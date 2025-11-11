import React from 'react';
import { motion } from 'framer-motion';

const LoadingSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          className="glass-effect rounded-2xl p-6 animate-pulse"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="h-6 bg-white/20 rounded mb-4 shimmer" />
          <div className="h-4 bg-white/10 rounded mb-2 shimmer" />
          <div className="h-4 bg-white/10 rounded mb-4 w-2/3 shimmer" />
          <div className="h-2 bg-white/10 rounded mb-4 shimmer" />
          <div className="flex space-x-2">
            <div className="flex-1 h-10 bg-white/20 rounded-full shimmer" />
            <div className="w-10 h-10 bg-white/20 rounded-full shimmer" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
