import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, List, Package, PieChart, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

export const BottomNav: React.FC = () => {
  const items = [
    { icon: Home, label: 'Início', to: '/dashboard' },
    { icon: List, label: 'Listas', to: '/listas' },
    { icon: Package, label: 'Estoque', to: '/estoque' },
    { icon: PieChart, label: 'Gastos', to: '/relatorios' },
    { icon: Settings, label: 'Ajustes', to: '/configuracoes' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-3 flex justify-around items-center z-50 md:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive ? "text-primary font-medium" : "text-gray-500"
            )
          }
        >
          <item.icon size={22} />
          <span className="text-[10px]">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
