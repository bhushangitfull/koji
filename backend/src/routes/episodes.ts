import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import EpisodeModel from '../models/Episode';
import VocabularyModel from '../models/Vocabulary';
import { authenticateToken } from '../middleware/auth';
import { ApiResponse, Episode } from '../types';

const router = Router();

// Upload episode (POST /api/episodes/upload)
router.post(
  '/upload',
  authenticateToken,
  [body('title').notEmpty().trim()],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Validation failed',
      };
      res.status(400).json(response);
      return;
    }

    try {
      const { title, subtitleFileUrl, duration } = req.body;
      const userId = req.userId!;

      const episode = await EpisodeModel.create(
        userId,
        title,
        subtitleFileUrl,
        duration
      );

      const response: ApiResponse<Episode> = {
        success: true,
        data: episode,
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to upload episode',
      };
      res.status(500).json(response);
    }
  }
);

// Get episode by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const episode = await EpisodeModel.findById(id);

    if (!episode) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Episode not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<Episode> = {
      success: true,
      data: episode,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch episode',
    };
    res.status(500).json(response);
  }
});

// Get all episodes for user
router.get('/user/all', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const episodes = await EpisodeModel.getAllByUser(userId);

    const response: ApiResponse<Episode[]> = {
      success: true,
      data: episodes,
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch episodes',
    };
    res.status(500).json(response);
  }
});

// Get episode status
router.get('/:id/status', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const episode = await EpisodeModel.findById(id);

    if (!episode) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Episode not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<{status: string, error?: string}> = {
      success: true,
      data: {
        status: episode.processing_status,
        error: episode.processing_error,
      },
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch episode status',
    };
    res.status(500).json(response);
  }
});

// Delete episode
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await EpisodeModel.delete(id);

    if (!deleted) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Episode not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<null> = {
      success: true,
      message: 'Episode deleted successfully',
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to delete episode',
    };
    res.status(500).json(response);
  }
});

export default router;
