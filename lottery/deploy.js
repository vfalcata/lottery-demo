const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');
require('dotenv').config(); //required to load the .env variable
// https://sepolia.infura.io/v3/a7fb14829d3543cf809852bfbc92d4f5
const provider = new HDWalletProvider(
  process.env.MPHRASE,
  'https://sepolia.infura.io/v3/a7fb14829d3543cf809852bfbc92d4f5'
  );
  // remember to change this to your own phrase!
  // 'https://rinkeby.infura.io/v3/15c1d32581894b88a92d8d9e519e476c'
  // https://rinkeby.infura.io/v3/fc73186e0ebd4489a23b96e445bef904
  // remember to change this to your own endpoint!
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);
  console.log(interface) //we need this to paste in to our actual react app
  
  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ gas: '1000000', from: accounts[0] });

  console.log('Contract deployed to', result.options.address); //we also need this to paste in to our actual react app
  provider.engine.stop();
};
deploy();
