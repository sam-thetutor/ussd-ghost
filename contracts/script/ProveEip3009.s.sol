// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {GhostInvoiceRegistry} from "../src/GhostInvoiceRegistry.sol";
import {GhostGateway} from "../src/GhostGateway.sol";
import {IPrizeUSDT} from "../src/interfaces/IPrizeUSDT.sol";

/// @notice Live 1874 proof: open invoice, sign EIP-3009 off the payer key, relayer settle.
/// Prefer `npm run prove` (scripts/prove-auth.ts) for explorer-link printing.
contract ProveEip3009 is Script {
    bytes32 constant TRANSFER_WITH_AUTHORIZATION_TYPEHASH = keccak256(
        "TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)"
    );

    function run() external {
        GhostInvoiceRegistry registry = GhostInvoiceRegistry(vm.envAddress("REGISTRY_ADDRESS"));
        GhostGateway gateway = GhostGateway(vm.envAddress("GATEWAY_ADDRESS"));
        IPrizeUSDT usdt = IPrizeUSDT(vm.envAddress("PRIZE_USDT"));

        uint256 treasuryPk = vm.envUint("TREASURY_PRIVATE_KEY");
        uint256 payerPk = vm.envUint("PAYER_CUSTODY_KEY");
        uint256 relayerPk = vm.envUint("RELAYER_PRIVATE_KEY");
        address payer = vm.addr(payerPk);
        address payee = vm.envAddress("MERCHANT_PAYEE");

        uint256 value = 5 * 1e6;
        uint256 validAfter = 0;
        uint256 validBefore = block.timestamp + 15 minutes;
        bytes32 invoiceId = keccak256(abi.encode(payer, payee, value, block.timestamp));
        bytes32 nonce = keccak256(abi.encode("ghost", invoiceId, block.timestamp));
        bytes32 payerHint = keccak256(abi.encodePacked(vm.envString("DEMO_PHONE")));

        vm.startBroadcast(treasuryPk);
        registry.open(invoiceId, payee, value, validAfter, validBefore, payerHint);
        vm.stopBroadcast();

        bytes32 structHash = keccak256(
            abi.encode(
                TRANSFER_WITH_AUTHORIZATION_TYPEHASH, payer, payee, value, validAfter, validBefore, nonce
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", usdt.DOMAIN_SEPARATOR(), structHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(payerPk, digest);

        vm.startBroadcast(relayerPk);
        gateway.settle(invoiceId, payer, payee, value, validAfter, validBefore, nonce, v, r, s);
        vm.stopBroadcast();

        console.log("invoiceId");
        console.logBytes32(invoiceId);
        console.log("payer WBT should stay 0; USDT moved to merchant");
        console.log("payer USDT", usdt.balanceOf(payer));
        console.log("merchant USDT", usdt.balanceOf(payee));
    }
}
