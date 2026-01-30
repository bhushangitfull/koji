import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = Router();

// Get global leaderboard
router.get(
  '/global',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 10, offset = 0 } = req.query;

      // TODO: Implement global leaderboard
      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: { message: 'Global leaderboard coming soon' },
      };

      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch leaderboard',
      };
      res.status(500).json(response);
    }
  }
);

// Get weekly leaderboard
router.get(
  '/weekly',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: { message: 'Weekly leaderboard coming soon' },
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch weekly leaderboard',
      };
      res.status(500).json(response);
    }
  }
);

// Get friend leaderboard
router.get(
  '/friends/:userId',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: { message: 'Friend leaderboard coming soon' },
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to fetch friend leaderboard',
      };
      res.status(500).json(response);
    }
  }
);

export default router;
