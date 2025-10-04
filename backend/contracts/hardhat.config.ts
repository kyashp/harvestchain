import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true, // avoid "stack too deep"
    },
  },
  paths: {
    sources: "./src",   // your .sol files live here
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    xrplEvm: {
      url: process.env.XRPL_EVM_RPC ?? "",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: Number(process.env.XRPL_EVM_CHAINID ?? 1440002),
    },
  },
};

export default config;
