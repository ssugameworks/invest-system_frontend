'use client';

import { usePathname, useRouter } from 'next/navigation';
import { 
  HomeIcon, 
  ChartBarSquareIcon, 
  UserCircleIcon 
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeSolid, 
  ChartBarSquareIcon as ChartSolid, 
  UserCircleIcon as UserSolid 
} from '@heroicons/react/24/solid';

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      id: 'home',
      label: '홈',
      icon: HomeIcon,
      activeIcon: HomeSolid,
      path: '/main',
    },
    {
      id: 'invest',
      label: '투자',
      icon: ChartBarSquareIcon,
      activeIcon: ChartSolid,
      path: '/invest', // 추후 구현
    },
    {
      id: 'my',
      label: '내 정보',
      icon: UserCircleIcon,
      activeIcon: UserSolid,
      path: '/my', // 추후 구현
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 w-full pb-3 pt-2" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
      <div className="mx-auto max-w-[420px] px-6">
        <div className="relative flex h-[64px] w-full items-center justify-center gap-20 rounded-[24px] border border-white/10 px-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] overflow-hidden">
          {/* Animated Glass Gradient Background */}
          <div className="absolute inset-0 bg-[#151A29]/60 backdrop-blur-xl z-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_8s_infinite] z-0" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-20 z-0" />
          
          {/* Tab Buttons */}
          {tabs.map((tab) => {
            const isActive = pathname === tab.path || (tab.id === 'home' && pathname === '/');
            const Icon = isActive ? tab.activeIcon : tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.path)}
                className="group relative z-10 flex flex-col items-center justify-center gap-1"
              >
                {/* Active Glow Effect */}
                {isActive && (
                  <div className="absolute -top-10 left-1/2 h-10 w-10 -translate-x-1/2 rounded-full bg-accent-green/20 blur-xl" />
                )}
                
                <Icon 
                  className={`h-6 w-6 transition-all duration-200 ${
                    isActive ? 'text-accent-green scale-105 drop-shadow-[0_0_8px_rgba(178,245,82,0.5)]' : 'text-text-tertiary group-hover:text-text-secondary'
                  }`} 
                />
                <span 
                  className={`text-[12px] font-medium transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-text-tertiary group-hover:text-text-secondary'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
