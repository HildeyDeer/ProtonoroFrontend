import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../api/auth';
import styles from './RegisterForm.module.css';
import PrivacyPolicyModal from '../../components/layout/Registration-Login/PrivacyPolicyModal/PrivacyPolicyModal';
import TermsOfUseModal from '../../components/layout/Registration-Login/TermsOfUseModal/TermsOfUseModal';

interface RegisterFormData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface RegisterErrors {
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  general?: string;
}

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register: registerApi, loading } = useAuth();
  
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfUse, setShowTermsOfUse] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name as keyof RegisterErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: RegisterErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Полное имя обязательно';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Полное имя должно содержать минимум 2 символа';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Имя пользователя должно содержать минимум 3 символа';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Только латинские буквы, цифры и нижнее подчеркивание';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Пароль должен содержать заглавные и строчные буквы и цифры';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтверждение пароля обязательно';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Необходимо согласие с условиями';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const result = await registerApi(
        formData.email, 
        formData.password, 
        formData.fullName,
        formData.username
      );
      
      if (result.success && result.data) {
        console.log('Registration successful:', result.data);
        navigate('/register/success', { 
          state: { 
            email: formData.email,
            username: formData.username 
          }
        });
      } else {
        const errorMessage = result.error || 'Ошибка регистрации';
        
        if (errorMessage.includes('email') || errorMessage.includes('Email')) {
          setErrors({ email: 'Пользователь с таким email уже существует' });
        } else if (errorMessage.includes('user') || errorMessage.includes('User')) {
          setErrors({ username: 'Пользователь с таким именем уже существует' });
        } else {
          setErrors({ general: errorMessage });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Произошла ошибка при регистрации. Попробуйте позже.' });
    }
  };

  const handleOAuthRegister = (provider: string) => {
    if (loading) return;
    
    console.log(`OAuth registration with ${provider}`);
    
    setTimeout(() => {
      alert(`Регистрация через ${provider} скоро будет доступна`);
    }, 1000);
  };

  // Обработчики открытия/закрытия модалок
  const openPrivacyPolicy = () => {
    setShowPrivacyPolicy(true);
  };

  const openTermsOfUse = () => {
    setShowTermsOfUse(true);
  };

  const closePrivacyPolicy = () => {
    setShowPrivacyPolicy(false);
  };

  const closeTermsOfUse = () => {
    setShowTermsOfUse(false);
  };

  return (
    <div className={styles.registerContainer}>
      {/* Фоновые элементы */}
      <div className={styles.registerBackground}>
        <div className={styles.bgCircle1}></div>
        <div className={styles.bgCircle2}></div>
        <div className={styles.bgGradient}></div>
      </div>

      {/* Header */}
      <header className={styles.registerHeader}>
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
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>На главную</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.registerMain}>
        <div className={styles.registerWrapper}>
          <div className={styles.registerCard}>
            <div className={styles.registerHeaderSection}>
              <h2 className={styles.registerTitle}>Создать аккаунт</h2>
              <p className={styles.registerSubtitle}>
                Присоединяйтесь к сообществу Protonoro
              </p>
            </div>

            {/* Общая ошибка */}
            {errors.general && (
              <div className={styles.generalError}>
                <div className={styles.errorIcon}>⚠️</div>
                <div className={styles.errorText}>{errors.general}</div>
              </div>
            )}

            {/* OAuth Providers */}
            <div className={styles.oauthSection}>
              <h3 className={styles.oauthTitle}>Быстрая регистрация</h3>
              <div className={styles.oauthButtons}>
                <button 
                  className={`${styles.oauthBtn} ${styles.google}`}
                  onClick={() => handleOAuthRegister('Google')}
                  disabled={loading}
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
                  onClick={() => handleOAuthRegister('GitHub')}
                  disabled={loading}
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

            {/* Registration Form */}
            <form className={styles.registerForm} onSubmit={handleSubmit}>
              {/* Поле полного имени */}
              <div className={styles.formGroup}>
                <label htmlFor="fullName" className={styles.formLabel}>
                  Полное имя
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.fullName ? styles.error : ''}`}
                  placeholder="Иван Иванов"
                  disabled={loading}
                />
                {errors.fullName && (
                  <div className={styles.errorMessage}>{errors.fullName}</div>
                )}
                <div className={styles.fieldHint}>
                  Будет отображаться в вашем профиле
                </div>
              </div>

              {/* Поле имени пользователя */}
              <div className={styles.formGroup}>
                <label htmlFor="username" className={styles.formLabel}>
                  Имя пользователя
                </label>
                <div className={styles.usernameInputContainer}>
                  <div className={styles.usernamePrefix}>@</div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`${styles.formInput} ${styles.usernameInput} ${errors.username ? styles.error : ''}`}
                    placeholder="ivan_ivanov"
                    disabled={loading}
                  />
                </div>
                {errors.username && (
                  <div className={styles.errorMessage}>{errors.username}</div>
                )}
                <div className={styles.fieldHint}>
                  Используется для входа и упоминаний
                </div>
              </div>

              {/* Поле email */}
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
                  disabled={loading}
                />
                {errors.email && (
                  <div className={styles.errorMessage}>{errors.email}</div>
                )}
              </div>

              {/* Поле пароля */}
              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.formLabel}>
                  Пароль
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.password ? styles.error : ''}`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                {errors.password && (
                  <div className={styles.errorMessage}>{errors.password}</div>
                )}
                <div className={styles.passwordHints}>
                  <p className={styles.hintText}>Пароль должен содержать:</p>
                  <ul className={styles.hintList}>
                    <li className={formData.password.length >= 8 ? styles.valid : ''}>
                      Минимум 8 символов
                    </li>
                    <li className={/[a-z]/.test(formData.password) ? styles.valid : ''}>
                      Строчную букву
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? styles.valid : ''}>
                      Заглавную букву
                    </li>
                    <li className={/\d/.test(formData.password) ? styles.valid : ''}>
                      Цифру
                    </li>
                  </ul>
                </div>
              </div>

              {/* Подтверждение пароля */}
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.formLabel}>
                  Подтверждение пароля
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.confirmPassword ? styles.error : ''}`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <div className={styles.errorMessage}>{errors.confirmPassword}</div>
                )}
              </div>

              {/* Согласие с условиями */}
              <div className={`${styles.formGroup} ${styles.termsCheckbox}`}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    disabled={loading}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.checkboxCustom}></span>
                  <span className={styles.checkboxText}>
                    Я соглашаюсь с{' '}
                    <button 
                      type="button"
                      className={styles.linkTerms}
                      onClick={openTermsOfUse}
                    >
                      Условиями использования
                    </button>{' '}
                    и{' '}
                    <button 
                      type="button"
                      className={styles.linkTerms}
                      onClick={openPrivacyPolicy}
                    >
                      Политикой конфиденциальности
                    </button>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <div className={styles.errorMessage}>{errors.agreeToTerms}</div>
                )}
              </div>

              <button 
                type="submit" 
                className={styles.btnRegisterSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span>Регистрация...</span>
                    <div className={styles.loadingSpinner}></div>
                  </>
                ) : (
                  'Зарегистрироваться'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className={styles.loginLink}>
              <p>
                Уже есть аккаунт?{' '}
                <Link to="/login" className={styles.linkLogin}>
                  Войти
                </Link>
              </p>
            </div>

            {/* Benefits */}
            <div className={styles.benefitsSection}>
              <h4 className={styles.benefitsTitle}>Почему Protonoro?</h4>
              <div className={styles.benefitsGrid}>
                <div className={styles.benefit}>
                  <div className={styles.benefitIcon}>🎯</div>
                  <div className={styles.benefitText}>
                    <h5>Повышение продуктивности</h5>
                    <p>До 40% эффективнее с методом Помодоро</p>
                  </div>
                </div>
                <div className={styles.benefit}>
                  <div className={styles.benefitIcon}>📊</div>
                  <div className={styles.benefitText}>
                    <h5>Детальная аналитика</h5>
                    <p>Отслеживайте прогресс и оптимизируйте время</p>
                  </div>
                </div>
                <div className={styles.benefit}>
                  <div className={styles.benefitIcon}>🔄</div>
                  <div className={styles.benefitText}>
                    <h5>Синхронизация</h5>
                    <p>Доступ с любых устройств в реальном времени</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Модальные окна */}
      <PrivacyPolicyModal 
        isOpen={showPrivacyPolicy} 
        onClose={closePrivacyPolicy} 
      />
      
      <TermsOfUseModal 
        isOpen={showTermsOfUse} 
        onClose={closeTermsOfUse} 
      />
    </div>
  );
};

export default RegisterForm;