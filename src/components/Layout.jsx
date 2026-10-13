import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Layout() {
  const { isAdmin, role, logout } = useAuth();
  const links = [
    ['/books', 'Catálogo'],
    ['/members', 'Socios'],
    ['/lend', 'Prestar'],
    ['/loans', 'Préstamos'],
    ['/overdue', 'Vencidos'],
  ];
  if (isAdmin) links.push(['/report', 'Reporte'], ['/users/new', 'Nuevo bibliotecario']);
  return (
    <>
      <header className="topbar">
        <span className="brand">Manager Library</span>
        <nav>
          {links.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
        </nav>
        <span className="who">{role === 'admin' ? 'Administrador' : 'Bibliotecario'}
          <button className="btn small" onClick={logout}>Salir</button></span>
      </header>
      <main className="container"><Outlet /></main>
    </>
  );
}
