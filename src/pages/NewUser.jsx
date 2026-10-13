import { useState } from 'react';
import { api } from '../api';
import { ErrorBox, Notice } from '../components/ui.jsx';

export default function NewUser() {
  const [f, setF] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [ok, setOk] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError(null); setOk('');
    try {
      const u = await api.createUser({ ...f, role: 'librarian' });
      setOk(`Bibliotecario «${u.username}» creado.`);
      setF({ username: '', password: '' });
    } catch (err) { setError(err); }
  }

  return (
    <>
      <h1>Nuevo bibliotecario</h1>
      <form className="card stack" style={{ maxWidth: 420 }} onSubmit={submit}>
        <label>Usuario<input value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} required /></label>
        <label>Contraseña<input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required /></label>
        <ErrorBox error={error} /><Notice>{ok}</Notice>
        <button className="btn primary">Crear</button>
      </form>
    </>
  );
}
