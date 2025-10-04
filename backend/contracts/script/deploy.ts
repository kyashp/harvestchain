import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  // Deploy mocks (replace with real oracles later)
  const AI = await ethers.getContractFactory("MockAIOracle");
  const ai = await AI.deploy(); await ai.waitForDeployment();

  const DO = await ethers.getContractFactory("MockDeliveryOracle");
  const del = await DO.deploy(); await del.waitForDeployment();

  // SSI & Credit oracles
  const verifierAddr = deployer.address; // backend later
  const SSI = await ethers.getContractFactory("SSIRegistry");
  const ssi = await SSI.deploy(verifierAddr); await ssi.waitForDeployment();

  const updaterAddr = deployer.address; // backend later
  const CS = await ethers.getContractFactory("CreditScoreOracle");
  const credit = await CS.deploy(updaterAddr); await credit.waitForDeployment();

  const feeReceiver = deployer.address;
  const feeBps = 50;

  const Escrow = await ethers.getContractFactory("HarvestChainEscrowAI");
  const escrow = await Escrow.deploy(
    await ai.getAddress(),
    await del.getAddress(),
    await ssi.getAddress(),
    await credit.getAddress(),
    feeReceiver,
    feeBps
  );
  await escrow.waitForDeployment();

  console.log("AI Oracle:", await ai.getAddress());
  console.log("Delivery Oracle:", await del.getAddress());
  console.log("SSIRegistry:", await ssi.getAddress());
  console.log("CreditScoreOracle:", await credit.getAddress());
  console.log("Escrow:", await escrow.getAddress());
}

main().catch((e) => { console.error(e); process.exit(1); });
