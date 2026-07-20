import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Heart,
  Store,
  Ticket,
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
  { label: "Cupons", href: "/cupons", icon: Ticket },
];

export const BOTTOM_NAV: NavItem[] = [
  { label: "Início", href: "/", icon: LayoutDashboard },
  { label: "Produtos", href: "/produtos", icon: Package },
  { label: "Pedidos", href: "/pedidos", icon: ShoppingBag },
  { label: "Clientes", href: "/clientes", icon: Users },
];
