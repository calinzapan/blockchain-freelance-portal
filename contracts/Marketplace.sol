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

        uint[] payersContribution;
        uint fundsCollected;
        uint[] freelancersSalaries;
        uint evaluatorSalary;

        address projectManager;

        int developingStartingDate;
        int devMaxTimeout;
        int revStartingDate;
        int revMaxTimeout;
        int projectStartingDate;
        int projectMaxTimeout;

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
        int devMaxTimeout,
        int revMaxTimeout,
        int projectStartingDate,
        int projectMaxTimeout,
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
        product.developingStartingDate = - 1;
        product.revStartingDate = - 1;

        product.executionTotalCost = executionTotalCost;
        product.devTotalCost = devTotalCost;
        product.revTotalCost = revTotalCost;
        product.totalCost = executionTotalCost + devTotalCost + revTotalCost;

        product.devMaxTimeout = devMaxTimeout;
        product.revMaxTimeout = revMaxTimeout;
        product.projectStartingDate = projectStartingDate;
        product.projectMaxTimeout = projectMaxTimeout;

        product.description = description;
        product.expertise = expertise;
    }

    function getProduct(uint prodNumber) public view returns (Product memory) {
        return products[prodNumber];
    }

    function getProductCount() public view returns (uint) {
        return numPorducts;
    }
}
