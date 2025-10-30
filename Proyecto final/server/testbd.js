import sqlite3 from 'sqlite3';
import path from 'path';

const __dirname = path.resolve();
const dbPath = path.join(__dirname, 'vacaciones.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) console.error('Error al conectar con la BD:', err.message);
  else console.log('Conectado a la BD.');
});

db.all("SELECT * FROM vacaciones", [], (err, rows) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Contenido de la tabla vacaciones:", rows);
  }
});


db.close();
