const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function fixPasswords() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',        // sesuai konfigurasi MySQL Anda
    password: '',        // password MySQL
    database: 'pengaduan_db'
  });

  const passwordPlain = 'rahasia123';
  const hash = await bcrypt.hash(passwordPlain, 10);
  console.log('Hash baru:', hash);

  // Update semua user
  await connection.execute(
    `UPDATE users SET password = ? WHERE email IN ('superadmin@example.com', 'admin@example.com', 'user@example.com')`,
    [hash]
  );

  console.log('✅ Password berhasil diupdate');
  await connection.end();
}

fixPasswords().catch(console.error);