import React from 'react';

const ReferralLandingFooter: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <img src="https://recruithp.jp/src/hraim_favicon.webp" alt="HRaim" className="h-8 w-8 mx-auto mb-4" />
        <p className="text-gray-400 text-sm">
          © {new Date().getFullYear()} HRaim. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default ReferralLandingFooter;