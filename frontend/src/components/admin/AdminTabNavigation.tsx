
import React from 'react';
import { BarChart3, Globe } from 'lucide-react';

interface AdminTabNavigationProps {
  activeTab: 'menu' | 'analytics' | 'homepage';
  onTabChange: (tab: 'menu' | 'analytics' | 'homepage') => void;
}

const AdminTabNavigation = ({ activeTab, onTabChange }: AdminTabNavigationProps) => {
  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
      <button
        onClick={() => onTabChange('menu')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'menu'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Menu Management
      </button>
      <button
        onClick={() => onTabChange('homepage')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
          activeTab === 'homepage'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Globe className="w-4 h-4" />
        Homepage Editor
      </button>
      <button
        onClick={() => onTabChange('analytics')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
          activeTab === 'analytics'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <BarChart3 className="w-4 h-4" />
        Analytics
      </button>
    </div>
  );
};

export default AdminTabNavigation;
