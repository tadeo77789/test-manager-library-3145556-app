import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, fmtDate } from '../api';
import { ErrorBox, Notice, StatusBadge } from '../components/ui.jsx';

export default function LoanDetail() {
  const { id } = useParams();
  const [loan, setLoan] = useState(null);
  const [member, setMember] = useState(null);
  const [error, setError] = useState(null);
  const [ok, setOk] = useState('');

  const load = useCallback(() => api.loan(id).then((l) => {
    setLoan(l);
    api.member(l.member_id).then(setMember).catch(() => {});
  }).catch(setError), [id]);
  useEffect(() => { load(); }, [load]);

  async function giveBack(item) {
    setError(null); setOk('');
    try { await api.returnItem(id, item.id); setOk(`«${item.book_title}» devuelto.`); await load(); } catch (e) { setError(e); }
  }

  return (
    <>
      <p><Link to="/loans">← Préstamos</Link></p>
      <h1>Detalle del préstamo</h1>
      <ErrorBox error={error} /><Notice>{ok}</Notice>
      {loan && (
        <>
          <div className="card">
            <p>Socio: <strong>{member ? <Link to={`/members/${member.id}`}>{member.full_name}</Link> : loan.member_id}</strong></p>
            <p>Fecha: {fmtDate(loan.loaned_at)} · Estado: <StatusBadge status={loan.status} /></p>
          </div>
          <div className="card table-wrap">
            <table>
              <thead><tr><th>Libro</th><th>ISBN</th><th>Categoría</th><th>Vence</th><th>Devuelto</th><th></th></tr></thead>
              <tbody>
                {loan.items.map((i) => (
                  <tr key={i.id}>
                    <td>{i.book_title}</td><td>{i.isbn}</td><td>{i.category_name}</td>
                    <td>{fmtDate(i.due_at)}</td><td>{fmtDate(i.returned_at)}</td>
                    <td>{!i.returned_at && <button className="btn small primary" onClick={() => giveBack(i)}>Devolver</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
