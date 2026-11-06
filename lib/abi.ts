import { parseAbi } from "viem";

export const registryAbi = parseAbi([
  "function open(bytes32 invoiceId, address payee, uint256 amount, uint256 validAfter, uint256 validBefore, bytes32 payerHint)",
  "function getInvoice(bytes32 invoiceId) view returns ((address merchant, address payee, uint256 amount, uint256 validAfter, uint256 validBefore, uint8 status, bytes32 payerHint))",
  "function cancel(bytes32 invoiceId)",
  "event InvoiceOpened(bytes32 indexed invoiceId, address indexed payee, uint256 amount, uint256 validAfter, uint256 validBefore)",
  "event InvoicePaid(bytes32 indexed invoiceId, address indexed payer, uint256 amount)",
]);

export const gatewayAbi = parseAbi([
  "function settle(bytes32 invoiceId, address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)",
  "function paused() view returns (bool)",
  "function payerAllowed(address) view returns (bool)",
  "function setPayer(address payer, bool allowed)",
  "function amountCap() view returns (uint256)",
  "event Settled(bytes32 indexed invoiceId, address indexed from, address indexed to, uint256 value)",
]);

export const usdtAbi = parseAbi([
  "function name() view returns (string)",
  "function decimals() view returns (uint8)",
  "function DOMAIN_SEPARATOR() view returns (bytes32)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function authorizationState(address authorizer, bytes32 nonce) view returns (bool)",
  "function transferWithAuthorization(address from, address to, uint256 value, uint256 validAfter, uint256 validBefore, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)",
]);

export const InvoiceStatus = {
  None: 0,
  Open: 1,
  Paid: 2,
  Cancelled: 3,
} as const;
