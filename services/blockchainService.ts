import { ethers } from 'ethers';
import { CONTRACT_ABI } from '../constants';
import { VerificationResult, TransactionReceiptInfo } from '../types';

// We use a singleton-like pattern for the provider to ensure we don't recreate it constantly
let provider: ethers.JsonRpcProvider | null = null;

export const getProvider = (rpcUrl: string): ethers.JsonRpcProvider => {
  if (!provider || provider._getConnection().url !== rpcUrl) {
    provider = new ethers.JsonRpcProvider(rpcUrl);
  }
  return provider;
};

export const getContract = (address: string, rpcUrl: string, signer?: ethers.Signer) => {
  const prov = getProvider(rpcUrl);
  return new ethers.Contract(address, CONTRACT_ABI, signer || prov);
};

export const getCurrentBlockNumber = async (rpcUrl: string): Promise<number> => {
  try {
    const prov = getProvider(rpcUrl);
    return await prov.getBlockNumber();
  } catch (error) {
    // Fail silently for block polling to avoid console spam
    return 0;
  }
};

export const issueCertificate = async (
  contractAddress: string, 
  rpcUrl: string, 
  certId: string, 
  studentName: string,
  courseName: string,
  issueDate: string,
  expiryDate: string
): Promise<TransactionReceiptInfo> => {
  try {
    const prov = getProvider(rpcUrl);
    // Hardhat Account #0 (The Deployer/Admin)
    const signer = await prov.getSigner(0); 
    
    const contract = getContract(contractAddress, rpcUrl, signer);
    
    const tx = await contract.issue(certId, studentName, courseName, issueDate, expiryDate);
    const receipt = await tx.wait();
    
    if (!receipt) throw new Error("Transaction failed or no receipt returned");

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      effectiveGasPrice: ethers.formatUnits(receipt.gasPrice || 0, 'gwei'),
      from: receipt.from,
      to: receipt.to || contractAddress
    };

  } catch (error: any) {
    console.error("Issuance Error:", error);
    throw new Error(error.reason || error.message || "Failed to issue certificate");
  }
};

export const verifyCertificate = async (
  contractAddress: string, 
  rpcUrl: string, 
  certId: string
): Promise<VerificationResult | null> => {
  try {
    const contract = getContract(contractAddress, rpcUrl);
    
    // Call the view function (no gas cost)
    // Returns tuple: (name, course, issueDate, expiryDate)
    const result = await contract.verify(certId);
    
    // Solidity returns empty string if not found. Check name (index 0).
    const name = result[0];
    
    if (name && name.length > 0) {
      return {
        isValid: true,
        name: result[0],
        course: result[1],
        issueDate: result[2],
        expiryDate: result[3]
      };
    }
    
    return null;
  } catch (error) {
    console.error("Verification Error:", error);
    return null;
  }
};