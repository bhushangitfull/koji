import { Router } from 'express';
import authRoutes from './auth';
import episodeRoutes from './episodes';
import vocabularyRoutes from './vocabulary';
import quizRoutes from './quiz';
import progressRoutes from './progress';
import leaderboardRoutes from './leaderboard';
import friendsRoutes from './friends';

const router = Router();

router.use('/auth', authRoutes);
router.use('/episodes', episodeRoutes);
router.use('/vocabulary', vocabularyRoutes);
router.use('/quiz', quizRoutes);
router.use('/progress', progressRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/friends', friendsRoutes);

export default router;
