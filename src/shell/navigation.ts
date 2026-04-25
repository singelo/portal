import { BarChart3, BriefcaseBusiness, Building2, FileStack, Package2, type LucideIcon } from 'lucide-react';

export type NavigationItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/clientes', label: 'Clientes', icon: Building2 },
  { to: '/estoque', label: 'Estoque', icon: Package2 },
  { to: '/ordens-servico', label: 'Ordens de servico', icon: BriefcaseBusiness },
  { to: '/propostas', label: 'Arquivos', icon: FileStack },
];
