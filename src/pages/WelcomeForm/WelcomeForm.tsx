import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomeForm.css';

const WelcomeForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Определяем тему системы
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    
    // Добавляем/убираем класс dark-mode
    if (prefersDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);

  // Следим за прогрессом скролла
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setScrollProgress(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Инициализация анимаций при скролле
  useEffect(() => {
    const initScrollAnimations = () => {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      };

      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            
            // Анимация счетчиков
            const counters = entry.target.querySelectorAll('[data-count]');
            counters.forEach(counter => {
              const target = parseInt(counter.getAttribute('data-count') || '0');
              const duration = 2000;
              const increment = target / (duration / 16);
              let current = 0;
              
              const updateCounter = () => {
                current += increment;
                if (current < target) {
                  counter.textContent = Math.floor(current).toLocaleString();
                  requestAnimationFrame(updateCounter);
                } else {
                  counter.textContent = target.toLocaleString();
                }
              };
              
              requestAnimationFrame(updateCounter);
            });
          }
        });
      }, observerOptions);

      // Наблюдаем за всеми элементами с data-aos
      document.querySelectorAll('[data-aos]').forEach(el => {
        observerRef.current?.observe(el);
      });
    };

    initScrollAnimations();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const handleDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 800);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const header = document.querySelector('.welcome-header');
      const headerHeight = header?.clientHeight || 0;
      const sectionPosition = section.getBoundingClientRect().top;
      const offsetPosition = sectionPosition + window.pageYOffset - headerHeight - 20;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={`welcome-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Progress bar */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }}></div>

      {/* Фоновые элементы с размытием */}
      <div className="background-elements">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
        <div className="bg-circle circle-4"></div>
        <div className="bg-gradient"></div>
        <div className="particles-container">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 7}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
        <header className="welcome-header">
        <div className="header-content">
            <div className="logo-section">
            <div className="logo-icon">
                {/* Иконка target из lucide-react */}
                <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
                </svg>
            </div>
            <div className="logo-text">
                {/* Синий текст lucid-target */}
                <span className="logo-first" style={{ color: '#3b82f6' }}>Protonoro</span>
            </div>
            </div>
          
          <nav className="header-nav">
            <button 
              className="nav-link" 
              onClick={() => scrollToSection('features')}
            >
              <span className="nav-text">Возможности</span>
              <span className="nav-underline"></span>
            </button>
            <button 
              className="nav-link" 
              onClick={() => scrollToSection('about')}
            >
              <span className="nav-text">Метод Помодоро</span>
              <span className="nav-underline"></span>
            </button>
            <button 
              className="nav-link" 
              onClick={() => scrollToSection('cta')}
            >
              <span className="nav-text">Начать</span>
              <span className="nav-underline"></span>
            </button>
          </nav>
          
          <div className="header-actions">
            <button 
              className="theme-toggle"
              onClick={toggleTheme}
              title={darkMode ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            
            <button 
              className="btn-login" 
              onClick={handleLogin}
              disabled={isLoading}
            >
              <span>Вход</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 10z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button 
              className="btn-demo" 
              onClick={handleDemo}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span>Загрузка</span>
                  <div className="loading-spinner"></div>
                </>
              ) : (
                <>
                  <span>Демо</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="badge-text">✨ НОВОЕ ПОКОЛЕНИЕ</span>
            </div>
            
            <h1 className="hero-title">
              <span className="title-line">Твой путь к</span>
              <span className="title-line highlight">
                <span className="highlight-text">максимальной</span>
                <span className="highlight-underline"></span>
              </span>
              <span className="title-line highlight">
                <span className="highlight-text">продуктивности</span>
                <span className="highlight-underline"></span>
              </span>
            </h1>
            
            <p className="hero-description">
              <span className="description-line">Интеллектуальная система управления временем,</span>
              <span className="description-line">которая превращает цели в реальные результаты.</span>
              <span className="description-line">Основано на проверенной методике Помодоро.</span>
            </p>

            <div className="hero-stats">
              <div className="stat" data-aos="fade-up">
                <div className="stat-number" data-count="10000">0</div>
                <div className="stat-label">Довольных пользователей</div>
              </div>
              <div className="stat" data-aos="fade-up" data-aos-delay="100">
                <div className="stat-number" data-count="500000">0</div>
                <div className="stat-label">Выполненных задач</div>
              </div>
              <div className="stat" data-aos="fade-up" data-aos-delay="200">
                <div className="stat-number" data-count="98">0</div>
                <div className="stat-label">Рост продуктивности</div>
              </div>
            </div>

            <div className="cta-buttons">
              <button 
                className="btn-primary" 
                onClick={handleDemo}
                disabled={isLoading}
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <span>Начать бесплатно</span>
                <div className="btn-sparkle">
                  <div className="spark"></div>
                  <div className="spark"></div>
                  <div className="spark"></div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button 
                className="btn-secondary"
                onClick={() => scrollToSection('features')}
                data-aos="fade-up"
                data-aos-delay="400"
              >
                <span>Изучить возможности</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <div className="hero-visual" data-aos="fade-left" data-aos-delay="500">
            <div className="dashboard-preview">
              <div className="preview-glass">
                <div className="preview-header">
                  <div className="preview-dots">
                    <div className="dot red"></div>
                    <div className="dot yellow"></div>
                    <div className="dot green"></div>
                  </div>
                </div>
                
                <div className="preview-timer-section">
                  <div className="preview-timer-header">
                    <h3>Таймер фокуса</h3>
                    <div className="preview-timer-display">
                      <div className="preview-timer-value">
                        <span className="timer-digit">2</span>
                        <span className="timer-digit">5</span>
                        <span className="timer-colon">:</span>
                        <span className="timer-digit">0</span>
                        <span className="timer-digit">0</span>
                      </div>
                      <div className="preview-timer-label">Время фокуса</div>
                    </div>
                  </div>
                  <div className="preview-timer-controls">
                    <div className="preview-timer-btn active">
                      <span className="timer-mode">Помодоро</span>
                      <span className="timer-duration">25 мин</span>
                    </div>
                    <div className="preview-timer-btn">
                      <span className="timer-mode">Короткий перерыв</span>
                      <span className="timer-duration">5 мин</span>
                    </div>
                    <div className="preview-timer-btn">
                      <span className="timer-mode">Длинный перерыв</span>
                      <span className="timer-duration">15 мин</span>
                    </div>
                  </div>
                </div>

                <div className="preview-drop-zone">
                  <div className="preview-category-column">
                    <div className="preview-category-header">
                      <div className="preview-category-title">
                        <div className="preview-category-color-dot" style={{ backgroundColor: '#3b82f6' }}></div>
                        <h4>Рабочие задачи</h4>
                      </div>
                      <div className="preview-badge">3</div>
                    </div>
                    
                    <div className="preview-task-card">
                      <div className="preview-task-header">
                        <div className="preview-task-date">01/9/2026</div>
                        <div className="preview-task-time">09:00</div>
                      </div>
                      <h5 className="preview-task-title">Обзор целей сотрудников</h5>
                      <p className="preview-task-description">Установка квартальных целей для отдела продаж</p>
                      
                      <div className="preview-task-progress">
                        <div className="preview-progress-circle">
                          <svg className="progress-ring" width="60" height="60">
                            <circle className="progress-ring-background" cx="30" cy="30" r="24" />
                            <circle className="progress-ring-circle" cx="30" cy="30" r="24" style={{ strokeDasharray: '150.8', strokeDashoffset: '150.8' }} />
                          </svg>
                          <span className="progress-text">75%</span>
                        </div>
                        <div className="preview-progress-bar">
                          <div className="preview-progress-fill" style={{ width: '75%' }}></div>
                        </div>
                        <div className="preview-progress-text">75%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="floating-circle circle-1"></div>
        <div className="floating-circle circle-2"></div>
        <div className="floating-circle circle-3"></div>
      </div>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header" data-aos="fade-up">
          <h3 className="section-title">Почему именно Protonoro?</h3>
          <p className="section-subtitle">
            Инновационный подход к управлению временем с фокусом на результатах
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card" data-aos="fade-up">
            <div className="feature-icon-wrapper">
              <div className="feature-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6a.75.75 0 001.5 0V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h4 className="feature-title">Умный таймер Помодоро</h4>
            <p className="feature-description">
              Адаптивные интервалы, автоматическое планирование перерывов и 
              интеллектуальные рекомендации для максимальной концентрации
            </p>
            <div className="feature-highlight"></div>
          </div>

          <div className="feature-card" data-aos="fade-up" data-aos-delay="100">
            <div className="feature-icon-wrapper">
              <div className="feature-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10b981">
                  <path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm14.25 6a.75.75 0 01-.75.75H7.5a.75.75 0 010-1.5h9a.75.75 0 01.75.75zm-5.25 3a.75.75 0 01-.75.75H7.5a.75.75 0 010-1.5H12a.75.75 0 01.75.75z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h4 className="feature-title">Управление задачами</h4>
            <p className="feature-description">
              Drag & Drop интерфейс, категории, теги и интеллектуальная сортировка 
              для эффективной организации рабочего процесса
            </p>
            <div className="feature-highlight"></div>
          </div>

          <div className="feature-card" data-aos="fade-up" data-aos-delay="200">
            <div className="feature-icon-wrapper">
              <div className="feature-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#8b5cf6">
                  <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
                </svg>
              </div>
            </div>
            <h4 className="feature-title">Аналитика продуктивности</h4>
            <p className="feature-description">
              Подробная статистика, графики эффективности и персонализированные 
              рекомендации для постоянного роста
            </p>
            <div className="feature-highlight"></div>
          </div>

          <div className="feature-card" data-aos="fade-up" data-aos-delay="300">
            <div className="feature-icon-wrapper">
              <div className="feature-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f59e0b">
                  <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                </svg>
              </div>
            </div>
            <h4 className="feature-title">Адаптивный интерфейс</h4>
            <p className="feature-description">
              Темная/светлая тема, кастомизация, поддержка всех устройств и 
              мгновенная синхронизация между платформами
            </p>
            <div className="feature-highlight"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="about-content">
          <div className="about-text" data-aos="fade-right">
            <div className="about-badge">
              <span className="badge-text">🎯 МЕТОД ПОМОДОРО</span>
            </div>
            
            <h3 className="about-title">Научный подход к продуктивности</h3>
            <p className="about-description">
              Техника управления временем, разработанная Франческо Чирилло в конце 1980-х годов. 
              Метод использует таймер для разбиения работы на интервалы, традиционно по 25 минут, 
              разделённые короткими перерывами.
            </p>
            
            <div className="about-steps">
              <div className="step">
                <div className="step-number">
                  <span>1</span>
                  <div className="step-pulse"></div>
                </div>
                <div className="step-content">
                  <h5>Выберите задачу</h5>
                  <p>Определите, над чем будете работать в следующий интервал</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">
                  <span>2</span>
                  <div className="step-pulse"></div>
                </div>
                <div className="step-content">
                  <h5>Установите таймер</h5>
                  <p>25 минут на глубокую концентрацию без отвлечений</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">
                  <span>3</span>
                  <div className="step-pulse"></div>
                </div>
                <div className="step-content">
                  <h5>Работайте</h5>
                  <p>Сосредоточьтесь только на выбранной задаче</p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">
                  <span>4</span>
                  <div className="step-pulse"></div>
                </div>
                <div className="step-content">
                  <h5>Отдохните</h5>
                  <p>5-минутный перерыв для восстановления концентрации</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="about-visual" data-aos="fade-left">
            <div className="pomodoro-cycle">
              <div className="cycle-item focus">
                <div className="cycle-icon">🎯</div>
                <div className="cycle-glow"></div>
                <div className="cycle-text">
                  <h5>Фокус</h5>
                  <p>25 минут</p>
                </div>
              </div>
              
              <div className="cycle-arrow">
                <div className="arrow-line"></div>
                <div className="arrow-head"></div>
              </div>
              
              <div className="cycle-item break">
                <div className="cycle-icon">☕</div>
                <div className="cycle-glow"></div>
                <div className="cycle-text">
                  <h5>Перерыв</h5>
                  <p>5 минут</p>
                </div>
              </div>
              
              <div className="cycle-arrow">
                <div className="arrow-line"></div>
                <div className="arrow-head"></div>
              </div>
              
              <div className="cycle-item focus">
                <div className="cycle-icon">🎯</div>
                <div className="cycle-glow"></div>
                <div className="cycle-text">
                  <h5>Фокус</h5>
                  <p>25 минут</p>
                </div>
              </div>
              
              <div className="cycle-arrow">
                <div className="arrow-line"></div>
                <div className="arrow-head"></div>
              </div>
              
              <div className="cycle-item long-break">
                <div className="cycle-icon">🌴</div>
                <div className="cycle-glow"></div>
                <div className="cycle-text">
                  <h5>Длинный перерыв</h5>
                  <p>15 минут</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="cta-section">
        <div className="cta-content" data-aos="zoom-in">
          <h3 className="cta-title">Начните свой путь к продуктивности</h3>
          <p className="cta-subtitle">
            Присоединяйтесь к сообществу профессионалов, которые уже изменили свой подход к работе
          </p>
          
          <div className="cta-actions">
            <button 
              className="btn-cta-primary" 
              onClick={handleDemo}
              disabled={isLoading}
            >
              <span>Начать бесплатный демо</span>
              <div className="cta-sparkle">
                <div className="spark"></div>
                <div className="spark"></div>
                <div className="spark"></div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button 
              className="btn-cta-secondary"
              onClick={handleLogin}
            >
              <span>Создать аккаунт</span>
            </button>
          </div>
          
          <div className="cta-stats">
            <div className="cta-stat">
              <div className="cta-stat-number">14 дней</div>
              <div className="cta-stat-label">бесплатного тестирования</div>
            </div>
            <div className="cta-stat">
              <div className="cta-stat-number">0₽</div>
              <div className="cta-stat-label">для начала работы</div>
            </div>
            <div className="cta-stat">
              <div className="cta-stat-number">24/7</div>
              <div className="cta-stat-label">поддержка пользователей</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="welcome-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon small">
                {/* Иконка target из lucide-react */}
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <div className="footer-logo-text">
                {/* Синий текст lucid-target */}
                <span className="footer-logo-main" style={{ color: '#3b82f6' }}>
                  Protonoro
                </span>
                <span className="footer-logo-subtitle"></span>
              </div>
            </div>
            <p className="footer-tagline">
              Превращаем время в достижения
            </p>
          </div>

          <div className="footer-links">
            <div className="link-group">
              <h5 className="link-title">Продукт</h5>
              <button className="footer-link" onClick={() => scrollToSection('features')}>Возможности</button>
              <button className="footer-link" onClick={handleDemo}>Демо</button>
              <button className="footer-link" onClick={() => scrollToSection('about')}>Метод Помодоро</button>
            </div>
            
            <div className="link-group">
              <h5 className="link-title">Компания</h5>
              <button className="footer-link" onClick={() => alert('О нас скоро будет доступно')}>О нас</button>
              <button className="footer-link" onClick={() => alert('Блог скоро будет доступен')}>Блог</button>
              <button className="footer-link" onClick={() => alert('Карьера скоро будет доступна')}>Карьера</button>
            </div>
            
            <div className="link-group">
              <h5 className="link-title">Поддержка</h5>
              <button className="footer-link" onClick={() => alert('Центр помощи скоро будет доступен')}>Помощь</button>
              <button className="footer-link" onClick={() => alert('Контакты скоро будут доступны')}>Контакты</button>
              <button className="footer-link" onClick={() => alert('Сообщество скоро будет доступно')}>Сообщество</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            © {new Date().getFullYear()} Protonoro. Все права защищены.
          </p>
          <div className="footer-legal">
            <button className="legal-link" onClick={() => alert('Политика конфиденциальности скоро будет доступна')}>
              Конфиденциальность
            </button>
            <button className="legal-link" onClick={() => alert('Условия использования скоро будут доступны')}>
              Условия
            </button>
            <button className="legal-link" onClick={() => alert('Политика cookie скоро будет доступна')}>
              Cookie
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomeForm;