// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Test} from "forge-std/Test.sol";
import {GhostInvoiceRegistry} from "../src/GhostInvoiceRegistry.sol";
import {GhostGateway} from "../src/GhostGateway.sol";
import {MockPrizeUSDT} from "../src/mocks/MockPrizeUSDT.sol";

contract GhostGatewayTest is Test {
    uint256 internal constant PAYER_PK = 0xA11CE;
    address internal payer;
    address internal backend = address(0xBEEF);
    address internal merchant = address(0xA01);
    address internal relayer = address(0x501);

    MockPrizeUSDT internal usdt;
    GhostInvoiceRegistry internal registry;
    GhostGateway internal gateway;

    bytes32 constant TYPEHASH = keccak256(
        "TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)"
    );

    function setUp() public {
        payer = vm.addr(PAYER_PK);
        usdt = new MockPrizeUSDT();
        vm.prank(address(this));
        registry = new GhostInvoiceRegistry(backend);
        gateway = new GhostGateway(address(usdt), address(registry));
        registry.setGateway(address(gateway));
        gateway.setPayer(payer, true);

        usdt.mint(payer, 20 * 1e6);
        vm.deal(relayer, 1 ether);
    }

    function _open(bytes32 id, uint256 amount, uint256 validBefore) internal {
        vm.prank(backend);
        registry.open(id, merchant, amount, 0, validBefore, bytes32(0));
    }

    function _sign(address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce)
        internal
        view
        returns (uint8 v, bytes32 r, bytes32 s)
    {
        bytes32 structHash =
            keccak256(abi.encode(TYPEHASH, payer, to, value, validAfter, validBefore, nonce));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", usdt.DOMAIN_SEPARATOR(), structHash));
        (v, r, s) = vm.sign(PAYER_PK, digest);
    }

    function test_happySettle() public {
        bytes32 id = keccak256("inv-1");
        uint256 amount = 5 * 1e6;
        _open(id, amount, block.timestamp + 15 minutes);
        bytes32 nonce = keccak256("n1");
        (uint8 v, bytes32 r, bytes32 s) = _sign(merchant, amount, 0, block.timestamp + 15 minutes, nonce);

        vm.prank(relayer);
        gateway.settle(id, payer, merchant, amount, 0, block.timestamp + 15 minutes, nonce, v, r, s);

        GhostInvoiceRegistry.Invoice memory inv = registry.getInvoice(id);
        assertEq(uint256(inv.status), uint256(GhostInvoiceRegistry.Status.Paid));
        assertEq(usdt.balanceOf(merchant), amount);
        assertEq(usdt.balanceOf(payer), 15 * 1e6);
    }

    function test_amountMismatchReverts() public {
        bytes32 id = keccak256("inv-2");
        _open(id, 5 * 1e6, block.timestamp + 15 minutes);
        bytes32 nonce = keccak256("n2");
        uint256 wrong = 6 * 1e6;
        (uint8 v, bytes32 r, bytes32 s) = _sign(merchant, wrong, 0, block.timestamp + 15 minutes, nonce);

        vm.prank(relayer);
        vm.expectRevert(GhostGateway.AmountMismatch.selector);
        gateway.settle(id, payer, merchant, wrong, 0, block.timestamp + 15 minutes, nonce, v, r, s);
    }

    function test_expiredInvoiceReverts() public {
        bytes32 id = keccak256("inv-3");
        _open(id, 5 * 1e6, block.timestamp + 60);
        vm.warp(block.timestamp + 120);
        bytes32 nonce = keccak256("n3");
        (uint8 v, bytes32 r, bytes32 s) = _sign(merchant, 5 * 1e6, 0, block.timestamp + 15 minutes, nonce);

        vm.prank(relayer);
        vm.expectRevert(GhostGateway.InvoiceWindow.selector);
        gateway.settle(id, payer, merchant, 5 * 1e6, 0, block.timestamp + 15 minutes, nonce, v, r, s);
    }

    function test_replayReverts() public {
        bytes32 id = keccak256("inv-4");
        uint256 amount = 5 * 1e6;
        _open(id, amount, block.timestamp + 15 minutes);
        bytes32 nonce = keccak256("n4");
        (uint8 v, bytes32 r, bytes32 s) = _sign(merchant, amount, 0, block.timestamp + 15 minutes, nonce);

        vm.prank(relayer);
        gateway.settle(id, payer, merchant, amount, 0, block.timestamp + 15 minutes, nonce, v, r, s);

        bytes32 id2 = keccak256("inv-4b");
        _open(id2, amount, block.timestamp + 15 minutes);
        vm.prank(relayer);
        vm.expectRevert(GhostGateway.Replay.selector);
        gateway.settle(id2, payer, merchant, amount, 0, block.timestamp + 15 minutes, nonce, v, r, s);
    }
}
