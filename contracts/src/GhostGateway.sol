// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {GhostInvoiceRegistry} from "./GhostInvoiceRegistry.sol";
import {IPrizeUSDT} from "./interfaces/IPrizeUSDT.sol";

/// @title GhostGateway
/// @notice Relayer-only settle path: prize USDT transferWithAuthorization then markPaid.
///         Gateway holds no USDT float. Relayer pays WBT gas.
contract GhostGateway {
    IPrizeUSDT public immutable prizeUSDT;
    GhostInvoiceRegistry public immutable registry;

    address public owner;
    bool public paused;
    uint256 public amountCap;
    mapping(address payer => bool) public payerAllowed;

    event PayerSet(address indexed payer, bool allowed);
    event Paused(bool paused);
    event AmountCapSet(uint256 cap);
    event Settled(
        bytes32 indexed invoiceId, address indexed from, address indexed to, uint256 value
    );

    error NotOwner();
    error PausedNow();
    error PayerDenied();
    error OverCap();
    error NotOpen();
    error PayeeMismatch();
    error AmountMismatch();
    error InvoiceWindow();
    error AuthWindow();
    error Replay();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address prizeUSDT_, address registry_) {
        prizeUSDT = IPrizeUSDT(prizeUSDT_);
        registry = GhostInvoiceRegistry(registry_);
        owner = msg.sender;
        amountCap = 100 * 1e6; // 100 USDT, 6 decimals
    }

    function setPayer(address payer, bool allowed) external onlyOwner {
        payerAllowed[payer] = allowed;
        emit PayerSet(payer, allowed);
    }

    function setPaused(bool paused_) external onlyOwner {
        paused = paused_;
        emit Paused(paused_);
    }

    function setAmountCap(uint256 cap) external onlyOwner {
        amountCap = cap;
        emit AmountCapSet(cap);
    }

    function settle(
        bytes32 invoiceId,
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        if (paused) revert PausedNow();
        if (!payerAllowed[from]) revert PayerDenied();
        if (value > amountCap) revert OverCap();

        GhostInvoiceRegistry.Invoice memory inv = registry.getInvoice(invoiceId);
        if (inv.status != GhostInvoiceRegistry.Status.Open) revert NotOpen();
        if (to != inv.payee) revert PayeeMismatch();
        if (value != inv.amount) revert AmountMismatch();
        if (block.timestamp < inv.validAfter || block.timestamp >= inv.validBefore) {
            revert InvoiceWindow();
        }
        if (block.timestamp <= validAfter || block.timestamp >= validBefore) revert AuthWindow();
        if (prizeUSDT.authorizationState(from, nonce)) revert Replay();

        prizeUSDT.transferWithAuthorization(
            from, to, value, validAfter, validBefore, nonce, v, r, s
        );
        registry.markPaid(invoiceId, from);
        emit Settled(invoiceId, from, to, value);
    }
}
