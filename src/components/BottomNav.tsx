import React from 'react';
import { Home, Headphones, ShoppingBag, FileText, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, language, setActiveTaskTier, orders, t } = useApp();

  const incompleteCount = orders.filter((o) => o.status === 'pending').length;

  const handleTabClick = (tab: NavTab) => {
    // If navigating back to Menu, reset sub-view if needed
    if (tab !== 'menu') {
      setActiveTaskTier(null);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems: { id: NavTab; label: string; labelBn: string; icon: React.ReactNode }[] = [
    {
      id: 'home',
      label: 'Home',
      labelBn: 'হোম',
      icon: <Home size={22} className="stroke-[1.8]" />,
    },
    {
      id: 'service',
      label: 'Service',
      labelBn: 'সার্ভিস',
      icon: <Headphones size={22} className="stroke-[1.8]" />,
    },
    {
      id: 'menu',
      label: 'Menu',
      labelBn: 'টাস্ক মেনু',
      icon: <ShoppingBag size={22} className="stroke-[1.8]" />,
    },
    {
      id: 'record',
      label: 'Record',
      labelBn: 'রেকর্ড',
      icon: <FileText size={22} className="stroke-[1.8]" />,
    },
    {
      id: 'mine',
      label: 'Mine',
      labelBn: 'প্রোফাইল',
      icon: <User size={22} className="stroke-[1.8]" />,
    },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 shadow-lg max-w-md mx-auto"
    >
      <div className="grid grid-cols-5 h-14">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center space-y-0.5 transition-all duration-200 ${
                isActive
                  ? 'text-neutral-900 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <div className="relative">
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110 text-rose-800' : ''}`}>
                  {item.icon}
                </div>
                {item.id === 'record' && incompleteCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[9.5px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                    {incompleteCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight ${isActive ? 'text-rose-800 font-bold' : ''}`}>
                {t(`nav_${item.id}`) || (language === 'bn' ? item.labelBn : item.label)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
