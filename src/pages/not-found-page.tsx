import { Link } from 'react-router-dom';
import { buttonVariants } from '../components/ui/button';
import { Card, CardDescription, CardTitle } from '../components/ui/card';

export function NotFoundPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <Card className="fade-up max-w-lg rounded-[32px] p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">404</p>
        <CardTitle className="mt-4 text-3xl">Pagina nao encontrada</CardTitle>
        <CardDescription className="mt-3">
          O endereco nao existe nessa nova base do painel. Vamos te levar de volta para o inicio.
        </CardDescription>
        <Link className={buttonVariants({ className: 'mt-6' })} to="/">
          Voltar ao dashboard
        </Link>
      </Card>
    </div>
  );
}
