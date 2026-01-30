import { query } from '../config/database';
import { Vocabulary } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class VocabularyModel {
  static async findById(id: string): Promise<Vocabulary | null> {
    const result = await query(
      'SELECT * FROM vocabulary WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByEpisodeId(episodeId: string): Promise<Vocabulary[]> {
    const result = await query(
      'SELECT * FROM vocabulary WHERE episode_id = $1 ORDER BY first_appearance_timestamp ASC',
      [episodeId]
    );
    return result.rows;
  }

  static async findByJapanese(
    japanese: string,
    episodeId?: string
  ): Promise<Vocabulary | null> {
    const query_text = episodeId
      ? 'SELECT * FROM vocabulary WHERE japanese = $1 AND episode_id = $2 LIMIT 1'
      : 'SELECT * FROM vocabulary WHERE japanese = $1 LIMIT 1';

    const params = episodeId ? [japanese, episodeId] : [japanese];
    const result = await query(query_text, params);
    return result.rows[0] || null;
  }

  static async create(
    episodeId: string,
    japanese: string,
    hiragana: string,
    english: string,
    partsOfSpeech: string[],
    firstAppearanceTimestamp: number,
    timesInEpisode: number = 1,
    isPhrase: boolean = false,
    kanjiBreakdown?: Record<string, unknown>
  ): Promise<Vocabulary> {
    const id = uuidv4();
    const now = new Date();

    const result = await query(
      `INSERT INTO vocabulary (id, episode_id, japanese, hiragana, english, parts_of_speech, kanji_breakdown, first_appearance_timestamp, times_in_episode, is_phrase, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        id,
        episodeId,
        japanese,
        hiragana,
        english,
        partsOfSpeech,
        kanjiBreakdown ? JSON.stringify(kanjiBreakdown) : null,
        firstAppearanceTimestamp,
        timesInEpisode,
        isPhrase,
        now,
      ]
    );

    return result.rows[0];
  }

  static async findByEpisodeIdPaginated(
    episodeId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ data: Vocabulary[]; total: number }> {
    const countResult = await query(
      'SELECT COUNT(*) as count FROM vocabulary WHERE episode_id = $1',
      [episodeId]
    );

    const dataResult = await query(
      'SELECT * FROM vocabulary WHERE episode_id = $1 ORDER BY first_appearance_timestamp ASC LIMIT $2 OFFSET $3',
      [episodeId, limit, offset]
    );

    return {
      data: dataResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  }
}

export default VocabularyModel;
