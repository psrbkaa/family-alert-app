const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ✅ REGISTER
exports.register = async (req, res) => {
  const { name, password, role, family_id: inputFamilyId } = req.body;

  // Validasi input
  if (!name || !password || !role) {
    return res.status(400).json({ message: 'Semua data wajib diisi' });
  }

  try {
    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Cek apakah username sudah digunakan
    const [existing] = await db.execute('SELECT * FROM users WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Username sudah digunakan' });
    }

    // Tentukan family_id berdasarkan role
    let family_id = null;

    if (role === 'parent') {
      family_id = Date.now().toString(); // Buat family_id baru
    
      // ✅ Tambahkan ini
      await db.execute('INSERT INTO families (id) VALUES (?)', [family_id]);
    } else if (role === 'child') {
      if (!inputFamilyId) {
        return res.status(400).json({ message: 'Child wajib memasukkan family_id dari orang tua' });
      }
    
      // Cek apakah family_id yang dimasukkan memang ada di tabel families
      const [familyCheck] = await db.execute('SELECT * FROM families WHERE id = ?', [inputFamilyId]);
      if (familyCheck.length === 0) {
        return res.status(404).json({ message: 'family_id tidak ditemukan' });
      }
    
      family_id = inputFamilyId;
    }
    

    // Simpan ke database
    const [result] = await db.execute(
      'INSERT INTO users (name, password, role, family_id) VALUES (?, ?, ?, ?)',
      [name, hashed, role, family_id]
    );

    res.status(201).json({
      message: 'Register berhasil',
      user_id: result.insertId,
      family_id
    });

  } catch (err) {
    console.error('❌ Error saat register:', err); // Tambahkan log ini
    res.status(500).json({ message: 'Gagal register', error: err.message });
  }
};

// ✅ LOGIN
exports.login = async (req, res) => {
  const { name, password } = req.body;

  try {
    console.log('[LOGIN] Input:', { name, password });

    const [[user]] = await db.execute('SELECT * FROM users WHERE name = ?', [name]);
    console.log('[LOGIN] User dari DB:', user);

    // Cek user dan password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log('[LOGIN] Gagal: user tidak ditemukan atau password salah');
      return res.status(401).json({ message: 'Login gagal: username atau password salah' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('[LOGIN] Password cocok:', isPasswordValid);

    // Buat token JWT
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        role: user.role,
        family_id: user.family_id,
      },
      'RAHASIA_KUNCI',
      { expiresIn: '1d' }
    );

    console.log('[LOGIN] Token berhasil dibuat');
    res.json({ token, user });

  } catch (err) {
    console.error('❌ Error saat login:', err);
    res.status(500).json({ message: 'Login gagal', error: err.message });
  }
};
