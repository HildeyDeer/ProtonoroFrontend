import { useState, useEffect } from 'react';
import { Save, User, Mail, ArrowLeft, Upload, Trash2, Globe, Phone, MapPin, Calendar, Shield, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './ProfileForm.module.css';
import ProfileSecurityModal from './../../components/layout/Profile/ProfileSecurityModal/ProfileSecurityModal';

interface ProfileData {
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
}

const ProfileForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Получаем данные из location.state или localStorage
  const modalData = location.state?.profileData;
  
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Alex Doe',
    email: 'alex.doe@protonoro.com',
    role: 'Product Manager',
    avatar: null,
    bio: 'Product Manager at Protonoro with 5+ years of experience in digital product development.',
    location: 'San Francisco, CA',
    website: 'https://protonoro.com',
    phone: '+1 (555) 123-4567'
  });

  const [avatarInitials, setAvatarInitials] = useState('AD');
  const [isSaving, setIsSaving] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // Инициализация данных при загрузке
  useEffect(() => {
    // Приоритет: данные из модального окна > localStorage > дефолтные значения
    const savedProfile = localStorage.getItem('userProfile');
    let initialData = profile;

    if (modalData) {
      initialData = { ...initialData, ...modalData };
    } else if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        initialData = { ...initialData, ...parsedProfile };
      } catch (error) {
        console.error('Error parsing saved profile:', error);
      }
    }

    setProfile(initialData);
    
    // Обновляем инициалы для аватара
    const initials = initialData.name.split(' ').map(n => n[0]).join('').toUpperCase();
    setAvatarInitials(initials);
  }, [modalData]);

  // Функция для обновления конкретного поля профиля
  const updateProfileField = (field: keyof ProfileData, value: string | null) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Обработчик загрузки аватара
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB.');
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
          updateProfileField('avatar', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    updateProfileField('avatar', null);
  };

  // Основной обработчик сохранения
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const profileData = {
      ...profile,
      updatedAt: new Date().toISOString(),
      initials: avatarInitials
    };

    // Сохраняем в localStorage
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    
    // Здесь будет API запрос в реальном приложении
    console.log('Profile data saved:', profileData);

    // Показываем уведомление
    setTimeout(() => {
      setIsSaving(false);
      alert('Профиль успешно сохранен!');
      // Возвращаемся на дашборд
      navigate('/dashboard');
    }, 1500);
  };

  // Сброс к значениям по умолчанию
  const handleReset = () => {
    const defaultProfile = {
      name: 'Alex Doe',
      email: 'alex.doe@protonoro.com',
      role: 'Product Manager',
      avatar: null,
      bio: 'Product Manager at Protonoro with 5+ years of experience in digital product development.',
      location: 'San Francisco, CA',
      website: 'https://protonoro.com',
      phone: '+1 (555) 123-4567'
    };
    
    setProfile(defaultProfile);
    const initials = defaultProfile.name.split(' ').map(n => n[0]).join('').toUpperCase();
    setAvatarInitials(initials);
  };

  // Выход из аккаунта
  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти из аккаунта?')) {
      // Очищаем данные авторизации
      localStorage.removeItem('authToken');
      localStorage.removeItem('userProfile');
      // Перенаправляем на страницу входа
      navigate('/login');
    }
  };

  // Открытие модального окна безопасности
  const handleSecurityClick = () => {
    setShowSecurityModal(true);
  };

  // Закрытие модального окна безопасности
  const handleCloseSecurityModal = () => {
    setShowSecurityModal(false);
  };

  return (
    <>
      <div className={styles.profilePage}>
        {/* Шапка страницы */}
        <div className={styles.pageHeader}>
          <Link to="/dashboard" className={styles.backButton}>
            <ArrowLeft size={20} />
            Назад к дашборду
          </Link>
          <div className={styles.headerContent}>
            <h1>Настройки профиля</h1>
            <p className={styles.pageSubtitle}>Управляйте личной информацией и настройками аккаунта</p>
          </div>
        </div>

        <div className={styles.profileContainer}>
          {/* Основная форма профиля */}
          <form onSubmit={handleSubmit} className={styles.profileForm}>
            {/* Секция аватара */}
            <div className={styles.avatarSection}>
              <div className={styles.avatarContainer}>
                {profile.avatar ? (
                  <div className={styles.avatarWithImage}>
                    <img 
                      src={profile.avatar} 
                      alt="Аватар профиля" 
                      className={styles.avatarImage}
                    />
                    <button 
                      type="button"
                      className={styles.removeAvatarBtn}
                      onClick={handleRemoveAvatar}
                      title="Удалить аватар"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    <span className={styles.avatarInitials}>{avatarInitials}</span>
                  </div>
                )}
              </div>
              
              <div className={styles.avatarControls}>
                <label className={styles.avatarUploadBtn}>
                  <Upload size={16} />
                  {profile.avatar ? 'Сменить фото' : 'Загрузить фото'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className={styles.avatarInput}
                  />
                </label>
                <p className={styles.avatarHint}>
                  Рекомендуемый размер: 400×400px. Максимум 5MB.
                </p>
              </div>
            </div>

            {/* Основные поля формы */}
            <div className={styles.formGrid}>
              {/* Блок личной информации */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                  <User size={18} />
                  Личная информация
                </h3>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Полное имя
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => updateProfileField('name', e.target.value)}
                    className={styles.formInput}
                    placeholder="Введите ваше полное имя"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Email адрес
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => updateProfileField('email', e.target.value)}
                    className={styles.formInput}
                    placeholder="Введите ваш email"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Должность
                  </label>
                  <input
                    type="text"
                    value={profile.role}
                    onChange={(e) => updateProfileField('role', e.target.value)}
                    className={styles.formInput}
                    placeholder="Введите вашу должность"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    О себе
                  </label>
                  <textarea
                    value={profile.bio || ''}
                    onChange={(e) => updateProfileField('bio', e.target.value)}
                    className={styles.formTextarea}
                    placeholder="Расскажите немного о себе..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Блок контактной информации */}
              <div className={styles.formSection}>
                <h3 className={styles.sectionTitle}>
                  <Mail size={18} />
                  Контактная информация
                </h3>
                
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <Phone size={16} />
                    Телефон
                  </label>
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => updateProfileField('phone', e.target.value)}
                    className={styles.formInput}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <MapPin size={16} />
                    Местоположение
                  </label>
                  <input
                    type="text"
                    value={profile.location || ''}
                    onChange={(e) => updateProfileField('location', e.target.value)}
                    className={styles.formInput}
                    placeholder="Город, страна"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <Globe size={16} />
                    Веб-сайт
                  </label>
                  <input
                    type="url"
                    value={profile.website || ''}
                    onChange={(e) => updateProfileField('website', e.target.value)}
                    className={styles.formInput}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* Действия формы */}
            <div className={styles.formActions}>
              <button 
                type="button" 
                className={styles.resetButton}
                onClick={handleReset}
              >
                Сбросить настройки
              </button>
              <div className={styles.actionButtons}>
                <Link to="/dashboard" className={styles.cancelButton}>
                  Отмена
                </Link>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isSaving}
                >
                  <Save size={16} />
                  {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </div>
            </div>
          </form>

          {/* Боковая панель с настройками */}
          <div className={styles.sidePanel}>
            {/* Карточка информации профиля */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <Calendar size={18} />
                <h3>Информация о профиле</h3>
              </div>
              <p>Ваши данные были обновлены: {new Date().toLocaleDateString('ru-RU')}</p>
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Зарегистрирован</span>
                  <span className={styles.statValue}>12.01.2024</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Последний вход</span>
                  <span className={styles.statValue}>Сегодня, 14:30</span>
                </div>
              </div>
            </div>
            
            {/* Карточка безопасности */}
            <div className={styles.infoCard}>
              <div className={styles.cardHeader}>
                <Shield size={18} />
                <h3>Безопасность аккаунта</h3>
              </div>
              <p>Обновите пароль и управляйте двухфакторной аутентификацией.</p>
              <button 
                className={styles.sideButton}
                onClick={handleSecurityClick}
              >
                Настройки безопасности
              </button>
            </div>
            
            {/* Выход из аккаунта */}
            <div className={styles.logoutCard}>
              <button 
                className={styles.logoutButton}
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Выйти из аккаунта
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно безопасности */}
      <ProfileSecurityModal
        isOpen={showSecurityModal}
        onClose={handleCloseSecurityModal}
      />
    </>
  );
};

export default ProfileForm;