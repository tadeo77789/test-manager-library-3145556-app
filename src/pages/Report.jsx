import { useState } from 'react';
import { api } from '../api';
import { ErrorBox } from '../components/ui.jsx';

export default function Report() {
  const [range, setRange] = useState({ from: '', to: '' });
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  async function run(e) {
    e.preventDefault();
    setError(null); setData(null);
    try { setData(await api.report(range)); } catch (err) { setError(err); }
  }

  return (
    <>
      <h1>Libros más prestados</h1>
      <form className="row" onSubmit={run}>
        <label>Desde<input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} required /></label>
        <label>Hasta<input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} required /></label>
        <button className="btn primary">Generar</button>
      </form>
      <ErrorBox error={error} />
      {data && (
        <div className="card table-wrap">
          <table>
            <thead><tr><th>#</th><th>Libro</th><th>Categoría</th><th>Veces prestado</th></tr></thead>
            <tbody>
              {data.rows.map((r, i) => (
                <tr key={`${r.book_id}-${r.book_title}-${r.category_name}`}>
                  <td>{i + 1}</td><td>{r.book_title}</td><td>{r.category_name}</td><td><strong>{r.times_borrowed}</strong></td>
                </tr>
              ))}
              {data.rows.length === 0 && <tr><td colSpan="4" className="muted">Sin préstamos en el rango.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
