import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth.jsx';
import { ErrorBox } from '../components/ui.jsx';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const r = await api.login(username, password);
      login(r.access_token, r.role);
    } catch (err) { setError(err); } finally { setBusy(false); }
  }

  return (
    <div className="card login">
      <h1>Manager Library</h1>
      <form onSubmit={submit}>
        <label>Usuario<input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required /></label>
        <label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <ErrorBox error={error} />
        <button className="btn primary" disabled={busy}>Ingresar</button>
      </form>
    </div>
  );
}
