// Default local hardhat node URL
export const DEFAULT_RPC_URL = "http://127.0.0.1:8545";

// Placeholder - User must update this after deployment
export const DEFAULT_CONTRACT_ADDRESS = "0x5FbDB23156785EBF1425af549D204344078701s8"; 

export const CONTRACT_ABI = [
  "function issue(string memory _id, string memory _name, string memory _course, string memory _issueDate, string memory _expiryDate) public",
  "function verify(string memory _id) public view returns (string memory, string memory, string memory, string memory)"
];

export const APP_TITLE = "CertVerify";
export const APP_SUBTITLE = "Immutable Credential Verification";