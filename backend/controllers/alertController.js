const Alert = require('../models/alertModel');

// Kirim alert darurat
exports.sendAlert = async (req, res) => {
  try {
    const { message, latitude, longitude, audio_url } = req.body;
    const { id: user_id, family_id } = req.user;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, error: "Latitude dan longitude diperlukan" });
    }

    const result = await Alert.createAlert({
      user_id,
      family_id,
      message,
      latitude,
      longitude,
      audio_url
    });

    const io = req.app.get('socketio');
    const newAlert = {
      user_id,
      family_id,
      message,
      latitude,
      longitude,
      audio_url,
      created_at: new Date().toISOString()
    };

    // Emit ke hanya anggota keluarga yang sama
    io.to(family_id).emit('emergency_alert', newAlert);

    res.json({ success: true, insertId: result.insertId });
  } catch (err) {
    console.error("Gagal kirim alert:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Ambil semua alert dalam satu keluarga
exports.getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.getAlertsByFamilyId(req.user.family_id);
    res.json(alerts);
  } catch (err) {
    console.error("Gagal ambil alert:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Panic mode auto-update location
exports.panicUpdate = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const { id: user_id, family_id } = req.user;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, error: "Latitude dan longitude diperlukan" });
    }

    const message = "📍 Update lokasi Panic Mode aktif";
    const result = await Alert.createAlert({ user_id, family_id, message, latitude, longitude });

    const io = req.app.get('socketio');
    const newAlert = {
      user_id,
      family_id,
      message,
      latitude,
      longitude,
      created_at: new Date().toISOString()
    };

    io.to(family_id).emit('emergency_alert', newAlert);
    res.json({ success: true, insertId: result.insertId });
  } catch (err) {
    console.error("Gagal update panic location:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

