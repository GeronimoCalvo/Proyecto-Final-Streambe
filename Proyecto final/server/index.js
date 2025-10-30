import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

sqlite3.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, "vacaciones.db");

const app = express();
app.use(cors());
app.use(express.json());

// Abrir base de datos con callback para ver si se conecta
const db = new sqlite3.Database(DB_FILE, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error("❌ Error al abrir la BD:", err.message);
  } else {
    console.log("✅ Conectado a la base de datos:", DB_FILE);
  }
});

// Crear tabla requests si no existe
db.run(
  `CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    days INTEGER NOT NULL,
    start TEXT NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  (err) => {
    if (err) console.error("Error creando tabla requests:", err.message);
  }
);

// Crear tabla vacaciones si no existe
db.run(
  `CREATE TABLE IF NOT EXISTS vacaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    dias_tomados INTEGER,
    fecha_inicio TEXT,
    fecha_fin TEXT,
    motivo TEXT
  )`,
  (err) => {
    if (err) console.error("Error creando tabla vacaciones:", err.message);
  }
);

// ---------------------
// Rutas: requests
// ---------------------
app.get("/api/requests", (req, res) => {
  db.all("SELECT * FROM requests ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      console.error("Error SELECT requests:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post("/api/requests", (req, res) => {
  const { name, days, start, comment } = req.body;
  if (!name || !days || !start) return res.status(400).json({ error: "Faltan datos" });

  db.run(
    "INSERT INTO requests (name, days, start, comment) VALUES (?, ?, ?, ?)",
    [name, days, start, comment],
    function (err) {
      if (err) {
        console.error("Error INSERT requests:", err.message);
        return res.status(500).json({ error: err.message });
      }
      db.get("SELECT * FROM requests WHERE id = ?", [this.lastID], (e, row) => {
        if (e) {
          console.error("Error SELECT requests after insert:", e.message);
          return res.status(500).json({ error: e.message });
        }
        res.status(201).json(row);
      });
    }
  );
});

// ---------------------
// Rutas: vacaciones
// ---------------------

// GET todas las vacaciones
app.get("/api/vacaciones", (req, res) => {
  db.all("SELECT * FROM vacaciones ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      console.error("Error SELECT vacaciones:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST crear vacaciones
app.post("/api/vacaciones", (req, res) => {
  const { nombre, dias_tomados, fecha_inicio, fecha_fin, motivo } = req.body;

  console.log("📥 Datos recibidos del frontend:", req.body);

  // Validaciones simples
  if (!nombre || !fecha_inicio || !fecha_fin) {
    return res.status(400).json({ error: "Faltan campos obligatorios: nombre/fecha_inicio/fecha_fin" });
  }

  db.run(
    `INSERT INTO vacaciones (nombre, dias_tomados, fecha_inicio, fecha_fin, motivo)
     VALUES (?, ?, ?, ?, ?)`,
    [nombre, dias_tomados || 0, fecha_inicio, fecha_fin, motivo || null],
    function (err) {
      if (err) {
        console.error("❌ Error al guardar en la BD:", err.message);
        return res.status(500).json({ error: "Error al guardar" });
      }
      console.log("✅ Solicitud guardada con ID:", this.lastID);
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Opcional: DELETE para eliminar (útil para probar borrado desde frontend)
app.delete("/api/vacaciones/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM vacaciones WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error DELETE vacaciones:", err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) return res.status(404).json({ error: "No existe ese id" });
    res.json({ deletedId: id });
  });
});

// Catch-all para rutas no definidas (devuelve JSON, no HTML)
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor backend en http://localhost:${PORT}`));
