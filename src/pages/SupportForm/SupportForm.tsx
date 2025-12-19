import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, HelpCircle, MessageCircle, FileText, 
  Send, Search, Check, Clock, Mail, Phone, 
  Globe, ChevronDown, ChevronUp, User, Hash,
  ChevronRight, ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../api/auth';
import styles from './SupportForm.module.css';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  read?: boolean;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  isExpanded: boolean;
}

interface SupportTicket {
  id: number;
  title: string;
  category: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const HelpForm = () => {
  const { user, isAuthenticated } = useAuth();
  
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(0);
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Здравствуйте! Чем могу помочь?',
      sender: 'support',
      timestamp: new Date(Date.now() - 3600000),
      read: true
    },
    {
      id: 2,
      text: 'Привет! У меня вопрос по настройке таймера Помодоро',
      sender: 'user',
      timestamp: new Date(Date.now() - 1800000),
      read: true
    },
    {
      id: 3,
      text: 'Конечно! Что именно вас интересует?',
      sender: 'support',
      timestamp: new Date(Date.now() - 1200000),
      read: true
    },
    {
      id: 4,
      text: 'Как изменить длительность рабочих интервалов?',
      sender: 'user',
      timestamp: new Date(Date.now() - 600000),
      read: true
    },
    {
      id: 5,
      text: 'Вы можете изменить настройки времени в меню настроек таймера. Откройте настройки, перейдите в раздел "Настройки времени" и отрегулируйте ползунки или введите значения вручную.',
      sender: 'support',
      timestamp: new Date(),
      read: true
    }
  ]);
  const [faqSearch, setFaqSearch] = useState('');
  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    {
      id: 1,
      question: 'Как начать использовать таймер Помодоро?',
      answer: '1. Зарегистрируйтесь или войдите в аккаунт\n2. Перейдите в раздел "Задачи" и создайте первую задачу\n3. Запустите таймер из панели управления\n4. Следуйте технике: 25 минут работы, 5 минут перерыва',
      category: 'Начало работы',
      isExpanded: false
    },
    {
      id: 2,
      question: 'Как изменить настройки времени таймера?',
      answer: '1. Нажмите на иконку настроек (шестеренка) в правом верхнем углу\n2. В открывшемся окне перейдите в раздел "Настройки времени"\n3. Используйте ползунки или введите значения вручную\n4. Сохраните изменения',
      category: 'Настройки',
      isExpanded: false
    },
    {
      id: 3,
      question: 'Как добавить новую задачу?',
      answer: '1. Нажмите кнопку "Новая задача" в правом верхнем углу\n2. Заполните название и описание задачи\n3. Выберите категорию и приоритет\n4. Установите срок выполнения (опционально)\n5. Сохраните задачу',
      category: 'Задачи',
      isExpanded: false
    },
    {
      id: 4,
      question: 'Как работает статистика продуктивности?',
      answer: 'Статистика собирает данные о:\n- Количестве выполненных помодоро\n- Времени работы над задачами\n- Процент выполнения задач\n- График продуктивности по дням\n\nДанные обновляются автоматически после каждого завершенного таймера.',
      category: 'Статистика',
      isExpanded: false
    },
    {
      id: 5,
      question: 'Как настроить уведомления?',
      answer: '1. Перейдите в настройки таймера\n2. Откройте раздел "Уведомления и звуки"\n3. Включите/отключите уведомления о завершении таймера\n4. Настройте звуковые оповещения\n5. Дайте разрешение на уведомления в браузере при первом включении',
      category: 'Уведомления',
      isExpanded: false
    },
    {
      id: 6,
      question: 'Что делать, если таймер не запускается?',
      answer: 'Попробуйте следующие шаги:\n1. Обновите страницу (F5)\n2. Проверьте подключение к интернету\n3. Очистите кэш браузера\n4. Попробуйте другой браузер\n5. Если проблема persists, свяжитесь с поддержкой',
      category: 'Проблемы',
      isExpanded: false
    },
    {
      id: 7,
      question: 'Как экспортировать статистику?',
      answer: '1. Перейдите в раздел "Статистика"\n2. Нажмите кнопку "Экспорт" в правом верхнем углу\n3. Выберите формат экспорта (CSV, PDF, Excel)\n4. Укажите период данных\n5. Скачайте файл',
      category: 'Статистика',
      isExpanded: false
    },
    {
      id: 8,
      question: 'Можно ли использовать приложение на мобильном?',
      answer: 'Да! Protonoro полностью адаптирован для мобильных устройств:\n- Автоматическая адаптация под размер экрана\n- Сенсорные жесты для управления\n- Push-уведомления на мобильных браузерах\n- Оптимизированная скорость работы',
      category: 'Мобильная версия',
      isExpanded: false
    }
  ]);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: '',
    attachFiles: false
  });
  const [isSending, setIsSending] = useState(false);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    {
      id: 1,
      title: 'Проблема с уведомлениями',
      category: 'notifications',
      status: 'resolved',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-16')
    },
    {
      id: 2,
      title: 'Вопрос по API интеграции',
      category: 'technical',
      status: 'in-progress',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-21')
    },
    {
      id: 3,
      title: 'Предложение по улучшению интерфейса',
      category: 'feedback',
      status: 'open',
      createdAt: new Date('2024-01-22'),
      updatedAt: new Date('2024-01-22')
    }
  ]);

  const slidesRef = useRef<HTMLDivElement>(null);

  // Заполняем данные пользователя при загрузке
  useEffect(() => {
    if (user && isAuthenticated) {
      setContactForm(prev => ({
        ...prev,
        name: user.full_name || user.username || '',
        email: user.email || ''
      }));
    }
  }, [user, isAuthenticated]);

  // Обновляем позицию слайдера при изменении активного слайда
  useEffect(() => {
    setSliderPosition(activeSlide * 100);
  }, [activeSlide]);

  // Фильтрация FAQ по поиску
  const filteredFaqItems = faqItems.filter(item => 
    item.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
    item.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: message,
      sender: 'user',
      timestamp: new Date(),
      read: false
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Имитация ответа поддержки
    setTimeout(() => {
      const responses = [
        'Понял ваш вопрос, давайте разберемся подробнее.',
        'Спасибо за обращение! Ответим вам в ближайшее время.',
        'Проверяю информацию по вашему запросу...',
        'Для решения вашего вопроса нам потребуется дополнительная информация.',
        'Попробуйте выполнить следующие шаги...'
      ];
      
      const response: Message = {
        id: messages.length + 2,
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: 'support',
        timestamp: new Date(),
        read: false
      };

      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const handleToggleFaq = (id: number) => {
    setFaqItems(prev => prev.map(item => 
      item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
    ));
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    // Имитация отправки формы
    setTimeout(() => {
      setIsSending(false);
      alert('Сообщение отправлено! Мы ответим вам в течение 24 часов.');
      
      setContactForm({
        name: '',
        email: '',
        category: 'general',
        subject: '',
        message: '',
        attachFiles: false
      });

      // Добавляем новый тикет
      const newTicket: SupportTicket = {
        id: supportTickets.length + 1,
        title: contactForm.subject || 'Новый запрос',
        category: contactForm.category,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setSupportTickets([newTicket, ...supportTickets]);
    }, 1500);
  };

  const handleContactChange = (field: keyof typeof contactForm, value: string | boolean) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return '#3b82f6';
      case 'in-progress': return '#f59e0b';
      case 'resolved': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open': return 'Открыт';
      case 'in-progress': return 'В работе';
      case 'resolved': return 'Решен';
      default: return 'Неизвестно';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU');
    }
  };

  const handleSlideClick = (index: number) => {
    setActiveSlide(index);
  };

  const handleNextSlide = () => {
    setActiveSlide(prev => (prev + 1) % 3);
  };

  const handlePrevSlide = () => {
    setActiveSlide(prev => (prev - 1 + 3) % 3);
  };

  const slideTitles = ['Чат с поддержкой', 'FAQ', 'Контактная форма'];
  const slideIcons = [MessageCircle, FileText, Mail];

  return (
    <div className={styles.helpPage}>
      {/* Шапка страницы */}
      <div className={styles.pageHeader}>
        <Link to="/dashboard" className={styles.backButton}>
          <ArrowLeft size={20} />
          Назад к дашборду
        </Link>
        <div className={styles.headerContent}>
          <h1>Центр помощи</h1>
          <p className={styles.pageSubtitle}>
            Получите помощь по использованию Protonoro, ознакомьтесь с FAQ или свяжитесь с поддержкой
          </p>
        </div>
      </div>

      <div className={styles.helpContainer}>
        {/* Основная часть со слайдером */}
        <div className={styles.mainContent}>
          {/* Слайдер-навигация */}
          <div className={styles.sliderNavigation}>
            <div className={styles.sliderTabs}>
              {slideTitles.map((title, index) => {
                const Icon = slideIcons[index];
                return (
                  <button
                    key={index}
                    className={`${styles.sliderTab} ${activeSlide === index ? styles.activeSliderTab : ''}`}
                    onClick={() => handleSlideClick(index)}
                  >
                    <Icon size={18} />
                    <span>{title}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Ползунок */}
            <div className={styles.sliderTrack}>
              <div 
                className={styles.sliderThumb}
                style={{ transform: `translateX(${sliderPosition}%)` }}
              />
            </div>

            {/* Кнопки навигации */}
            <div className={styles.sliderControls}>
              <button 
                className={styles.sliderControl}
                onClick={handlePrevSlide}
                disabled={activeSlide === 0}
              >
                <ChevronLeft size={20} />
              </button>
              <div className={styles.sliderDots}>
                {[0, 1, 2].map(index => (
                  <button
                    key={index}
                    className={`${styles.sliderDot} ${activeSlide === index ? styles.activeSliderDot : ''}`}
                    onClick={() => handleSlideClick(index)}
                  />
                ))}
              </div>
              <button 
                className={styles.sliderControl}
                onClick={handleNextSlide}
                disabled={activeSlide === 2}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Контейнер слайдов */}
          <div className={styles.slidesContainer}>
            <div 
              ref={slidesRef}
              className={styles.slidesWrapper}
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {/* Слайд 1: Чат с поддержкой */}
              <div className={styles.slide}>
                <div className={styles.chatSection}>
                  <div className={styles.chatHeader}>
                    <div className={styles.chatInfo}>
                      <div className={styles.chatAvatar}>
                        <HelpCircle size={20} />
                      </div>
                      <div>
                        <h3>Поддержка Protonoro</h3>
                        <p className={styles.chatStatus}>
                          <span className={styles.statusDot}></span>
                          Онлайн, отвечает в течение 5 минут
                        </p>
                      </div>
                    </div>
                    <div className={styles.chatStats}>
                      <div className={styles.stat}>
                        <Clock size={14} />
                        <span>Среднее время ответа: 2 мин</span>
                      </div>
                      <div className={styles.stat}>
                        <Check size={14} />
                        <span>Удовлетворенность: 97%</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.chatMessages}>
                    {messages.map((msg, index) => {
                      const prevMsg = messages[index - 1];
                      const showDate = !prevMsg || 
                        formatDate(prevMsg.timestamp) !== formatDate(msg.timestamp);

                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div className={styles.messageDate}>
                              <span className={styles.messageDateText}>
                                {formatDate(msg.timestamp)}
                              </span>
                            </div>
                          )}
                          <div className={`${styles.message} ${styles[msg.sender]}`}>
                            <div className={styles.messageBubble}>
                              <div className={styles.messageText}>{msg.text}</div>
                              <div className={styles.messageTime}>
                                {formatTime(msg.timestamp)}
                                {msg.sender === 'user' && (
                                  <span className={styles.messageStatus}>
                                    {msg.read ? '✓✓' : '✓'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.chatInput}>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Напишите ваш вопрос..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button 
                      className={styles.sendButton}
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Слайд 2: FAQ */}
              <div className={styles.slide}>
                <div className={styles.faqSection}>
                  <div className={styles.searchBar}>
                    <Search size={18} />
                    <input
                      type="text"
                      value={faqSearch}
                      onChange={(e) => setFaqSearch(e.target.value)}
                      placeholder="Поиск по FAQ..."
                    />
                  </div>

                  <div className={styles.faqCategories}>
                    {['Все', 'Начало работы', 'Настройки', 'Задачи', 'Статистика', 'Проблемы', 'Мобильная версия']
                      .map(category => (
                        <button
                          key={category}
                          className={`${styles.categoryTab} ${
                            faqSearch === category.toLowerCase() ? styles.activeCategory : ''
                          }`}
                          onClick={() => setFaqSearch(category === 'Все' ? '' : category.toLowerCase())}
                        >
                          {category}
                        </button>
                      ))}
                  </div>

                  <div className={styles.faqList}>
                    {filteredFaqItems.length > 0 ? (
                      filteredFaqItems.map(item => (
                        <div 
                          key={item.id} 
                          className={`${styles.faqItem} ${item.isExpanded ? styles.expanded : ''}`}
                        >
                          <div 
                            className={styles.faqQuestion}
                            onClick={() => handleToggleFaq(item.id)}
                          >
                            <div className={styles.faqQuestionContent}>
                              <div className={styles.faqCategoryTag}>
                                {item.category}
                              </div>
                              <h4>{item.question}</h4>
                            </div>
                            <button className={styles.expandButton}>
                              {item.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                          </div>
                          {item.isExpanded && (
                            <div className={styles.faqAnswer}>
                              {item.answer.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className={styles.noResults}>
                        <Search size={24} />
                        <p>По вашему запросу ничего не найдено</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Слайд 3: Контактная форма */}
              <div className={styles.slide}>
                <div className={styles.contactSection}>
                  <div className={styles.contactHeader}>
                    <h3>Свяжитесь с нами</h3>
                    <p>Заполните форму ниже, и наша команда поддержки свяжется с вами в ближайшее время</p>
                  </div>

                  <form onSubmit={handleContactSubmit} className={styles.contactForm}>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          <User size={14} />
                          Ваше имя
                        </label>
                        <input
                          type="text"
                          value={contactForm.name}
                          onChange={(e) => handleContactChange('name', e.target.value)}
                          className={styles.formInput}
                          placeholder="Введите ваше имя"
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          <Mail size={14} />
                          Email адрес
                        </label>
                        <input
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => handleContactChange('email', e.target.value)}
                          className={styles.formInput}
                          placeholder="Введите ваш email"
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          <Hash size={14} />
                          Категория запроса
                        </label>
                        <select
                          value={contactForm.category}
                          onChange={(e) => handleContactChange('category', e.target.value)}
                          className={styles.formSelect}
                        >
                          <option value="general">Общий вопрос</option>
                          <option value="technical">Техническая проблема</option>
                          <option value="billing">Вопросы по оплате</option>
                          <option value="feedback">Предложения и отзывы</option>
                          <option value="feature">Запрос новой функции</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                          Тема сообщения
                        </label>
                        <input
                          type="text"
                          value={contactForm.subject}
                          onChange={(e) => handleContactChange('subject', e.target.value)}
                          className={styles.formInput}
                          placeholder="Кратко опишите тему"
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>
                        Подробное описание
                      </label>
                      <textarea
                        value={contactForm.message}
                        onChange={(e) => handleContactChange('message', e.target.value)}
                        className={styles.formTextarea}
                        placeholder="Опишите ваш вопрос или проблему подробно..."
                        rows={6}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={contactForm.attachFiles}
                          onChange={(e) => handleContactChange('attachFiles', e.target.checked)}
                          className={styles.checkboxInput}
                        />
                        <span>Прикрепить скриншоты или файлы (до 5MB)</span>
                      </label>
                    </div>

                    <div className={styles.formActions}>
                      <button 
                        type="submit" 
                        className={styles.submitButton}
                        disabled={isSending}
                      >
                        <Send size={16} />
                        {isSending ? 'Отправка...' : 'Отправить сообщение'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Боковая панель */}
        <div className={styles.sidePanel}>
          {/* Информация о поддержке */}
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <HelpCircle size={18} />
              <h3>Служба поддержки</h3>
            </div>
            <div className={styles.supportInfo}>
              <div className={styles.supportItem}>
                <Clock size={14} />
                <div>
                  <p className={styles.supportLabel}>Часы работы</p>
                  <p className={styles.supportValue}>Пн-Пт: 9:00-18:00</p>
                </div>
              </div>
              <div className={styles.supportItem}>
                <Phone size={14} />
                <div>
                  <p className={styles.supportLabel}>Телефон</p>
                  <p className={styles.supportValue}>+7 (800) 123-45-67</p>
                </div>
              </div>
              <div className={styles.supportItem}>
                <Mail size={14} />
                <div>
                  <p className={styles.supportLabel}>Email</p>
                  <p className={styles.supportValue}>support@protonoro.com</p>
                </div>
              </div>
              <div className={styles.supportItem}>
                <Globe size={14} />
                <div>
                  <p className={styles.supportLabel}>Веб-сайт</p>
                  <p className={styles.supportValue}>protonoro.com/support</p>
                </div>
              </div>
            </div>
          </div>

          {/* Мои тикеты */}
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <FileText size={18} />
              <h3>Мои обращения</h3>
            </div>
            <div className={styles.ticketsList}>
              {supportTickets.length > 0 ? (
                supportTickets.map(ticket => (
                  <div key={ticket.id} className={styles.ticketItem}>
                    <div className={styles.ticketHeader}>
                      <h4 className={styles.ticketTitle}>{ticket.title}</h4>
                      <span 
                        className={styles.ticketStatus}
                        style={{ backgroundColor: getStatusColor(ticket.status) }}
                      >
                        {getStatusText(ticket.status)}
                      </span>
                    </div>
                    <div className={styles.ticketMeta}>
                      <span className={styles.ticketCategory}>{ticket.category}</span>
                      <span className={styles.ticketDate}>
                        {ticket.createdAt.toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.noTickets}>У вас нет активных обращений</p>
              )}
            </div>
            <button 
              className={styles.sideButton}
              onClick={() => setActiveSlide(2)}
            >
              Создать новое обращение
            </button>
          </div>

          {/* Быстрые ссылки */}
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <Globe size={18} />
              <h3>Полезные ресурсы</h3>
            </div>
            <div className={styles.resourcesList}>
              <a href="#" className={styles.resourceLink}>Документация</a>
              <a href="#" className={styles.resourceLink}>Блог о продуктивности</a>
              <a href="#" className={styles.resourceLink}>Видео-уроки</a>
              <a href="#" className={styles.resourceLink}>API документация</a>
              <a href="#" className={styles.resourceLink}>Сообщество пользователей</a>
            </div>
          </div>

          {/* Статистика */}
          <div className={styles.infoCard}>
            <div className={styles.cardHeader}>
              <Check size={18} />
              <h3>Статистика поддержки</h3>
            </div>
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Среднее время ответа</span>
                <span className={styles.statValue}>2 мин 15 сек</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Удовлетворенность</span>
                <span className={styles.statValue}>97%</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Обработка в день</span>
                <span className={styles.statValue}>450+</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Активных тикетов</span>
                <span className={styles.statValue}>24</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpForm;