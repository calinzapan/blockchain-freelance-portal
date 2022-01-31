// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import './Token.sol';

contract Marketplace {
    Token token;

    address owner;

    struct User {
        string name;
        uint rep;
        string expertise;
        bool isValue;
    }

    mapping(address => User) managers;
    mapping(address => User) payers;
    mapping(address => User) freelancers;
    mapping(address => User) evaluators;
	
    struct paiedUser {
        uint flatAmount;
        uint procentOfTotalCost;
    }

    struct Product {
        bool startedFunding;
        bool startedDeveloping;
        bool startedExecution; 

        bool workDone;

        bool managerValidated;
        bool managerAnswer;
        bool revValidated;
        bool revAnswer;

        bool projectDone;

        uint executionTotalCost;
        uint devTotalCost;
        uint revTotalCost;
        uint totalCost;

        uint numPayers;
        uint numFreelancers;

        address[] projectPayers;
        address[] projectFreelancers;
        address projectEvaluator;
        address hiredFreelancer;

        uint[] payersContribution;
        uint fundsCollected;

        address projectManager;

        string description;
        string expertise;
    }

    uint numPorducts;
    mapping(uint => Product) products;

    modifier requireOwner(){
        require(msg.sender == owner, "not owner crowd contract");
        _;
    }

    modifier requireManager(){
        require(managers[msg.sender].isValue, "not manager, no right to create product");
        _;
    }

    modifier requirePayer(){
        require(payers[msg.sender].isValue, "not payer");
        _;
    }

    constructor() public {  
        owner = msg.sender;  // cine apeleaza contractul este owner
    }

    function initToken(address adr) public requireOwner {
        token = Token(adr);
    }

    function echo(string memory input) public returns (string memory text) {
        return input;
    }

    function myAddress() public returns (address text) {
        return msg.sender;  // returnam adresa sender-ului
    }

    function createManager(address adr, string memory name) public requireOwner {
        managers[adr] = User(name, 5, '', true);
    }

    function getManager(address adr) public returns (User memory) {
        return managers[adr];
    }

    function createPayer(address adr, string memory name) public requireOwner {
        payers[adr] = User(name, 5, '', true);
    }

    function createFreelancer(address adr, string memory name, string memory expertise) public requireOwner {
        freelancers[adr] = User(name, 5, expertise, true);
    }

    function createEvaluator(address adr, string memory name, string memory expertise) public requireOwner {
        evaluators[adr] = User(name, 5, expertise, true);
    }

    function getBalance(address adr) public view returns (uint) {
        return token.balanceOf(adr);   // suma de bani adunata in contract
    }

    function createProduct(
        uint executionTotalCost,
        uint devTotalCost,
        uint revTotalCost,
        string memory description,
        string memory expertise
    ) public {
        Product storage product = products[numPorducts++];
        product.startedFunding = true;
        product.startedDeveloping = false;
        product.startedExecution = false;
        product.workDone = false;
        product.managerValidated = false;
        product.revValidated = false;

        product.projectManager = msg.sender;

        product.executionTotalCost = executionTotalCost;
        product.devTotalCost = devTotalCost;
        product.revTotalCost = revTotalCost;


        product.description = description;
        product.expertise = expertise;
    }

    function getProduct(uint prodNumber) public view returns (Product memory) {
        return products[prodNumber];
    }

    function getProductCount() public view returns (uint) {
        return numPorducts;
    }

    function financeProduct(uint prodNumber, uint amount) public requirePayer {
        require(products[prodNumber].startedFunding == true, 'project funding has finished');

        token.transferFrom(msg.sender, address(this), amount);
        products[prodNumber].fundsCollected += amount;

        if (products[prodNumber].fundsCollected >= products[prodNumber].executionTotalCost) {
            products[prodNumber].startedFunding = false;
            products[prodNumber].startedDeveloping = true;
        }

        uint i;
        for (i = 0; i < products[prodNumber].projectPayers.length; i++) {
            if (products[prodNumber].projectPayers[i] == msg.sender) {
                products[prodNumber].payersContribution[i] += amount;
                return;
            }
        }
        products[prodNumber].projectPayers.push(msg.sender);
        products[prodNumber].payersContribution.push(amount);
    }

    function withdrawProductFinance(uint prodNumber, uint amount) public requirePayer {
        require(products[prodNumber].startedFunding == true, 'project funding has finished');

        uint i;
        for (i = 0; i < products[prodNumber].projectPayers.length; i++) {
            if (products[prodNumber].projectPayers[i] == msg.sender) {
                break;
            }
        }
        require(products[prodNumber].projectPayers[i] == msg.sender, 'not financed this product');
        require(products[prodNumber].payersContribution[i] >= amount, 'not enough funds');

        products[prodNumber].payersContribution[i] -= amount;
        products[prodNumber].fundsCollected -= amount;
        token.transfer(msg.sender, amount);
    }

    function returnMoneyToPayers(uint prodNumber) public requireManager {
        require(products[prodNumber].startedFunding == true, 'project funding has finished');
        require(products[prodNumber].projectManager == msg.sender, 'not manager of this product');
        for (uint i = 0; i < products[prodNumber].projectPayers.length; i++) {
            uint amount = products[prodNumber].payersContribution[i];
            if (amount >= 0) {
                token.transfer(products[prodNumber].projectPayers[i], amount);
            }
        }
    }

    function registerRevForProduct(uint productId) public {
        require(products[productId].projectEvaluator == address(0), "rev already exists for project");
        products[productId].projectEvaluator = msg.sender;
    }

    function registerDevForProduct(uint productId) public {
        products[productId].projectFreelancers.push(msg.sender);
        products[productId].numFreelancers++;
    }

    function hireDevToWorkOnProject(uint prodNumber, address devAdr) public {
        require(products[prodNumber].startedDeveloping == true, "Project should be funded");
        require(products[prodNumber].projectManager == msg.sender, 'not manager of this product');

        products[prodNumber].hiredFreelancer = devAdr;
        products[prodNumber].startedExecution = true;
        products[prodNumber].numFreelancers = 0;
        delete products[prodNumber].projectFreelancers;
    }

    function sendWorkDone(uint prodNumber) public {
        require(products[prodNumber].startedExecution == true, "Project should be in execution");
        require(products[prodNumber].hiredFreelancer == msg.sender);
    
        products[prodNumber].managerValidated = false;
        products[prodNumber].workDone = true;
        products[prodNumber].startedExecution = false;
        products[prodNumber].startedDeveloping = false;
        products[prodNumber].startedFunding = false;
    }

    function acceptDevWork(uint prodNumber, bool accepted) public {
        require(products[prodNumber].workDone == true, "Project should be work done");
        require(products[prodNumber].projectManager == msg.sender, 'not manager of this product');


        products[prodNumber].managerValidated = true;
        products[prodNumber].workDone = true;
        products[prodNumber].startedExecution = false;
        products[prodNumber].startedDeveloping = false;
        products[prodNumber].startedFunding = false;
        products[prodNumber].projectDone = true;

        products[prodNumber].managerAnswer = accepted;

        if (accepted == true) {
            token.transfer(products[prodNumber].hiredFreelancer, products[prodNumber].executionTotalCost);
            
            if(freelancers[products[prodNumber].hiredFreelancer].rep < 10) {
                freelancers[products[prodNumber].hiredFreelancer].rep++;
            }
        }
    }

    function acceptManagerValidation(uint prodNumber, bool validated) public {
        require(products[prodNumber].projectEvaluator == msg.sender, "Your are not the evaluator of this project");
        require(products[prodNumber].workDone == true, "Dev haven't yet submited their work");
        require(products[prodNumber].managerValidated == true, "Manager have not validated project");
        require(products[prodNumber].managerAnswer == false, "Manager approved project, no need for this");

        if(validated) {
            token.transfer(products[prodNumber].hiredFreelancer, products[prodNumber].devTotalCost);
            if(freelancers[products[prodNumber].hiredFreelancer].rep < 10) {
                freelancers[products[prodNumber].hiredFreelancer].rep++;
            }
            products[prodNumber].projectDone = true;
        } else {
            if(freelancers[products[prodNumber].hiredFreelancer].rep > 0) {
                freelancers[products[prodNumber].hiredFreelancer].rep--;
            }
            products[prodNumber].projectDone = false;
            
        }

        token.transfer(products[prodNumber].projectEvaluator, products[prodNumber].revTotalCost);
        if (evaluators[products[prodNumber].projectEvaluator].rep < 10) {
                evaluators[products[prodNumber].projectEvaluator].rep++;
        }
    }
}
