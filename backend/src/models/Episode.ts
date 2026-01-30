import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { Episode } from '../types';

export class EpisodeModel {
  static async findById(id: string): Promise<Episode | null> {
    const result = await query(
      'SELECT * FROM episodes WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByUserId(userId: string): Promise<Episode[]> {
    const result = await query(
      'SELECT * FROM episodes WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async create(
    userId: string,
    title: string,
    subtitleFileUrl?: string,
    duration: number = 0
  ): Promise<Episode> {
    const id = uuidv4();
    const now = new Date();

    const result = await query(
      `INSERT INTO episodes (id, user_id, title, subtitle_file_url, duration, processing_status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, userId, title, subtitleFileUrl, duration, 'pending', now, now]
    );

    return result.rows[0];
  }

  static async updateStatus(
    id: string,
    status: string,
    error?: string
  ): Promise<Episode | null> {
    const result = await query(
      `UPDATE episodes 
       SET processing_status = $1, processing_error = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, error || null, id]
    );

    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM episodes WHERE id = $1',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  static async getAllByUser(userId: string): Promise<Episode[]> {
    const result = await query(
      'SELECT * FROM episodes WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }
}

export default EpisodeModel;
