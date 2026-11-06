// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {GhostInvoiceRegistry} from "../src/GhostInvoiceRegistry.sol";
import {GhostGateway} from "../src/GhostGateway.sol";

contract Deploy is Script {
    address constant PRIZE_USDT = 0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7;

    function run() external {
        address backend = vm.envAddress("TREASURY_ADDRESS");
        address payer = vm.envAddress("PAYER_ADDRESS");
        uint256 pk = vm.envUint("DEPLOYER_PRIVATE_KEY");

        vm.startBroadcast(pk);
        GhostInvoiceRegistry registry = new GhostInvoiceRegistry(backend);
        GhostGateway gateway = new GhostGateway(PRIZE_USDT, address(registry));
        registry.setGateway(address(gateway));
        gateway.setPayer(payer, true);
        vm.stopBroadcast();

        console.log("GhostInvoiceRegistry", address(registry));
        console.log("GhostGateway", address(gateway));
        console.log("backendSigner (treasury)", backend);
        console.log("demo payer allowed", payer);
        console.log("prize USDT", PRIZE_USDT);
    }
}
