import React from 'react';
import { motion } from 'framer-motion';
import './SSLSection.css';

const SSLSection = ({ data }) => {
  const getValidityStatusColor = (status) => {
    switch (status) {
      case 'valid':
        return 'var(--accent-green)';
      case 'expiring-soon':
        return 'var(--accent-amber)';
      case 'expired':
        return 'var(--accent-red)';
      default:
        return 'var(--text-muted)';
    }
  };

  return (
    <motion.div
      className="ssl-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="ssl-header">
        <h3 className="ssl-title">
          <span className="ssl-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          SSL Certificate Analysis
        </h3>
        <div
          className="ssl-status-badge"
          style={{
            background: data.valid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: data.valid ? 'var(--accent-green)' : 'var(--accent-red)',
            borderColor: data.valid ? 'var(--accent-green)' : 'var(--accent-red)'
          }}
        >
          {data.valid ? 'Valid Certificate' : 'Invalid Certificate'}
        </div>
      </div>

      <div className="ssl-grid">
        <div className="ssl-card">
          <div className="ssl-card-header">
            <span className="ssl-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </span>
            <h4>Validity Period</h4>
          </div>
          <div className="ssl-card-content">
            <div className="ssl-info-row">
              <span className="ssl-info-label">Valid From:</span>
              <span className="ssl-info-value">
                {new Date(data.validFrom).toLocaleDateString()}
              </span>
            </div>
            <div className="ssl-info-row">
              <span className="ssl-info-label">Valid To:</span>
              <span className="ssl-info-value">
                {new Date(data.validTo).toLocaleDateString()}
              </span>
            </div>
            <div className="ssl-info-row">
              <span className="ssl-info-label">Days Remaining:</span>
              <span
                className="ssl-info-value ssl-days-remaining"
                style={{ color: getValidityStatusColor(data.validityStatus) }}
              >
                {data.daysRemaining} days
              </span>
            </div>
          </div>
        </div>

        <div className="ssl-card">
          <div className="ssl-card-header">
            <span className="ssl-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </span>
            <h4>Certificate Issuer</h4>
          </div>
          <div className="ssl-card-content">
            <div className="ssl-info-row">
              <span className="ssl-info-label">Organization:</span>
              <span className="ssl-info-value">{data.issuer.organization}</span>
            </div>
            <div className="ssl-info-row">
              <span className="ssl-info-label">Common Name:</span>
              <span className="ssl-info-value">{data.issuer.commonName}</span>
            </div>
            <div className="ssl-info-row">
              <span className="ssl-info-label">Country:</span>
              <span className="ssl-info-value">{data.issuer.country}</span>
            </div>
          </div>
        </div>

        <div className="ssl-card">
          <div className="ssl-card-header">
            <span className="ssl-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </span>
            <h4>Security Details</h4>
          </div>
          <div className="ssl-card-content">
            <div className="ssl-info-row">
              <span className="ssl-info-label">TLS Version:</span>
              <span className="ssl-info-value ssl-tls-version">{data.tlsVersion}</span>
            </div>
            <div className="ssl-info-row">
              <span className="ssl-info-label">Chain Trust:</span>
              <span className="ssl-info-value">
                <span className={`ssl-status-indicator ${data.chainTrust === 'trusted' ? 'trusted' : 'untrusted'}`}>
                  {data.chainTrust === 'trusted' ? '✓' : '✗'}
                </span>
                {data.chainTrust}
              </span>
            </div>
            <div className="ssl-info-row">
              <span className="ssl-info-label">Mixed Content:</span>
              <span className="ssl-info-value">
                <span className={`ssl-status-indicator ${!data.mixedContent ? 'trusted' : 'untrusted'}`}>
                  {!data.mixedContent ? '✓' : '✗'}
                </span>
                {data.mixedContent ? 'Detected' : 'None'}
              </span>
            </div>
          </div>
        </div>

        <div className="ssl-card">
          <div className="ssl-card-header">
            <span className="ssl-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </span>
            <h4>Connection Status</h4>
          </div>
          <div className="ssl-card-content">
            <div className="ssl-info-row">
              <span className="ssl-info-label">HTTPS Support:</span>
              <span className="ssl-info-value">
                <span className={`ssl-status-indicator ${data.httpsSupport ? 'trusted' : 'untrusted'}`}>
                  {data.httpsSupport ? '✓' : '✗'}
                </span>
                {data.httpsSupport ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="ssl-info-row">
              <span className="ssl-info-label">Secure Connection:</span>
              <span className="ssl-info-value">
                <span className={`ssl-status-indicator ${data.secureConnection ? 'trusted' : 'untrusted'}`}>
                  {data.secureConnection ? '✓' : '✗'}
                </span>
                {data.secureConnection ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SSLSection;
