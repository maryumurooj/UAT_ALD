import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import App from './App';
import { AuthProvider } from './services/AuthContext.jsx'; // Import AuthProvider

// Find the root element in your HTML
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

// Render your App component wrapped in BrowserRouter and AuthProvider
root.render(
	<React.StrictMode>
		<BrowserRouter> 
			<AuthProvider> {/* Wrap App with AuthProvider */}
				<App />
			</AuthProvider>
		</BrowserRouter>
	</React.StrictMode>
);
