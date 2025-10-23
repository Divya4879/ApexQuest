import React from 'react';

interface BannedPageProps {
  reason: string;
  expiresAt: Date;
}

export const BannedPage: React.FC<BannedPageProps> = ({ reason, expiresAt }) => {
  const timeRemaining = expiresAt.getTime() - Date.now();
  const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-red-900/20 border border-red-500 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">🚫</div>
        
        <h1 className="text-2xl font-bold text-red-400 mb-4">
          Account Temporarily Banned
        </h1>
        
        <div className="bg-gray-800 rounded p-4 mb-6">
          <div className="text-gray-300 text-sm mb-2">Reason:</div>
          <div className="text-white font-medium mb-4">{reason}</div>
          
          <div className="text-gray-300 text-sm mb-2">Ban expires:</div>
          <div className="text-red-400 font-medium mb-2">
            {expiresAt.toLocaleString()}
          </div>
          
          <div className="text-gray-400 text-sm">
            ({hoursRemaining} hours remaining)
          </div>
        </div>
        
        <div className="text-gray-400 text-sm">
          Please follow community guidelines when your ban expires.
          <br />
          Contact support if you believe this is an error.
        </div>
        
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
        >
          Check Ban Status
        </button>
      </div>
    </div>
  );
};

export default BannedPage;
