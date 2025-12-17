import { Calendar, Target, Search, Plus, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../../api/auth';
import ProfilePopup from '../Modals/ProfilePopup/ProfilePopup';
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
    full_name?: string | null;
    username?: string | null;
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
  const [avatarPosition, setAvatarPosition] = useState({ x: 0, y: 0, width: 0 });

  const { user, isAuthenticated } = useAuth();

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

  // Функция для получения данных профиля
  const getCurrentProfileData = (): ProfileData => {
    if (externalProfileData) {
      return {
        ...externalProfileData,
        full_name: externalProfileData.full_name || null,
        username: externalProfileData.username || null
      };
    }
    
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
    
    if (profileData.full_name) {
      const names = profileData.full_name.split(' ');
      return names
        .filter((_name: string, index: number) => index < 2)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    const nameParts = profileData.name.split(' ');
    return nameParts
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!isAuthenticated) {
      onProfileAction('login');
      return;
    }
    
    // Получаем позицию аватара для правильного позиционирования попапа
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setAvatarPosition({
      x: buttonRect.left,
      y: buttonRect.bottom,
      width: buttonRect.width
    });
    
    setShowProfileMenu(!showProfileMenu);
  };

  const handleMenuProfileAction = (action: string) => {
    setShowProfileMenu(false);
    onProfileAction(action);
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
            placeholder="Поиск задачи..." 
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
          Новая Задача
        </button>
        
        <div className={styles.profileContainer}>
          <button 
            className={styles.userAvatar}
            onClick={handleProfileClick}
            aria-label="Меню профиля"
            style={profileData?.avatar ? {
              backgroundImage: `url(${profileData.avatar})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: 'transparent'
            } : {}}
          >
            {!profileData?.avatar && <span>{getAvatarInitials()}</span>}
          </button>
          
          <ProfilePopup
            isOpen={showProfileMenu}
            onClose={() => setShowProfileMenu(false)}
            onProfileAction={handleMenuProfileAction}
            profileData={profileData}
            position={{
              right: window.innerWidth - avatarPosition.x - avatarPosition.width,
              top: avatarPosition.y + 8
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;