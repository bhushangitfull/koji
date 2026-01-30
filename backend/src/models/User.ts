import { query } from '../config/database';
import { User } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class UserModel {
  static async findById(id: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  static async create(
    email: string,
    passwordHash: string,
    name: string
  ): Promise<User> {
    const id = uuidv4();
    const now = new Date();

    const result = await query(
      `INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, email, passwordHash, name, now, now]
    );

    return result.rows[0];
  }

  static async update(
    id: string,
    updates: Partial<User>
  ): Promise<User | null> {
    const fields = Object.keys(updates)
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ');

    const values = Object.values(updates);
    values.push(id);

    const result = await query(
      `UPDATE users SET ${fields}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  static async getAllUsers(): Promise<User[]> {
    const result = await query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  }
}

export default UserModel;
