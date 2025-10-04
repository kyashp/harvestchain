import { ethers } from "hardhat";

async function main() {
  const [buyer, seller, verifier, updater] = await ethers.getSigners();
  const USDCdec = 6;

  // 1) Deploy mocks & registries
  const AI = await ethers.getContractFactory("MockAIOracle");
  const ai = await AI.deploy(); await ai.waitForDeployment();

  const DO = await ethers.getContractFactory("MockDeliveryOracle");
  const del = await DO.deploy(); await del.waitForDeployment();

  const SSI = await ethers.getContractFactory("SSIRegistry");
  const ssi = await SSI.deploy(await verifier.getAddress()); await ssi.waitForDeployment();

  const CS = await ethers.getContractFactory("CreditScoreOracle");
  const credit = await CS.deploy(await updater.getAddress()); await credit.waitForDeployment();

  const Escrow = await ethers.getContractFactory("HarvestChainEscrowAI");
  const escrow = await Escrow.deploy(
    await ai.getAddress(), await del.getAddress(),
    await ssi.getAddress(), await credit.getAddress(),
    await buyer.getAddress(), 50 // feeReceiver, 0.5%
  ); await escrow.waitForDeployment();

  // 2) Deploy mock ERC20 (precompiled contract)
  const MockERC20 = await ethers.getContractFactory("MockUSD");
  const token = await MockERC20.deploy();
  await token.waitForDeployment();

  // 3) Fund test wallets & approvals
  await token.mint(await buyer.getAddress(), 1_000_000_000);   // 1,000 MUSD (6dp)
  await token.mint(await seller.getAddress(), 100_000_000);
  await token.connect(buyer).approve(await escrow.getAddress(), ethers.MaxUint256);
  await token.connect(seller).approve(await escrow.getAddress(), ethers.MaxUint256);

  // 4) Seed AI price & SSI auth + credit score
  const marketKey = ethers.keccak256(ethers.toUtf8Bytes("TUNA|A|ILOILO"));
  await ai.set(marketKey, ethers.parseUnits("3.50", USDCdec), ethers.parseUnits("0.80", 18));

  const ROLE_COOP_MEMBER = ethers.keccak256(ethers.toUtf8Bytes("COOP_MEMBER"));
  await ssi.connect(verifier).setAuthorized(await seller.getAddress(), ROLE_COOP_MEMBER, BigInt(Math.floor(Date.now()/1000)+3600));

  await credit.connect(updater).setScore(await buyer.getAddress(), 810); // gets lower deposit automatically

  // 5) Buyer creates order (100kg, cap 3.80, deposit 30% -> will reduce to 20% due to score>=800)
  const qty = 100n;
  const maxUnitPrice = ethers.parseUnits("3.80", USDCdec);
  const notionalMax = qty * maxUnitPrice;                     // 380
  const depositBps = 3000; // 30% requested
  const forfeitBps = 2000; // 20% of deposit if surrender
  const maxDiscountBps = 500; // 5% below AI floor allowed
  const expectedDepositAfterScore = notionalMax * 2000n / 10000n; // 20% due to score>=800
  const txCreate = await escrow.connect(buyer).createOrder(
    await token.getAddress(), marketKey, qty, maxUnitPrice,
    depositBps, forfeitBps, maxDiscountBps,
    0, 0, expectedDepositAfterScore
  );
  await txCreate.wait();
  const orderId = (await escrow.nextOrderId()) - 1n;
  console.log("Order ID:", orderId.toString());

  // 6) Seller accepts at 3.60 (>= min based on AI floor 3.50 with 5% discount)
  await escrow.connect(seller).acceptOrder(orderId, ethers.parseUnits("3.60", USDCdec), ethers.parseUnits("10", USDCdec));

  // 7) Buyer tops up to full notional: 100*3.60 = 360; deposit already ~72; remainder ~288
  await escrow.connect(buyer).fundRemainder(orderId, ethers.parseUnits("288", USDCdec));

  // 8) Delivery + settlement
  await del.setDelivered(orderId, true);
  await escrow.markDelivered(orderId);
  await escrow.settle(orderId);

  // 9) Show balances
  const sBal = await token.balanceOf(await seller.getAddress());
  const bBal = await token.balanceOf(await buyer.getAddress());
  console.log("Seller MUSD:", Number(sBal)/1e6, "Buyer MUSD:", Number(bBal)/1e6);
  console.log("Addresses:",
    "\n Escrow:", await escrow.getAddress(),
    "\n Token:", await token.getAddress(),
    "\n AI:", await ai.getAddress(),
    "\n Delivery:", await del.getAddress(),
    "\n SSI:", await ssi.getAddress(),
    "\n Credit:", await credit.getAddress()
  );
}

main().catch((e)=>{ console.error(e); process.exit(1); });
