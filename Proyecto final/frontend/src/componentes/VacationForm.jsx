import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function VacationForm({ onClose, onAdd }) {
  const [range, setRange] = useState([null, null]);
  const [type, setType] = useState("Vacaciones");
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Por favor, ingresá un nombre");
    if (!range[0] || !range[1]) return alert("Seleccioná un rango de fechas");

    const from = range[0].toISOString().split("T")[0];
    const to = range[1].toISOString().split("T")[0];

    onAdd({
      id: Date.now(),
      name,
      from,
      to,
      type,
    });

    onClose();
  };

  return (
    <div className="card">
      <h2 className="title">Seleccionar Rango de Fechas</h2>

      <Calendar
        selectRange
        value={range}
        onChange={setRange}
        className="big-calendar"
        locale="es-ES"
        calendarType="ISO 8601" // Esto lo pone de Lunes a Domingo
      />

      <form onSubmit={handleSubmit} className="form-section">
        <input
          type="text"
          className="input"
          placeholder="Nombre del empleado"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="select"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="Vacaciones">Vacaciones</option>
          <option value="Baja médica">Baja médica</option>
          <option value="Cumpleaños">Cumpleaños</option>
          <option value="Aniversario">Aniversario</option>
        </select>

        <button type="submit" className="btn-guardar">
          Guardar
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn-cancelar"
        >
          Cancelar
        </button>
      </form>
    </div>
  );
}
