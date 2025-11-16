import React, { useState } from 'react';
import { FiX, FiMessageCircle } from 'react-icons/fi';
import PostCard from './PostCard';
import { motion, AnimatePresence } from 'framer-motion';
import PostDetailView from './PostDetailView'; // Add this if you want modal detail with comments

const ViewAllModal = ({ posts, onClose, currentUser }) => {
  const [openPost, setOpenPost] = useState(null); // Track currently open post for comments

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          backgroundColor: '#121212',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '1000px',
          maxHeight: '80vh',
          overflowY: 'auto',
          padding: '1rem',
          color: '#fff',
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
          }}
          aria-label="Close modal"
        >
          <FiX />
        </button>

        <h2 style={{ marginBottom: '1rem' }}>All Posts</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          {posts.map((post) => (
            <div
              key={post._id}
              style={{
                position: 'relative',
                width: '100%',
                paddingTop: '75%', // 4:3 aspect ratio
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#1a1a1a',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
              }}
            >
              {/* Media and PostCard inside absolute container to maintain 4:3 ratio */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '75%', // media takes upper 75% height of card
                  overflow: 'hidden',
                  borderTopLeftRadius: '12px',
                  borderTopRightRadius: '12px',
                }}
              >
                <PostCard post={post} showActions currentUser={currentUser} />
              </div>
              {/* Title and "uploaded by" below the media with comment icon */}
              <div
                style={{
                  position: 'absolute',
                  top: '75%',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: '0.5rem 1rem',
                  backgroundColor: '#222',
                  borderBottomLeftRadius: '12px',
                  borderBottomRightRadius: '12px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'default',
                }}
              >
                <div style={{ overflow: 'hidden', flexGrow: 1, paddingRight: '0.5rem' }}>
                  <h3
                    style={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      marginBottom: '0.25rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={post.title}
                  >
                    {post.title}
                  </h3>
                  <span
                    style={{
                      color: '#aaa',
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={`Uploaded by ${post.owner}`}
                  >
                    Uploaded by {post.owner}
                  </span>
                </div>
                <button
                  aria-label={`Open comments for ${post.title}`}
                  title="Comments"
                  onClick={() => setOpenPost(post)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    padding: '0.25rem',
                  }}
                >
                  <FiMessageCircle size={24} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Post detail modal for comments */}
        <AnimatePresence>
          {openPost && (
            <PostDetailView
              post={openPost}
              onClose={() => setOpenPost(null)}
              currentUser={currentUser}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ViewAllModal;
