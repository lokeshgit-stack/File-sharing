import express from 'express';
import Playlist from '../models/Playlist.js';
import Podcast from '../models/Podcast.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/playlists
// @desc    Get all public playlists
// @access  Public
router.get('/', async (req, res) => {
  try {
    const playlists = await Playlist.find({ isPublic: true })
      .populate('creator', 'username')
      .sort('-createdAt')
      .lean();

    res.json(playlists.map(playlist => ({
      id: playlist._id,
      name: playlist.name,
      description: playlist.description,
      creator: playlist.creator.username,
      userId: playlist.creator._id,
      isPublic: playlist.isPublic,
      podcastCount: playlist.podcasts.length,
      createdAt: playlist.createdAt
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/playlists
// @desc    Create playlist
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }

    const playlist = await Playlist.create({
      name,
      description: description || '',
      creator: req.user._id,
      isPublic: isPublic !== undefined ? isPublic : true
    });

    const populatedPlaylist = await Playlist.findById(playlist._id)
      .populate('creator', 'username');

    res.status(201).json({
      id: populatedPlaylist._id,
      name: populatedPlaylist.name,
      description: populatedPlaylist.description,
      creator: populatedPlaylist.creator.username,
      userId: populatedPlaylist.creator._id,
      isPublic: populatedPlaylist.isPublic,
      podcastCount: 0,
      createdAt: populatedPlaylist.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/playlists/:id
// @desc    Get playlist by ID with podcasts
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('creator', 'username')
      .populate({
        path: 'podcasts',
        populate: { path: 'owner', select: 'username' }
      });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json({
      id: playlist._id,
      name: playlist.name,
      description: playlist.description,
      creator: playlist.creator.username,
      userId: playlist.creator._id,
      isPublic: playlist.isPublic,
      createdAt: playlist.createdAt,
      podcasts: playlist.podcasts.map(podcast => ({
        id: podcast._id,
        title: podcast.title,
        description: podcast.description,
        filePath: podcast.filePath,
        duration: podcast.duration,
        plays: podcast.plays,
        owner: podcast.owner.username,
        createdAt: podcast.createdAt
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/playlists/:playlistId/podcasts/:podcastId
// @desc    Add podcast to playlist
// @access  Private
router.post('/:playlistId/podcasts/:podcastId', protect, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const podcast = await Podcast.findById(req.params.podcastId);
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    // Check if already in playlist
    if (playlist.podcasts.includes(req.params.podcastId)) {
      return res.status(400).json({ error: 'Podcast already in playlist' });
    }

    playlist.podcasts.push(req.params.podcastId);
    await playlist.save();

    res.json({ message: 'Podcast added to playlist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/playlists/:playlistId/podcasts/:podcastId
// @desc    Remove podcast from playlist
// @access  Private
router.delete('/:playlistId/podcasts/:podcastId', protect, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check ownership
    if (playlist.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    playlist.podcasts = playlist.podcasts.filter(
      id => id.toString() !== req.params.podcastId
    );
    
    await playlist.save();

    res.json({ message: 'Podcast removed from playlist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
