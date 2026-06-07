const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function fix() {
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pengaduan_db'
  });
  const hash = await bcrypt.hash('rahasia123', 10);
  await db.execute(`DELETE FROM users WHERE email IN ('admin@example.com', 'superadmin@example.com')`);
  await db.execute(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?), (?, ?, ?, ?)`, 
    ['Admin', 'admin@example.com', hash, 'ADMIN', 'Super Admin', 'superadmin@example.com', hash, 'SUPER_ADMIN']);
  console.log('Admin dan super admin berhasil diupdate');
  await db.end();
}
fix();