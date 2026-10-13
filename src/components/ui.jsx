export function ErrorBox({ error }) {
  if (!error) return null;
  return (
    <div className="alert error" role="alert">
      <strong>{error.message}</strong>
      {error.details?.length > 0 && (
        <ul>{error.details.map((d, i) => <li key={i}>{d.field}: {d.issue}</li>)}</ul>
      )}
    </div>
  );
}

export function Notice({ children }) {
  return children ? <div className="alert ok" role="status">{children}</div> : null;
}

export function Pager({ data, onPage }) {
  if (!data) return null;
  const pages = Math.max(1, Math.ceil(data.total / data.size));
  return (
    <div className="pager">
      <button className="btn" disabled={data.page <= 1} onClick={() => onPage(data.page - 1)}>Anterior</button>
      <span>Página {data.page} de {pages} · {data.total} registros</span>
      <button className="btn" disabled={data.page >= pages} onClick={() => onPage(data.page + 1)}>Siguiente</button>
    </div>
  );
}

export function StatusBadge({ status }) {
  const label = { open: 'Abierto', overdue: 'Vencido', closed: 'Cerrado' }[status] || status;
  return <span className={`badge ${status}`}>{label}</span>;
}
