import React from 'react';
import { motion } from 'framer-motion';
import './DetailedReport.css';

const DetailedReport = ({ section, data, onClose }) => {
  const getSectionIcon = (section) => {
    const icons = {
      performance: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      ),
      accessibility: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      seo: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      ),
      bestPractices: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    };
    return icons[section] || (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    );
  };

  const getSectionTitle = (section) => {
    const titles = {
      performance: 'Performance Analysis',
      accessibility: 'Accessibility Report',
      seo: 'SEO Evaluation',
      bestPractices: 'Best Practices'
    };
    return titles[section] || section;
  };

  return (
    <motion.div
      className="detailed-report"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="report-header">
        <div className="report-title-section">
          <span className="report-icon">{getSectionIcon(section)}</span>
          <h3 className="report-title">{getSectionTitle(section)}</h3>
        </div>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="report-content">
        {section === 'performance' && data.metrics && (
          <div className="metrics-section">
            <h4 className="section-subtitle">Performance Metrics</h4>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Page Load Time</span>
                <span className="metric-value">{data.metrics.pageLoadTime}ms</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">First Contentful Paint</span>
                <span className="metric-value">{data.metrics.firstContentfulPaint}ms</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Largest Contentful Paint</span>
                <span className="metric-value">{data.metrics.largestContentfulPaint}ms</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Time to Interactive</span>
                <span className="metric-value">{data.metrics.timeToInteractive}ms</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Speed Index</span>
                <span className="metric-value">{data.metrics.speedIndex}ms</span>
              </div>
            </div>
          </div>
        )}

        {data.checks && (
          <div className="checks-section">
            <h4 className="section-subtitle">Checks Performed</h4>
            <div className="checks-list">
              {Object.entries(data.checks).map(([key, value]) => (
                <div key={key} className="check-item">
                  <span className={`check-indicator ${value ? 'pass' : 'fail'}`}>
                    {value ? '✓' : '✗'}
                  </span>
                  <span className="check-label">
                    {formatCheckLabel(key)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.suggestions && data.suggestions.length > 0 && (
          <div className="suggestions-section">
            <h4 className="section-subtitle">Improvement Suggestions</h4>
            <ul className="suggestions-list">
              {data.suggestions.map((suggestion, index) => (
                <motion.li
                  key={index}
                  className="suggestion-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="suggestion-bullet">→</span>
                  {suggestion}
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const formatCheckLabel = (key) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/has /gi, '')
    .trim();
};

export default DetailedReport;
