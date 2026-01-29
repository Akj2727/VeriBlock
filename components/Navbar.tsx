import React from 'react';
import { ViewState, UserRole } from '../types';
import { APP_TITLE } from '../constants';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, userRole, setUserRole }) => {
  
  const navItems = [
    { id: ViewState.HOME, label: 'Home', requiredRole: 'verifier' }, // Visible to all
    { id: ViewState.VERIFY, label: 'Verify', requiredRole: 'verifier' },
    { id: ViewState.ISSUE, label: 'Issue (Admin)', requiredRole: 'admin' },
  ];

  const handleRoleToggle = () => {
    const newRole = userRole === 'admin' ? 'verifier' : 'admin';
    setUserRole(newRole);
    // If switching to verifier while on Issue page, go home
    if (newRole === 'verifier' && currentView === ViewState.ISSUE) {
      setView(ViewState.HOME);
    }
  };

  return (
    <nav className="w-full bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(ViewState.HOME)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              {APP_TITLE}
            </span>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="flex gap-1">
              {navItems.map((item) => {
                if (item.requiredRole === 'admin' && userRole !== 'admin') return null;
                return (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentView === item.id
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>

            <div className="h-6 w-px bg-slate-700 mx-2"></div>

            <button 
              onClick={handleRoleToggle}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                userRole === 'admin' 
                  ? 'border-blue-500 text-blue-400 hover:bg-blue-900/20' 
                  : 'border-slate-600 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Role: {userRole === 'admin' ? 'Admin' : 'Verifier'}
            </button>

            <button
               onClick={() => setView(ViewState.SETTINGS)}
               className="ml-2 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors"
               aria-label="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;