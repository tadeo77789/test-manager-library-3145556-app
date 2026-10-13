import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtDate } from '../api';
import { ErrorBox, Pager } from '../components/ui.jsx';

export default function Overdue() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try { setData(await api.overdue({ page, size: 20 })); } catch (e) { setError(e); }
  }, [page]);
  useEffect(() => { load(); }, [load]);

  return (
    <>
      <h1>Préstamos vencidos</h1>
      <ErrorBox error={error} />
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Libro</th><th>Socio</th><th>Vencía</th><th>Días de retraso</th><th></th></tr></thead>
          <tbody>
            {data?.items.map((o) => (
              <tr key={o.item_id}>
                <td>{o.book_title}</td><td>{o.member_name}</td><td>{fmtDate(o.due_at)}</td>
                <td><strong>{o.days_late}</strong></td>
                <td><Link to={`/loans/${o.loan_id}`}>Ver préstamo</Link></td>
              </tr>
            ))}
            {data && data.items.length === 0 && <tr><td colSpan="5" className="muted">No hay libros vencidos.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pager data={data} onPage={setPage} />
    </>
  );
}
