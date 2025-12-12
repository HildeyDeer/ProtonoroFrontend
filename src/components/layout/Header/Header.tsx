import { Calendar, Target, Search, Plus, Moon, Sun, User, Settings, LogOut, HelpCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
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
  };
}

const Header = ({ 
  darkMode, 
  onThemeToggle, 
  searchQuery, 
  onSearchChange,
  onNewTask,
  profileData,
  onProfileAction,
  onConfettiTrigger
}: HeaderProps) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [currentDate, setCurrentDate] = useState('');
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  // Обновляем текущую дату при загрузке
  useEffect(() => {
    updateFullDate();
    // Обновляем дату каждый день
    const interval = setInterval(updateCurrentDate, 3600000); // Каждый час
    return () => clearInterval(interval);
  }, []);

  // Вариант 1: Просто месяц и год
  const updateCurrentDate = () => {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    setCurrentDate(`${month} ${year}`);
  };

  // Вариант 2: Полная дата с днем недели
  const updateFullDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      year: 'numeric',
      weekday: 'long',
      day: 'numeric'
    };
    const formattedDate = now.toLocaleDateString('default', options);
    setCurrentDate(formattedDate);
  };

  // Вариант 3: Кастомный формат (например: "Friday, September 27, 2024")
  const updateCustomDate = () => {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    const day = now.getDate();
    const weekday = now.toLocaleString('default', { weekday: 'long' });
    setCurrentDate(`${weekday}, ${month} ${day}, ${year}`);
  };

  // Вариант 4: Для русского языка
  const updateRussianDate = () => {
    const now = new Date();
    const month = now.toLocaleString('ru-RU', { month: 'long' });
    const year = now.getFullYear();
    // Первая буква заглавная
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    setCurrentDate(`${capitalizedMonth} ${year}`);
  };

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

  // Функция для получения инициалов
  const getAvatarInitials = () => {
    if (!profileData?.name) return 'AD';
    return profileData.name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleMenuProfileAction = (action: string) => {
    setShowProfileMenu(false);
    onProfileAction(action);
  };

  // Обработчик клика на логотип для пасхалки
  const handleLogoClick = () => {
    const currentTime = Date.now();
    
    if (currentTime - lastClickTime > 3000) {
      setClickCount(1);
    } else {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      
      if (newCount < 5) {
        console.log(`Logo clicked ${newCount} times`);
      }
      
      if (newCount === 5) {
        console.log("🎊 CONFETTI TIME! 🎊");
        if (onConfettiTrigger) {
          onConfettiTrigger();
        }
        
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
                  <h3>{profileData?.name || 'Alex Doe'}</h3>
                  <p className={styles.profileEmail}>{profileData?.email || 'alex.doe@protonoro.com'}</p>
                  <p className={styles.profileRole}>{profileData?.role || 'Product Manager'}</p>
                </div>
              </div>
              
              <div className={styles.menuDivider} />
              
              <button 
                className={styles.menuItem}
                onClick={() => handleMenuProfileAction('profile')}
              >
                <User size={16} />
                <span>My Profile</span>
              </button>
              
              <button 
                className={styles.menuItem}
                onClick={() => handleMenuProfileAction('settings')}
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
              
              <button 
                className={styles.menuItem}
                onClick={() => handleMenuProfileAction('help')}
              >
                <HelpCircle size={16} />
                <span>Help & Support</span>
              </button>
              
              <div className={styles.menuDivider} />
              
              <button 
                className={`${styles.menuItem} ${styles.menuItemLogout}`}
                onClick={() => handleMenuProfileAction('logout')}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;