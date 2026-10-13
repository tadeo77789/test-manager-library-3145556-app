import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Books from './pages/Books.jsx';
import Members from './pages/Members.jsx';
import MemberDetail from './pages/MemberDetail.jsx';
import Lend from './pages/Lend.jsx';
import Loans from './pages/Loans.jsx';
import LoanDetail from './pages/LoanDetail.jsx';
import Overdue from './pages/Overdue.jsx';
import Report from './pages/Report.jsx';
import NewUser from './pages/NewUser.jsx';

function Protected({ children, admin }) {
  const { token, isAdmin } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (admin && !isAdmin) return <div className="alert error">No tiene permisos para ver esta sección.</div>;
  return children;
}

export default function App() {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/books" replace /> : <Login />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/books" element={<Books />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/:id" element={<MemberDetail />} />
        <Route path="/lend" element={<Lend />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/loans/:id" element={<LoanDetail />} />
        <Route path="/overdue" element={<Overdue />} />
        <Route path="/report" element={<Protected admin><Report /></Protected>} />
        <Route path="/users/new" element={<Protected admin><NewUser /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to="/books" replace />} />
    </Routes>
  );
}
