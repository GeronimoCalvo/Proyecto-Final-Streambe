const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./vacaciones.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    days INTEGER NOT NULL,
    start TEXT NOT NULL,
    comment TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
});

db.close();
console.log('Base de datos inicializada correctamente');
