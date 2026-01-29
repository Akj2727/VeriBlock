import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Input from './components/Input';
import Button from './components/Button';
import { ViewState, AppConfig, UserRole, VerificationResult, TransactionReceiptInfo } from './types';
import { issueCertificate, verifyCertificate, getCurrentBlockNumber } from './services/blockchainService';
import { generateCertificateInsight } from './services/geminiService';
import { DEFAULT_CONTRACT_ADDRESS, DEFAULT_RPC_URL, APP_TITLE, APP_SUBTITLE } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [userRole, setUserRole] = useState<UserRole>('verifier'); // Default role
  const [config, setConfig] = useState<AppConfig>({
    contractAddress: DEFAULT_CONTRACT_ADDRESS,
    rpcUrl: DEFAULT_RPC_URL
  });

  // Blockchain Status
  const [currentBlock, setCurrentBlock] = useState<number>(0);

  // Poll for block number
  useEffect(() => {
    const fetchBlock = async () => {
      const block = await getCurrentBlockNumber(config.rpcUrl);
      setCurrentBlock(block);
    };

    fetchBlock(); // Initial fetch
    const interval = setInterval(fetchBlock, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [config.rpcUrl, view]); 


  // Issue State
  const [issueId, setIssueId] = useState('');
  const [issueName, setIssueName] = useState('');
  const [issueCourse, setIssueCourse] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [issueExpiry, setIssueExpiry] = useState('');
  const [isIssuing, setIsIssuing] = useState(false);
  const [issueReceipt, setIssueReceipt] = useState<TransactionReceiptInfo | null>(null);
  const [issueError, setIssueError] = useState<string | null>(null);

  // Verify State
  const [verifyId, setVerifyId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerificationResult | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleIssue = async () => {
    setIssueError(null);
    setIssueReceipt(null);

    if (!issueId || !issueName || !issueCourse || !issueDate) {
      setIssueError('Please fill in all required fields (ID, Name, Course, Issue Date)');
      return;
    }
    
    setIsIssuing(true);
    try {
      const receipt = await issueCertificate(
        config.contractAddress, 
        config.rpcUrl, 
        issueId, 
        issueName,
        issueCourse,
        issueDate,
        issueExpiry || 'N/A'
      );
      setIssueReceipt(receipt);
      getCurrentBlockNumber(config.rpcUrl).then(setCurrentBlock);

      setIssueId('');
      setIssueName('');
      setIssueCourse('');
      setIssueDate('');
      setIssueExpiry('');
    } catch (err: any) {
      setIssueError(err.message);
    } finally {
      setIsIssuing(false);
    }
  };

  const handleVerify = async () => {
    setVerifyResult(null);
    setAiInsight('');
    if (!verifyId) return;

    setIsVerifying(true);
    try {
      const result = await verifyCertificate(
        config.contractAddress, 
        config.rpcUrl, 
        verifyId
      );

      if (result) {
        setVerifyResult(result);
        
        setIsAiLoading(true);
        generateCertificateInsight(result.name || '', verifyId, config.contractAddress)
          .then(insight => setAiInsight(insight))
          .catch(e => console.error(e))
          .finally(() => setIsAiLoading(false));

      } else {
        setVerifyResult({ isValid: false, found: false } as any);
      }
    } catch (err) {
      console.error(err);
      setVerifyResult({ isValid: false, found: false } as any);
    } finally {
      setIsVerifying(false);
    }
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <div className="bg-blue-500/10 p-4 rounded-full mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4">
        {APP_TITLE}
      </h1>
      <p className="text-xl text-slate-400 max-w-2xl mb-8">
        {APP_SUBTITLE} <br/>
        Issue tamper-proof academic credentials and allow anyone to verify them instantly on the Ethereum blockchain.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => setView(ViewState.VERIFY)} className="text-lg px-8 py-3">
          Verify a Certificate
        </Button>
        {userRole === 'admin' && (
          <Button onClick={() => setView(ViewState.ISSUE)} variant="secondary" className="text-lg px-8 py-3">
            Issue Certificate
          </Button>
        )}
      </div>
      {userRole !== 'admin' && (
         <p className="mt-8 text-sm text-slate-600">
           Note: Switch to "Admin" role in the navbar to issue certificates.
         </p>
      )}
    </div>
  );

  const renderIssue = () => (
    <div className="max-w-xl mx-auto w-full">
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="bg-blue-600 rounded-lg p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </span>
          Issue New Certificate
        </h2>
        
        <div className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4 text-sm text-blue-200">
            <p>Admin Mode: This action will write data to the blockchain. Ensure your local Hardhat node is running.</p>
          </div>

          <Input 
            label="Certificate ID" 
            placeholder="e.g. 2024-CS-001" 
            value={issueId} 
            onChange={(e) => setIssueId(e.target.value)} 
          />
          <Input 
            label="Student Name" 
            placeholder="e.g. Alice Johnson" 
            value={issueName} 
            onChange={(e) => setIssueName(e.target.value)} 
          />
          <Input 
            label="Course / Degree Name" 
            placeholder="e.g. Bachelor of Computer Science" 
            value={issueCourse} 
            onChange={(e) => setIssueCourse(e.target.value)} 
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Issue Date" 
              type="date"
              value={issueDate} 
              onChange={(e) => setIssueDate(e.target.value)} 
            />
            <Input 
              label="Expiration Date (Optional)" 
              type="date"
              value={issueExpiry} 
              onChange={(e) => setIssueExpiry(e.target.value)} 
            />
          </div>
          
          <div className="pt-2">
            <Button onClick={handleIssue} isLoading={isIssuing} className="w-full">
              {isIssuing ? 'Minting Certificate...' : 'Issue Certificate (As Admin)'}
            </Button>
          </div>

          {issueError && (
            <div className="p-4 rounded-lg text-sm border bg-red-900/20 border-red-800 text-red-200">
              {issueError}
            </div>
          )}

          {issueReceipt && (
            <div className="mt-6 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
               <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Blockchain Receipt</span>
                  <div className="flex gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs text-slate-500">Mined Successfully</span>
                  </div>
               </div>
               <div className="p-4 space-y-3 font-mono text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction Hash:</span>
                    <span className="text-blue-400 break-all ml-4 text-right">{issueReceipt.hash}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Block Number:</span>
                    <span className="text-yellow-400">#{issueReceipt.blockNumber}</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-slate-500">Gas Used (Miner Fee):</span>
                    <span className="text-purple-400">{issueReceipt.gasUsed} units</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-slate-500">From (Admin):</span>
                    <span className="text-slate-400 truncate w-32">{issueReceipt.from}</span>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderVerify = () => (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl mb-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
           <span className="bg-purple-600 rounded-lg p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          Public Verification
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <Input 
            label="Certificate ID" 
            placeholder="Enter ID to verify..." 
            value={verifyId} 
            onChange={(e) => setVerifyId(e.target.value)} 
          />
          <Button onClick={handleVerify} isLoading={isVerifying} className="sm:mb-0.5">
            Verify
          </Button>
        </div>
      </div>

      {verifyResult && verifyResult.isValid && (
        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/10 border border-green-800 rounded-2xl p-8 shadow-xl animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-500 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Certificate Valid</h3>
              <p className="text-green-400 text-sm">Verified on Ethereum Blockchain</p>
            </div>
          </div>
          
          <div className="space-y-6 mt-6 border-t border-green-800/50 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Student Name</p>
                <p className="text-2xl font-mono text-white">{verifyResult.name}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Certificate ID</p>
                <p className="text-lg font-mono text-white">{verifyId}</p>
              </div>
            </div>

            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Course / Program</p>
              <p className="text-xl font-medium text-white">{verifyResult.course}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Issued On</p>
                <p className="text-base text-white">{verifyResult.issueDate}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Expires On</p>
                <p className="text-base text-white">{verifyResult.expiryDate || 'Never'}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wide">AI Credential Insight</p>
            </div>
            {isAiLoading ? (
              <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse"></div>
            ) : (
              <p className="text-slate-300 text-sm italic">
                "{aiInsight || 'No insight available.'}"
              </p>
            )}
          </div>
        </div>
      )}

      {verifyResult && !verifyResult.isValid && (
         <div className="bg-red-900/20 border border-red-800 rounded-2xl p-6 text-center">
            <h3 className="text-lg font-bold text-red-400 mb-2">Certificate Not Found</h3>
            <p className="text-red-200 text-sm">No record exists on the blockchain for ID: <span className="font-mono">{verifyId}</span></p>
         </div>
      )}
    </div>
  );

  const renderSettings = () => (
     <div className="max-w-xl mx-auto w-full">
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">Configuration</h2>
        <div className="space-y-6">
          <Input 
            label="Contract Address" 
            value={config.contractAddress}
            onChange={(e) => setConfig({...config, contractAddress: e.target.value})}
          />
           <Input 
            label="RPC URL" 
            value={config.rpcUrl}
            onChange={(e) => setConfig({...config, rpcUrl: e.target.value})}
          />
          <div className="bg-slate-900 rounded-lg p-4 text-xs text-slate-500 font-mono">
            <p className="mb-2">Current Constants:</p>
            <p>ADDR: {DEFAULT_CONTRACT_ADDRESS}</p>
            <p>RPC: {DEFAULT_RPC_URL}</p>
          </div>
          <Button onClick={() => setView(ViewState.HOME)} variant="secondary">Back to Home</Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      <Navbar currentView={view} setView={setView} userRole={userRole} setUserRole={setUserRole} />
      
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
        {view === ViewState.HOME && renderHome()}
        {view === ViewState.ISSUE && (userRole === 'admin' ? renderIssue() : renderHome())}
        {view === ViewState.VERIFY && renderVerify()}
        {view === ViewState.SETTINGS && renderSettings()}
      </main>

      <Footer blockNumber={currentBlock} />
    </div>
  );
};

export default App;