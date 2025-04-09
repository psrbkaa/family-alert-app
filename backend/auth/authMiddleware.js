const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log("⚠️ Token tidak ditemukan di header");
    return res.sendStatus(401);
  }

  try {
    const decoded = jwt.verify(token, 'RAHASIA_KUNCI');
    console.log("✅ Token berhasil diverifikasi:", decoded);

    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [decoded.id]);

    if (rows.length === 0) {
      console.log("❌ User tidak ditemukan berdasarkan ID dari token:", decoded.id);
      return res.status(403).json({ error: "User tidak ditemukan" });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    console.error("❌ Error verifikasi token:", err.message);
    res.status(403).json({ error: "Token tidak valid" });
  }
};

module.exports = authenticate; // ✅ DI SINI AJA, tanpa kurung tutup tambahan
