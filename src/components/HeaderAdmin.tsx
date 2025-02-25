import React, { useState, ReactNode  } from 'react';
import { Bell, ChevronDown, LogOut } from 'lucide-react';
import DefaultUserImage from '../imagens/dark.png';

interface HeaderProps {
    activeSection: string;
    children?: ReactNode; // Adicione esta linha
  }
  
  const HeaderAdmin: React.FC<HeaderProps> = ({ activeSection, children }) => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800 capitalize">
          {activeSection}
        </h1>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <img
                src={DefaultUserImage}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <ChevronDown className="w-4 h-4" />
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;