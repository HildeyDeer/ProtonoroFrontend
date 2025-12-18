import React, { useState } from 'react';
import { X, Shield, Lock, Key, Smartphone, Eye, EyeOff, Check } from 'lucide-react';
import styles from './ProfileSecurityModal.module.css';

interface ProfileSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileSecurityModal: React.FC<ProfileSecurityModalProps> = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: 'Chrome на Windows', location: 'Москва, Россия', lastActive: 'Сегодня, 14:30', current: true },
    { id: 2, device: 'Safari на iPhone', location: 'Санкт-Петербург, Россия', lastActive: 'Вчера, 18:45', current: false },
    { id: 3, device: 'Firefox на Mac', location: 'Нью-Йорк, США', lastActive: '3 дня назад', current: false },
  ]);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  if (!isOpen) return null;

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError('Пароль должен содержать минимум 8 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Новые пароли не совпадают');
      return;
    }

    setIsChangingPassword(true);
    
    // Имитация запроса на смену пароля
    setTimeout(() => {
      setIsChangingPassword(false);
      alert('Пароль успешно изменен!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1500);
  };

  const handleTerminateSession = (sessionId: number) => {
    if (sessionId === 1) {
      alert('Нельзя завершить текущую сессию');
      return;
    }
    
    setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  const handleTerminateAllSessions = () => {
    setActiveSessions(prev => prev.filter(session => session.current));
    alert('Все сессии, кроме текущей, завершены');
  };

  const handleTwoFactorToggle = () => {
    setTwoFactorAuth(!twoFactorAuth);
    if (!twoFactorAuth) {
      alert('Двухфакторная аутентификация включена. Следуйте инструкциям для настройки.');
    } else {
      alert('Двухфакторная аутентификация отключена.');
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} color="var(--primary-color)" />
            <h2>Безопасность аккаунта</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.modalContent}>
          {/* Смена пароля */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Lock size={18} />
              <h3>Смена пароля</h3>
            </div>
            
            <form onSubmit={handlePasswordChange} className={styles.passwordForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <Key size={14} />
                  Текущий пароль
                </label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={styles.formInput}
                    placeholder="Введите текущий пароль"
                    required
                  />
                  <button
                    type="button"
                    className={styles.showPasswordButton}
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <Key size={14} />
                  Новый пароль
                </label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={styles.formInput}
                    placeholder="Введите новый пароль"
                    required
                  />
                  <button
                    type="button"
                    className={styles.showPasswordButton}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <Key size={14} />
                  Подтвердите новый пароль
                </label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.formInput}
                    placeholder="Повторите новый пароль"
                    required
                  />
                  <button
                    type="button"
                    className={styles.showPasswordButton}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className={styles.errorMessage}>
                  {passwordError}
                </div>
              )}

              <button 
                type="submit" 
                className={styles.saveButton}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Изменение...' : 'Сменить пароль'}
              </button>
            </form>
          </div>

          {/* Двухфакторная аутентификация */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Smartphone size={18} />
              <h3>Двухфакторная аутентификация</h3>
            </div>
            
            <div className={styles.twoFactorSection}>
              <div className={styles.toggleRow}>
                <div>
                  <p className={styles.settingLabel}>Включить 2FA</p>
                  <p className={styles.settingDescription}>
                    Добавьте дополнительный уровень безопасности к вашему аккаунту
                  </p>
                </div>
                <label className={styles.switch}> {/* Изменено с .toggleSwitch на .switch */}
                  <input
                    type="checkbox"
                    checked={twoFactorAuth}
                    onChange={handleTwoFactorToggle}
                  />
                  <span className={styles.slider}></span> {/* Изменено с .toggleSlider на .slider */}
                </label>
              </div>
              
              {twoFactorAuth && (
                <div className={styles.twoFactorInfo}>
                  <Check size={16} color="var(--success-color)" />
                  <span>Двухфакторная аутентификация активна</span>
                </div>
              )}
            </div>
          </div>

          {/* Активные сессии */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Shield size={18} />
              <h3>Активные сессии</h3>
            </div>
            
            <div className={styles.sessionsList}>
              {activeSessions.map((session) => (
                <div key={session.id} className={styles.sessionItem}>
                  <div className={styles.sessionInfo}>
                    <div className={styles.sessionDevice}>
                      {session.device}
                      {session.current && (
                        <span className={styles.currentSession}>Текущая</span>
                      )}
                    </div>
                    <div className={styles.sessionDetails}>
                      <span>{session.location}</span>
                      <span>•</span>
                      <span>{session.lastActive}</span>
                    </div>
                  </div>
                  {!session.current && (
                    <button
                      className={styles.terminateButton}
                      onClick={() => handleTerminateSession(session.id)}
                    >
                      Завершить
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {activeSessions.length > 1 && (
              <button
                className={styles.terminateAllButton}
                onClick={handleTerminateAllSessions}
              >
                Завершить все другие сессии
              </button>
            )}
          </div>

          {/* Кнопка закрытия */}
          <div className={styles.modalFooter}>
            <button 
              type="button" 
              className={styles.closeModalButton}
              onClick={onClose}
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSecurityModal;