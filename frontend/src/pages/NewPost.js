import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiX, FiImage, FiVideo, FiMusic } from 'react-icons/fi';
import { postAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const NewPost = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 5);
    
    if (selectedFiles.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    setFiles(selectedFiles);

    // Generate previews
    const newPreviews = selectedFiles.map(file => ({
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' : 'audio',
      url: URL.createObjectURL(file)
    }));
    setPreviews(newPreviews);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      
      files.forEach(file => {
        formData.append('files', file);
      });

      await postAPI.create(formData);
      
      toast.success('Post created successfully!');
      navigate('/my-posts');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to create post');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.h1
          className="text-5xl font-bold mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="gradient-text">Create New Post</span>
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit}
          className="glass-effect rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Title */}
          <div className="mb-6">
            <label className="block text-white font-bold mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-purple-500"
              placeholder="Enter post title..."
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-white font-bold mb-2">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-white/10 text-white border border-white/20 focus:outline-none focus:border-purple-500"
              placeholder="Tell us about your post..."
            />
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-white font-bold mb-2">
              Upload Media (Max 5 files) *
            </label>
            <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-purple-500 transition">
              <input
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FiUpload className="text-6xl text-white/50 mx-auto mb-4" />
                <p className="text-white/70">
                  Click to upload images, videos, or audio
                </p>
                <p className="text-white/50 text-sm mt-2">
                  {files.length} / 5 files selected
                </p>
              </label>
            </div>
          </div>

          {/* File Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {previews.map((preview, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative glass-effect rounded-lg p-4"
                >
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FiX />
                  </button>
                  
                  <div className="flex flex-col items-center">
                    {preview.type === 'image' ? (
                      <>
                        <img src={preview.url} alt="" className="w-full h-32 object-cover rounded mb-2" />
                        <FiImage className="text-purple-400" />
                      </>
                    ) : preview.type === 'video' ? (
                      <>
                        <video src={preview.url} className="w-full h-32 object-cover rounded mb-2" />
                        <FiVideo className="text-blue-400" />
                      </>
                    ) : (
                      <FiMusic className="text-pink-400 text-4xl mb-2" />
                    )}
                    <p className="text-white/70 text-xs mt-2 truncate w-full text-center">
                      {preview.name}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={uploading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-full disabled:opacity-50"
          >
            {uploading ? 'Creating Post...' : 'Create Post'}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
};

export default NewPost;
