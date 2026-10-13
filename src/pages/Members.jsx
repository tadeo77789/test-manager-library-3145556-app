import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { ErrorBox, Notice, Pager } from '../components/ui.jsx';

export default function Members() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ full_name: '', document_number: '' });
  const [formError, setFormError] = useState(null);
  const [ok, setOk] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try { setData(await api.members({ q, page, size: 10 })); } catch (e) { setError(e); }
  }, [q, page]);
  useEffect(() => { load(); }, [load]);

  async function create(e) {
    e.preventDefault();
    setFormError(null); setOk('');
    try {
      const m = await api.createMember(form);
      setOk(`Socio «${m.full_name}» registrado.`);
      setForm({ full_name: '', document_number: '' });
      load();
    } catch (err) { setFormError(err); }
  }

  return (
    <>
      <h1>Socios</h1>
      <form className="card" onSubmit={create}>
        <h2>Nuevo socio</h2>
        <div className="row">
          <label>Nombre completo<input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></label>
          <label>Documento<input value={form.document_number} onChange={(e) => setForm({ ...form, document_number: e.target.value })} required /></label>
          <button className="btn primary">Registrar</button>
        </div>
        <ErrorBox error={formError} /><Notice>{ok}</Notice>
      </form>
      <div className="row">
        <label>Buscar<input value={q} placeholder="Nombre o documento" onChange={(e) => { setQ(e.target.value); setPage(1); }} /></label>
      </div>
      <ErrorBox error={error} />
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Nombre</th><th>Documento</th><th></th></tr></thead>
          <tbody>
            {data?.items.map((m) => (
              <tr key={m.id}>
                <td>{m.full_name}</td><td>{m.document_number}</td>
                <td><Link to={`/members/${m.id}`}>Ver detalle</Link></td>
              </tr>
            ))}
            {data && data.items.length === 0 && <tr><td colSpan="3" className="muted">Sin resultados.</td></tr>}
          </tbody>
        </table>
      </div>
      <Pager data={data} onPage={setPage} />
    </>
  );
}
