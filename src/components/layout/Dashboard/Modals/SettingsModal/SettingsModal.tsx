import { useState, useEffect } from 'react';
import { X, Clock, Coffee, Moon, Bell, Save, AlertCircle, Image as ImageIcon } from 'lucide-react';
import styles from './SettingsModal.module.css';

interface TimerSettings {
  pomodoro: number; // в минутах
  shortBreak: number; // в минутах
  longBreak: number; // в минутах
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  longBreakInterval: number; // количество помодоро до длинного перерыва
  notifications: boolean;
  sound: boolean;
  darkMode: boolean;
  backgroundImage: boolean; // Новая настройка - фон-картинка
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: TimerSettings) => void;
  initialSettings?: Partial<TimerSettings>;
}

// Объявляем интерфейс для расширения Window
declare global {
  interface Window {
    chrome?: {
      runtime?: {
        openOptionsPage?: () => void;
      };
    };
  }
}

const SettingsModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialSettings 
}: SettingsModalProps) => {
  // Проверяем поддержку уведомлений браузером
  const [browserSupportsNotifications, setBrowserSupportsNotifications] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showNotificationWarning, setShowNotificationWarning] = useState(false);

  // Настройки по умолчанию (звук и уведомления отключены, фон-картинка отключена)
  const defaultSettings: TimerSettings = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreaks: true,
    autoStartPomodoros: true,
    longBreakInterval: 4,
    notifications: false,
    sound: false,
    darkMode: true,
    backgroundImage: false, // По умолчанию выключено
  };

  const [settings, setSettings] = useState<TimerSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  // Проверяем поддержку уведомлений при монтировании
  useEffect(() => {
    if (!('Notification' in window)) {
      setBrowserSupportsNotifications(false);
      console.warn('Этот браузер не поддерживает уведомления');
    } else {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Синхронизация с начальными настройками
  useEffect(() => {
    if (isOpen) {
      const newSettings = {
        ...defaultSettings,
        ...initialSettings
      };
      setSettings(newSettings);
      setHasChanges(false);
      
      // Проверяем разрешения при открытии модального окна
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    }
  }, [isOpen, initialSettings]);

  // Функция для запроса разрешения на уведомления
  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      setBrowserSupportsNotifications(false);
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      // Если разрешение отклонено, показываем предупреждение
      if (permission === 'denied') {
        setShowNotificationWarning(true);
        // Автоматически отключаем уведомления если разрешение отклонено
        setSettings(prev => ({
          ...prev,
          notifications: false
        }));
      }
      
      return permission;
    } catch (error) {
      console.error('Ошибка при запросе разрешения на уведомления:', error);
      setNotificationPermission('denied');
      return 'denied';
    }
  };

  // Обработчик изменения уведомлений
  const handleNotificationsChange = async (enabled: boolean) => {
    if (enabled) {
      // Если включаем уведомления, запрашиваем разрешение
      if (notificationPermission === 'default') {
        const permission = await requestNotificationPermission();
        
        if (permission === 'granted') {
          setSettings(prev => ({
            ...prev,
            notifications: true
          }));
        } else {
          // Если разрешение не получено, оставляем выключенным
          setSettings(prev => ({
            ...prev,
            notifications: false
          }));
        }
      } else if (notificationPermission === 'granted') {
        // Если разрешение уже есть, включаем уведомления
        setSettings(prev => ({
          ...prev,
          notifications: true
        }));
      } else {
        // Если разрешение отклонено, показываем предупреждение
        setShowNotificationWarning(true);
        setSettings(prev => ({
          ...prev,
          notifications: false
        }));
      }
    } else {
      // Просто выключаем уведомления
      setSettings(prev => ({
        ...prev,
        notifications: false
      }));
    }
    setHasChanges(true);
  };

  // Обработчик изменения других значений
  const handleChange = (key: keyof TimerSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  // Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверяем уведомления перед сохранением
    if (settings.notifications && notificationPermission !== 'granted') {
      if (window.confirm('Для включения уведомлений требуется разрешение. Запросить разрешение сейчас?')) {
        requestNotificationPermission().then(permission => {
          if (permission === 'granted') {
            onSave(settings);
            onClose();
            setHasChanges(false);
          } else {
            alert('Уведомления не могут быть включены без разрешения.');
            // Сохраняем настройки без уведомлений
            onSave({
              ...settings,
              notifications: false
            });
            onClose();
            setHasChanges(false);
          }
        });
        return;
      } else {
        // Пользователь отказался запрашивать разрешение
        onSave({
          ...settings,
          notifications: false
        });
        onClose();
        setHasChanges(false);
        return;
      }
    }
    
    onSave(settings);
    onClose();
    setHasChanges(false);
  };

  // Обработчик отмены
  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('У вас есть несохраненные изменения. Закрыть без сохранения?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Сброс к значениям по умолчанию
  const handleReset = () => {
    if (window.confirm('Сбросить все настройки к значениям по умолчанию?')) {
      setSettings(defaultSettings);
      setHasChanges(true);
    }
  };

  // Функция для открытия настроек браузера
  const openBrowserNotificationSettings = () => {
    // Используем безопасный доступ к window.chrome
    if (window.chrome && window.chrome.runtime && window.chrome.runtime.openOptionsPage) {
      window.chrome.runtime.openOptionsPage();
    } else {
      alert('Пожалуйста, разрешите уведомления в настройках вашего браузера:\n' +
            '1. Откройте настройки браузера\n' +
            '2. Найдите раздел "Конфиденциальность и безопасность"\n' +
            '3. Найдите "Настройки сайтов"\n' +
            '4. Найдите этот сайт в списке и разрешите уведомления');
    }
    setShowNotificationWarning(false);
  };

  // Функции для увеличения/уменьшения значений
  const incrementValue = (key: keyof TimerSettings, step: number = 5) => {
    const currentValue = settings[key] as number;
    const maxValue = getMaxValue(key);
    const newValue = Math.min(currentValue + step, maxValue);
    handleChange(key, newValue);
  };

  const decrementValue = (key: keyof TimerSettings, step: number = 5) => {
    const currentValue = settings[key] as number;
    const minValue = getMinValue(key);
    const newValue = Math.max(currentValue - step, minValue);
    handleChange(key, newValue);
  };

  // Получение минимальных и максимальных значений для каждого поля
  const getMinValue = (key: keyof TimerSettings): number => {
    const minValues: Record<keyof TimerSettings, number> = {
      pomodoro: 5,
      shortBreak: 1,
      longBreak: 10,
      longBreakInterval: 2,
      autoStartBreaks: 0,
      autoStartPomodoros: 0,
      notifications: 0,
      sound: 0,
      darkMode: 0,
      backgroundImage: 0,
    };
    return minValues[key] || 0;
  };

  const getMaxValue = (key: keyof TimerSettings): number => {
    const maxValues: Record<keyof TimerSettings, number> = {
      pomodoro: 60,
      shortBreak: 15,
      longBreak: 30,
      longBreakInterval: 8,
      autoStartBreaks: 1,
      autoStartPomodoros: 1,
      notifications: 1,
      sound: 1,
      darkMode: 1,
      backgroundImage: 1,
    };
    return maxValues[key] || 100;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Настройки таймера</h2>
          <button className={styles.closeButton} onClick={handleCancel}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Секция настроек таймера */}
          <div className={styles.settingsSection}>
            <h3 className={styles.sectionTitle}>
              <Clock size={18} />
              Настройки времени
            </h3>
            
            <div className={styles.timeSettingsGrid}>
              <div className={styles.timeSetting}>
                <label htmlFor="pomodoro">
                  <span className={styles.timeLabel}>Помодоро</span>
                  <span className={styles.timeDescription}>Рабочий интервал</span>
                </label>
                <div className={styles.timeInputContainer}>
                  <input
                    id="pomodoro"
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={settings.pomodoro}
                    onChange={(e) => handleChange('pomodoro', parseInt(e.target.value))}
                    className={styles.timeSlider}
                  />
                  <div className={styles.timeValue}>
                    <div className={styles.timeNumberInputContainer}>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        step="5"
                        value={settings.pomodoro}
                        onChange={(e) => handleChange('pomodoro', parseInt(e.target.value))}
                        className={styles.timeNumberInput}
                      />
                      <div className={styles.timeNumberButtons}>
                        <button
                          type="button"
                          className={styles.timeNumberButton}
                          onClick={() => incrementValue('pomodoro', 5)}
                          disabled={settings.pomodoro >= 60}
                          title="Увеличить на 5 минут"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className={styles.timeNumberButton}
                          onClick={() => decrementValue('pomodoro', 5)}
                          disabled={settings.pomodoro <= 5}
                          title="Уменьшить на 5 минут"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                    <span>минут</span>
                  </div>
                </div>
              </div>

              <div className={styles.timeSetting}>
                <label htmlFor="shortBreak">
                  <span className={styles.timeLabel}>Короткий перерыв</span>
                  <span className={styles.timeDescription}>Между помодоро</span>
                </label>
                <div className={styles.timeInputContainer}>
                  <input
                    id="shortBreak"
                    type="range"
                    min="1"
                    max="15"
                    step="1"
                    value={settings.shortBreak}
                    onChange={(e) => handleChange('shortBreak', parseInt(e.target.value))}
                    className={styles.timeSlider}
                  />
                  <div className={styles.timeValue}>
                    <div className={styles.timeNumberInputContainer}>
                      <input
                        type="number"
                        min="1"
                        max="15"
                        step="1"
                        value={settings.shortBreak}
                        onChange={(e) => handleChange('shortBreak', parseInt(e.target.value))}
                        className={styles.timeNumberInput}
                      />
                      <div className={styles.timeNumberButtons}>
                        <button
                          type="button"
                          className={styles.timeNumberButton}
                          onClick={() => incrementValue('shortBreak', 1)}
                          disabled={settings.shortBreak >= 15}
                          title="Увеличить на 1 минуту"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className={styles.timeNumberButton}
                          onClick={() => decrementValue('shortBreak', 1)}
                          disabled={settings.shortBreak <= 1}
                          title="Уменьшить на 1 минуту"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                    <span>минут</span>
                  </div>
                </div>
              </div>

              <div className={styles.timeSetting}>
                <label htmlFor="longBreak">
                  <span className={styles.timeLabel}>Длинный перерыв</span>
                  <span className={styles.timeDescription}>После 4 помодоро</span>
                </label>
                <div className={styles.timeInputContainer}>
                  <input
                    id="longBreak"
                    type="range"
                    min="10"
                    max="30"
                    step="5"
                    value={settings.longBreak}
                    onChange={(e) => handleChange('longBreak', parseInt(e.target.value))}
                    className={styles.timeSlider}
                  />
                  <div className={styles.timeValue}>
                    <div className={styles.timeNumberInputContainer}>
                      <input
                        type="number"
                        min="10"
                        max="30"
                        step="5"
                        value={settings.longBreak}
                        onChange={(e) => handleChange('longBreak', parseInt(e.target.value))}
                        className={styles.timeNumberInput}
                      />
                      <div className={styles.timeNumberButtons}>
                        <button
                          type="button"
                          className={styles.timeNumberButton}
                          onClick={() => incrementValue('longBreak', 5)}
                          disabled={settings.longBreak >= 30}
                          title="Увеличить на 5 минут"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className={styles.timeNumberButton}
                          onClick={() => decrementValue('longBreak', 5)}
                          disabled={settings.longBreak <= 10}
                          title="Уменьшить на 5 минут"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                    <span>минут</span>
                  </div>
                </div>
              </div>

              <div className={styles.timeSetting}>
                <label htmlFor="longBreakInterval">
                  <span className={styles.timeLabel}>Интервал длинных перерывов</span>
                  <span className={styles.timeDescription}>Количество помодоро до длинного перерыва</span>
                </label>
                <div className={styles.intervalInput}>
                  <input
                    id="longBreakInterval"
                    type="range"
                    min="2"
                    max="8"
                    step="1"
                    value={settings.longBreakInterval}
                    onChange={(e) => handleChange('longBreakInterval', parseInt(e.target.value))}
                    className={styles.intervalSlider}
                  />
                  <div className={styles.intervalValue}>
                    <div className={styles.timeNumberInputContainer}>
                      <input
                        type="number"
                        min="2"
                        max="8"
                        step="1"
                        value={settings.longBreakInterval}
                        onChange={(e) => handleChange('longBreakInterval', parseInt(e.target.value))}
                        className={styles.timeNumberInput}
                      />
                      <div className={styles.timeNumberButtons}>
                        <button
                          type="button"
                          className={styles.timeNumberButton}
                          onClick={() => incrementValue('longBreakInterval', 1)}
                          disabled={settings.longBreakInterval >= 8}
                          title="Увеличить на 1"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className={styles.timeNumberButton}
                          onClick={() => decrementValue('longBreakInterval', 1)}
                          disabled={settings.longBreakInterval <= 2}
                          title="Уменьшить на 1"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                    <span>помодоро</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Секция автоматизации */}
          <div className={styles.settingsSection}>
            <h3 className={styles.sectionTitle}>
              <Coffee size={18} />
              Автоматизация
            </h3>
            
            <div className={styles.switchSettings}>
              <div className={styles.switchSetting}>
                <div className={styles.switchLabel}>
                  <span>Автозапуск перерывов</span>
                  <span className={styles.switchDescription}>
                    Автоматически начинать перерыв после завершения помодоро
                  </span>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={settings.autoStartBreaks}
                    onChange={(e) => handleChange('autoStartBreaks', e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              <div className={styles.switchSetting}>
                <div className={styles.switchLabel}>
                  <span>Автозапуск помодоро</span>
                  <span className={styles.switchDescription}>
                    Автоматически начинать следующий помодоро после перерыва
                  </span>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={settings.autoStartPomodoros}
                    onChange={(e) => handleChange('autoStartPomodoros', e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
          </div>

          {/* Секция уведомлений */}
          <div className={styles.settingsSection}>
            <h3 className={styles.sectionTitle}>
              <Bell size={18} />
              Уведомления и звуки
            </h3>
            
            {showNotificationWarning && (
              <div className={styles.notificationWarning}>
                <AlertCircle size={18} />
                <div className={styles.notificationWarningContent}>
                  <span className={styles.notificationWarningText}>
                    Уведомления отключены в настройках браузера. 
                    <button 
                      type="button" 
                      onClick={openBrowserNotificationSettings}
                      className={styles.notificationSettingsLink}
                    >
                      Включить уведомления
                    </button>
                  </span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowNotificationWarning(false)}
                  className={styles.warningClose}
                >
                  &times;
                </button>
              </div>
            )}
            
            {!browserSupportsNotifications && (
              <div className={styles.notificationWarning}>
                <AlertCircle size={18} />
                <span>Ваш браузер не поддерживает уведомления</span>
              </div>
            )}
            
            <div className={styles.switchSettings}>
              <div className={styles.switchSetting}>
                <div className={styles.switchLabel}>
                  <span>Уведомления</span>
                  <span className={styles.switchDescription}>
                    Показывать уведомления о завершении таймера
                    {notificationPermission === 'granted' && (
                      <span className={`${styles.permissionStatus} ${styles.granted}`}>
                        ✓ Разрешено
                      </span>
                    )}
                    {notificationPermission === 'denied' && (
                      <span className={`${styles.permissionStatus} ${styles.denied}`}>
                        ✗ Заблокировано
                      </span>
                    )}
                    {notificationPermission === 'default' && (
                      <span className={`${styles.permissionStatus} ${styles.default}`}>
                        ⚠ Не запрошено
                      </span>
                    )}
                  </span>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => handleNotificationsChange(e.target.checked)}
                    disabled={!browserSupportsNotifications || notificationPermission === 'denied'}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>

              <div className={styles.switchSetting}>
                <div className={styles.switchLabel}>
                  <span>Звуковые оповещения</span>
                  <span className={styles.switchDescription}>
                    Воспроизводить звук при завершении таймера
                  </span>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={settings.sound}
                    onChange={(e) => handleChange('sound', e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
            
            {settings.notifications && notificationPermission !== 'granted' && (
              <div className={styles.notificationPrompt}>
                <div className={styles.notificationPromptHeader}>
                  <div className={styles.notificationPromptIcon}>
                    <Bell size={20} />
                  </div>
                  <h4 className={styles.notificationPromptTitle}>Разрешить уведомления</h4>
                </div>
                
                <div className={styles.notificationPromptBody}>
                  <p className={styles.notificationPromptText}>
                    Разрешите показ уведомлений, чтобы получать оповещения о завершении таймера, даже если вкладка неактивна.
                  </p>
                  
                  <ul className={styles.notificationPromptFeatures}>
                    <li>Уведомления о завершении помодоро</li>
                    <li>Оповещения о перерывах</li>
                    <li>Работает в фоновом режиме</li>
                  </ul>
                </div>
                
                <div className={styles.notificationPromptActions}>
                  <button 
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, notifications: false }))}
                    className={`${styles.permissionButton} ${styles.secondary}`}
                  >
                    Пропустить
                  </button>
                  <button 
                    type="button"
                    onClick={requestNotificationPermission}
                    className={styles.permissionButton}
                  >
                    <Bell size={16} />
                    Разрешить уведомления
                  </button>
                </div>
                
                <p className={styles.permissionHint}>
                  Разрешение можно изменить в настройках браузера в любой момент
                </p>
              </div>
            )}
          </div>

          {/* Секция внешнего вида */}
          <div className={styles.settingsSection}>
            <h3 className={styles.sectionTitle}>
              <Moon size={18} />
              Внешний вид
            </h3>
            
            <div className={styles.switchSettings}>
              <div className={styles.switchSetting}>
                <div className={styles.switchLabel}>
                  <span>Темная тема</span>
                  <span className={styles.switchDescription}>
                    Использовать темную цветовую схему
                  </span>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={(e) => handleChange('darkMode', e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
          </div>
          {/* Секция фонового изображения */}
              <div className={styles.switchSetting}>
                <div className={styles.switchLabel}>
                  <span>Фон-картинка</span>
                  <span className={styles.switchDescription}>
                    Использовать картинку из папки Extra/Icons вместо градиентного фона
                  </span>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={settings.backgroundImage}
                    onChange={(e) => handleChange('backgroundImage', e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>


            {/* Подсказка для фона-картинки */}
            {settings.backgroundImage && (
              <div className={styles.backgroundHint}>
                <ImageIcon size={16} />
                <span>
                  Используется картинка из: <code>src/Extra/Icons/</code>
                </span>
              </div>
            )}
          

          {/* Кнопки действий */}
          <div className={styles.modalFooter}>
            <button 
              type="button" 
              className={styles.resetButton}
              onClick={handleReset}
            >
              Сбросить настройки
            </button>
            
            <div className={styles.actionButtons}>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={handleCancel}
              >
                Отмена
              </button>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={!hasChanges}
              >
                <Save size={16} />
                Сохранить изменения
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    
  );
};

export default SettingsModal;