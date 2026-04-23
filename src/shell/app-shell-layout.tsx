import { useState, type PropsWithChildren } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import logo from '../assets/logo-rm.png';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { useAuth } from '../stores/auth-store';

const navigation = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/clientes', label: 'Clientes', icon: Building2 },
];

export function AppShellLayout({ children }: PropsWithChildren) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-dvh">
      <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[256px_minmax(0,1fr)]">
        <aside className="hidden border-r border-border bg-[#fbfcfd] px-4 py-6 lg:flex lg:flex-col">
          <SidebarContent sessionName={session?.user?.name} pathname={location.pathname} onLogout={handleLogout} />
        </aside>

        <div className="relative flex min-h-dvh flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-white/88 backdrop-blur-xl">
            <div className="flex w-full items-center justify-between gap-4 px-4 py-4 md:px-6 xl:px-8 2xl:px-10">
              <div className="flex items-center gap-3">
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-foreground lg:hidden"
                  onClick={() => setMobileOpen(true)}
                  type="button"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">RM Portal</p>
                  
                </div>
              </div>

              <div className="hidden items-center gap-3 md:flex">
                
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </div>
            </div>
          </header>

          <main className="flex w-full flex-1 flex-col px-4 py-6 md:px-6 md:py-8 xl:px-8 2xl:px-10">
            {children}
          </main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-900/16 backdrop-blur-sm lg:hidden">
          <div className="absolute left-0 top-0 h-full w-[88vw] max-w-[320px] border-r border-border bg-[#fbfcfd] px-4 py-4 text-foreground shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                
                <div>
                  <p className="text-sm font-semibold">RM Portal</p>
                </div>
              </div>
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white"
                onClick={() => setMobileOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <SidebarContent
              sessionName={session?.user?.name}
              pathname={location.pathname}
              onLogout={async () => {
                setMobileOpen(false);
                await handleLogout();
              }}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

type SidebarContentProps = {
  pathname: string;
  sessionName?: string;
  onLogout: () => void | Promise<void>;
  onNavigate?: () => void;
};

function SidebarContent({ pathname, sessionName, onLogout, onNavigate }: SidebarContentProps) {
  return (
    <>
      

     

      <nav className="mt-4 flex flex-1 flex-col gap-1.5">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                isActive && 'bg-white text-foreground shadow-sm ring-1 ring-border',
                !isActive && 'text-muted-foreground hover:bg-white hover:text-foreground',
              )
            }
            onClick={onNavigate}
            to={to}
          >
            <Icon className={cn('h-4 w-4', pathname === to ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground')} />
            {label}
          </NavLink>
        ))}
      </nav>

      <Button className="mt-4 w-full" variant="outline" onClick={() => void onLogout()}>
        <LogOut className="mr-2 h-4 w-4" />
        Encerrar sessao
      </Button>
    </>
  );
}
