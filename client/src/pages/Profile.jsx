import React from 'react';
import { motion } from 'framer-motion';

const Profile = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50">
      {/* Background blur effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-purple-100 opacity-50 blur-3xl" />
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center p-8"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          Profile Coming Soon
        </h1>
        <p className="text-lg text-gray-600">
          We're working hard to bring you an amazing profile experience.
        </p>
      </motion.div>
    </div>
  );
};

export default Profile;