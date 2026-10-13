import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { ErrorBox } from '../components/ui.jsx';

export default function MemberDetail() {
  const { id } = useParams();
  const [m, setM] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { api.member(id).then(setM).catch(setError); }, [id]);

  return (
    <>
      <p><Link to="/members">← Socios</Link></p>
      <h1>Detalle del socio</h1>
      <ErrorBox error={error} />
      {m && (
        <div className="card">
          <h2>{m.full_name}</h2>
          <p>Documento: <strong>{m.document_number}</strong></p>
          <p>Libros sin devolver: <strong>{m.active_loans}</strong> de 3</p>
          <Link className="btn primary" to={`/loans?member_id=${m.id}`}>Ver sus préstamos</Link>{' '}
          <Link className="btn" to={`/lend?member_id=${m.id}`}>Prestar libros</Link>
        </div>
      )}
    </>
  );
}
