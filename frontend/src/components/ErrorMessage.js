import React from 'react';
import { motion } from 'framer-motion';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <motion.div
      className="error-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="error-title">Analysis Failed</h3>
      <p className="error-message">{message}</p>
      
      <div className="error-suggestions">
        <p className="suggestions-title">Common issues:</p>
        <ul className="suggestions-list">
          <li>Check if the URL is correct and accessible</li>
          <li>Ensure the website is online and responding</li>
          <li>Try with or without https:// prefix</li>
          <li>Verify there are no firewall restrictions</li>
        </ul>
      </div>

      {onRetry && (
        <motion.button
          className="retry-button"
          onClick={onRetry}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Try Again
        </motion.button>
      )}
    </motion.div>
  );
};

export default ErrorMessage;
