type AppLoaderProps = {
  label: string;
};

export function AppLoader({ label }: AppLoaderProps) {
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="glass-panel fade-up flex max-w-sm flex-col items-center gap-4 rounded-[28px] border border-border px-10 py-12 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <div>
          <p className="text-lg font-semibold text-foreground">Carregando ambiente</p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}
