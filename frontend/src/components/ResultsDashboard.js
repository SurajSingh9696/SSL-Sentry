import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SSLSection from './SSLSection';
import ScoreCard from './ScoreCard';
import DetailedReport from './DetailedReport';
import './ResultsDashboard.css';

const ResultsDashboard = ({ results }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const performanceData = results.performance || {};
  const sslData = results.ssl || {};

  const overallScore = calculateOverallScore(performanceData);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      className="results-dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="results-header" variants={itemVariants}>
        <div className="results-info">
          <h2 className="results-url">{results.hostname}</h2>
          <p className="results-timestamp">
            Analyzed on {new Date(results.analyzedAt).toLocaleString()}
          </p>
        </div>
      </motion.div>

      <motion.div className="overall-score-section" variants={itemVariants}>
        <div className="overall-score-card">
          <div className="score-circle-wrapper">
            <svg className="score-circle" viewBox="0 0 120 120">
              <circle
                className="score-circle-bg"
                cx="60"
                cy="60"
                r="54"
              />
              <motion.circle
                className="score-circle-progress"
                cx="60"
                cy="60"
                r="54"
                initial={{ strokeDashoffset: 339 }}
                animate={{ strokeDashoffset: 339 - (339 * overallScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{
                  stroke: getScoreColor(overallScore)
                }}
              />
            </svg>
            <div className="score-value">
              <span className="score-number">{overallScore}</span>
            </div>
          </div>
          <div className="score-label">
            <h3>Overall Score</h3>
            <p>{getScoreLabel(overallScore)}</p>
          </div>
        </div>
      </motion.div>

      {sslData && (
        <motion.div variants={itemVariants}>
          <SSLSection data={sslData} />
        </motion.div>
      )}

      <motion.div className="score-cards-grid" variants={itemVariants}>
        <ScoreCard
          title="Performance"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          }
          score={performanceData.performance?.score || 0}
          onClick={() => toggleSection('performance')}
          isExpanded={expandedSection === 'performance'}
        />
        <ScoreCard
          title="Accessibility"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }
          score={performanceData.accessibility?.score || 0}
          onClick={() => toggleSection('accessibility')}
          isExpanded={expandedSection === 'accessibility'}
        />
        <ScoreCard
          title="SEO"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          }
          score={performanceData.seo?.score || 0}
          onClick={() => toggleSection('seo')}
          isExpanded={expandedSection === 'seo'}
        />
        <ScoreCard
          title="Best Practices"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          }
          score={performanceData.bestPractices?.score || 0}
          onClick={() => toggleSection('bestPractices')}
          isExpanded={expandedSection === 'bestPractices'}
        />
      </motion.div>

      {expandedSection && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <DetailedReport
            section={expandedSection}
            data={performanceData[expandedSection]}
            onClose={() => setExpandedSection(null)}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

const calculateOverallScore = (performanceData) => {
  const scores = [
    performanceData.performance?.score || 0,
    performanceData.accessibility?.score || 0,
    performanceData.seo?.score || 0,
    performanceData.bestPractices?.score || 0
  ];
  
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(average);
};

const getScoreColor = (score) => {
  if (score >= 90) return '#10b981';
  if (score >= 70) return '#f59e0b';
  return '#ef4444';
};

const getScoreLabel = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs Improvement';
  return 'Poor';
};

export default ResultsDashboard;
