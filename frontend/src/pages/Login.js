import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [loading, setLoading] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark 
        ? 'linear-gradient(135deg, #0a0e27 0%, #1e2749 50%, #0a0e27 100%)'
        : 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 50%, #f8f9fa 100%)',
      padding: '2rem 1rem',
      position: 'relative',
      overflow: 'hidden',
    },
    backgroundGrid: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: isDark
        ? 'linear-gradient(rgba(0, 229, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.05) 1px, transparent 1px)'
        : 'linear-gradient(rgba(33, 150, 243, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(33, 150, 243, 0.03) 1px, transparent 1px)',
      backgroundSize: '50px 50px',
      pointerEvents: 'none',
    },
    card: {
      background: isDark 
        ? 'rgba(30, 39, 73, 0.8)' 
        : 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      padding: '2.5rem',
      borderRadius: '20px',
      boxShadow: isDark 
        ? '0 20px 60px rgba(0, 0, 0, 0.6)' 
        : '0 10px 40px rgba(0, 0, 0, 0.1)',
      width: '100%',
      maxWidth: '450px',
      border: `1px solid ${isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)'}`,
      position: 'relative',
      zIndex: 1,
    },
    logoContainer: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    logo: {
      fontSize: '4rem',
      marginBottom: '1rem',
      display: 'inline-block',
      animation: 'float 3s ease-in-out infinite',
    },
    title: {
      fontSize: '2rem',
      fontWeight: '800',
      marginBottom: '0.5rem',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #00e5ff 0%, #7c4dff 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    subtitle: {
      textAlign: 'center',
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      fontSize: '0.95rem',
      marginBottom: '2rem',
    },
    errorBox: {
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      color: '#ef4444',
      padding: '1rem',
      borderRadius: '12px',
      marginBottom: '1.5rem',
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      color: isDark ? '#ffffff' : '#1a1a1a',
      fontWeight: '600',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    inputIcon: {
      position: 'absolute',
      left: '1rem',
      color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
      fontSize: '1.25rem',
      pointerEvents: 'none',
    },
    input: {
      width: '100%',
      padding: '0.875rem 1rem 0.875rem 3rem',
      border: `2px solid ${isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)'}`,
      borderRadius: '12px',
      fontSize: '1rem',
      background: isDark ? 'rgba(10, 14, 39, 0.5)' : 'rgba(255, 255, 255, 0.8)',
      color: isDark ? '#ffffff' : '#1a1a1a',
      outline: 'none',
      transition: 'all 0.3s ease',
    },
    eyeIcon: {
      position: 'absolute',
      right: '1rem',
      color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
      fontSize: '1.25rem',
      cursor: 'pointer',
      transition: 'color 0.3s ease',
    },
    button: {
      width: '100%',
      padding: '1rem',
      background: 'linear-gradient(135deg, #7c4dff 0%, #00e5ff 100%)',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 20px rgba(124, 77, 255, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    footer: {
      marginTop: '1.5rem',
      textAlign: 'center',
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      fontSize: '0.95rem',
    },
    link: {
      color: isDark ? '#00e5ff' : '#2196f3',
      fontWeight: '700',
      textDecoration: 'none',
      transition: 'color 0.3s ease',
    },
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        input::placeholder {
          color: ${isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
        }
        
        @media (max-width: 640px) {
          .login-card {
            padding: 1.5rem !important;
          }
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.backgroundGrid}></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={styles.card}
          className="login-card"
        >
          {/* Logo & Title */}
          <div style={styles.logoContainer}>
            <motion.div 
              style={styles.logo}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🚀
            </motion.div>
            <h2 style={styles.title}>SecureShare</h2>
            <p style={styles.subtitle}>Welcome back! Login to your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={styles.errorBox}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <FiMail style={styles.inputIcon} />
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = isDark ? '#00e5ff' : '#2196f3';
                    e.target.style.boxShadow = isDark 
                      ? '0 0 0 3px rgba(0, 229, 255, 0.1)' 
                      : '0 0 0 3px rgba(33, 150, 243, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <FiLock style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = isDark ? '#00e5ff' : '#2196f3';
                    e.target.style.boxShadow = isDark 
                      ? '0 0 0 3px rgba(0, 229, 255, 0.1)' 
                      : '0 0 0 3px rgba(33, 150, 243, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <div
                  style={styles.eyeIcon}
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = isDark ? '#00e5ff' : '#2196f3';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';
                  }}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              style={styles.button}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(124, 77, 255, 0.6)' }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '3px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }} />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <span>🚀</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p style={styles.footer}>
            Don't have an account?{' '}
            <Link 
              to="/register" 
              style={styles.link}
              onMouseEnter={(e) => {
                e.target.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.target.style.textDecoration = 'none';
              }}
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default Login;
