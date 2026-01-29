import React from 'react';

interface FooterProps {
  blockNumber: number;
}

const Footer: React.FC<FooterProps> = ({ blockNumber }) => {
  return (
    <footer className="w-full py-6 mt-auto border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm">
        <div className="text-slate-500 mb-2 md:mb-0">
          Blockchain CertVerify Prototype &copy; {new Date().getFullYear()}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800 rounded-full px-3 py-1 border border-slate-700">
             <div className={`h-2 w-2 rounded-full ${blockNumber > 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
             <span className="text-slate-300 font-mono text-xs">
               {blockNumber > 0 ? `Block: #${blockNumber}` : 'Syncing...'}
             </span>
          </div>
          <span className="text-slate-600 text-xs hidden sm:block">
            Network: Local Hardhat
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;