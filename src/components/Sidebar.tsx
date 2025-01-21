import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Video, FileText, Clock, BarChart2, Play, Triangle } from 'lucide-react';

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
};

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  const navigate = useNavigate();

  const isFreelancer = localStorage.getItem('isFreelancer') === 'true';

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/' },
    { id: 'freelancers', label: 'Freelancers', icon: <Users className="w-5 h-5" />, path: '/freelancers' },
    { id: 'videos', label: 'Vídeos', icon: <Video className="w-5 h-5" />, path: '/videos' },
    { id: 'canais', label: 'Canais', icon: <Play className="w-5 h-5" />, path: '/canais' },
    { id: 'logs', label: 'Logs', icon: <Clock className="w-5 h-5" />, path: '/logs' },
    { id: 'reports', label: 'Relatórios', icon: <BarChart2 className="w-5 h-5" />, path: '/reports' },
  ];

  const filteredMenuItems = isFreelancer
    ? menuItems.filter((item) => item.id === 'dashboard' || item.id === 'videos')
    : menuItems;

  const handleNavigation = (item: MenuItem) => {
    setActiveSection(item.id);
    navigate(item.path);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <Play className="w-6 h-6 text-blue-600 fill-blue-600" />
            <Triangle className="w-6 h-6 text-blue-600 fill-blue-600" />
          </div>
          <span className="text-xl font-bold text-gray-900">TubeFlow</span>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item)}
            className={`
              w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
              transition-all duration-200 text-sm font-medium
              ${activeSection === item.id
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            {React.cloneElement(item.icon as React.ReactElement, {
              className: `w-5 h-5 ${activeSection === item.id ? 'text-blue-600' : 'text-gray-400'
                }`,
            })}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
