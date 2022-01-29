// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Token is ERC20 {
    uint public initialSupply = 1000000;

    constructor() public ERC20('Lancer', 'LNC') {
        _mint(msg.sender, initialSupply);
    }
}
