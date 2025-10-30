import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function RequestList({ requests }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Función para colorear los días según las solicitudes
  const tileClassName = ({ date }) => {
    for (const req of requests) {
      const from = new Date(req.from);
      const to = new Date(req.to);
      if (date >= from && date <= to) {
        if (req.type === "Vacaciones") return "vacaciones-day";
        if (req.type === "Baja médica") return "bajamedica-day";
      }
    }
    return null;
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileClassName={tileClassName}
      />

      <h3 style={{ marginTop: "20px" }}>Solicitudes</h3>
      <ul style={{ marginTop: "10px" }}>
        {requests.length === 0 && <li>No hay solicitudes todavía.</li>}
        {requests.map((req) => (
          <li key={req.id}>
            <strong>{req.name}</strong> – {req.type} ({req.from} → {req.to})
          </li>
        ))}
      </ul>
    </div>
  );
}
