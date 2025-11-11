import React from 'react';
import Navbar from './Navbar';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'dark bg-background-dark' : 'bg-background-light'
    }`}>
      <Navbar />
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-8"
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;