// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/// @notice Prize USDT on Whitechain Sepolia: 0xcedfB56113143d55b2358b8CFbB0dEB5Ad2f55a7
/// Interface of the methods we actually use. Do not call receiveWithAuthorization:
/// that requires msg.sender == to, so a gateway settling to the merchant would revert.
interface IPrizeUSDT {
    function name() external view returns (string memory);
    function decimals() external view returns (uint8);
    function DOMAIN_SEPARATOR() external view returns (bytes32);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function authorizationState(address authorizer, bytes32 nonce) external view returns (bool);

    function transferWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function receiveWithAuthorization(
        address from,
        address to,
        uint256 value,
        uint256 validAfter,
        uint256 validBefore,
        bytes32 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function cancelAuthorization(address authorizer, bytes32 nonce, uint8 v, bytes32 r, bytes32 s)
        external;
}
