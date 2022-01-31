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
        var role
        if (i == 0) {
            role = "manager"
        }
        else if (i >= 1 && i <= 2) {
            role = "payer"
        }
        else if (i >= 3 && i <= 5) {
            role = "dev"
            const option = document.createElement("option");
            option.text = "Account_" + i + "_" + role;
            selector.add(option);
        }
        else {
            role = "rev"
        }


    }

    selectedAccount = accounts[0]
}

function getSelectedAccount() {
    d = document.getElementById("accountSelector").value;
    d = d.split("_")[1]
    d = parseInt(d)
    selectedAccount = accounts[d]

    getProducts()
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
                        const new_row = document.createElement('div');
                        new_row.className = "row";

                        const card = document.createElement('div');
                        card.className = "card"

                        const cardBody = document.createElement('div');
                        cardBody.className = "card-body"

                        const h = document.createElement("H1");
                        h.className = "card-title"
                        const t = document.createTextNode("Project " + i);
                        const para = document.createElement("p");
                        const t1 = document.createTextNode(prod['description']);
                        const para2 = document.createElement("p");
                        const t2 = document.createTextNode(prod['expertise']);


                        const button = document.createElement('button');
                        button.innerHTML = 'Apply';
                        button.onclick = function () {
                            marketplaceContract.methods.registerDevForProduct(i).send({ from: selectedAccount, gas }).then(
                                (resp) => {
                                    console.log(resp);
                                }
                            ).catch((error) => {
                                console.error(error);
                                alert(error);
                            })
                        };

                        const sendWorkDoneButton = document.createElement('button');
                        sendWorkDoneButton.innerHTML = 'Send to validation';
                        button.className += ' btn btn-primary';
                        sendWorkDoneButton.className += ' btn btn-success'
                        sendWorkDoneButton.onclick = function () {

                            marketplaceContract.methods.sendWorkDone(i).send({ from: selectedAccount, gas }).then(
                                (resp) => {
                                    console.log(resp);
                                    alert('Work done sent!')
                                }
                            ).catch((error) => {
                                console.error(error);
                                alert(error);
                            })
                        };

                        divProdList.appendChild(new_row);
                        new_row.appendChild(card);
                        card.appendChild(cardBody);
                        cardBody.appendChild(h);
                        h.appendChild(t);
                        cardBody.appendChild(para);
                        para.appendChild(t1);
                        cardBody.appendChild(para2);
                        para2.appendChild(t2);
                        cardBody.appendChild(button);
                        cardBody.appendChild(sendWorkDoneButton);
                    }
                )
            }
        }
    )

}

init().then(_ => console.log('init done'));
