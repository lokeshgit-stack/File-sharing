import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Playlists from './pages/Playlists';

// Podcast Routes (existing)
import PodcastDetail from './pages/PodcastDetail';
import MyPodcasts from './pages/MyPodcasts';
import Upload from './pages/Upload';

// Post Routes
import NewPost from './pages/NewPost';
import MyPosts from './pages/MyPosts';
import PostDetail from './pages/PostDetail';

// File Share Routes
import FileShare from './pages/FileShare';
import FileShareResult from './pages/FileShareResult';
import PublicFileShare from './pages/PublicFileShare';

// Import styles
import './App.css';
import './index.css';

function App() {
  return (
    <Router>
        <AuthProvider>
      <ThemeProvider>
          <div className="app-container">
            {/* Animated background effect */}
            <div className="app-background"></div>
            
            <Navbar />
            
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'rgba(10, 14, 39, 0.95)',
                  backdropFilter: 'blur(20px)',
                  color: '#fff',
                  border: '1px solid rgba(0, 229, 255, 0.3)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  padding: '16px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                success: {
                  style: {
                    background: 'rgba(0, 200, 83, 0.1)',
                    border: '1px solid rgba(0, 200, 83, 0.5)',
                  },
                  iconTheme: {
                    primary: '#00c853',
                    secondary: '#fff',
                  },
                },
                error: {
                  style: {
                    background: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid rgba(244, 67, 54, 0.5)',
                  },
                  iconTheme: {
                    primary: '#f44336',
                    secondary: '#fff',
                  },
                },
                loading: {
                  style: {
                    background: 'rgba(0, 229, 255, 0.1)',
                    border: '1px solid rgba(0, 229, 255, 0.5)',
                  },
                  iconTheme: {
                    primary: '#00e5ff',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/playlists" element={<Playlists />} />
                
                {/* Podcast Routes (existing) */}
                <Route path="/podcast/:id" element={<PodcastDetail />} />
                <Route 
                  path="/my-podcasts" 
                  element={
                    <PrivateRoute>
                      <MyPodcasts />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/upload" 
                  element={
                    <PrivateRoute>
                      <Upload />
                    </PrivateRoute>
                  } 
                />
                
                {/* New Post Routes */}
                <Route 
                  path="/new-post" 
                  element={
                    <PrivateRoute>
                      <NewPost />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/my-posts" 
                  element={
                    <PrivateRoute>
                      <MyPosts />
                    </PrivateRoute>
                  } 
                />
                <Route path="/post/:id" element={<PostDetail />} />
                
                {/* File Share Routes */}
                <Route 
                  path="/file-share" 
                  element={
                    <PrivateRoute>
                      <FileShare />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/my-files" 
                  element={
                    <PrivateRoute>
                      <FileShareResult />
                    </PrivateRoute>
                  } 
                />
                <Route path="/share/:shareId" element={<PublicFileShare />} />
              </Routes>
            </main>
            
            {/* Footer */}
            <footer className="app-footer">
              <div className="footer-content">
                <p>© 2025 SecureShare. Built with 🔐 for Privacy.</p>
                <div className="footer-links">
                  <a href="/privacy">Privacy Policy</a>
                  <a href="/terms">Terms of Service</a>
                  <a href="/contact">Contact</a>
                </div>
              </div>
            </footer>
          </div>
      </ThemeProvider>
        </AuthProvider>
    </Router>
  );
}

export default App;
