// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 amt) external returns (bool);
    function transferFrom(address from, address to, uint256 amt) external returns (bool);
    function balanceOf(address a) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amt) external returns (bool);
    function decimals() external view returns (uint8);
}

library SafeERC20 {
    function safeTransfer(IERC20 t, address to, uint256 v) internal {
        require(t.transfer(to, v), "ERC20 transfer failed");
    }
    function safeTransferFrom(IERC20 t, address from, address to, uint256 v) internal {
        require(t.transferFrom(from, to, v), "ERC20 transferFrom failed");
    }
}

abstract contract ReentrancyGuard {
    uint256 private _locked = 1;
    modifier nonReentrant() {
        require(_locked == 1, "REENTRANCY");
        _locked = 2;
        _;
        _locked = 1;
    }
}

interface IAIPriceOracle {
    function getFloorPrice(bytes32 marketKey) external view returns (uint256 pricePerUnit, uint256 confidence, uint256 updatedAt);
}
interface IDeliveryOracle {
    function isDelivered(uint256 orderId) external view returns (bool);
}

interface ISSIRegistry {
    function isAuthorized(address user, bytes32 role) external view returns (bool);
}
interface ICreditScoreOracle {
    function getScore(address user) external view returns (uint16 score, uint64 updatedAt);
}

contract HarvestChainEscrowAI is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum State { None, Created, Accepted, FundedFull, Delivered, Settled, Cancelled }

    struct Order {
        address buyer;
        address seller;
        IERC20  token;
        bytes32 marketKey;
        uint256 quantity;
        uint256 unitPrice;
        uint256 notional;
        uint256 aiFloorPrice;
        uint256 depositBps;
        uint256 forfeitBps;
        uint256 maxDiscountBps;
        uint256 sellerBond;
        uint256 buyerEscrowed;
        uint256 sellerEscrowed;
        State   state;
        uint64  createdAt;
        uint64  acceptBy;
        uint64  deliverBy;
    }

    IAIPriceOracle public aiOracle;
    IDeliveryOracle public deliveryOracle;
    ISSIRegistry public ssi;
    ICreditScoreOracle public credit;
    address public feeReceiver;
    uint256 public protocolFeeBps;
    uint256 public nextOrderId;

    bytes32 public constant ROLE_COOP_MEMBER = keccak256("COOP_MEMBER");

    mapping(uint256 => Order) public orders;

    event OrderCreated(uint256 indexed id, address indexed buyer, bytes32 marketKey, uint256 qty, uint256 maxUnitPrice, uint256 depositBps, uint256 forfeitBps, uint256 maxDiscountBps);
    event OrderAccepted(uint256 indexed id, address indexed seller, uint256 unitPrice, uint256 aiFloorPrice, uint256 sellerBond);
    event BuyerFunded(uint256 indexed id, uint256 amount, uint256 totalFunded);
    event SellerBondFunded(uint256 indexed id, uint256 amount);
    event BuyerSurrendered(uint256 indexed id, uint256 forfeitedToSeller, uint256 refundedToBuyer);
    event Delivered(uint256 indexed id);
    event Settled(uint256 indexed id, address seller, uint256 sellerPayout, uint256 protocolFee, uint256 buyerRefund);
    event Cancelled(uint256 indexed id);

    error BadState(State s);
    error PastDeadline();
    error NotBuyer();
    error NotSeller();

    constructor(
        IAIPriceOracle _aiOracle,
        IDeliveryOracle _deliveryOracle,
        ISSIRegistry _ssi,
        ICreditScoreOracle _credit,
        address _feeReceiver,
        uint256 _protocolFeeBps
    ) {
        aiOracle = _aiOracle;
        deliveryOracle = _deliveryOracle;
        ssi = _ssi;
        credit = _credit;
        feeReceiver = _feeReceiver;
        protocolFeeBps = _protocolFeeBps;
        nextOrderId = 1;
    }

    // ---- Create order (buyer funds deposit) ----
    function createOrder(
        IERC20 token,
        bytes32 marketKey,
        uint256 quantity,
        uint256 maxUnitPrice,
        uint256 depositBps,
        uint256 forfeitBps,
        uint256 maxDiscountBps,
        uint64  acceptBy,
        uint64  deliverBy,
        uint256 initialDepositAmount
    ) external nonReentrant returns (uint256 id) {
        require(quantity > 0 && maxUnitPrice > 0, "bad terms");
        require(depositBps > 0 && depositBps <= 10000, "bad deposit");
        require(forfeitBps <= 5000, "forfeit too high");
        require(maxDiscountBps <= 2000, "discount too high");

        id = nextOrderId++;
        Order storage o = orders[id];
        o.buyer = msg.sender;
        o.token = token;
        o.marketKey = marketKey;
        o.quantity = quantity;
        o.unitPrice = maxUnitPrice;
        o.notional = quantity * maxUnitPrice;
        o.depositBps = depositBps;
        o.forfeitBps = forfeitBps;
        o.maxDiscountBps = maxDiscountBps;
        o.createdAt = uint64(block.timestamp);
        o.acceptBy = acceptBy;
        o.deliverBy = deliverBy;
        o.state = State.Created;

        // dynamic deposit by credit score (optional: lower deposit for high score)
        (uint16 score,) = credit.getScore(msg.sender);
        if (score >= 800 && depositBps > 2000) { o.depositBps = depositBps - 1000; } // -10%
        else if (score >= 700 && depositBps > 2500) { o.depositBps = depositBps - 500; } // -5%

        uint256 requiredDeposit = (o.notional * o.depositBps) / 10_000;
        require(initialDepositAmount == requiredDeposit, "deposit mismatch");
        token.safeTransferFrom(msg.sender, address(this), initialDepositAmount);
        o.buyerEscrowed = initialDepositAmount;

        emit OrderCreated(id, msg.sender, marketKey, quantity, maxUnitPrice, o.depositBps, forfeitBps, maxDiscountBps);
    }

    // ---- Seller accepts (must be authorized by SSI) ----
    function acceptOrder(uint256 id, uint256 unitPrice, uint256 sellerBond) external nonReentrant {
        Order storage o = orders[id];
        if (o.state != State.Created) revert BadState(o.state);
        if (o.acceptBy != 0 && block.timestamp > o.acceptBy) revert PastDeadline();
        require(unitPrice > 0 && unitPrice <= o.unitPrice, "price too high");

        // SSI check
        require(ssi.isAuthorized(msg.sender, ROLE_COOP_MEMBER), "SSI required");

        (uint256 aiFloor,,) = aiOracle.getFloorPrice(o.marketKey);
        require(aiFloor > 0, "AI price unavailable");
        uint256 minAcceptable = (aiFloor * (10_000 - o.maxDiscountBps)) / 10_000;
        require(unitPrice >= minAcceptable, "under AI floor");

        o.aiFloorPrice = aiFloor;
        o.unitPrice = unitPrice;
        o.notional = o.quantity * unitPrice;
        o.seller = msg.sender;
        o.state = State.Accepted;

        if (sellerBond > 0) {
            o.sellerBond = sellerBond;
            o.token.safeTransferFrom(msg.sender, address(this), sellerBond);
            o.sellerEscrowed = sellerBond;
            emit SellerBondFunded(id, sellerBond);
        }

        emit OrderAccepted(id, msg.sender, unitPrice, aiFloor, sellerBond);
    }

    // ---- Buyer tops up to full notional ----
    function fundRemainder(uint256 id, uint256 amount) external nonReentrant {
        Order storage o = orders[id];
        if (msg.sender != o.buyer) revert NotBuyer();
        require(o.state == State.Accepted || o.state == State.FundedFull, "bad state");
        o.token.safeTransferFrom(msg.sender, address(this), amount);
        o.buyerEscrowed += amount;
        if (o.buyerEscrowed >= o.notional) o.state = State.FundedFull;
        emit BuyerFunded(id, amount, o.buyerEscrowed);
    }

    // ---- Buyer surrender (forfeit % of deposit) ----
    function surrender(uint256 id) external nonReentrant {
        Order storage o = orders[id];
        if (msg.sender != o.buyer) revert NotBuyer();
        require(o.state == State.Accepted || o.state == State.FundedFull, "bad state");

        uint256 depositAbs = (o.notional * o.depositBps) / 10_000;
        uint256 forfeited = (depositAbs * o.forfeitBps) / 10_000;
        uint256 toSeller = forfeited > o.buyerEscrowed ? o.buyerEscrowed : forfeited;
        uint256 refund = o.buyerEscrowed - toSeller;
        o.state = State.Cancelled;

        if (toSeller > 0 && o.seller != address(0)) o.token.safeTransfer(o.seller, toSeller);
        if (refund > 0) o.token.safeTransfer(o.buyer, refund);
        if (o.sellerEscrowed > 0) o.token.safeTransfer(o.seller, o.sellerEscrowed);

        emit BuyerSurrendered(id, toSeller, refund);
        emit Cancelled(id);
    }

    // ---- Delivery & settlement ----
    function markDelivered(uint256 id) external {
        Order storage o = orders[id];
        require(o.state == State.FundedFull, "not funded");
        if (o.deliverBy != 0 && block.timestamp > o.deliverBy) revert PastDeadline();
        require(deliveryOracle.isDelivered(id), "not delivered");
        o.state = State.Delivered;
        emit Delivered(id);
    }

    function settle(uint256 id) external nonReentrant {
        Order storage o = orders[id];
        require(o.state == State.Delivered, "bad state");
        require(o.buyerEscrowed >= o.notional, "insufficient escrow");

        uint256 fee = (protocolFeeBps == 0) ? 0 : (o.notional * protocolFeeBps) / 10_000;
        uint256 net = o.notional - fee;

        o.state = State.Settled;
        if (fee > 0 && feeReceiver != address(0)) o.token.safeTransfer(feeReceiver, fee);
        o.token.safeTransfer(o.seller, net);
        if (o.sellerEscrowed > 0) o.token.safeTransfer(o.seller, o.sellerEscrowed);

        uint256 leftover = o.buyerEscrowed - o.notional;
        if (leftover > 0) o.token.safeTransfer(o.buyer, leftover);
        emit Settled(id, o.seller, net, fee, leftover);
    }
}
