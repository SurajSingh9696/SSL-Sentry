import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { websitesAPI, notificationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import './Dashboard.css';

const Dashboard = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWebsite, setNewWebsite] = useState({ url: '', nickname: '', checkInterval: 24 });
  const [error, setError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isDesktopProfileOpen, setIsDesktopProfileOpen] = useState(false);
  const desktopProfileRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWebsites();
    fetchUnreadCount();
    
    // Poll for unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (desktopProfileRef.current && !desktopProfileRef.current.contains(e.target)) {
        setIsDesktopProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchWebsites = async () => {
    try {
      const response = await websitesAPI.getAll();
      if (response.success) {
        setWebsites(response.data.websites);
      }
    } catch (error) {
      console.error('Failed to fetch websites:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };
  const handleAddWebsite = async (e) => {
    e.preventDefault();
    setError('');

    // Close modal immediately
    setShowAddModal(false);
    const websiteData = { ...newWebsite };
    setNewWebsite({ url: '', nickname: '', checkInterval: 24 });

    // Add temporary loading card
    const tempId = `temp-${Date.now()}`;
    const loadingWebsite = {
      _id: tempId,
      url: websiteData.url,
      nickname: websiteData.nickname,
      checkInterval: websiteData.checkInterval,
      isLoading: true,
      status: null,
      lastCheck: null
    };
    setWebsites([loadingWebsite, ...websites]);

    try {
      const response = await websitesAPI.add(websiteData);
      if (response.success) {
        // Replace loading card with actual data
        setWebsites(prevWebsites => 
          prevWebsites.map(w => w._id === tempId ? response.data.website : w)
        );
      }
    } catch (err) {
      // Remove loading card on error
      setWebsites(prevWebsites => prevWebsites.filter(w => w._id !== tempId));
      setError(err.message || 'Failed to add website');
      alert(`Failed to add website: ${err.message || 'Unknown error'}`);
    }
  };

  const handleCheckNow = async (id) => {
    try {
      const response = await websitesAPI.checkNow(id);
      if (response.success) {
        setWebsites(websites.map(w => w._id === id ? response.data.website : w));
      }
    } catch (error) {
      console.error('Check failed:', error);
    }
  };

  const handleRefreshAll = async () => {
    if (websites.length === 0) return;
    
    setRefreshingAll(true);
    
    try {
      // Check all websites in parallel
      const checkPromises = websites
        .filter(w => !w.isLoading)
        .map(website => 
          websitesAPI.checkNow(website._id)
            .then(response => {
              if (response.success) {
                setWebsites(prevWebsites => 
                  prevWebsites.map(w => 
                    w._id === response.data.website._id ? response.data.website : w
                  )
                );
              }
              return response;
            })
            .catch(error => {
              console.error(`Failed to check ${website.url}:`, error);
              return null;
            })
        );
      
      await Promise.all(checkPromises);
    } catch (error) {
      console.error('Refresh all failed:', error);
    } finally {
      setRefreshingAll(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this website?')) return;

    try {
      await websitesAPI.delete(id);
      setWebsites(websites.filter(w => w._id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'var(--accent-green)';
      case 'warning': return 'var(--accent-amber)';
      case 'critical': return 'var(--accent-red)';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
      case 'warning':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
      case 'critical':
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
      default:
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => {
                setIsMobileMenuOpen((prev) => !prev);
                setIsProfileMenuOpen(false);
              }}
              aria-label="Toggle menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="desktop-nav-brand desktop-only" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
              <img src="/logo.png" alt="SSL Sentry" className="dash-nav-logo-img" />
              <span className="dash-nav-logo-text">SSL Sentry</span>
            </div>
            <h1 className="mobile-brand-title" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>SSL Sentry</h1>
          </div>
          <div className="header-right">
            <div className="desktop-actions">
              <ThemeToggle />
              <div className="desktop-profile-wrapper" ref={desktopProfileRef}>
                <button
                  className="desktop-profile-btn"
                  onClick={() => setIsDesktopProfileOpen((prev) => !prev)}
                  aria-label="Profile menu"
                >
                  <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                  <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {isDesktopProfileOpen && (
                  <div className="desktop-profile-dropdown">
                    <div className="dropdown-user-info">
                      <div className="dropdown-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                      <div className="dropdown-user-details">
                        <p className="dropdown-name">{user?.name}</p>
                        <p className="dropdown-email">{user?.email}</p>
                      </div>
                    </div>
                    <div className="dropdown-divider" />
                    <button
                      className="dropdown-nav-item"
                      onClick={() => { navigate('/notifications'); setIsDesktopProfileOpen(false); }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                      </svg>
                      <span>Notifications</span>
                      {unreadCount > 0 && <span className="dropdown-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                    </button>
                    <button
                      className="dropdown-nav-item"
                      onClick={() => { navigate('/settings'); setIsDesktopProfileOpen(false); }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                      </svg>
                      <span>Settings</span>
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-nav-item danger" onClick={() => { logout(); setIsDesktopProfileOpen(false); }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="mobile-actions">
              <button
                className="mobile-profile-btn"
                onClick={() => {
                  setIsProfileMenuOpen((prev) => !prev);
                  setIsMobileMenuOpen(false);
                }}
                aria-label="Toggle profile menu"
              >
                <span className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {isProfileMenuOpen && (
                <div className="mobile-profile-dropdown">
                  <div className="profile-name">{user?.name}</div>
                  <button className="dropdown-item" onClick={() => { navigate('/settings'); setIsProfileMenuOpen(false); }}>Settings</button>
                  <button className="dropdown-item" onClick={logout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="mobile-menu-panel">
            <button
              className="mobile-menu-item"
              onClick={() => {
                navigate('/notifications');
                setIsMobileMenuOpen(false);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="mobile-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>
            <div className="mobile-menu-toggle">
              <span>Theme</span>
              <ThemeToggle />
            </div>
          </div>
        )}
      </header>

      <div className="dashboard-main">
        <div className="dashboard-actions">
          <h2>Tracked Websites</h2>
          <div className="action-buttons">
            <button 
              className="refresh-all-btn" 
              onClick={handleRefreshAll}
              disabled={refreshingAll || websites.length === 0}
              title="Refresh all websites"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={refreshingAll ? 'spinning' : ''}>
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              {refreshingAll ? 'Refreshing...' : 'Refresh All'}
            </button>
            <button className="add-btn" onClick={() => setShowAddModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Website
            </button>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-loading">
            <div className="spinner"></div>
            <p>Loading your websites...</p>
          </div>
        ) : websites.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <h3>No websites tracked yet</h3>
            <p>Add your first website to start monitoring SSL certificates and performance</p>
            <button className="add-btn" onClick={() => setShowAddModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Website
            </button>
          </div>
        ) : (
          <div className="websites-grid">
            {websites.map((website) => (
              <motion.div
                key={website._id}
                className={`website-card ${website.isLoading ? 'loading' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {website.isLoading ? (
                  // Skeleton loading card
                  <>
                    <div className="card-header">
                      <div className="skeleton skeleton-status"></div>
                      <div className="card-actions">
                        <div className="skeleton skeleton-button"></div>
                        <div className="skeleton skeleton-button"></div>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="skeleton skeleton-title"></div>
                      <div className="skeleton skeleton-text"></div>
                      <div className="metrics">
                        <div className="metric">
                          <span className="metric-label">SSL Status</span>
                          <div className="skeleton skeleton-metric"></div>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Expires in</span>
                          <div className="skeleton skeleton-metric"></div>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Performance</span>
                          <div className="skeleton skeleton-metric"></div>
                        </div>
                      </div>
                      <div className="skeleton skeleton-check"></div>
                    </div>
                  </>
                ) : (
                  // Actual website card
                  <>
                    <div className="card-header">
                      <div className="card-status" style={{ color: getStatusColor(website.status?.overall) }}>
                        <span className="status-icon">{getStatusIcon(website.status?.overall)}</span>
                        <span className="status-text">{website.status?.overall || 'unknown'}</span>
                      </div>
                      <div className="card-actions">
                        <button onClick={() => handleCheckNow(website._id)} title="Check now">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 4 23 10 17 10"/>
                        <polyline points="1 20 1 14 7 14"/>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(website._id)} title="Delete">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  <h3>{website.nickname || website.url}</h3>
                  {website.nickname && <p className="url-text">{website.url}</p>}

                  <div className="metrics">
                    <div className="metric">
                      <span className="metric-label">SSL Status</span>
                      <span className={`metric-value ${website.status?.ssl?.valid ? 'valid' : 'invalid'}`}>
                        {website.status?.ssl?.valid ? 'Valid' : 'Invalid'}
                      </span>
                    </div>
                    {website.status?.ssl?.daysRemaining !== undefined && (
                      <div className="metric">
                        <span className="metric-label">Expires in</span>
                        <span className={`metric-value ${website.status.ssl.daysRemaining < 30 ? 'warning' : ''}`}>
                          {website.status.ssl.daysRemaining} days
                        </span>
                      </div>
                    )}
                    {website.status?.performance?.score !== undefined && (
                      <div className="metric">
                        <span className="metric-label">Performance</span>
                        <span className="metric-value">{website.status.performance.score}/100</span>
                      </div>
                    )}
                  </div>

                  {website.lastCheck && (
                    <p className="last-check">
                      Last checked: {new Date(website.lastCheck).toLocaleString()}
                    </p>
                  )}
                </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Add Website</h2>
              {error && <div className="modal-error">{error}</div>}
              <form onSubmit={handleAddWebsite}>
                <div className="form-group">
                  <label>Website URL *</label>
                  <input
                    type="text"
                    value={newWebsite.url}
                    onChange={(e) => setNewWebsite({ ...newWebsite, url: e.target.value })}
                    placeholder="https://example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nickname (optional)</label>
                  <input
                    type="text"
                    value={newWebsite.nickname}
                    onChange={(e) => setNewWebsite({ ...newWebsite, nickname: e.target.value })}
                    placeholder="My Website"
                  />
                </div>
                <div className="form-group">
                  <label>Check Interval (hours)</label>
                  <input
                    type="number"
                    className="no-spinner"
                    value={newWebsite.checkInterval}
                    onChange={(e) => setNewWebsite({ ...newWebsite, checkInterval: parseInt(e.target.value) })}
                    min="1"
                    max="168"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">Add Website</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
