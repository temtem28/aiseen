import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '@/components/Logo';
import { 
  LayoutDashboard, 
  Search, 
  BarChart3, 
  FileText, 
  Users, 
  Settings,
  HelpCircle,
  Bot
} from 'lucide-react';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  path: string;
  active?: boolean;
}

export default function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Search, label: 'Audit', path: '/audit' },
    { icon: BarChart3, label: 'Historique', path: '/audit/history' },
    { icon: Bot, label: 'Citations IA', path: '/ai-citations' },
    { icon: Users, label: 'Concurrents', path: '/competitive-analysis' },
    { icon: FileText, label: 'Rapports', path: '/weekly-reports' },
  ];

  const bottomItems: SidebarItem[] = [
    { icon: Settings, label: 'Paramètres', path: '/settings' },
    { icon: HelpCircle, label: 'Aide', path: '/help' },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-16 bg-[#0a0f1a] border-r border-[#1a2332] flex flex-col items-center py-4 z-50">
      {/* Logo */}
      <div className="mb-8">
        <Logo size="sm" showTagline={false} />
      </div>

      {/* Main Menu */}
      <nav className="flex-1 flex flex-col items-center gap-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group ${
                isActive 
                  ? 'bg-cyan-500/20 text-cyan-400' 
                  : 'text-gray-500 hover:text-cyan-400 hover:bg-[#1a2332]'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full" />
              )}
              <item.icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <div className="absolute left-14 px-2 py-1 bg-[#1a2332] text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {item.label}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Menu */}
      <div className="flex flex-col items-center gap-2 pt-4 border-t border-[#1a2332]">
        {bottomItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-cyan-400 hover:bg-[#1a2332] transition-all duration-200 group"
          >
            <item.icon className="w-5 h-5" />
            
            {/* Tooltip */}
            <div className="absolute left-14 px-2 py-1 bg-[#1a2332] text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
              {item.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
