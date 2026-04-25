import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import logo from '../assets/logo-rm.png';
import { APP_DESCRIPTION, APP_NAME } from '../config/app';
import { Button } from '../components/ui/button';
import { Card, CardDescription, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useAuth } from '../stores/auth-store';

const loginSchema = z.object({
  password: z.string().min(1, 'Digite sua senha para entrar.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, status } = useAuth();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  if (status === 'authenticated') {
    return <Navigate replace to="/" />;
  }

  async function onSubmit(values: LoginFormValues) {
    setServerError('');
    const result = await signIn(values.password);

    if (!result.ok || !result.data?.token) {
      setServerError(result.error?.message || 'Nao foi possivel autenticar.');
      return;
    }

    window.location.hash = '#/';
    navigate('/', { replace: true });
  }

  return (
    <div className="grid min-h-dvh place-items-center overflow-hidden px-4 py-8">
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-40" />
      <div className="relative mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="fade-up hidden px-4 py-8 lg:flex lg:flex-col lg:justify-center">
          <div>
            <div className="flex items-center gap-4">
              <img alt="RM Portal" className="h-14 w-14 rounded-2xl object-cover" src={logo} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Painel Interno</p>
                <h1 className="mt-2 text-4xl font-semibold leading-tight text-foreground">
                  Simples, direto e pronto para o dia a dia do negocio.
                </h1>
              </div>
            </div>
            <p className="mt-8 max-w-xl text-base leading-7 text-muted-foreground">
              {APP_DESCRIPTION}
            </p>
          </div>
        </section>

        <Card className="fade-up mx-auto w-full max-w-xl rounded-[28px] p-6 md:p-8">
          <div className="mb-8 flex items-center gap-4">
            <img alt="RM Portal" className="h-12 w-12 rounded-xl object-cover" src={logo} />
            <div>
              <CardTitle className="mt-2 text-2xl md:text-3xl">Entrar no {APP_NAME}</CardTitle>
              <CardDescription className="mt-2">
                Use a senha configurada no servidor para acessar o painel.
              </CardDescription>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground" htmlFor="password">
                Senha de acesso
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoComplete="current-password"
                  className="pl-11"
                  id="password"
                  placeholder="Digite sua senha"
                  type="password"
                  {...register('password')}
                />
              </div>
              {errors.password ? <p className="text-sm text-danger">{errors.password.message}</p> : null}
            </div>

            {serverError ? (
              <div className="rounded-2xl border border-danger/15 bg-danger/10 px-4 py-3 text-sm text-danger">{serverError}</div>
            ) : null}

            <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar no painel'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
