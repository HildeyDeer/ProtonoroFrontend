import { Calendar, Target, Search, Plus, Moon, Sun, User, Settings, LogOut, HelpCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../api/auth';
import styles from './Header.module.css';

interface HeaderProps {
  darkMode: boolean;
  onThemeToggle: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onNewTask: () => void;
  onProfileAction: (action: string) => void;
  onConfettiTrigger?: () => void;
  profileData?: {
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
    full_name?: string | null; // Изменено: string | null вместо string
    username?: string | null;  // Изменено: string | null вместо string
  };
}

// Интерфейс для данных профиля
interface ProfileData {
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  full_name?: string | null;
  username?: string | null;
}

const Header = ({ 
  darkMode, 
  onThemeToggle, 
  searchQuery, 
  onSearchChange,
  onNewTask,
  profileData: externalProfileData,
  onProfileAction,
  onConfettiTrigger
}: HeaderProps) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [currentDate, setCurrentDate] = useState('');
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, logout } = useAuth();

  // Форматирование даты
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      setCurrentDate(now.toLocaleDateString('ru-RU', options));
    };
    
    updateDate();
    const interval = setInterval(updateDate, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Функция для получения данных профиля
  const getCurrentProfileData = (): ProfileData => {
    // Если переданы внешние данные, используем их
    if (externalProfileData) {
      return {
        ...externalProfileData,
        full_name: externalProfileData.full_name || null,
        username: externalProfileData.username || null
      };
    }
    
    // Если пользователь авторизован, получаем данные из auth
    if (user) {
      const userFullName = user.full_name || (user as any).fullName || '';
      const userEmail = user.email || '';
      const userName = user.username || userEmail.split('@')[0] || 'Пользователь';
      
      return {
        name: userFullName || userName,
        email: userEmail,
        role: 'Пользователь',
        avatar: null,
        full_name: userFullName || null,
        username: userName
      };
    }
    
    // Дефолтные значения для неавторизованного пользователя
    return {
      name: 'Гость',
      email: 'Войдите в аккаунт',
      role: 'Гость',
      avatar: null,
      full_name: null,
      username: null
    };
  };

  const profileData = getCurrentProfileData();

  // Функция для получения инициалов из полного имени
  const getAvatarInitials = (): string => {
    if (!profileData?.name) return 'ГС';
    
    // Берем инициалы из полного имени
    if (profileData.full_name) {
      const names = profileData.full_name.split(' ');
      return names
        .filter((_name: string, index: number) => index < 2) // Берем только первые 2 слова
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    // Если нет полного имени, берем из name
    const nameParts = profileData.name.split(' ');
    return nameParts
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      onProfileAction('login');
      return;
    }
    setShowProfileMenu(!showProfileMenu);
  };

  const handleMenuProfileAction = async (action: string) => {
    setShowProfileMenu(false);
    
    switch (action) {
      case 'logout':
        try {
          await logout();
          onProfileAction('logout');
        } catch (error) {
          console.error('Logout error:', error);
        }
        break;
      case 'login':
        window.location.href = '/login';
        break;
      default:
        onProfileAction(action);
        break;
    }
  };

  // Обработчик клика на логотип
  const handleLogoClick = () => {
    const currentTime = Date.now();
    
    if (currentTime - lastClickTime > 3000) {
      setClickCount(1);
    } else {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      
      if (newCount === 5 && onConfettiTrigger) {
        onConfettiTrigger();
        
        if (logoRef.current) {
          logoRef.current.style.transform = 'scale(1.2)';
          logoRef.current.style.transition = 'transform 0.3s ease';
          
          setTimeout(() => {
            if (logoRef.current) {
              logoRef.current.style.transform = 'scale(1)';
            }
          }, 300);
        }
        
        setTimeout(() => {
          setClickCount(0);
        }, 2000);
      }
    }
    
    setLastClickTime(currentTime);
  };

  const logoClass = clickCount > 0 ? `${styles.logo} ${styles.logoPulse}` : styles.logo;

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div 
          ref={logoRef}
          className={logoClass} 
          onClick={handleLogoClick}
          title={clickCount > 0 ? `Clicked ${clickCount} times` : "Click me!"}
          style={{ cursor: 'pointer' }}
        >
          <Target className={styles.logoIcon} size={28} />
          <h1>Protonoro</h1>
        </div>
        <div className={styles.dateDisplay}>
          <Calendar size={18} />
          <span>{currentDate}</span>
        </div>
      </div>
      
      <div className={styles.headerRight}>
        <div className={styles.searchBar}>
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <button 
          className={styles.themeToggle}
          onClick={onThemeToggle}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <button className={styles.btnPrimary} onClick={onNewTask}>
          <Plus size={18} />
          New Task
        </button>
        
        <div className={styles.profileContainer} ref={profileMenuRef}>
          <button 
            className={styles.userAvatar}
            onClick={handleProfileClick}
            aria-label="Profile menu"
            style={profileData?.avatar ? {
              backgroundImage: `url(${profileData.avatar})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: 'transparent'
            } : {}}
          >
            {!profileData?.avatar && <span>{getAvatarInitials()}</span>}
          </button>
          
          {showProfileMenu && (
            <div className={styles.profileMenu}>
              <div className={styles.profileInfo}>
                <div 
                  className={styles.profileAvatarLarge}
                  style={profileData?.avatar ? {
                    backgroundImage: `url(${profileData.avatar})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: 'transparent'
                  } : {}}
                >
                  {!profileData?.avatar && <span>{getAvatarInitials()}</span>}
                </div>
                <div className={styles.profileDetails}>
                  <h3>{profileData.name}</h3>
                  {/* Отображаем username если он отличается от полного имени */}
                  {profileData.username && profileData.username !== profileData.name && (
                    <p className={styles.profileUsername}>@{profileData.username}</p>
                  )}
                  <p className={styles.profileEmail}>{profileData.email}</p>
                  <p className={styles.profileRole}>{profileData.role}</p>
                  
                  {/* Статус пользователя */}
                  {user?.isDemo && (
                    <p className={styles.demoBadge}>Демо-режим</p>
                  )}
                  {!isAuthenticated && (
                    <p className={styles.guestBadge}>Гость (войдите в аккаунт)</p>
                  )}
                </div>
              </div>
              
              <div className={styles.menuDivider} />
              
              {/* Меню для авторизованных пользователей */}
              {isAuthenticated ? (
                <>
                  <button 
                    className={styles.menuItem}
                    onClick={() => handleMenuProfileAction('profile')}
                  >
                    <User size={16} />
                    <span>Мой профиль</span>
                  </button>
                  
                  <button 
                    className={styles.menuItem}
                    onClick={() => handleMenuProfileAction('settings')}
                  >
                    <Settings size={16} />
                    <span>Настройки</span>
                  </button>
                  
                  <button 
                    className={styles.menuItem}
                    onClick={() => handleMenuProfileAction('help')}
                  >
                    <HelpCircle size={16} />
                    <span>Помощь</span>
                  </button>
                  
                  <div className={styles.menuDivider} />
                  
                  <button 
                    className={`${styles.menuItem} ${styles.menuItemLogout}`}
                    onClick={() => handleMenuProfileAction('logout')}
                  >
                    <LogOut size={16} />
                    <span>Выйти</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className={styles.menuItem}
                    onClick={() => handleMenuProfileAction('login')}
                  >
                    <User size={16} />
                    <span>Войти</span>
                  </button>
                  
                  <button 
                    className={styles.menuItem}
                    onClick={() => handleMenuProfileAction('register')}
                  >
                    <User size={16} />
                    <span>Регистрация</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;