const Migrations = artifacts.require('Migrations');
const Token = artifacts.require('Token');
const Marketplace = artifacts.require('Marketplace');

module.exports = function (deployer) {
    // deployer.deploy(Migrations);
    deployer.deploy(Token);
    deployer.deploy(Marketplace);
};
