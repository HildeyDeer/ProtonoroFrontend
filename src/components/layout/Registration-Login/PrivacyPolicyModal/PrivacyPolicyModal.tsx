import React from 'react';
import { X, Shield, Lock, Eye, Mail, Check } from 'lucide-react';
import styles from './PrivacyPolicyModal.module.css';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} color="var(--primary-color)" />
            <h2>Политика конфиденциальности</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.modalContent}>
          <div className={styles.privacyContent}>
            <div className={styles.privacySection}>
              <h4><Lock size={16} /> Защита ваших данных</h4>
              <p>
                Мы серьезно относимся к защите ваших персональных данных. 
                Вся информация шифруется и хранится на защищенных серверах.
              </p>
            </div>
            
            <h3>1. Какие данные мы собираем</h3>
            <p>
              При регистрации и использовании Protonoro мы собираем:
            </p>
            <ul>
              <li>Имя и контактную информацию</li>
              <li>Данные для входа (email и пароль в зашифрованном виде)</li>
              <li>Статистику использования таймера</li>
              <li>Настройки и предпочтения</li>
              <li>Технические данные (браузер, устройство)</li>
            </ul>
            
            <h3>2. Как мы используем ваши данные</h3>
            <div className={styles.privacySection}>
              <h4><Eye size={16} /> Прозрачность использования</h4>
              <p>
                Ваши данные используются исключительно для:
              </p>
              <ul>
                <li>Предоставления услуг таймера Помодоро</li>
                <li>Персонализации вашего опыта</li>
                <li>Улучшения работы сервиса</li>
                <li>Отправки важных уведомлений</li>
              </ul>
            </div>
            
            <h3>3. Защита данных</h3>
            <p>
              Мы используем современные методы шифрования (SSL/TLS) для защиты 
              передачи данных. Пароли хранятся в виде хэшей и недоступны даже нам.
            </p>
            
            <h3>4. Cookies и аналогичные технологии</h3>
            <p>
              Мы используем cookies для:
            </p>
            <ul>
              <li>Аутентификации пользователей</li>
              <li>Сохранения настроек сессии</li>
              <li>Анализа использования сервиса (в анонимной форме)</li>
            </ul>
            
            <h3>5. Ваши права</h3>
            <p>Вы имеете право:</p>
            <ul>
              <li>Запросить доступ к вашим данным</li>
              <li>Исправить неточные данные</li>
              <li>Удалить вашу учетную запись</li>
              <li>Отозвать согласие на обработку</li>
            </ul>
            
            <div className={styles.privacySection}>
              <h4><Mail size={16} /> Контакты</h4>
              <p>
                По вопросам конфиденциальности обращайтесь:
                <br />
                <strong>Email:</strong> privacy@protonoro.com
                <br />
                <strong>Время ответа:</strong> 1-3 рабочих дня
              </p>
            </div>
            
            <h3>6. Изменения в политике</h3>
            <p>
              Мы уведомим вас о существенных изменениях в этой политике 
              через уведомления в сервисе или по email.
            </p>
            
            <p className={styles.updateDate}>
              <Check size={12} /> Обновлено: {new Date().toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          
          <div className={styles.modalFooter}>
            <button 
              type="button" 
              className={styles.acceptButton}
              onClick={onClose}
            >
              Понятно
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;