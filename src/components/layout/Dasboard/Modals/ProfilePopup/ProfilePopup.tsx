import { User, Settings, LogOut, HelpCircle } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { useAuth } from '../../../../../api/auth';
import styles from './ProfilePopup.module.css';

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileAction: (action: string) => void;
  profileData?: {
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
    full_name?: string | null;
    username?: string | null;
  };
  position?: {
    top?: number | string;
    right?: number | string;
    left?: number | string;
    bottom?: number | string;
  };
}

interface ProfileData {
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  full_name?: string | null;
  username?: string | null;
}

const ProfilePopup = ({ 
  isOpen, 
  onClose, 
  onProfileAction,
  profileData: externalProfileData,
  position = { right: 0, top: 'calc(100% + 0.5rem)' }
}: ProfilePopupProps) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();

  // Закрытие попапа при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

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

  const handleMenuAction = async (action: string) => {
    onClose();
    
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

  if (!isOpen) return null;

  const popupStyle = {
    top: position.top,
    right: position.right,
    left: position.left,
    bottom: position.bottom
  };

  return (
    <div 
      className={styles.profilePopup}
      ref={popupRef}
      style={popupStyle}
    >
      <div className={styles.popupContent}>
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
            {profileData.username && profileData.username !== profileData.name && (
              <p className={styles.profileUsername}>@{profileData.username}</p>
            )}
            <p className={styles.profileEmail}>{profileData.email}</p>
            <p className={styles.profileRole}>{profileData.role}</p>
            
            {user?.isDemo && (
              <p className={styles.demoBadge}>Демо-режим</p>
            )}
            {!isAuthenticated && (
              <p className={styles.guestBadge}>Гость (войдите в аккаунт)</p>
            )}
          </div>
        </div>
        
        <div className={styles.menuDivider} />
        
        {isAuthenticated ? (
          <>
            <button 
              className={styles.menuItem}
              onClick={() => handleMenuAction('profile')}
            >
              <User size={16} />
              <span>Мой профиль</span>
            </button>
            
            <button 
              className={styles.menuItem}
              onClick={() => handleMenuAction('settings')}
            >
              <Settings size={16} />
              <span>Настройки</span>
            </button>
            
            <button 
              className={styles.menuItem}
              onClick={() => handleMenuAction('help')}
            >
              <HelpCircle size={16} />
              <span>Помощь</span>
            </button>
            
            <div className={styles.menuDivider} />
            
            <button 
              className={`${styles.menuItem} ${styles.menuItemLogout}`}
              onClick={() => handleMenuAction('logout')}
            >
              <LogOut size={16} />
              <span>Выйти</span>
            </button>
          </>
        ) : (
          <>
            <button 
              className={styles.menuItem}
              onClick={() => handleMenuAction('login')}
            >
              <User size={16} />
              <span>Войти</span>
            </button>
            
            <button 
              className={styles.menuItem}
              onClick={() => handleMenuAction('register')}
            >
              <User size={16} />
              <span>Регистрация</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePopup;