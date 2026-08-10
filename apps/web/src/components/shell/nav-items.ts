import {
  LayoutDashboard,
  Package,
  Truck,
  ShoppingBag,
  Users,
  Heart,
  Store,
  Ticket,
  BarChart3,
  MapPin,
  MessageCircle,
  Zap,
  Settings,
  Wallet,
  Boxes,
  RotateCcw,
  Tag,
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
  { label: "Fornecedores", href: "/fornecedores", icon: Truck },
  { label: "Estoque", href: "/estoque", icon: Boxes },
  { label: "Pedidos", href: "/pedidos", icon: ShoppingBag },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Afiliadas", href: "/afiliadas", icon: Heart },
  { label: "Revendedoras", href: "/revendedoras", icon: Store },
  { label: "Kits", href: "/kits", icon: Tag },
  { label: "Mapa", href: "/mapa", icon: MapPin },
  { label: "Cupons", href: "/cupons", icon: Ticket },
  { label: "Financeiro", href: "/financeiro", icon: Wallet },
  { label: "Trocas", href: "/trocas", icon: RotateCcw },
  { label: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { label: "Atendimento", href: "/atendimento", icon: MessageCircle },
  { label: "Fluxos", href: "/fluxos", icon: Zap },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

export const BOTTOM_NAV: NavItem[] = [
  { label: "Início", href: "/", icon: LayoutDashboard },
  { label: "Produtos", href: "/produtos", icon: Package },
  { label: "Pedidos", href: "/pedidos", icon: ShoppingBag },
  { label: "Clientes", href: "/clientes", icon: Users },
];
