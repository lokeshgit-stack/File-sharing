import React, { useState } from 'react';
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
      // Optionally: auto-login or redirect
      setTimeout(() => {
        navigate('/login'); // Or navigate to home/dashboard
      }, 1400);
    } catch (error) {
      if (error.response?.data?.errors) {
        // Field validation errors from backend
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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 via-purple-900 to-black px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-xl p-8 w-full max-w-md shadow-lg"
      >
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <FiUser /> Create Account
        </h2>
        <p className="text-gray-300 mb-8 text-sm">Register to securely share and manage files</p>
        <form autoComplete="off" onSubmit={handleSubmit}>
          {/* Username */}
          <label className="block mb-4">
            <span className="text-white font-semibold flex items-center gap-2">
              <FiUser /> Username
            </span>
            <input
              name="username"
              value={form.username}
              onChange={handleInputChange}
              required
              minLength={3}
              className={`w-full mt-2 px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 outline-none ring-2 ring-transparent focus:ring-purple-500 transition ${
                fieldErrors.username ? 'ring-red-500 bg-red-400/10' : ''
              }`}
              placeholder="Choose a username"
            />
            {fieldErrors.username && (
              <span className="block text-red-400 text-xs mt-1">{fieldErrors.username}</span>
            )}
          </label>
          {/* Email */}
          <label className="block mb-4">
            <span className="text-white font-semibold flex items-center gap-2">
              <FiMail /> Email
            </span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleInputChange}
              required
              className={`w-full mt-2 px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 outline-none ring-2 ring-transparent focus:ring-purple-500 transition ${
                fieldErrors.email ? 'ring-red-500 bg-red-400/10' : ''
              }`}
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <span className="block text-red-400 text-xs mt-1">{fieldErrors.email}</span>
            )}
          </label>
          {/* Password */}
          <label className="block mb-4 relative">
            <span className="text-white font-semibold flex items-center gap-2">
              <FiLock /> Password
            </span>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleInputChange}
              required
              minLength={6}
              className={`w-full mt-2 px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 outline-none ring-2 ring-transparent focus:ring-purple-500 transition ${
                fieldErrors.password ? 'ring-red-500 bg-red-400/10' : ''
              }`}
              placeholder="Create a password"
            />
            <button
              type="button"
              className="absolute top-[46px] right-4 text-gray-400 hover:text-white transition"
              tabIndex={-1}
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
            {fieldErrors.password && (
              <span className="block text-red-400 text-xs mt-1">{fieldErrors.password}</span>
            )}
          </label>
          {/* Confirm Password */}
          <label className="block mb-6 relative">
            <span className="text-white font-semibold flex items-center gap-2">
              <FiLock /> Confirm Password
            </span>
            <input
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleInputChange}
              required
              className={`w-full mt-2 px-4 py-3 rounded-lg bg-white/10 text-white placeholder-gray-400 outline-none ring-2 ring-transparent focus:ring-purple-500 transition ${
                fieldErrors.confirmPassword ? 'ring-red-500 bg-red-400/10' : ''
              }`}
              placeholder="Re-type your password"
            />
            {fieldErrors.confirmPassword && (
              <span className="block text-red-400 text-xs mt-1">{fieldErrors.confirmPassword}</span>
            )}
          </label>
          {/* Register button */}
          <motion.button
            type="submit"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-700 to-pink-600 text-white py-3 font-semibold rounded-lg mb-3 transition hover:from-purple-600 hover:to-pink-500 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FiCheckCircle className="animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <FiCheckCircle />
                Register
              </>
            )}
          </motion.button>
        </form>
        <div className="text-center text-gray-300 mt-3">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:underline font-semibold">
            Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
