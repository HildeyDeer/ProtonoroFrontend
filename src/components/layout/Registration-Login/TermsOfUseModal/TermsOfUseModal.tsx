import React from 'react';
import { X, FileText, AlertCircle, CheckCircle, Users, Clock, Shield } from 'lucide-react';
import styles from './TermsOfUseModal.module.css';

interface TermsOfUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsOfUseModal: React.FC<TermsOfUseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="var(--success-color)" />
            <h2>Условия использования</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.modalContent}>
          <div className={styles.termsContent}>
            <div className={styles.termsSection}>
              <h4><CheckCircle size={16} /> Принятие условий</h4>
              <p>
                Используя Protonoro, вы подтверждаете, что прочитали, поняли 
                и соглашаетесь с этими условиями.
              </p>
            </div>
            
            <h3>1. Описание сервиса</h3>
            <p>
              Protonoro — это сервис для управления временем по методике Помодоро, 
              предоставляющий инструменты для повышения продуктивности.
            </p>
            
            <h3>2. Требования к пользователям</h3>
            <ul>
              <li>Возраст от 16 лет</li>
              <li>Действительный email адрес</li>
              <li>Согласие с настоящими условиями</li>
              <li>Ответственность за сохранность учетных данных</li>
            </ul>
            
            <h3>3. Правила использования</h3>
            <div className={styles.termsSection}>
              <h4><Users size={16} /> Ответственное использование</h4>
              <p>Разрешается:</p>
              <ul>
                <li>Использовать сервис для личного повышения продуктивности</li>
                <li>Создавать несколько таймеров для разных задач</li>
                <li>Экспортировать свои данные для анализа</li>
              </ul>
            </div>
            
            <div className={styles.termsWarning}>
              <AlertCircle size={16} />
              <p>
                Запрещено нарушать работу сервиса, пытаться получить 
                несанкционированный доступ или использовать сервис для 
                незаконной деятельности.
              </p>
            </div>
            
            <h3>4. Интеллектуальная собственность</h3>
            <p>
              Все права на сервис, логотипы, дизайн и контент принадлежат 
              Protonoro. Вы не можете копировать или распространять 
              материалы без нашего разрешения.
            </p>
            
            <h3>5. Ответственность</h3>
            <p>
              Сервис предоставляется "как есть". Мы не гарантируем 
              бесперебойную работу, но стремимся минимизировать сбои.
            </p>
            
            <h3>6. Прекращение доступа</h3>
            <p>
              Мы можем приостановить или прекратить доступ к сервису в случае 
              нарушения условий использования.
            </p>
            
            <h3>7. Изменения условий</h3>
            <p>
              Мы оставляем право изменять эти условия. О существенных изменениях 
              вы будете уведомлены за 30 дней.
            </p>
            
            <div className={styles.termsSection}>
              <h4><Shield size={16} /> Юридическая информация</h4>
              <p>
                <strong>Контакты для претензий:</strong> legal@protonoro.com
                <br />
                <strong>Юрисдикция:</strong> Законы Российской Федерации
              </p>
            </div>
            
            <p className={styles.updateDate}>
              <Clock size={12} /> Вступили в силу: {new Date().toLocaleDateString('ru-RU', {
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
              Принять условия
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUseModal;