import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Upload from './pages/Upload';
import MyPodcasts from './pages/MyPodcasts';
import Playlists from './pages/Playlists';
import PodcastDetail from './pages/PodcastDetail';
import FileShare from './pages/FileShare';
import FileShareResult from './pages/FileShareResult';
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';
import NewPost from './pages/NewPost'; // New post creation page
import MyPosts from './pages/MyPosts'; // User's posts page
import PostDetail from './pages/PostDetail'; // Individual post detail page
import PublicFileShare from './pages/PublicFileShare';


function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Navbar />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/playlists" element={<Playlists />} />
            
            {/* Podcast Routes (existing) */}
            <Route path="/podcast/:id" element={<PodcastDetail />} />
            <Route path="/my-podcasts" element={<PrivateRoute><MyPodcasts /></PrivateRoute>} />
            <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
            
            {/* New Post Routes */}
            <Route path="/new-post" element={<PrivateRoute><NewPost /></PrivateRoute>} />
            <Route path="/my-posts" element={<PrivateRoute><MyPosts /></PrivateRoute>} />
            <Route path="/post/:id" element={<PostDetail />} />
            
            {/* File Share Routes */}
            <Route path="/file-share" element={<PrivateRoute><FileShare /></PrivateRoute>} />
            <Route path="/my-files" element={<PrivateRoute><FileShareResult /></PrivateRoute>} />
            {/* <Route path="/share/:shareId" element={<FileShareResult />} /> */}
             <Route path="/share/:shareId" element={<PublicFileShare />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
