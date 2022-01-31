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
            const option = document.createElement("option");
            option.text = "Account_" + i + "_" + role;
            selector.add(option);
        }
        else if (i >= 1 && i <= 2) {
            role = "payer"
        }
        else if (i >= 3 && i <= 5) {
            role = "dev"
        }
        else {
            role = "rev";
        }


    }

    selectedAccount = accounts[0];
    getProducts();
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
                        console.log(prod)
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

                        const input = document.createElement("INPUT");
                        input.setAttribute("type", "number");
                        input.id = "rev-project-" + i;


                        const workDoneAcceptButton = document.createElement('button');
                        const workDoneDenyButton = document.createElement('button');

                        workDoneAcceptButton.innerHTML = 'Accept';
                        workDoneDenyButton.innerHTML = 'Discard';

                        workDoneAcceptButton.className += ' btn btn-primary';
                        workDoneDenyButton.classList += ' btn btn-danger';
                        workDoneAcceptButton.onclick = function () {

                            let projectAccepted = true
                            marketplaceContract.methods.acceptDevWork(i, projectAccepted).send({ from: selectedAccount, gas }).then(
                                (resp) => {
                                    console.log(resp);
                                    alert("Project dev work accepted for product " + i);
                                }
                            ).catch((error) => {
                                console.error(error);
                                alert(error);
                            })
                        };

                        workDoneDenyButton.onclick = function () {

                            let projectAccepted = false
                            marketplaceContract.methods.acceptDevWork(i, projectAccepted).send({ from: selectedAccount, gas }).then(
                                (resp) => {
                                    console.log(resp);
                                    alert("Project dev work not accepted for product " + i);
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


                        cardBody.appendChild(workDoneAcceptButton)
                        cardBody.appendChild(workDoneDenyButton)


                        const h2 = document.createElement("H3");
                        const t3 = document.createTextNode("Applications");
                        new_row.appendChild(h2)
                        h2.appendChild(t3)

                        const a = prod.projectFreelancers;

                        console.log(prod['projectFreelancers'])


                        for (let idxDev = 0; idxDev < a.length; idxDev++) {
                            console.log(idxDev)
                            const dev = a[idxDev]

                            const card = document.createElement('div');
                            card.id = 'card-dev-' + i + '_' + idxDev
                            card.className = "card"

                            const cardBody = document.createElement('div');
                            cardBody.className = "card-body"

                            const h = document.createElement("H2");
                            h.className = "card-title"
                            const t = document.createTextNode(dev);

                            const para = document.createElement("p");

                            const hireDevButton = document.createElement('button');

                            hireDevButton.innerHTML = 'Hire'
                            hireDevButton.className = 'btn btn-success';
                            hireDevButton.id = 'hire-button-dev-' + i + '_' + idxDev

                            card.appendChild(cardBody);
                            cardBody.appendChild(h);
                            h.appendChild(t);
                            cardBody.appendChild(para);
                            para.appendChild(t1);

                            card.appendChild(hireDevButton);

                            new_row.appendChild(card)

                            hireDevButton.onclick = function () {

                                alert("You hired a developer")
                                // call reject dev

                                marketplaceContract.methods.hireDevToWorkOnProject(i, a[i]).send({ from: selectedAccount, gas }).then(
                                    (resp) => {
                                        console.log(resp);
                                        alert("Hired dev for product " + i);
                                    }
                                ).catch((error) => {
                                    console.error(error);
                                    alert(error);
                                })

                                let auxCard = document.getElementById('card-dev-' + i + '_' + idxDev)
                                let auxBttn = document.getElementById('hire-button-dev-' + i + '_' + idxDev)
                                auxCard.removeChild(auxBttn);
                            };
                        }

                    }
                )
            }
        }
    )

}

init().then(_ => console.log('init done'));
