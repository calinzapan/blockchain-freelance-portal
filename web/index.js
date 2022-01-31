const web3 = new Web3(window.config.provider);
let accounts = [];
let marketplaceContract = {};
let tokenContract = {};

const gas = 2500000;
let productCount = -1;

async function init() {
    const { abi: marketAbi } = await fetch('./Marketplace.json').then(res => res.json());
    const { abi: tokenAbi } = await fetch('./Token.json').then(res => res.json());
    accounts = await web3.eth.getAccounts();
    marketplaceContract = new web3.eth.Contract(marketAbi, window.contracts.marketplace.address);
    tokenContract = new web3.eth.Contract(tokenAbi, window.contracts.token.address);
    await marketplaceContract.methods.initToken(window.contracts.token.address).send({ from: accounts[0], gas });
}


async function echo(index) {
    console.log(await marketplaceContract.methods.echo('hello').call({ from: accounts[0] }));
    console.log(await marketplaceContract.methods.myAddress().call({ from: accounts[index || 1] }));
    console.log(await marketplaceContract.methods.getBalance(accounts[index || 1]).call({ from: accounts[0] }));
}

async function initActors() {
    const actors = [
        { func: 'createManager', account: accounts[0], name: 'manager', payment: null },
        { func: 'createPayer', account: accounts[1], name: 'payer1', payment: 10000 },
        { func: 'createPayer', account: accounts[2], name: 'payer2', payment: 10000 },
        { func: 'createFreelancer', account: accounts[3], name: 'freelancer1', exp: 'frontend', payment: null },
        { func: 'createFreelancer', account: accounts[4], name: 'freelancer2', exp: 'backend', payment: null },
        { func: 'createFreelancer', account: accounts[5], name: 'freelancer3', exp: 'security', payment: null },
        { func: 'createEvaluator', account: accounts[6], name: 'evaluator1', exp: 'backend', payment: null },
        { func: 'createEvaluator', account: accounts[7], name: 'evaluator2', exp: 'security', payment: null }
    ];

    for (const i of actors) {
        const params = i.exp ? [i.account, i.name, i.exp] : [i.account, i.name];
        await marketplaceContract.methods[i.func](...params).send({ from: accounts[0], gas });
        if (i.payment) {
            await tokenContract.methods.transfer(i.account, i.payment).send({ from: accounts[0], gas });
        }
    }

    const result = await marketplaceContract.methods.getBalance(accounts[1]).call({ from: accounts[0] });
    console.log(result);
}

async function createProduct() {

    let executionTotalCost = 20;
    let devTotalCost = 30;
    let revTotalCost = 25;
    let devMaxTimeout = 5;
    let revMaxTimeout = 6;
    let projectStartingDate = new Date().getTime();
    let projectMaxTimeout = 7;
    marketplaceContract.methods.createProduct(
        executionTotalCost, devTotalCost, revTotalCost,
        devMaxTimeout, revMaxTimeout, projectStartingDate, projectMaxTimeout
    ).send({ from: accounts[0], gas: gas });


}

async function getProduct(productNumber) {
    const result = await marketplaceContract.methods.getProduct(productNumber).call({ from: accounts[0] });
    console.log(result);
}

async function financeProduct(productNumber, amount, from) {
    await tokenContract.methods.approve(window.contracts.marketplace.address, amount).send({ from, gas });
    await marketplaceContract.methods.financeProduct(productNumber, amount).send({ from, gas });
}

async function withdrawProductFinance(productNumber, amount, from) {
    await marketplaceContract.methods.withdrawProductFinance(productNumber, amount).send({ from, gas });
}

async function returnMoneyToPayers(productNumber) {
    await marketplaceContract.methods.returnMoneyToPayers(productNumber).send({ from: accounts[0], gas });
}

async function getManager(managerAdr) {
    const result = await marketplaceContract.methods.getManager(managerAdr).call({ from: accounts[0] });
    console.log(result);
}

init().then(_ => console.log('init done'));
