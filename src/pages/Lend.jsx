import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, fmtDate } from '../api';
import { ErrorBox } from '../components/ui.jsx';

export default function Lend() {
  const [params] = useSearchParams();
  const [mq, setMq] = useState('');
  const [members, setMembers] = useState([]);
  const [member, setMember] = useState(null);
  const [bq, setBq] = useState('');
  const [books, setBooks] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState(null);
  const [loan, setLoan] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = params.get('member_id');
    if (id) api.member(id).then(setMember).catch(setError);
  }, [params]);

  useEffect(() => {
    if (!mq.trim()) { setMembers([]); return; }
    const t = setTimeout(() => api.members({ q: mq, size: 8 }).then((r) => setMembers(r.items)).catch(setError), 250);
    return () => clearTimeout(t);
  }, [mq]);

  useEffect(() => {
    const t = setTimeout(() => api.books({ q: bq, size: 8 }).then((r) => setBooks(r.items)).catch(setError), 250);
    return () => clearTimeout(t);
  }, [bq]);

  function toggle(b) {
    setSelected((s) => (s.some((x) => x.id === b.id) ? s.filter((x) => x.id !== b.id) : s.length < 3 ? [...s, b] : s));
  }

  async function submit() {
    setBusy(true); setError(null); setLoan(null);
    try {
      const l = await api.createLoan({ member_id: member.id, items: selected.map((b) => ({ book_id: b.id })) });
      setLoan(l); setSelected([]);
      api.member(member.id).then(setMember).catch(() => {});
      setBq((v) => v + ' '); // refresh availability
      setTimeout(() => setBq((v) => v.trim()), 0);
    } catch (e) { setError(e); } finally { setBusy(false); }
  }

  return (
    <>
      <h1>Prestar libros</h1>
      <div className="grid2">
        <div className="card">
          <h2>1. Socio</h2>
          {member ? (
            <p><strong>{member.full_name}</strong> ({member.document_number})<br />
              <span className="muted">Sin devolver: {member.active_loans} de 3</span>{' '}
              <button className="btn small" onClick={() => setMember(null)}>Cambiar</button></p>
          ) : (
            <>
              <label>Buscar socio<input value={mq} onChange={(e) => setMq(e.target.value)} placeholder="Nombre o documento" /></label>
              <div className="pick">
                {members.map((m) => (
                  <div key={m.id}><span>{m.full_name} · {m.document_number}</span>
                    <button className="btn small" onClick={() => api.member(m.id).then(setMember).catch(setError)}>Elegir</button></div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="card">
          <h2>2. Libros (1 a 3, distintos)</h2>
          <label>Buscar libro<input value={bq} onChange={(e) => setBq(e.target.value)} placeholder="Título, autor o ISBN" /></label>
          <div className="pick">
            {books.map((b) => (
              <div key={b.id}>
                <span>{b.title} <span className="muted">· {b.available_copies} disp.</span></span>
                <button className="btn small" disabled={!selected.some((x) => x.id === b.id) && selected.length >= 3} onClick={() => toggle(b)}>
                  {selected.some((x) => x.id === b.id) ? 'Quitar' : 'Agregar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Resumen</h2>
        {selected.length === 0 ? <p className="muted">Aún no hay libros seleccionados.</p> : (
          <ul>{selected.map((b) => <li key={b.id}>{b.title}</li>)}</ul>
        )}
        <ErrorBox error={error} />
        <button className="btn primary" disabled={!member || selected.length === 0 || busy} onClick={submit}>Registrar préstamo</button>
      </div>

      {loan && (
        <div className="alert ok">
          Préstamo registrado. Vencimiento: <strong>{fmtDate(loan.items[0]?.due_at)}</strong>.{' '}
          <Link to={`/loans/${loan.id}`}>Ver préstamo</Link>
        </div>
      )}
    </>
  );
}
