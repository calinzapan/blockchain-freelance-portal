const web3 = new Web3(window.config.provider);
let accounts = [];
let marketplaceContract = {};

const gas = 2500000;

let productCount = -1;

let selectedAccount

async function init() {
    const { abi: marketAbi } = await fetch('./Marketplace.json').then(res => res.json());
    accounts = await web3.eth.getAccounts();
    marketplaceContract = new web3.eth.Contract(marketAbi, window.contracts.marketplace.address);

    let selector = document.getElementById('accountSelector')
    for (let i = 0; i < accounts.length; i++) {
        var role;
        if (i == 0) {
            role = "manager"
        }
        else if (i >= 1 && i <= 2) {
            role = "payer"
        }
        else if (i >= 3 && i <= 5) {
            role = "dev"
        }
        else {
            role = "rev"
        }

        const option = document.createElement("option");
        option.text = "Account_" + i + "_" + role;
        selector.add(option);
    }

    selectedAccount = accounts[0]

    getProducts();
}

function getSelectedAccount() {
    d = document.getElementById("accountSelector").value;
    d = d.split("_")[1]
    d = parseInt(d)
    selectedAccount = accounts[d]

    getProducts()
}

async function createProduct() {

    let executionTotalCost = document.getElementById("executionCostInput").value
    let devTotalCost = document.getElementById("devCostInput").value
    let revTotalCost = document.getElementById("revCostInput").value
    let description = document.getElementById("descriptionInput").value
    let expertise = document.getElementById("expertiseInput").value


    marketplaceContract.methods.createProduct(
        executionTotalCost, devTotalCost, revTotalCost, description, expertise
    ).send({ from: selectedAccount, gas: gas });
}

document.getElementById("createProductBtn").onclick = function fun() {
    createProduct()
}

async function getProductCount() {
    productCount = await marketplaceContract.methods.getProductCount().call({ from: selectedAccount });
    return productCount;
}

async function getProduct(productNumber) {

    const result = await marketplaceContract.methods.getProduct(productNumber).call({ from: selectedAccount });
    return result;
}

async function getProducts() {
    getProductCount().then(
        (prodCount) => {
            divProdList = document.getElementById("productList")
            divProdList.innerHTML = "";

            for (let i = 0; i < prodCount; i++) {
                getProduct(i).then(
                    (prod) => {
                        console.log(prod)
                        const new_row = document.createElement('div');
                        new_row.className = "row";

                        const card = document.createElement('div');
                        card.className = "card"

                        const cardBody = document.createElement('div');
                        cardBody.className = "card-body"

                        const h = document.createElement("H1");
                        h.className = "card-title"
                        const t = document.createTextNode("Project");
                        const para = document.createElement("p");
                        const t1 = document.createTextNode(prod['description']);
                        const para2 = document.createElement("p");
                        const t2 = document.createTextNode(prod['expertise']);

                        const prodState = 'None'
                        if (prod['projectDone']) {
                            prodState = "Project Done"
                        } else if (prod['managerValidated']) {
                            prodState = "Awaiting Rev Decision (manager validated)"
                        } else if (prod['workDone']) {
                            prodState = "Awaiting Manager Decision (dev sent worke)"
                        } else if (prod['startedExecution']) {
                            prodState = "Awaiting Devs to Finish work"
                        } else if (prod['startedDeveloping']) {
                            prodState = "Awaiting Devs to apply to project and be selected"
                        } else if (prod['startedFunding']) {
                            prodState = "Awaiting payers to give us $$$"
                        } else {
                            prodState = "Project Barely started"
                        }

                        const para3 = document.createElement("p");
                        const t3 = document.createTextNode(prodState);

                        divProdList.appendChild(new_row);
                        new_row.appendChild(card);
                        card.appendChild(cardBody);
                        cardBody.appendChild(h);
                        h.appendChild(t);
                        cardBody.appendChild(para);
                        para.appendChild(t1);
                        cardBody.appendChild(para2);
                        para2.appendChild(t2);
                        cardBody.appendChild(para3);
                        para3.appendChild(t3);
                    }
                )
            }
        }
    )

}

init().then(_ => console.log('init done'));
