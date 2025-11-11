import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiUpload, FiMusic, FiList, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiShare2, FiFolder } from 'react-icons/fi';


const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { path: '/upload', label: 'Upload', icon: FiUpload },
    { path: '/my-podcasts', label: 'My Podcasts', icon: FiMusic },
    { path: '/file-share', label: 'Upload Files', icon: FiShare2 },
{ path: '/my-files', label: 'My Files', icon: FiFolder },
  ];
  

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass-effect sticky top-0 z-50 shadow-2xl"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: onclick, ease: "linear" }}
                className="text-4xl"
              >
             🎙️
              </motion.div>
              <lable className="text-3xl font-bold gradient-text">
                SharePod
              </lable>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <item.icon className="text-xl" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            ))}

            {user ? (
              <>
                {userNavItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        isActive(item.path)
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <item.icon className="text-xl" />
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                ))}

                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="flex items-center space-x-2 px-4 py-2 glass-effect rounded-full"
                    whileHover={{ scale: 1.05 }}
                  >
                    <FiUser className="text-purple-400" />
                    <span className="text-white font-medium">{user.username}</span>
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-600 px-4 py-2 rounded-full text-white font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    <FiLogOut />
                    <span>Logout</span>
                  </motion.button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    className="text-white font-medium px-6 py-2 rounded-full hover:bg-white/10 transition-all"
                  >
                    Login
                  </motion.button>
                </Link>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(168, 85, 247, 0.8)' }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-bold shadow-lg"
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
            className="md:hidden text-white text-3xl"
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
            className="md:hidden glass-effect border-t border-white/20 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                      isActive(item.path)
                        ? 'bg-purple-600 text-white'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="text-xl" />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              ))}

              {user && userNavItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                      isActive(item.path)
                        ? 'bg-purple-600 text-white'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="text-xl" />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
