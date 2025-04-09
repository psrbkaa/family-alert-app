const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const alertRoutes = require('./routes/alertRoutes');
const authRoutes = require('./auth/authRoutes');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Setup socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
app.set('socketio', io); // Untuk akses di controller jika perlu

// Middleware
app.use(cors());
app.use(express.json());

// Routes API
app.use('/api', alertRoutes);
app.use('/api', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/auth', authRoutes);

// Serve file statis (HTML, CSS, JS) dari folder frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Endpoint utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ==================== Tambahan untuk realtime lokasi ==================== //
const familyLocations = {}; // Simpan lokasi anggota keluarga berdasarkan family_id

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("join_family", (familyId) => {
    socket.join(familyId);
    socket.familyId = familyId;
    console.log(`👨‍👩‍👧‍👦 User ${socket.id} join keluarga ${familyId}`);
  });

  socket.on("update_location", (data) => {
    const { user_id, name, family_id, latitude, longitude } = data;
    if (!family_id) return;

    // Simpan lokasi ke dalam memory
    if (!familyLocations[family_id]) familyLocations[family_id] = {};

    familyLocations[family_id][user_id] = {
      id: user_id,
      name,
      latitude,
      longitude
    };

    // Broadcast ke semua anggota keluarga
    const locationsArray = Object.values(familyLocations[family_id]);
    io.to(family_id).emit("family_locations", locationsArray);
  });

  socket.on("emergency_alert", (data) => {
    const { family_id } = data;
    console.log("📢 Broadcast alert ke family_id:", family_id);
    io.to(family_id).emit("emergency_alert", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Gunakan port dinamis yang diberikan oleh Railway
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
