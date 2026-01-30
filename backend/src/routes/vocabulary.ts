import { Router, Request, Response } from 'express';
import VocabularyModel from '../models/Vocabulary';
import { authenticateToken } from '../middleware/auth';
import { ApiResponse, Vocabulary } from '../types';

const router = Router();

// Get vocabulary by episode ID
router.get(
  '/:episodeId',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { episodeId } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      const { data, total } = await VocabularyModel.findByEpisodeIdPaginated(
        episodeId,
        parseInt(limit as string, 10),
        parseInt(offset as string, 10)
      );

      const response: ApiResponse<{ vocabulary: Vocabulary[]; total: number }> = {
        success: true,
        data: { vocabulary: data, total },
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch vocabulary',
      };
      res.status(500).json(response);
    }
  }
);

// Get single word by ID
router.get(
  '/word/:wordId',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { wordId } = req.params;
      const word = await VocabularyModel.findById(wordId);

      if (!word) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Word not found',
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<Vocabulary> = {
        success: true,
        data: word,
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch word',
      };
      res.status(500).json(response);
    }
  }
);

// Batch vocabulary lookup (POST for multiple words)
router.post(
  '/batch',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { wordIds } = req.body;

      if (!Array.isArray(wordIds) || wordIds.length === 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Invalid request: provide wordIds array',
        };
        res.status(400).json(response);
        return;
      }

      const words: Vocabulary[] = [];
      for (const wordId of wordIds) {
        const word = await VocabularyModel.findById(wordId);
        if (word) words.push(word);
      }

      const response: ApiResponse<Vocabulary[]> = {
        success: true,
        data: words,
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch vocabulary batch',
      };
      res.status(500).json(response);
    }
  }
);

export default router;
