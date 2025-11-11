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
// import MyFiles from './pages/MyFiles';

function App() {
  return (
      // <ThemeProvider>
    <Router>
       {/* <Layout> */}
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
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/podcast/:id" element={<PodcastDetail />} />
            <Route path="/my-podcasts" element={<PrivateRoute><MyPodcasts /></PrivateRoute>} />
            <Route path="/file-share" element={
              <PrivateRoute>
                <FileShare />
              </PrivateRoute>
            } />
            <Route path="/my-files" element={
              <PrivateRoute>
                <FileShareResult />
              </PrivateRoute>
            } />
            <Route 
              path="/upload" 
              element={
                <PrivateRoute>
                  <Upload />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/my-podcasts" 
              element={
                <PrivateRoute>
                  <MyPodcasts />
                </PrivateRoute>
              } 
            />
<Route path="/share/:shareId" element={<FileShareResult />} />
          </Routes>
        </div>
      </AuthProvider>
    {/* </Layout>
     <Toaster 
          position="top-right"
          toastOptions={{
            className: 'dark:bg-gray-800 dark:text-white',
            style: {
              background: 'var(--toaster-bg)',
              color: 'var(--toaster-color)',
            },
          }}
        /> */}
    {/* </ThemeProvider> */}
    </Router>
  );
}

export default App;
