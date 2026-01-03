import React, { useState, useEffect } from 'react';

const LoadingPage = ({ onLoadingComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-complete loading after 3 seconds (adjust as needed)
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onLoadingComplete();
      }, 500); // Wait for fade out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <div 
      className={`fixed inset-0 bg-white flex items-center justify-center z-50 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-center">
        {/* Replace this SVG with your actual logo */}
        <div className="animate-pulse">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto mb-4 animate-fade"
          >
            {/* Sample logo - replace with your actual logo SVG */}
            <circle cx="60" cy="60" r="50" stroke="#3B82F6" strokeWidth="4" fill="none" />
            <path
              d="M40 60 L55 75 L80 45"
              stroke="#3B82F6"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        
        {/* Loading text (optional) */}
        <p className="text-gray-600 text-lg font-medium animate-pulse">
          Loading...
        </p>
        
        {/* Loading dots animation */}
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        
        .animate-fade {
          animation: fade 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Updated App component with loading integration
const AppWithLoading = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingPage onLoadingComplete={handleLoadingComplete} />;
  }

  // Your main app content goes here
  return (
    <div className="App">
      {/* Your existing app content */}
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Your App!</h1>
        <p className="text-gray-600">Loading complete - your app is ready!</p>
      </div>
    </div>
  );
};

export default AppWithLoading;