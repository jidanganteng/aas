const db = require('../config/database');

// ========== USER PROFILE ==========
exports.getUserProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT id, name, email, phone, address, createdAt
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'User tidak ditemukan'
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Gagal mengambil profil user'
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, phone, address } = req.body;

  try {
    await db.query(
      `UPDATE users
       SET name = ?, phone = ?, address = ?
       WHERE id = ?`,
      [name, phone, address, userId]
    );

    res.json({
      message: 'Profil user berhasil diperbarui'
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Gagal update profil user'
    });
  }
};

// ========== ADMIN PROFILE ==========
exports.getAdminProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT id, name, email, phone, address, position, department, createdAt
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Admin tidak ditemukan'
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Gagal mengambil profil admin'
    });
  }
};

exports.updateAdminProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, phone, address, position, department } = req.body;

  try {
    await db.query(
      `UPDATE users
       SET name = ?, phone = ?, address = ?, position = ?, department = ?
       WHERE id = ?`,
      [name, phone, address, position, department, userId]
    );

    res.json({
      message: 'Profil admin berhasil diperbarui'
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Gagal update profil admin'
    });
  }
};