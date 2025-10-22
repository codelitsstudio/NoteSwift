import express from 'express';
import Download from '../models/Download';
import { authenticateStudent } from '../middlewares/student.middleware';

const router = express.Router();

// Get all downloads for the logged-in user
router.get('/', authenticateStudent, async (req, res) => {
  // Type assertion for req.user
  const user = req.user as { id?: string } | undefined;
  if (!user || !user.id) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const downloads = await Download.find({ user: user.id }).sort({ downloadedAt: -1 });
    res.json(downloads);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch downloads' });
  }
});

// Add a new download record
router.post('/', authenticateStudent, async (req, res) => {
  const user = req.user as { id?: string } | undefined;
  if (!user || !user.id) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const { fileName, fileUri, size, pages } = req.body;
    const download = await Download.create({
      user: user.id,
      fileName,
      fileUri,
      size,
      pages,
    });
    res.status(201).json(download);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save download' });
  }
});

export default router;