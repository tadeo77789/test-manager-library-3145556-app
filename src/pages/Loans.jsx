import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, fmtDate } from '../api';
import { ErrorBox, Pager, StatusBadge } from '../components/ui.jsx';

export default function Loans() {
  const [sp] = useSearchParams();
  const [f, setF] = useState({ from: '', to: '', status: '', member_id: sp.get('member_id') || '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try { setData(await api.loans({ ...f, page, size: 10 })); } catch (e) { setError(e); }
  }, [f, page]);
  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setPage(1); };

  return (
    <>
      <h1>Préstamos</h1>
      <div className="row">
        <label>Desde<input type="date" value={f.from} onChange={set('from')} /></label>
        <label>Hasta<input type="date" value={f.to} onChange={set('to')} /></label>
        <label>Estado
          <select value={f.status} onChange={set('status')}>
            <option value="">Todos</option>
            <option value="open">Abierto</option>
            <option value="overdue">Vencido</option>
            <option value="closed">Cerrado</option>
          </select>
        </label>
        {f.member_id && <button className="btn" onClick={() => { setF({ ...f, member_id: '' }); setPage(1); }}>Quitar filtro de socio</button>}
      </div>
      <ErrorBox error={error} />
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Fecha</th><th>Libros</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {data?.items.map((l) => (
              <tr key={l.id}>
                <td>{fmtDate(l.loaned_at)}</td>
                <td>{l.items?.map((i) => i.book_title).join(', ')}</td>
                <td><StatusBadge status={l.status} /></td>
                <td><Link to={`/loans/${l.id}`}>Ver detalle</Link></td>
              </tr>
            ))}
            {data && data.items.length === 0 && <tr><td colSpan="4" className="muted">Sin resultados.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pager data={data} onPage={setPage} />
    </>
  );
}
