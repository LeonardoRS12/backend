const pool = require("../config/db");

class User {
  /**
   * Create a new user in the database.
   * @param {string} email - User's email.
   * @param {string} hashedPassword - Hashed password.
   * @param {string} name - User's name (optional).
   * @returns {Promise} Result of the query.
   */
  static async create(email, hashedPassword, name) {
    const query = `
      INSERT INTO users (email, password, name) 
      VALUES ($1, $2, $3) 
      RETURNING id, email, name, status, registration_time;
    `;
    const values = [email, hashedPassword, name];
    return pool.query(query, values);
  }

  /**
   * Find a user by email.
   * @param {string} email - User's email.
   * @returns {Promise} User record or null.
   */
  static async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = $1";
    const values = [email];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Find a user by ID.
   * @param {number} id - User's ID.
   * @returns {Promise} User record or null.
   */
  static async findById(id) {
    const query = "SELECT * FROM users WHERE id = $1";
    const values = [id];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Update the last login time of a user.
   * @param {string} email - User's email.
   * @returns {Promise} Result of the query.
   */
  static async updateLastLogin(email) {
    const query = "UPDATE users SET last_login = NOW() WHERE email = $1";
    const values = [email];
    return pool.query(query, values);
  }

  /**
   * Get all users sorted by last login time.
   * @returns {Promise} List of all users.
   */
  static async getAllUsers() {
    const query = `
      SELECT id, email, name, last_login, status 
      FROM users 
      ORDER BY last_login DESC;
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Update the status of multiple users (block/unblock).
   * @param {Array<number>} userIds - Array of user IDs.
   * @param {string} status - New status (e.g., 'active', 'blocked').
   * @returns {Promise} Result of the query.
   */
  static async updateStatus(userIds, status) {
    const query = `
      UPDATE users 
      SET status = $1 
      WHERE id = ANY($2::int[]);
    `;
    const values = [status, userIds];
    return pool.query(query, values);
  }

  /**
   * Delete multiple users by ID.
   * @param {Array<number>} userIds - Array of user IDs.
   * @returns {Promise} Result of the query.
   */
  static async deleteByIds(userIds) {
    const query = "DELETE FROM users WHERE id = ANY($1::int[])";
    const values = [userIds];
    return pool.query(query, values);
  }
}

module.exports = User;