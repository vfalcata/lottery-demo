import "./App.css";
import React from "react";
import web3 from './web3'
import lottery from "./lottery";

class App extends React.Component {
  // //Replaced with new ES2016 syntax below
  //  constructor(props){
  //   super(props);
  //   this.state = {manager:''}
  // }
  // es2016 syntax, this will automatically be moved to the contructor function
  state = {
    manager: '',
    players: [],
    balance: '', //use a string instead of a number here since it will end up being a big number object
    value: '', //text input is always going to be empty string inputs or it will be a string we are going to work with
    message: ''
  } //we will initialize our state like this throughout the course

  //gets called as soon as our component renderes for the first time
  //A lifecycle method, that if we define it on our component, it will be automatically called after our component is rendered to the screen
  //Its a great place to load some data or do any other type of activity that needs to be done one time when a component first renders to the screen.
  async componentDidMount(){
    //when we are writing react code we need not specifiy 'from' property like in the last projects because the copy of web3 uses the provider form metamask that already has a default account signed into it, usually the first account
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address) //this is supposed to be a value in Wei, but we instantiate it above in the constructor as an empty string. The balance is not actully a number, it is an object, it is a number that is wrapped in a library called BigNumberJS
    this.setState({manager, players, balance}); //causes component to automatically rerender thus now rendering the data we load here.
  }

  //whenever we are making use of event handler with react, we always have to worry about the context of the function, specifically the value of 'this.' the arrow function handles this, and will automatically set it for us
  onSubmit=async (event)=>{ 
    event.preventDefault(); //avoids the form from submitting itself in the classic HTML way
    //when we send a transaction we need to get the accounts first, whereas the previous calls just used some default account that we didnt have to specify.
    const accounts = await web3.eth.getAccounts(); //all the accounts associated with the web3 provider of the user.(Not the accounts that are currently in the lottery)

    this.setState({message: 'Waiting on transaction success...'}) //wait message while transaction is running
    await lottery.methods.enter().send({
      from: accounts[0], // we assume that the first account address is the one that is going to be sending the transaction
      value: web3.utils.toWei(this.state.value, 'ether')
    }) //this takes 15-30s to process

    this.setState({message: 'You have been entered!'})
  }

  onClick = async ()=>{
    const accounts = await web3.eth.getAccounts(); //all the accounts associated with the web3 provider of the user.(Not the accounts that are currently in the lottery)

    this.setState({message: 'Waiting on transaction success.....'}) //wait message while transaction is running
    await lottery.methods.pickWinner().send({
      from: accounts[0], // we assume that the first account address is the one that is going to be sending the transaction
    }) //this takes 15-30s to process

    this.setState({message: 'A winner has been picked!'})
  }
  render() {
    // console.log(web3.version)
    // web3.eth.getAccounts().then(console.log) //remeber we can use async await on render funct of react so we have to use promises

    return (
      <div className="App">
        <h2>Lottery Contract</h2>
        <p>This contract is managed by {this.state.manager}
          There are currently {this.state.players.length} people entered,
          competing to win {web3.utils.fromWei(this.state.balance, 'ether')} ether!
        </p>
        <hr />
        <form onSubmit={this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter</label>
            <input
              value={this.state.value}
              onChange={event => this.setState({value: event.target.value})}
            />
          </div>
          <button>Enter</button>
        </form>
        <hr/>
        <h4>Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick a winner!</button>
        <hr/>
        <h1>{this.state.message}</h1>
      </div>
    );
  }
}
export default App;
