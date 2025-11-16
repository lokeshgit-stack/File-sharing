import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiUpload, FiMusic, FiList, FiUser, FiLogOut, FiMenu, FiX, FiFileText, FiImage, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiShare2, FiFolder } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home', icon: FiHome },
    // { path: '/playlists', label: 'Playlists', icon: FiList },
  ];

  const userNavItems = [
    // { path: '/upload', label: 'Upload Podcast', icon: FiUpload },
    { path: '/new-post', label: 'New Post', icon: FiUpload },
    // { path: '/my-podcasts', label: 'My Podcast', icon: FiImage },
    { path: '/my-posts', label: 'My Post', icon: FiUpload },
    // { path: '/post/:id', label: 'Post Detail', icon: FiUpload },
    { path: '/file-share', label: 'Upload Files', icon: FiShare2 },
    { path: '/my-files', label: 'My Files', icon: FiFolder },
  ];

  // Inline Styles
  const styles = {
    navbar: {
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: isDark 
        ? 'rgba(10, 14, 39, 0.95)' 
        : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${isDark ? 'rgba(0, 229, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
      boxShadow: isDark 
        ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
        : '0 4px 20px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '1rem 1.5rem',
    },
    flexContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      textDecoration: 'none',
      cursor: 'pointer',
    },
    logoIcon: {
      fontSize: '2.5rem',
      animation: 'float 3s ease-in-out infinite',
    },
    logoText: {
      fontSize: '1.75rem',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #00e5ff 0%, #7c4dff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    desktopNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',  // ← This controls spacing between nav items
    marginLeft: '3rem',  // ← ADD THIS LINE - creates space from logo
},
    navLink: (active) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      background: active 
        ? 'linear-gradient(135deg, #7c4dff 0%, #00e5ff 100%)' 
        : 'transparent',
      color: active ? '#ffffff' : isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '0.95rem',
      boxShadow: active ? '0 4px 15px rgba(124, 77, 255, 0.5)' : 'none',
    }),
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      background: isDark 
        ? 'rgba(30, 39, 73, 0.6)' 
        : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRadius: '50px',
      border: `1px solid ${isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)'}`,
    },
    userIcon: {
      color: isDark ? '#7c4dff' : '#2196f3',
    },
    userName: {
      color: isDark ? '#ffffff' : '#1a1a1a',
      fontWeight: '600',
    },
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',
      color: '#ffffff',
      padding: '0.5rem 1rem',
      borderRadius: '50px',
      border: 'none',
      fontWeight: '700',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
      transition: 'all 0.3s ease',
    },
    authButton: (isPrimary) => ({
      color: '#ffffff',
      fontWeight: isPrimary ? '700' : '600',
      padding: '0.5rem 1.5rem',
      borderRadius: '50px',
      border: 'none',
      cursor: 'pointer',
      background: isPrimary 
        ? 'linear-gradient(135deg, #7c4dff 0%, #ec4899 100%)' 
        : 'transparent',
      boxShadow: isPrimary ? '0 4px 15px rgba(124, 77, 255, 0.4)' : 'none',
      transition: 'all 0.3s ease',
    }),
    themeToggle: {
      background: isDark 
        ? 'rgba(30, 39, 73, 0.6)' 
        : 'rgba(255, 255, 255, 0.9)',
      border: `1px solid ${isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)'}`,
      borderRadius: '50%',
      padding: '0.65rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      fontSize: '1.25rem',
      color: isDark ? '#00e5ff' : '#f59e0b',
    },
    mobileMenuButton: {
      display: 'none',
      color: isDark ? '#ffffff' : '#1a1a1a',
      fontSize: '2rem',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
    },
    mobileMenu: {
      background: isDark 
        ? 'rgba(10, 14, 39, 0.98)' 
        : 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(20px)',
      borderTop: `1px solid ${isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
      overflow: 'hidden',
    },
    mobileMenuContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '1rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    mobileNavLink: (active) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      borderRadius: '12px',
      background: active 
        ? 'linear-gradient(135deg, #7c4dff 0%, #00e5ff 100%)' 
        : 'transparent',
      color: active ? '#ffffff' : isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
      textDecoration: 'none',
      fontWeight: '600',
      transition: 'all 0.3s ease',
    }),
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
        
        @media (min-width: 769px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>

      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        style={styles.navbar}
      >
        <div style={styles.container}>
          <div style={styles.flexContainer}>
            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none' }}>
              <motion.div 
                style={styles.logoContainer}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div style={styles.logoIcon}>
                  🚀
                </motion.div>
                <span style={styles.logoText}>
                  SecureShare
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="desktop-nav" style={styles.desktopNav}>
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    style={styles.navLink(isActive(item.path))}
                    onMouseEnter={(e) => {
                      if (!isActive(item.path)) {
                        e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(item.path)) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <item.icon style={{ fontSize: '1.25rem' }} />
                    <span>{item.label}</span>
                  </motion.div>
                </Link>
              ))}

              {user ? (
                <>
                  {userNavItems.map((item) => (
                    <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                      <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        style={styles.navLink(isActive(item.path))}
                        onMouseEnter={(e) => {
                          if (!isActive(item.path)) {
                            e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive(item.path)) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <item.icon style={{ fontSize: '1.25rem' }} />
                        <span>{item.label}</span>
                      </motion.div>
                    </Link>
                  ))}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Theme Toggle */}
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleTheme}
                      style={styles.themeToggle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = isDark 
                          ? '0 0 20px rgba(0, 229, 255, 0.4)' 
                          : '0 0 20px rgba(245, 158, 11, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {isDark ? <FiSun /> : <FiMoon />}
                    </motion.button>

                    <motion.div 
                      style={styles.userInfo}
                      whileHover={{ scale: 1.05 }}
                    >
                      <FiUser style={styles.userIcon} />
                      <span style={styles.userName}>{user.username}</span>
                    </motion.div>

                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(239, 68, 68, 0.5)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      style={styles.logoutButton}
                    >
                      <FiLogOut />
                      <span>Logout</span>
                    </motion.button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Theme Toggle */}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTheme}
                    style={styles.themeToggle}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = isDark 
                        ? '0 0 20px rgba(0, 229, 255, 0.4)' 
                        : '0 0 20px rgba(245, 158, 11, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {isDark ? <FiSun /> : <FiMoon />}
                  </motion.button>

                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={styles.authButton(false)}
                      onMouseEnter={(e) => {
                        e.target.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                      }}
                    >
                      Login
                    </motion.button>
                  </Link>
                  <Link to="/register" style={{ textDecoration: 'none' }}>
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(124, 77, 255, 0.6)' }}
                      whileTap={{ scale: 0.95 }}
                      style={styles.authButton(true)}
                    >
                      Sign Up
                    </motion.button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-btn"
              style={styles.mobileMenuButton}
            >
              {mobileMenuOpen ? <FiX /> : <FiMenu />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={styles.mobileMenu}
            >
              <div style={styles.mobileMenuContent}>
                {navItems.map((item) => (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ textDecoration: 'none' }}
                  >
                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      style={styles.mobileNavLink(isActive(item.path))}
                      onMouseEnter={(e) => {
                        if (!isActive(item.path)) {
                          e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(item.path)) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <item.icon style={{ fontSize: '1.25rem' }} />
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                ))}

                {user ? (
                  <>
                    {userNavItems.map((item) => (
                      <Link 
                        key={item.path} 
                        to={item.path} 
                        onClick={() => setMobileMenuOpen(false)}
                        style={{ textDecoration: 'none' }}
                      >
                        <motion.div
                          whileTap={{ scale: 0.95 }}
                          style={styles.mobileNavLink(isActive(item.path))}
                          onMouseEnter={(e) => {
                            if (!isActive(item.path)) {
                              e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive(item.path)) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          <item.icon style={{ fontSize: '1.25rem' }} />
                          <span>{item.label}</span>
                        </motion.div>
                      </Link>
                    ))}
                    
                    {/* Theme Toggle Mobile */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleTheme}
                      style={{
                        ...styles.mobileNavLink(false),
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {isDark ? <FiSun style={{ fontSize: '1.25rem' }} /> : <FiMoon style={{ fontSize: '1.25rem' }} />}
                      <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                    </motion.button>

                    <motion.div style={styles.userInfo}>
                      <FiUser style={styles.userIcon} />
                      <span style={styles.userName}>{user.username}</span>
                    </motion.div>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      style={styles.logoutButton}
                    >
                      <FiLogOut />
                      <span>Logout</span>
                    </motion.button>
                  </>
                ) : (
                  <>
                    {/* Theme Toggle Mobile */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleTheme}
                      style={{
                        ...styles.mobileNavLink(false),
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {isDark ? <FiSun style={{ fontSize: '1.25rem' }} /> : <FiMoon style={{ fontSize: '1.25rem' }} />}
                      <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                    </motion.button>

                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        style={styles.mobileNavLink(false)}
                      >
                        <FiUser style={{ fontSize: '1.25rem' }} />
                        <span>Login</span>
                      </motion.div>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        style={styles.mobileNavLink(false)}
                      >
                        <FiUser style={{ fontSize: '1.25rem' }} />
                        <span>Sign Up</span>
                      </motion.div>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
};

export default Navbar;
