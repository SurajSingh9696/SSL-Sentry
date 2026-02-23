import React from 'react';
import { motion } from 'framer-motion';
import './ScoreCard.css';

const ScoreCard = ({ title, icon, score, onClick, isExpanded }) => {
  const getScoreColor = (score) => {
    if (score >= 90) return 'var(--accent-green)';
    if (score >= 70) return 'var(--accent-amber)';
    return 'var(--accent-red)';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return (
    <motion.div
      className={`score-card ${isExpanded ? 'expanded' : ''}`}
      onClick={onClick}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <div className="score-card-header">
        <span className="score-card-icon">{icon}</span>
        <h4 className="score-card-title">{title}</h4>
      </div>

      <div className="score-card-body">
        <div className="score-ring">
          <svg viewBox="0 0 100 100" className="score-ring-svg">
            <circle
              className="score-ring-bg"
              cx="50"
              cy="50"
              r="45"
            />
            <motion.circle
              className="score-ring-progress"
              cx="50"
              cy="50"
              r="45"
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset: 283 - (283 * score) / 100 }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ stroke: getScoreColor(score) }}
            />
          </svg>
          <div className="score-ring-content">
            <span className="score-grade">{getScoreGrade(score)}</span>
            <span className="score-number">{score}</span>
          </div>
        </div>

        <div className="score-status">
          <div
            className="status-bar"
            style={{
              width: `${score}%`,
              background: getScoreColor(score)
            }}
          />
        </div>
      </div>

      <div className="score-card-footer">
        <span className="view-details">
          {isExpanded ? 'Close Details' : 'View Details'} →
        </span>
      </div>
    </motion.div>
  );
};

export default ScoreCard;
