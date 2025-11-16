import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const isDark = theme === 'dark';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Errors for each field
  const [fieldErrors, setFieldErrors] = useState({});

  // Main register handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate fields before submitting
    const newErrors = {};
    if (form.username.trim().length < 3) newErrors.username = 'Username must be at least 3 chars';
    if (!/^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(form.email)) newErrors.email = 'Invalid email address';
    if (form.password.length < 6) newErrors.password = 'Password min 6 chars';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setFieldErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const { data } = await authAPI.register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      toast.success('Registration successful!');
      setTimeout(() => {
        navigate('/login');
      }, 1400);
    } catch (error) {
      if (error.response?.data?.errors) {
        const errorsObj = {};
        error.response.data.errors.forEach(err => {
          errorsObj[err.param || 'form'] = err.msg;
        });
        setFieldErrors(errorsObj);
      } else {
        toast.error(error.response?.data?.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
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
      maxWidth: '500px',
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      color: isDark ? '#ffffff' : '#1a1a1a',
    },
    titleGradient: {
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
    formGroup: {
      marginBottom: '1.25rem',
    },
    label: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
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
    input: (hasError) => ({
      width: '100%',
      padding: '0.875rem 1rem',
      border: `2px solid ${hasError 
        ? '#ef4444' 
        : isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)'}`,
      borderRadius: '12px',
      fontSize: '1rem',
      background: hasError 
        ? 'rgba(239, 68, 68, 0.05)' 
        : isDark ? 'rgba(10, 14, 39, 0.5)' : 'rgba(255, 255, 255, 0.8)',
      color: isDark ? '#ffffff' : '#1a1a1a',
      outline: 'none',
      transition: 'all 0.3s ease',
    }),
    inputPassword: (hasError) => ({
      width: '100%',
      padding: '0.875rem 3rem 0.875rem 1rem',
      border: `2px solid ${hasError 
        ? '#ef4444' 
        : isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)'}`,
      borderRadius: '12px',
      fontSize: '1rem',
      background: hasError 
        ? 'rgba(239, 68, 68, 0.05)' 
        : isDark ? 'rgba(10, 14, 39, 0.5)' : 'rgba(255, 255, 255, 0.8)',
      color: isDark ? '#ffffff' : '#1a1a1a',
      outline: 'none',
      transition: 'all 0.3s ease',
    }),
    eyeIcon: {
      position: 'absolute',
      right: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
      fontSize: '1.25rem',
      cursor: 'pointer',
      transition: 'color 0.3s ease',
    },
    errorText: {
      display: 'block',
      color: '#ef4444',
      fontSize: '0.75rem',
      marginTop: '0.25rem',
    },
    button: {
      width: '100%',
      padding: '1rem',
      background: loading 
        ? 'rgba(124, 77, 255, 0.6)' 
        : 'linear-gradient(135deg, #7c4dff 0%, #ec4899 100%)',
      color: '#ffffff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '700',
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 20px rgba(124, 77, 255, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      marginBottom: '1rem',
      opacity: loading ? 0.6 : 1,
    },
    footer: {
      textAlign: 'center',
      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      fontSize: '0.95rem',
      marginTop: '0.75rem',
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
          .register-card {
            padding: 1.5rem !important;
          }
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.backgroundGrid}></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={styles.card}
          className="register-card"
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
            <h2 style={styles.title}>
              <FiUser />
              <span style={styles.titleGradient}>Create Account</span>
            </h2>
            <p style={styles.subtitle}>Register to securely share and manage files</p>
          </div>

          <form autoComplete="off" onSubmit={handleSubmit}>
            {/* Username */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FiUser />
                <span>Username</span>
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleInputChange}
                required
                minLength={3}
                style={styles.input(!!fieldErrors.username)}
                placeholder="Choose a username"
                onFocus={(e) => {
                  if (!fieldErrors.username) {
                    e.target.style.borderColor = isDark ? '#00e5ff' : '#2196f3';
                    e.target.style.boxShadow = isDark 
                      ? '0 0 0 3px rgba(0, 229, 255, 0.1)' 
                      : '0 0 0 3px rgba(33, 150, 243, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!fieldErrors.username) {
                    e.target.style.borderColor = isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {fieldErrors.username && (
                <span style={styles.errorText}>⚠️ {fieldErrors.username}</span>
              )}
            </div>

            {/* Email */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FiMail />
                <span>Email</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleInputChange}
                required
                style={styles.input(!!fieldErrors.email)}
                placeholder="you@example.com"
                onFocus={(e) => {
                  if (!fieldErrors.email) {
                    e.target.style.borderColor = isDark ? '#00e5ff' : '#2196f3';
                    e.target.style.boxShadow = isDark 
                      ? '0 0 0 3px rgba(0, 229, 255, 0.1)' 
                      : '0 0 0 3px rgba(33, 150, 243, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  if (!fieldErrors.email) {
                    e.target.style.borderColor = isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {fieldErrors.email && (
                <span style={styles.errorText}>⚠️ {fieldErrors.email}</span>
              )}
            </div>

            {/* Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FiLock />
                <span>Password</span>
              </label>
              <div style={styles.inputWrapper}>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  style={styles.inputPassword(!!fieldErrors.password)}
                  placeholder="Create a password"
                  onFocus={(e) => {
                    if (!fieldErrors.password) {
                      e.target.style.borderColor = isDark ? '#00e5ff' : '#2196f3';
                      e.target.style.boxShadow = isDark 
                        ? '0 0 0 3px rgba(0, 229, 255, 0.1)' 
                        : '0 0 0 3px rgba(33, 150, 243, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!fieldErrors.password) {
                      e.target.style.borderColor = isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
                <div
                  style={styles.eyeIcon}
                  onClick={() => setShowPassword(v => !v)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = isDark ? '#00e5ff' : '#2196f3';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';
                  }}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </div>
              </div>
              {fieldErrors.password && (
                <span style={styles.errorText}>⚠️ {fieldErrors.password}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FiLock />
                <span>Confirm Password</span>
              </label>
              <div style={styles.inputWrapper}>
                <input
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleInputChange}
                  required
                  style={styles.inputPassword(!!fieldErrors.confirmPassword)}
                  placeholder="Re-type your password"
                  onFocus={(e) => {
                    if (!fieldErrors.confirmPassword) {
                      e.target.style.borderColor = isDark ? '#00e5ff' : '#2196f3';
                      e.target.style.boxShadow = isDark 
                        ? '0 0 0 3px rgba(0, 229, 255, 0.1)' 
                        : '0 0 0 3px rgba(33, 150, 243, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!fieldErrors.confirmPassword) {
                      e.target.style.borderColor = isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(33, 150, 243, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <span style={styles.errorText}>⚠️ {fieldErrors.confirmPassword}</span>
              )}
            </div>

            {/* Register Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: loading ? 1 : 1.02, boxShadow: '0 8px 30px rgba(124, 77, 255, 0.6)' }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              disabled={loading}
              style={styles.button}
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
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <FiCheckCircle />
                  <span>Register</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div style={styles.footer}>
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={styles.link}
              onMouseEnter={(e) => {
                e.target.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.target.style.textDecoration = 'none';
              }}
            >
              Login
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Register;
