// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/// @title GhostInvoiceRegistry
/// @notice On-chain source of truth for kiosk invoices. Weekend: backendSigner opens.
contract GhostInvoiceRegistry {
    enum Status {
        None,
        Open,
        Paid,
        Cancelled
    }

    struct Invoice {
        address merchant;
        address payee;
        uint256 amount;
        uint256 validAfter;
        uint256 validBefore;
        Status status;
        bytes32 payerHint;
    }

    address public owner;
    address public backendSigner;
    address public gateway;

    mapping(bytes32 invoiceId => Invoice) public invoices;

    event InvoiceOpened(
        bytes32 indexed invoiceId,
        address indexed payee,
        uint256 amount,
        uint256 validAfter,
        uint256 validBefore
    );
    event InvoicePaid(bytes32 indexed invoiceId, address indexed payer, uint256 amount);
    event InvoiceCancelled(bytes32 indexed invoiceId);
    event GatewaySet(address indexed gateway);
    event BackendSignerSet(address indexed signer);

    error NotOwner();
    error NotBackend();
    error NotGateway();
    error InvoiceExists();
    error BadPayee();
    error BadAmount();
    error BadWindow();
    error NotOpen();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyBackend() {
        if (msg.sender != backendSigner) revert NotBackend();
        _;
    }

    modifier onlyGateway() {
        if (msg.sender != gateway) revert NotGateway();
        _;
    }

    constructor(address backendSigner_) {
        owner = msg.sender;
        backendSigner = backendSigner_;
        emit BackendSignerSet(backendSigner_);
    }

    function setGateway(address gateway_) external onlyOwner {
        gateway = gateway_;
        emit GatewaySet(gateway_);
    }

    function setBackendSigner(address signer) external onlyOwner {
        backendSigner = signer;
        emit BackendSignerSet(signer);
    }

    function getInvoice(bytes32 invoiceId) external view returns (Invoice memory) {
        return invoices[invoiceId];
    }

    function open(
        bytes32 invoiceId,
        address payee,
        uint256 amount,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 payerHint
    ) external onlyBackend {
        if (invoices[invoiceId].status != Status.None) revert InvoiceExists();
        if (payee == address(0)) revert BadPayee();
        if (amount == 0) revert BadAmount();
        if (validBefore <= validAfter) revert BadWindow();

        invoices[invoiceId] = Invoice({
            merchant: msg.sender,
            payee: payee,
            amount: amount,
            validAfter: validAfter,
            validBefore: validBefore,
            status: Status.Open,
            payerHint: payerHint
        });

        emit InvoiceOpened(invoiceId, payee, amount, validAfter, validBefore);
    }

    function markPaid(bytes32 invoiceId, address payer) external onlyGateway {
        Invoice storage inv = invoices[invoiceId];
        if (inv.status != Status.Open) revert NotOpen();
        inv.status = Status.Paid;
        emit InvoicePaid(invoiceId, payer, inv.amount);
    }

    function cancel(bytes32 invoiceId) external {
        Invoice storage inv = invoices[invoiceId];
        if (inv.status != Status.Open) revert NotOpen();
        if (msg.sender != backendSigner && msg.sender != inv.merchant) revert NotBackend();
        inv.status = Status.Cancelled;
        emit InvoiceCancelled(invoiceId);
    }
}
