import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Heart,
  Store,
  Ticket,
  BarChart3,
  MapPin,
  MessageCircle,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const PAINEL_NAV: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Produtos", href: "/produtos", icon: Package },
  { label: "Pedidos", href: "/pedidos", icon: ShoppingBag },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Afiliadas", href: "/afiliadas", icon: Heart },
  { label: "Revendedoras", href: "/revendedoras", icon: Store },
  { label: "Mapa", href: "/mapa", icon: MapPin },
  { label: "Cupons", href: "/cupons", icon: Ticket },
  { label: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { label: "Atendimento", href: "/atendimento", icon: MessageCircle },
  { label: "Fluxos", href: "/fluxos", icon: Zap },
];

export const BOTTOM_NAV: NavItem[] = [
  { label: "Início", href: "/", icon: LayoutDashboard },
  { label: "Produtos", href: "/produtos", icon: Package },
  { label: "Pedidos", href: "/pedidos", icon: ShoppingBag },
  { label: "Clientes", href: "/clientes", icon: Users },
];
