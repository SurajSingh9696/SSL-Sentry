import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import './Settings.css';

const EyeIcon = ({ show }) =>
  show ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // Profile
  const [profileData, setProfileData] = useState({ name: user?.name || '', email: user?.email || '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Desktop profile dropdown
  const [isDesktopProfileOpen, setIsDesktopProfileOpen] = useState(false);
  const desktopProfileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (desktopProfileRef.current && !desktopProfileRef.current.contains(e.target)) {
        setIsDesktopProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);
    try {
      const response = await authAPI.updateProfile(profileData);
      if (response.success) {
        updateUser(response.data?.user || profileData);
        setProfileSuccess('Profile updated successfully!');
        setTimeout(() => setProfileSuccess(''), 3000);
      } else {
        setProfileError(response.message || 'Failed to update profile.');
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    setPasswordLoading(true);
    try {
      const response = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (response.success) {
        setPasswordSuccess('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordSuccess(''), 3000);
      } else {
        setPasswordError(response.message || 'Failed to change password.');
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await authAPI.deleteAccount();
      logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account.');
      setDeleteLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="settings-container">
      {/* ── Header ── */}
      <header className="settings-header">
        <div className="settings-header-content">
          <div className="settings-header-left">
            {/* Desktop brand */}
            <div
              className="desktop-nav-brand settings-desktop-only"
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer' }}
            >
              <img src="/logo.png" alt="SSL Sentry" className="dash-nav-logo-img" />
              <span className="dash-nav-logo-text">SSL Sentry</span>
            </div>
            {/* Mobile title */}
            <span className="settings-mobile-title">Settings</span>
          </div>

          <div className="settings-header-right">
            <ThemeToggle />

            {/* Desktop profile dropdown */}
            <div className="desktop-profile-wrapper settings-desktop-only" ref={desktopProfileRef}>
              <button
                className="desktop-profile-btn"
                onClick={() => setIsDesktopProfileOpen((prev) => !prev)}
                aria-label="Profile menu"
              >
                <div className="settings-user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {isDesktopProfileOpen && (
                <div className="desktop-profile-dropdown">
                  <div className="dropdown-user-info">
                    <div className="settings-dropdown-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                    <div className="dropdown-user-details">
                      <p className="dropdown-name">{user?.name}</p>
                      <p className="dropdown-email">{user?.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <button
                    className="dropdown-nav-item"
                    onClick={() => { navigate('/dashboard'); setIsDesktopProfileOpen(false); }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                    </svg>
                    <span>Dashboard</span>
                  </button>
                  <button
                    className="dropdown-nav-item"
                    onClick={() => { navigate('/notifications'); setIsDesktopProfileOpen(false); }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span>Notifications</span>
                  </button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-nav-item danger" onClick={() => { logout(); setIsDesktopProfileOpen(false); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile back button */}
            <button className="settings-mobile-back" onClick={() => navigate('/dashboard')} aria-label="Back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <div className="settings-main">
        <div className="settings-page-title">
          <button className="settings-back-link" onClick={() => navigate('/dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Dashboard
          </button>
          <h2>Account Settings</h2>
          <p>Manage your profile, security and account preferences</p>
        </div>

        <div className="settings-grid">
          {/* ── Profile Card ── */}
          <motion.section className="settings-card" variants={cardVariants} initial="hidden" animate="visible">
            <div className="settings-card-header">
              <div className="settings-card-icon profile-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h3>Profile Details</h3>
                <p>Update your name and email address</p>
              </div>
            </div>

            <AnimatePresence>
              {profileSuccess && (
                <motion.div className="settings-alert success" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  {profileSuccess}
                </motion.div>
              )}
              {profileError && (
                <motion.div className="settings-alert error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                  {profileError}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleProfileUpdate} className="settings-form">
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="settings-btn primary" disabled={profileLoading}>
                {profileLoading ? (
                  <><span className="btn-spinner" /> Saving...</>
                ) : (
                  'Save Changes'
                )}
              </button>
            </form>
          </motion.section>

          {/* ── Password Card ── */}
          <motion.section className="settings-card" variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <div className="settings-card-header">
              <div className="settings-card-icon password-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <h3>Change Password</h3>
                <p>Update your account password</p>
              </div>
            </div>

            <AnimatePresence>
              {passwordSuccess && (
                <motion.div className="settings-alert success" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  {passwordSuccess}
                </motion.div>
              )}
              {passwordError && (
                <motion.div className="settings-alert error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                  {passwordError}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handlePasswordChange} className="settings-form">
              {[
                { label: 'Current Password', key: 'currentPassword', show: showCurrentPw, toggle: () => setShowCurrentPw(p => !p) },
                { label: 'New Password', key: 'newPassword', show: showNewPw, toggle: () => setShowNewPw(p => !p) },
                { label: 'Confirm New Password', key: 'confirmPassword', show: showConfirmPw, toggle: () => setShowConfirmPw(p => !p) },
              ].map(({ label, key, show, toggle }) => (
                <div className="form-group" key={key}>
                  <label>{label}</label>
                  <div className="input-with-icon password-input">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      type={show ? 'text' : 'password'}
                      value={passwordData[key]}
                      onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
                      placeholder={label}
                      required
                      autoComplete="new-password"
                    />
                    <button type="button" className="pw-toggle" onClick={toggle} tabIndex={-1}>
                      <EyeIcon show={show} />
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" className="settings-btn primary" disabled={passwordLoading}>
                {passwordLoading ? (
                  <><span className="btn-spinner" /> Changing...</>
                ) : (
                  'Change Password'
                )}
              </button>
            </form>
          </motion.section>

          {/* ── Danger Zone Card ── */}
          <motion.section className="settings-card danger-card" variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <div className="settings-card-header">
              <div className="settings-card-icon danger-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h3>Danger Zone</h3>
                <p>Irreversible and destructive actions</p>
              </div>
            </div>
            <div className="danger-zone-body">
              <div className="danger-info">
                <strong>Delete Account</strong>
                <span>Permanently remove your account and all associated data. This cannot be undone.</span>
              </div>
              <button className="settings-btn danger" onClick={() => setShowDeleteModal(true)}>
                Delete Account
              </button>
            </div>
          </motion.section>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            className="settings-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); setDeleteError(''); }}
          >
            <motion.div
              className="settings-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-danger-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3>Delete Account</h3>
              <p>This will permanently delete your account and all your data including tracked websites and notifications. <strong>This action cannot be undone.</strong></p>
              <div className="form-group">
                <label>Type <strong>DELETE</strong> to confirm</label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="delete-confirm-input"
                />
              </div>
              {deleteError && (
                <div className="settings-alert error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                  {deleteError}
                </div>
              )}
              <div className="modal-actions">
                <button
                  className="settings-btn secondary"
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); setDeleteError(''); }}
                >
                  Cancel
                </button>
                <button
                  className="settings-btn danger"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                >
                  {deleteLoading ? <><span className="btn-spinner" /> Deleting...</> : 'Delete My Account'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
