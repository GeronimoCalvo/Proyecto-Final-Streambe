import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "./styles.css";
import "react-calendar/dist/Calendar.css";

export default function App() {
  const [requests, setRequests] = useState([]);
  const [range, setRange] = useState([null, null]);
  const [type, setType] = useState("Vacaciones");
  const [name, setName] = useState("");

  // URL del backend (asegurate que el backend corra en el puerto 3000)
  const BACKEND = "http://localhost:3000";

  // Cargar ausencias desde el backend al iniciar
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(`${BACKEND}/api/vacaciones`);
        if (!res.ok) throw new Error(`GET /api/vacaciones respondio ${res.status}`);
        const data = await res.json();
        setRequests(
          data.map((r) => ({
            id: r.id,
            name: r.nombre,
            type: r.motivo || "Vacaciones",
            from: r.fecha_inicio,
            to: r.fecha_fin,
          }))
        );
      } catch (err) {
        console.error("Error al cargar ausencias:", err);
      }
    };
    fetchRequests();
  }, []);

  // Agregar solicitud
  const handleAddRequest = async () => {
    if (!name.trim()) return alert("Ingresá un nombre");
    if (!range[0] || !range[1]) return alert("Seleccioná un rango de fechas");

    const fecha_inicio = range[0].toISOString().split("T")[0];
    const fecha_fin = range[1].toISOString().split("T")[0];
    const dias_tomados = Math.ceil((range[1] - range[0]) / (1000 * 60 * 60 * 24)) + 1;
    const motivo = type;

    const data = { nombre: name, dias_tomados, fecha_inicio, fecha_fin, motivo };

    try {
      const res = await fetch(`${BACKEND}/api/vacaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Backend: ${res.status} - ${errText}`);
      }

      const saved = await res.json();
      // Guardamos la respuesta real (id) en el estado para mostrarla
      setRequests((prev) => [
        { id: saved.id, name, type: motivo, from: fecha_inicio, to: fecha_fin },
        ...prev,
      ]);

      setName("");
      setRange([null, null]);
      alert("Solicitud guardada ✅");
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("Error al guardar la solicitud. Mirá la consola para más detalle.");
    }
  };

  // Cancelar selección de calendario
  const handleCancelSelection = () => {
    setRange([null, null]);
  };

  // Borrar solicitud (hace DELETE al backend)
  const handleDeleteRequest = async (id) => {
    if (!window.confirm("¿Querés eliminar esta ausencia?")) return;
    try {
      const res = await fetch(`${BACKEND}/api/vacaciones/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`DELETE responded ${res.status}`);
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err) {
      console.error("Error al borrar:", err);
      alert("No se pudo borrar. Mirá la consola.");
    }
  };

  const tileClassName = ({ date }) => {
    return null;
  };

  return (
    <div className="page-container">
      <header className="header-bar">Gestor de Ausencias</header>

      <main>
        <h1 className="title">Planificador de Equipo</h1>

        <div className="card">
          <Calendar selectRange={true} value={range} onChange={setRange} tileClassName={tileClassName} className="react-calendar" />

          <div className="form-section">
            <input type="text" placeholder="Nombre del empleado" value={name} onChange={(e) => setName(e.target.value)} className="input" />

            <select value={type} onChange={(e) => setType(e.target.value)} className="select">
              <option value="Vacaciones">Vacaciones</option>
              <option value="Baja médica">Baja médica</option>
            </select>

            <button onClick={handleAddRequest} className="btn-guardar">
              Guardar Ausencia
            </button>

            {range[0] && (
              <button onClick={handleCancelSelection} className="btn-cancelar">
                Cancelar
              </button>
            )}
          </div>
        </div>

        <h2 className="subtitle">📅 Ausencias Programadas</h2>
        <div className="requests-list">
          {requests.length === 0 ? (
            <p className="empty-state">Aún no hay ausencias registradas.</p>
          ) : (
            requests.map((req) => (
              <div key={req.id} className={`request-card ${req.type === "Vacaciones" ? "vacaciones-card" : "bajamedica-card"}`}>
                <div className="request-header">
                  <span className="request-name">{req.name}</span>
                  <span className="request-type">{req.type}</span>
                  <button onClick={() => handleDeleteRequest(req.id)} className="btn-delete">
                    &times;
                  </button>
                </div>
                <div className="request-dates">
                  {req.from} → {req.to}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
