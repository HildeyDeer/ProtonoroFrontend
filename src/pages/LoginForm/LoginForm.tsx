import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './LoginForm.module.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    
    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Login attempt:', formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ email: 'Неверный email или пароль' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: string) => {
    setIsLoading(true);
    console.log(`OAuth login with ${provider}`);
    
    setTimeout(() => {
      alert(`В будущем здесь будет интеграция с ${provider}`);
      setIsLoading(false);
    }, 1000);
  };

  const handleDemoLogin = () => {
    navigate('/dashboard');
  };

  return (
    <div className={styles.container}>
      {/* Фоновые элементы */}
      <div className={styles.background}>
        <div className={`${styles.bgCircle} ${styles.circle1}`}></div>
        <div className={`${styles.bgCircle} ${styles.circle2}`}></div>
        <div className={styles.bgGradient}></div>
      </div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <div className={styles.logoIcon}>
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
            <div className={styles.logoText}>
              <span className={styles.logoFirst} style={{ color: '#3b82f6' }}>Protonoro</span>
            </div>
          </div>
          
          <button 
            className={styles.btnBack} 
            onClick={() => navigate('/')}
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>На главную</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.wrapper}>
          <div className={styles.card}>
            <div className={styles.headerSection}>
              <h2 className={styles.title}>Вход в Protonoro</h2>
              <p className={styles.subtitle}>
                Войдите в свой аккаунт, чтобы продолжить работу
              </p>
            </div>

            {/* OAuth Providers */}
            <div className={styles.oauthSection}>
              <h3 className={styles.oauthTitle}>Быстрый вход</h3>
              <div className={styles.oauthButtons}>
                <button 
                  className={`${styles.oauthBtn} ${styles.google}`}
                  onClick={() => handleOAuthLogin('Google')}
                  disabled={isLoading}
                >
                  <div className={styles.oauthIcon}>
                    <svg viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <span>Google</span>
                </button>

                <button 
                  className={`${styles.oauthBtn} ${styles.github}`}
                  onClick={() => handleOAuthLogin('GitHub')}
                  disabled={isLoading}
                >
                  <div className={styles.oauthIcon}>
                    <svg viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <span>GitHub</span>
                </button>
              </div>
              
              <div className={styles.divider}>
                <span className={styles.dividerText}>или через email</span>
              </div>
            </div>

            {/* Login Form */}
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.email ? styles.error : ''}`}
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
                {errors.email && (
                  <div className={styles.errorMessage}>{errors.email}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <div className={styles.passwordLabelRow}>
                  <label htmlFor="password" className={styles.formLabel}>
                    Пароль
                  </label>
                  <button 
                    type="button" 
                    className={styles.forgotPassword}
                    onClick={() => alert('Функция восстановления пароля скоро будет доступна')}
                  >
                    Забыли пароль?
                  </button>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.password ? styles.error : ''}`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                {errors.password && (
                  <div className={styles.errorMessage}>{errors.password}</div>
                )}
              </div>

              <div className={styles.formOptions}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxCustom}></span>
                  <span className={styles.checkboxText}>Запомнить меня</span>
                </label>
              </div>

              <button 
                type="submit" 
                className={styles.btnSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span>Вход...</span>
                    <div className={styles.loadingSpinner}></div>
                  </>
                ) : (
                  'Войти'
                )}
              </button>
            </form>

            {/* Demo Login */}
            <div className={styles.demoSection}>
              <div className={styles.divider}>
                <span className={styles.dividerText}>или</span>
              </div>
              <button 
                className={styles.btnDemo}
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>Попробовать демо</span>
              </button>
            </div>

            {/* Registration Link */}
            <div className={styles.registrationLink}>
              <p>
                Ещё нет аккаунта?{' '}
                <Link to="/register" className={styles.linkRegister}>
                  Зарегистрироваться
                </Link>
              </p>
            </div>

            {/* Terms */}
            <div className={styles.termsSection}>
              <p className={styles.termsText}>
                Нажимая "Войти", вы соглашаетесь с{' '}
                <button 
                  className={styles.linkTerms}
                  onClick={() => alert('Условия использования скоро будут доступны')}
                >
                  Условиями использования
                </button>{' '}
                и{' '}
                <button 
                  className={styles.linkTerms}
                  onClick={() => alert('Политика конфиденциальности скоро будет доступна')}
                >
                  Политикой конфиденциальности
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginForm;