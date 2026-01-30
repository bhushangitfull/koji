import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = Router();

// Add friend
router.post(
  '/add/:userId',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const currentUserId = req.userId!;

      // TODO: Implement friend add logic
      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: { message: 'Friend request sent' },
      };

      res.status(201).json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to add friend',
      };
      res.status(500).json(response);
    }
  }
);

// Get friends list
router.get('/list', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    // TODO: Implement friends list
    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: 'Friends list coming soon' },
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch friends list',
    };
    res.status(500).json(response);
  }
});

// Remove friend
router.post(
  '/remove/:userId',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const response: ApiResponse<null> = {
        success: true,
        message: 'Friend removed',
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse<null> = {
        success: false,
        error: 'Failed to remove friend',
      };
      res.status(500).json(response);
    }
  }
);

export default router;
