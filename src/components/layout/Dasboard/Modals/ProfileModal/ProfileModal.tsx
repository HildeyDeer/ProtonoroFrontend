import { useState, useRef, useEffect } from 'react';
import { X, User, Mail, Briefcase, Save, ExternalLink, Upload, Trash2 } from 'lucide-react';
import styles from './ProfileModal.module.css';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profileData: any) => void;
  onOpenProfilePage: () => void;
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
  onOpenProfilePage, 
  initialData 
}: ProfileModalProps) => {
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
        alert('File size should be less than 5MB');
        return;
      }

      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
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

  const handleOpenProfilePage = () => {
    onOpenProfilePage();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Edit Profile</h2>
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
                    alt="Profile avatar" 
                    className={styles.avatarImage}
                  />
                  {isHoveringAvatar && (
                    <div className={styles.avatarOverlay}>
                      <button 
                        type="button" 
                        className={styles.removeAvatarIcon}
                        onClick={handleRemoveAvatar}
                        title="Remove avatar"
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
                {avatar ? 'Change Avatar' : 'Upload Avatar'}
              </button>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name">
                <User size={16} />
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">
                <Mail size={16} />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="role">
                <Briefcase size={16} />
                Role
              </label>
              <input
                id="role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Enter your role"
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
              Open Full Profile Page
            </button>
            <p className={styles.profilePageHint}>
              Access advanced settings and profile customization
            </p>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;