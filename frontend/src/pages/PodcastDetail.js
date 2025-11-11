import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PodcastCard from '../components/PodcastCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const PodcastDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [podcast, setPodcast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        const response = await api.get(`/podcasts/${id}`);
        setPodcast(response.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching podcast:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPodcast();
  }, [id]);

  if (loading) {
    return <LoadingSkeleton count={1} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl text-red-500 mb-4">Error loading podcast</h2>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl mb-4">Podcast not found</h2>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PodcastCard podcast={podcast} showActions={true} />
    </div>
  );
};

export default PodcastDetail;