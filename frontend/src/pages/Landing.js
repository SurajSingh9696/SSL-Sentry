import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const Landing = () => {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      navigate('/analyzer', { state: { url: url.trim() } });
    }
  };

  const features = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      title: 'SSL Certificate Validation',
      description: 'Check SSL validity, expiry dates, and certificate chain trust'
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
      title: 'Performance Metrics',
      description: 'Measure load times, FCP, LCP, and speed optimization opportunities'
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: 'Accessibility Analysis',
      description: 'Evaluate semantic structure, ARIA usage, and accessibility compliance'
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      ),
      title: 'SEO Optimization',
      description: 'Analyze meta tags, structured data, and search engine visibility'
    }
  ];

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
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="landing-container">
      <div className="landing-nav">
        <div className="nav-left">
          <img src="/logo.png" alt="SSL Sentry" className="nav-logo-img" />
          <span className="nav-logo-text">SSL Sentry</span>
        </div>
        <div className="nav-right">
          <ThemeToggle />
          <div className="auth-buttons">
            {isAuthenticated ? (
              <button className="dashboard-btn" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </button>
            ) : (
              <>
                <button className="signin-btn" onClick={() => navigate('/login')}>
                  Sign In
                </button>
                <button className="signup-btn" onClick={() => navigate('/register')}>
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <motion.div
        className="hero-section"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="hero-badge" variants={itemVariants}>
          <span className="badge-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span>Enterprise-Grade Security Analysis</span>
        </motion.div>

        <motion.h1 className="hero-title" variants={itemVariants}>
          SSL Sentry
        </motion.h1>

        <motion.p className="hero-subtitle" variants={itemVariants}>
          Comprehensive security and performance analysis for modern websites.
          Get instant insights into SSL certificates, load times, accessibility, and SEO.
        </motion.p>

        <motion.form 
          className="hero-form" 
          onSubmit={handleSubmit}
          variants={itemVariants}
        >
          <div className="input-wrapper">
            <span className="input-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Enter website URL (e.g., example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="url-input"
            />
          </div>
          <motion.button
            type="submit"
            className="analyze-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Analyze Website
          </motion.button>
        </motion.form>
      </motion.div>

      <motion.div
        className="features-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.h2 className="features-title" variants={itemVariants}>
          Powerful Analysis Tools
        </motion.h2>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="cta-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.div className="cta-content" variants={itemVariants}>
          <h2 className="cta-title">Ready to optimize your website?</h2>
          <p className="cta-description">
            Get detailed insights in seconds and improve your web presence
          </p>
          <motion.button
            className="cta-button"
            onClick={() => document.querySelector('.url-input').focus()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Free Analysis
          </motion.button>
        </motion.div>
      </motion.div>

      <footer className="landing-footer">
        <p>&copy; 2026 SSL Sentry. Built for developers, by developers.</p>
      </footer>
    </div>
  );
};

export default Landing;
