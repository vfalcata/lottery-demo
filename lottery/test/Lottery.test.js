const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const {interface, bytecode} = require('../compile');

let lottery;
let accounts;

beforeEach(async ()=>{
    accounts = await web3.eth.getAccounts();
    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({data: bytecode})
        .send({from: accounts[0], gas:'1000000'})
});

describe('Lottery Contract', ()=>{
    it('deploys a contract',()=>{
        //checks existence
        assert.ok(lottery.options.address) //recall address only exists if contract was deployed
    })

    it('allows one account to enter',async ()=>{
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02','ether') //amount of wei we want to send along
            // first arg is the amount second is the unit
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })

        assert.equal(accounts[0],players[0])
        assert.equal(1, players.length)
    })

    it('allows multiple accounts to enter',async ()=>{
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02','ether') //amount of wei we want to send along
            // first arg is the amount second is the unit
        });
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02','ether') //amount of wei we want to send along
            // first arg is the amount second is the unit
        });
        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02','ether') //amount of wei we want to send along
            // first arg is the amount second is the unit
        });
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })

        assert.equal(accounts[0],players[0])
        assert.equal(accounts[1],players[1])
        assert.equal(accounts[2],players[2])
        assert.equal(3, players.length)
    })

    it('requires a minimum amount of ether to enter', async ()=>{
        try{
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 0
            })
            assert(false); //checks for truthiness, always fails
        }catch (err){
            assert(err) //checks for truthiness
        }
    })

    it('only manager can call pick winner', async ()=>{
        try{
            await lottery.methods.pickWinner().send({
                from: accounts[1],
            })
            assert(false); //checks for truthiness, always fails
        }catch (err){
            assert(err); //checks for truthiness
        }
    })

    it('sends money to the winner and resets the players array', async ()=>{
        // we only enter in one player so we dont have to deal with the random nature of who actually wins, which would take more code
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2','ether') //amount of wei we want to send along
            // first arg is the amount second is the unit
        });
        const intialBalance = await web3.eth.getBalance(accounts[0]); 
        //returns the amount of ether in Wei that a give account controls
        //you can use this on contracts or external accounts, by inserting the address as the argument
        
        const initialContractBalance = await web3.eth.getBalance(lottery.options.address);
        console.log(initialContractBalance)
        assert.equal(initialContractBalance,web3.utils.toWei('2','ether'))

        await lottery.methods.pickWinner().send({
            from: accounts[0]
        })
        const finalBalance = await web3.eth.getBalance(accounts[0]); 
        // one player so they must be the winner now can compare balance difference
        //we also have to account the amount of monies paid for gas, so we wont have the exact expected amount.
        const difference = finalBalance - intialBalance;
        assert(difference > web3.utils.toWei('1.8', 'ether')); //this will account for gas cost, as with out paying gas this would be the maximum amount
        const finalContractBalance = await web3.eth.getBalance(lottery.options.address);
        assert.equal(finalContractBalance, 0)
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        })
        assert.equal(players.length, 0)
    })
})