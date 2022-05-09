// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { BigNumber } = require("ethers");
const hre = require("hardhat");
const { addresses } = require("./addresses");
const ethers = hre.ethers;

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const account = new ethers.Wallet(process.env.PRIVATE_KEY);
const signer = account.connect(provider);


async function deployToken(initialMintAddress) {
  const CobToken = await ethers.getContractFactory("CobToken");
  const cobToken = await CobToken.deploy(initialMintAddress);
  return await cobToken.deployed();
}

async function deployMasterchef(cobAddress, devAddress, feeAddress, cobPerBlock, startBlock) {
  const MasterChef = await ethers.getContractFactory("MasterChefV2");
  const masterChef = await MasterChef.deploy(cobAddress, devAddress, feeAddress, cobPerBlock, startBlock);
  return await masterChef.deployed();
}

async function main() {
  const cobPerBlock = ethers.utils.parseUnits("2.24", "ether");
  const startblock = BigNumber.from(27745197);

  const cob = await deployToken(addresses.devTreasury);
  const mc = await deployMasterchef(cob.address, addresses.timelock, addresses.devTreasury, cobPerBlock, startblock);

  await cob.transferOwnership(mc.address);
  await mc.transferOwnership(addresses.timelock);

  console.log("Transferred ownership of Cob to MasterChief for minting & staking rewards")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });