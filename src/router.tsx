import { Navigate, Outlet, createHashRouter } from 'react-router-dom';
import { AppShellLayout } from './shell/app-shell-layout';
import { useAuth } from './stores/auth-store';
import { LoginPage } from './pages/login-page';
import { DashboardPage } from './pages/dashboard-page';
import { ClientesPage } from './pages/clientes-page';
import { OrdensServicoPage } from './pages/ordens-servico-page';
import { PropostasPage } from './pages/propostas-page';
import { NotFoundPage } from './pages/not-found-page';

function ProtectedLayout() {
  const { status } = useAuth();

  if (status === 'anonymous') {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShellLayout>
      <Outlet />
    </AppShellLayout>
  );
}

function PublicOnlyRoute() {
  const { status } = useAuth();

  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
}

export const router = createHashRouter([
  {
    path: '/login',
    element: <PublicOnlyRoute />,
  },
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'clientes',
        element: <ClientesPage />,
      },
      {
        path: 'ordens-servico',
        element: <OrdensServicoPage />,
      },
      {
        path: 'propostas',
        element: <PropostasPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
