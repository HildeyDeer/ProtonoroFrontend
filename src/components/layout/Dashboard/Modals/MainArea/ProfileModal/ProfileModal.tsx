import { useState, useRef, useEffect } from 'react';
import { X, User, Mail, Briefcase, Save, ExternalLink, Upload, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Добавляем useNavigate
import styles from './ProfileModal.module.css';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: any) => void;
  // Убираем onOpenProfilePage - теперь используем navigate
  initialData?: {
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
  };
}

const ProfileModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: ProfileModalProps) => {
  const navigate = useNavigate(); // Добавляем навигацию
  const [name, setName] = useState(initialData?.name || 'Alex Doe');
  const [email, setEmail] = useState(initialData?.email || 'alex.doe@protonoro.com');
  const [role, setRole] = useState(initialData?.role || 'Product Manager');
  const [avatar, setAvatar] = useState<string | null>(initialData?.avatar || null);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Синхронизируем состояние с initialData при открытии
  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || 'Alex Doe');
      setEmail(initialData?.email || 'alex.doe@protonoro.com');
      setRole(initialData?.role || 'Product Manager');
      setAvatar(initialData?.avatar || null);
    }
  }, [isOpen, initialData]);

  // Функция для получения инициалов
  const getInitials = () => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Функция для обработки загрузки аватарки
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Полный размер файла не должен превышать 5MB.');
        return;
      }

      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, загрузите изображение.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setIsHoveringAvatar(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      name, 
      email, 
      role,
      avatar
    });
    onClose();
  };

  // Исправленный обработчик открытия страницы профиля
  const handleOpenProfilePage = () => {
    // Подготавливаем данные для передачи
    const profileData = {
      name,
      email,
      role,
      avatar
    };
    
    // Сначала сохраняем изменения
    onSave(profileData);
    
    // Закрываем модальное окно
    onClose();
    
    // Переходим на страницу профиля с передачей данных
    navigate('/profile', { state: { profileData } });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Редактировать профиль</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.avatarSection}>
            <div 
              className={styles.avatarContainer}
              onMouseEnter={() => avatar && setIsHoveringAvatar(true)}
              onMouseLeave={() => setIsHoveringAvatar(false)}
            >
              {avatar ? (
                <div className={`${styles.avatarWithImage} ${isHoveringAvatar ? styles.fisheyeEffect : ''}`}>
                  <img 
                    src={avatar} 
                    alt="Аватар пользователя" 
                    className={styles.avatarImage}
                  />
                  {isHoveringAvatar && (
                    <div className={styles.avatarOverlay}>
                      <button 
                        type="button" 
                        className={styles.removeAvatarIcon}
                        onClick={handleRemoveAvatar}
                        title="Удалить аватарку"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.profileAvatarLarge}>
                  <span>{getInitials()}</span>
                </div>
              )}
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className={styles.avatarInput}
            />
            
            <div className={styles.avatarButtons}>
              <button 
                type="button" 
                className={styles.changeAvatarBtn}
                onClick={handleAvatarClick}
              >
                <Upload size={16} />
                {avatar ? 'Сменить аватар' : 'Загрузить аватар'}
              </button>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name">
                <User size={16} />
                Полное имя
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите ваше имя"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">
                <Mail size={16} />
                Email Адрес
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите ваш email"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="role">
                <Briefcase size={16} />
                Роль
              </label>
              <input
                id="role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Введите вашу роль"
              />
            </div>
          </div>

          {/* Кнопка для открытия полной страницы профиля */}
          <div className={styles.profilePageLink}>
            <button 
              type="button" 
              className={styles.profilePageBtn}
              onClick={handleOpenProfilePage}
            >
              <ExternalLink size={16} />
              Открыть страницу профиля
            </button>
            <p className={styles.profilePageHint}>
              Полное редактирование профиля и настройки аккаунта.
            </p>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Закрыть
            </button>
            <button type="submit" className={styles.submitButton}>
              <Save size={16} />
              Сохранить изменения
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;