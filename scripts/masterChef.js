// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
const hre = require("hardhat");
const TimeLock = require("../artifacts/contracts/interfaces/ITimelock.sol/ITimelock.json");
const MasterChef = require("../artifacts/contracts/MasterChefV2.sol/MasterChefV2.json");
const { addresses } = require("./addresses");

const hashZero = hre.ethers.constants.HashZero;
const zero = hre.ethers.constants.Zero;

// ----------------------------------------------------------------------------------
// -------------------------------- Helper Functions --------------------------------
// ----------------------------------------------------------------------------------

async function fetchSigner() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  const signer = wallet.connect(provider);
  console.log(`connected to ${signer.address}`);
  return signer;
};//works


async function fetchContract(address, abi, signer) {
  const contract = new ethers.Contract(address, abi, signer);
  console.log(`loaded contract ${contract.address}`);
  return contract;
};//works


// ----------------------------------------------------------------------------------
// ------------------------------- Timelock Functions -------------------------------
// ----------------------------------------------------------------------------------

async function scheduleTransaction(target, value, data, predecessor, salt, delay) {
  const signer = await fetchSigner();
  const timelock = await fetchContract(addresses.timelock, TimeLock.abi, signer);
  return await timelock.schedule(target, value, data, predecessor, salt, delay);
}

async function executeTransaction(target, value, data, predecessor, salt) {
  const signer = await fetchSigner();
  const timelock = await fetchContract(addresses.timelock, TimeLock.abi, signer);
  await timelock.execute(target, value, data, predecessor, salt);
}

async function grantRole(role, account) {
  const signer = await fetchSigner();
  const timelock = await fetchContract(addresses.timelock, TimeLock.abi, signer);
  await timelock.grantRole(role, account);
}

async function revokeRole(role, account) {
  const signer = await fetchSigner();
  const timelock = await fetchContract(addresses.timelock, TimeLock.abi, signer);
  await timelock.revokeRole(role, account);
}

// ----------------------------------------------------------------------------------
// ------------------------------ MasterChef Functions ------------------------------
// ----------------------------------------------------------------------------------

async function createPool(schedule, allocPoint, poolToken, depositFeeBP, withUpdate, delay) {
  const signer = await fetchSigner();
  const masterchef = await fetchContract(addresses.masterChef, MasterChef.abi, signer);

  console.log(`loaded MasterChef ${masterchefContract.address}
              Adding Pool for ${poolToken} 
  `);

  const rawTx = await masterchef.populateTransaction.add(
    allocPoint,
    poolToken,
    depositFeeBP,
    withUpdate,
  );

  if(schedule) {
    await scheduleTransaction(masterchef.address, zero, rawTx.data, hashZero, hashZero, delay);
  }
  else {
    await executeTransaction(masterchef.address, zero, rawTx.data, hashZero, hashZero);
  }
}; //works



// ----------------------------------------------------------------------------------

async function main() {
  await createPool("0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174");
  // console.log(abi);
  // console.log(abiCoder.encodeFunctionData("dev", ["0x43b02cdF22d0DE535279507CF597969Ce82198Af"]));

  // await scheduleTransaction(timelock, "0x3ce06fafa62c028bd0197ad12591264e44126d53", hre.ethers.utils.parseUnits("1", 0), hashZero, hashZero, hashZero, hre.ethers.utils.parseUnits("30", 0));
  // await executeTransaction(timelock, "0x3ce06fafa62c028bd0197ad12591264e44126d53", hre.ethers.utils.parseUnits("1", 0), hashZero, hashZero, hashZero);
  // **** Examples ****
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
