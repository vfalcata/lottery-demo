import Web3 from "web3";
     
window.ethereum.request({ method: "eth_requestAccounts" }); //get the eth accounts from metamask, since it injects it to the page we can just get it via the window
 
const web3 = new Web3(window.ethereum); //copy of web3 from metmask library, whose provider we take and inject in to our copy of web3
 
export default web3; //now we can use this configure version of web3 object throughout our app.