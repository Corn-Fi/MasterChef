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
}

// ----------------------------------------------------------------------------------

async function fetchContract(address, abi, signer) {
  const contract = new ethers.Contract(address, abi, signer);
  console.log(`loaded contract ${contract.address}`);
  return contract;
}

// ----------------------------------------------------------------------------------
// ------------------------------- Timelock Functions -------------------------------
// ----------------------------------------------------------------------------------

async function scheduleTransaction(target, value, data, predecessor, salt, delay) {
  const signer = await fetchSigner();
  const timelock = await fetchContract(addresses.timelock, TimeLock.abi, signer);
  return await timelock.schedule(target, value, data, predecessor, salt, delay);
}

// ----------------------------------------------------------------------------------

async function executeTransaction(target, value, data, predecessor, salt) {
  const signer = await fetchSigner();
  const timelock = await fetchContract(addresses.timelock, TimeLock.abi, signer);
  await timelock.execute(target, value, data, predecessor, salt);
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
    withUpdate
  );

  if(schedule) {
    await scheduleTransaction(masterchef.address, zero, rawTx.data, hashZero, hashZero, delay);
  }
  else {
    await executeTransaction(masterchef.address, zero, rawTx.data, hashZero, hashZero);
  }
}

// ----------------------------------------------------------------------------------

async function setPool(schedule, poolId, allocPoint, depositFeeBP, withUpdate, delay) {
  const signer = await fetchSigner();
  const masterchef = await fetchContract(addresses.masterChef, MasterChef.abi, signer);

  console.log(`loaded MasterChef ${masterchefContract.address}
              Setting pool:${poolId} 
  `);

  const rawTx = await masterchef.populateTransaction.set(
    poolId,
    allocPoint,
    depositFeeBP,
    withUpdate
  );

  if(schedule) {
    await scheduleTransaction(masterchef.address, zero, rawTx.data, hashZero, hashZero, delay);
  }
  else {
    await executeTransaction(masterchef.address, zero, rawTx.data, hashZero, hashZero);
  }
}

// ----------------------------------------------------------------------------------

async function transferOwnership(schedule, newOwner, delay) {
  const signer = await fetchSigner();
  const masterchef = await fetchContract(addresses.masterChef, MasterChef.abi, signer);

  console.log(`loaded MasterChef ${masterchefContract.address}
              Transferring ownership to ${newOwner} 
  `);

  const rawTx = await masterchef.populateTransaction.transferOwnership(newOwner);

  if(schedule) {
    await scheduleTransaction(masterchef.address, zero, rawTx.data, hashZero, hashZero, delay);
  }
  else {
    await executeTransaction(masterchef.address, zero, rawTx.data, hashZero, hashZero);
  }
}

// ----------------------------------------------------------------------------------

async function updateEmissionRate(schedule, cobPerBlock, delay) {
  const signer = await fetchSigner();
  const masterchef = await fetchContract(addresses.masterChef, MasterChef.abi, signer);

  console.log(`loaded MasterChef ${masterchefContract.address}
              Updating emission rate to ${cobPerBlock} 
  `);

  const rawTx = await masterchef.populateTransaction.updateEmissionRate(cobPerBlock);

  if(schedule) {
    await scheduleTransaction(masterchef.address, zero, rawTx.data, hashZero, hashZero, delay);
  }
  else {
    await executeTransaction(masterchef.address, zero, rawTx.data, hashZero, hashZero);
  }
}

// ----------------------------------------------------------------------------------

async function main() {
  // **** Examples ****
}

// ----------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
