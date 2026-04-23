import { Navigate, Outlet, createHashRouter } from 'react-router-dom';
import { AppShellLayout } from './shell/app-shell-layout';
import { AppLoader } from './components/app-loader';
import { useAuth } from './stores/auth-store';
import { LoginPage } from './pages/login-page';
import { DashboardPage } from './pages/dashboard-page';
import { ClientesPage } from './pages/clientes-page';
import { NotFoundPage } from './pages/not-found-page';

function ProtectedLayout() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <AppLoader label="Preparando o painel..." />;
  }

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

  if (status === 'loading') {
    return <AppLoader label="Verificando acesso..." />;
  }

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
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
