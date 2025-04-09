const db = require('../config/db');

const Alert = {
  createAlert: async ({ user_id, family_id, message, latitude, longitude, audio_url = null }) => {
    const [result] = await db.execute(
      `INSERT INTO alerts (user_id, family_id, message, latitude, longitude, audio_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, family_id, message, latitude, longitude, audio_url]
    );
    return result;
  },

  getAlertsByFamilyId: async (family_id) => {
    const [rows] = await db.execute(
      `SELECT a.*, u.name AS user_name FROM alerts a
       JOIN users u ON a.user_id = u.id
       WHERE a.family_id = ?
       ORDER BY a.created_at DESC`,
      [family_id]
    );
    return rows;
  }
};

module.exports = Alert;
