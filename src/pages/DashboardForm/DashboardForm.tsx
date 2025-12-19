import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../api/auth';
import Header from '../../components/layout/Dashboard/Header/Header';
import ProfilePopup from '../../components/layout/Dashboard/Modals/Header/ProfilePopup/ProfilePopup';
import Sidebar from '../../components/layout/Dashboard/Sidebar/Sidebar';
import TimerSection from '../../components/layout/Dashboard/MainArea/Timer/TimerSection';
import DropZone from '../../components/layout/Dashboard/MainArea/Dropzone/DropZone';
import CategoryPopup from '../../components/layout/Dashboard/Modals/Sidebar/CategoryPopup/CategoryPopup';
import CategoryModal from '../../components/layout/Dashboard/Modals/MainArea/CategoryModal/CategoryModal';
import TaskModal from '../../components/layout/Dashboard/Modals/MainArea/TaskModal/TaskModal';
import ProfileModal from '../../components/layout/Dashboard/Modals/MainArea/ProfileModal/ProfileModal';
import SettingsModal from '../../components/layout/Dashboard/Modals/SettingsModal/SettingsModal';
import Analytics from '../../components/layout/Dashboard/Modals/MainArea/AnalyticsModal/AnalyticsModal';
import Confetti from '../../components/layout/Dashboard/Modals/Header/Confetti/Confetti';
import type { Category, TimerState, TimerMode, DroppedCategory, Task } from '../../types';
import '../../styles/App.css';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // ✅ ИСПОЛЬЗУЕМ ХУК useAuth
  const { user, isAuthenticated, logout, checkAuthStatus } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  
  // Проверка авторизации
  useEffect(() => {
    const checkAuth = async () => {
      if (authChecked) return;
      
      try {
        console.log('Starting auth check...');
        
        if (isAuthenticated) {
          console.log('Already authenticated');
          setAuthChecked(true);
          return;
        }
        
        if (checkAuthStatus) {
          const isAuth = await checkAuthStatus();
          console.log('Auth check result:', isAuth);
          
          if (!isAuth) {
            console.log('Not authenticated, redirecting to login');
            navigate('/login');
          } else {
            console.log('Authenticated successfully');
          }
        } else {
          console.log('No auth check function, user not authenticated');
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/login');
      } finally {
        setAuthChecked(true);
      }
    };
    
    if (!authChecked) {
      checkAuth();
    }
  }, [checkAuthStatus, navigate, isAuthenticated, authChecked]);

  // Состояния компонента
  const [showConfetti, setShowConfetti] = useState(false);
  
  // ✅ СОСТОЯНИЯ ДЛЯ НАСТРОЕК
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [timerSettings, setTimerSettings] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreaks: true,
    autoStartPomodoros: true,
    longBreakInterval: 4,
    notifications: true,
    sound: true,
    backgroundImage: false,
    darkMode: true,
  });

  // ✅ ТЕМНАЯ ТЕМА ПО УМОЛЧАНИЮ
  const [darkMode, setDarkMode] = useState(timerSettings.darkMode);
  
  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro');
  const [time, setTime] = useState(25 * 60);
  const [timerState, setTimerState] = useState<TimerState>('stopped');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const intervalRef = useRef<number | null>(null);
  
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);
  const [droppedCategories, setDroppedCategories] = useState<DroppedCategory[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [profilePopupPosition, setProfilePopupPosition] = useState<{
    x: number;
    y: number;
    width: number;
  }>({ 
    x: 0, 
    y: 0, 
    width: 0 
  });
  
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  
  const [editingTask, setEditingTask] = useState<{ categoryId: number; task: Task } | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [showPopup, setShowPopup] = useState(false);
  const popupTimeoutRef = useRef<number | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');

  // ✅ ОБНОВЛЕННЫЙ ПРОФИЛЬ С ПОЛНЫМ ИМЕНЕМ
  const [profileData, setProfileData] = useState({
    name: 'Гость',
    email: 'Войдите в аккаунт',
    role: 'Гость',
    full_name: null as string | null,
    username: null as string | null
  });

  const [activeTab, setActiveTab] = useState<'tasks' | 'analytics'>('tasks');
  
  // Категории
  const [categories, setCategories] = useState<Category[]>([
    { 
      id: 1, 
      name: 'Работа', 
      color: '#3b82f6', 
      tasks: [
        { id: 1, title: 'Создать отчет', description: 'Подготовить еженедельный отчет по проекту', category: 'Работа', date: '01/9/2026', time: '09:00', progress: 75, completed: false },
        { id: 2, title: 'Планирование задач', description: 'Составить план на следующую неделю', category: 'Работа', date: '01/9/2026', time: '11:30', progress: 100, completed: true },
      ]
    },
    { 
      id: 2, 
      name: 'Учеба', 
      color: '#10b981', 
      tasks: [
        { id: 3, title: 'Изучить React', description: 'Просмотреть уроки по React', category: 'Учеба', date: '02/9/2026', time: '14:00', progress: 30, completed: false },
      ]
    },
  ]);

  const toggleTask = (taskId: number) => {
  setDroppedCategories(prev =>
    prev.map(cat => ({
      ...cat,
      tasks: cat.tasks.map(task =>
        task.id === taskId
          ? { ...task, completed: !task.completed }
          : task
      )
    }))
  );
};

  // Функция для расчета общего времени режима
  const getTotalTimeForMode = (mode: TimerMode): number => {
    switch(mode) {
      case 'pomodoro': return timerSettings.pomodoro * 60;
      case 'shortBreak': return timerSettings.shortBreak * 60;
      case 'longBreak': return timerSettings.longBreak * 60;
      default: return timerSettings.pomodoro * 60;
    }
  };

  // Обработчики таймера
  const handleStart = () => {
    if (time === 0) {
      handleReset();
    }
    setTimerState('running');
  };

  const handlePause = () => {
    setTimerState('paused');
  };

  const handleReset = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerState('stopped');
    
    switch (timerMode) {
      case 'pomodoro':
        setTime(timerSettings.pomodoro * 60);
        break;
      case 'shortBreak':
        setTime(timerSettings.shortBreak * 60);
        break;
      case 'longBreak':
        setTime(timerSettings.longBreak * 60);
        break;
    }
  };

  // Переключение темы
useEffect(() => {
  if (darkMode) {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
  }
  
  // Сохраняем настройку в timerSettings
  setTimerSettings(prev => ({
    ...prev,
    darkMode
  }));
}, [darkMode]);

  // Загрузка настроек из localStorage
  useEffect(() => {
  const savedSettings = localStorage.getItem('timerSettings');
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings);
      setTimerSettings(parsedSettings);
      setDarkMode(parsedSettings.darkMode);
      
      // Применяем класс темы на body
      if (parsedSettings.darkMode) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
      } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
      }
      
      // Применяем настройки времени
      if (timerMode === 'pomodoro') {
        setTime(parsedSettings.pomodoro * 60);
      } else if (timerMode === 'shortBreak') {
        setTime(parsedSettings.shortBreak * 60);
      } else if (timerMode === 'longBreak') {
        setTime(parsedSettings.longBreak * 60);
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }
  } else {
    // По умолчанию темная тема
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  }
}, []);

  // Логика таймера
  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = window.setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [timerState]);

  // Функция для запуска конфетти
  const handleConfettiTrigger = () => {
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  // Функция для воспроизведения звука завершения
  const playTimerSound = () => {
    if (!timerSettings.sound) return;
    
    try {
      const audio = new Audio('src/Extra/Sounds/timer-complete.mp3');
      audio.play().catch(e => console.warn('Audio playback failed:', e));
    } catch (error) {
      console.warn('Sound playback error:', error);
    }
  };

  // Функция для показа уведомления
  const showTimerNotification = () => {
    if (!timerSettings.notifications || !('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      new Notification('Таймер завершен!', {
        body: timerMode === 'pomodoro' ? 'Время для перерыва!' : 'Время работать!',
        icon: 'src/Extra/Icons/pomodoro.png'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showTimerNotification();
        }
      });
    }
  };

  // Функция для обработки завершения таймера
  const handleTimerComplete = () => {
    setTimerState('stopped');
    playTimerSound();
    showTimerNotification();
    
    if (timerMode === 'pomodoro') {
      setCompletedPomodoros(prev => prev + 1);
      
      // Используем настройку longBreakInterval
      if (completedPomodoros % timerSettings.longBreakInterval === timerSettings.longBreakInterval - 1) {
        setTimeout(() => {
          setTimerMode('longBreak');
          setTime(timerSettings.longBreak * 60);
        }, 1000);
      } else {
        setTimeout(() => {
          setTimerMode('shortBreak');
          setTime(timerSettings.shortBreak * 60);
        }, 1000);
      }
      
    } else {
      setTimeout(() => {
        setTimerMode('pomodoro');
        setTime(timerSettings.pomodoro * 60);
      }, 1000);
    }
  };

  // Функция для изменения режима таймера
  const handleModeChange = (mode: TimerMode) => {
    setTimerState('stopped');
    setTimerMode(mode);
    
    switch (mode) {
      case 'pomodoro':
        setTime(timerSettings.pomodoro * 60);
        break;
      case 'shortBreak':
        setTime(timerSettings.shortBreak * 60);
        break;
      case 'longBreak':
        setTime(timerSettings.longBreak * 60);
        break;
    }
  };

  // Обработка drag end
  useEffect(() => {
    const handleDragEnd = () => {
      setDraggedCategory(null);
      setIsDragOver(false);
    };

    document.addEventListener('dragend', handleDragEnd);
    
    return () => {
      document.removeEventListener('dragend', handleDragEnd);
    };
  }, []);

  // Функция форматирования времени
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenAnalytics = () => {
    setActiveTab('analytics');
    setIsAnalyticsOpen(true);
  };

  const handleCloseAnalytics = () => {
    setActiveTab('tasks');
    setIsAnalyticsOpen(false);
  };

  const handleTasksClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab('tasks');
    setIsAnalyticsOpen(false);
  };

  // ✅ ОТКРЫТИЕ ПОПАПА ПРОФИЛЯ С ПРАВИЛЬНОЙ ПОЗИЦИЕЙ
  const openProfilePopup = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setProfilePopupPosition({
      x: buttonRect.left,
      y: buttonRect.bottom,
      width: buttonRect.width
    });
    setShowProfilePopup(true);
  };

  // ✅ ЗАКРЫТИЕ ПОПАПА ПРОФИЛЯ
  const closeProfilePopup = () => {
    setShowProfilePopup(false);
  };
  
  // ✅ ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ПОЗИЦИОНИРОВАНИЯ ПОПАПА
  const getProfilePopupPosition = () => ({
    top: profilePopupPosition.y + 8,
    right: window.innerWidth - profilePopupPosition.x - profilePopupPosition.width
  });
  
  // ✅ ОБНОВЛЯЕМ ДАННЫЕ ПРОФИЛЯ ПРИ ИЗМЕНЕНИИ ПОЛЬЗОВАТЕЛЯ
  useEffect(() => {
    if (user) {
      // ✅ ПРАВИЛЬНОЕ ФОРМИРОВАНИЕ ИМЕНИ ИЗ ДАННЫХ ПОЛЬЗОВАТЕЛЯ
      const userFullName = user.full_name || (user as any).fullName || '';
      const userEmail = user.email || '';
      const userName = user.username || userEmail.split('@')[0] || 'Пользователь';
      
      setProfileData({
        name: userFullName || userName,
        email: userEmail,
        role: 'Пользователь',
        full_name: userFullName || null,
        username: userName
      });
      
      console.log('✅ Profile data updated from auth:', {
        full_name: userFullName,
        username: userName,
        email: userEmail
      });
    } else {
      // ✅ СБРАСЫВАЕМ ДАННЫЕ ДЛЯ ГОСТЯ
      setProfileData({
        name: 'Гость',
        email: 'Войдите в аккаунт',
        role: 'Гость',
        full_name: null,
        username: null
      });
    }
  }, [user]);

  // ✅ ФУНКЦИЯ ДЛЯ ЗАКРЫТИЯ МОДАЛЬНОГО ОКНА ПРОФИЛЯ
  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  // ✅ ОБНОВЛЕННЫЕ ОБРАБОТЧИКИ ДЕЙСТВИЙ ПРОФИЛЯ
  const handleProfileAction = async (action: string) => {
    console.log(`🎯 Profile action: ${action}`);
    
    switch (action) {
      case 'profile':
        setIsProfileModalOpen(true);
        break;
        
      case 'settings':
        setIsSettingsModalOpen(true);
        break;
        
      case 'help':
        alert('❓ Помощь и поддержка скоро будут доступны!');
        break;
        
      case 'logout':
        if (window.confirm('🚪 Вы уверены, что хотите выйти?')) {
          try {
            await logout();
            navigate('/login');
            // Сбрасываем данные профиля
            setProfileData({
              name: 'Гость',
              email: 'Войдите в аккаунт',
              role: 'Гость',
              full_name: null,
              username: null
            });
          } catch (error) {
            console.error('❌ Logout error:', error);
            alert('⚠️ Произошла ошибка при выходе');
          }
        }
        break;
        
      case 'login':
        navigate('/login');
        break;
        
      case 'register':
        navigate('/register');
        break;
        
      default:
        console.log(`❓ Unknown action: ${action}`);
    }
    
    // Автоматически закрываем попап после действия
    closeProfilePopup();
  };

  // ✅ ФУНКЦИЯ ДЛЯ ОБРАБОТКИ КЛИКА НА ПРОФИЛЬ В ХЕДЕРЕ
  const handleHeaderProfileAction = (action: string, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (action === 'openProfile' && event) {
      openProfilePopup(event);
    } else {
      handleProfileAction(action);
    }
  };

  // ✅ ФУНКЦИЯ ДЛЯ ОБНОВЛЕНИЯ ПРОФИЛЯ
  const handleProfileSave = (updatedProfile: {
    name?: string;
    email?: string;
    role?: string;
    avatar?: string | null;
  }) => {
    setProfileData(prev => ({
      ...prev,
      ...updatedProfile
    }));
    console.log('💾 Profile saved:', updatedProfile);
    closeProfileModal();
  };

  // ✅ ФУНКЦИЯ ДЛЯ СОХРАНЕНИЯ НАСТРОЕК
  const handleSaveSettings = (settings: any) => {
  setTimerSettings(settings);
  
  // Применяем тему
  setDarkMode(settings.darkMode);
  
  // Применяем класс темы на body
  if (settings.darkMode) {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
    document.body.classList.remove('dark-mode');
  }
  
  // Применяем настройки к текущему таймеру
  if (timerMode === 'pomodoro') {
    setTime(settings.pomodoro * 60);
  } else if (timerMode === 'shortBreak') {
    setTime(settings.shortBreak * 60);
  } else if (timerMode === 'longBreak') {
    setTime(settings.longBreak * 60);
  }
  
  console.log('⚙️ Settings saved:', settings);
  setIsSettingsModalOpen(false);
  
  // Сохраняем настройки в localStorage
  localStorage.setItem('timerSettings', JSON.stringify(settings));
};

  // ✅ ФУНКЦИЯ ДЛЯ ЗАГРУЗКИ ПРОФИЛЯ (УПРОЩЕННАЯ)
  const loadUserProfile = async () => {
    try {
      // Используем данные из useAuth, а не пытаемся вызвать несуществующую функцию
      if (user) {
        setProfileData(prev => ({
          ...prev,
          name: user.full_name || user.username || prev.name,
          email: user.email || prev.email,
          full_name: user.full_name || prev.full_name,
          username: user.username || prev.username,
          role: 'Пользователь'
        }));
        
        console.log('✅ User profile loaded from auth:', user);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load user profile:', error);
    }
  };

  // ✅ АВТОМАТИЧЕСКАЯ ЗАГРУЗКА ПРОФИЛЯ ПОСЛЕ ЛОГИНА
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        loadUserProfile();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  // ========== ОБРАБОТЧИКИ DRAG & DROP ==========
  const handleDragStart = (category: Category, e: React.DragEvent) => {
    setDraggedCategory(category);
    setShowPopup(false);
    setHoveredCategory(null);
    
    e.dataTransfer.setData('application/json', JSON.stringify(category));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const category: Category = JSON.parse(data);
        if (!droppedCategories.find(c => c.id === category.id)) {
          const newDroppedCategory: DroppedCategory = {
            ...category,
            position: droppedCategories.length
          };
          setDroppedCategories([...droppedCategories, newDroppedCategory]);
        }
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
    
    setDraggedCategory(null);
  };

  // Обработчики категорий и задач
  const handleCreateCategory = (categoryData: any) => {
    const newCategory: Category = {
      id: Date.now(),
      tasks: [],
      ...categoryData
    };

    setCategories(prev => [...prev, newCategory]);
    setIsCategoryModalOpen(false);
  };

  const handleEditCategory = (categoryData: any) => {
    if (!editingCategory) return;

    setCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === editingCategory.id
          ? { ...category, ...categoryData }
          : category
      )
    );

    setDroppedCategories(prev => 
      prev.map(dc => 
        dc.id === editingCategory.id
          ? { ...dc, ...categoryData }
          : dc
      )
    );

    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    if (window.confirm(`Вы уверены, что хотите удалить категорию "${category.name}"? Все ${category.tasks.length} задач в этой категории будут удалены.`)) {
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      setDroppedCategories(prev => prev.filter(dc => dc.id !== categoryId));
    }
  };

  const handleEditCategoryClick = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId) || 
                    droppedCategories.find(dc => dc.id === categoryId);
    
    if (category) {
      setEditingCategory(category);
      setIsCategoryModalOpen(true);
    }
  };

  const handleCreateTask = (taskData: any) => {
    const newTask: Task = {
      id: Date.now(),
      ...taskData,
      completed: false
    };

    const targetCategory = categories.find(c => c.name === taskData.category);
    
    if (targetCategory) {
      setCategories(prevCategories => 
        prevCategories.map(category => 
          category.id === targetCategory.id
            ? { ...category, tasks: [...category.tasks, newTask] }
            : category
        )
      );

      setDroppedCategories(prev => 
        prev.map(dc => 
          dc.id === targetCategory.id
            ? { ...dc, tasks: [...dc.tasks, newTask] }
            : dc
        )
      );
    }
    
    setIsTaskModalOpen(false);
  };

  const handleEditTask = (taskData: any) => {
    if (!editingTask) return;

    setCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === editingTask.categoryId
          ? { 
              ...category, 
              tasks: category.tasks.map(task => 
                task.id === editingTask.task.id 
                  ? { ...task, ...taskData }
                  : task
              )
            }
          : category
      )
    );

    setDroppedCategories(prev => 
      prev.map(dc => 
        dc.id === editingTask.categoryId
          ? { 
              ...dc, 
              tasks: dc.tasks.map(task => 
                task.id === editingTask.task.id 
                  ? { ...task, ...taskData }
                  : task
              )
            }
          : dc
      )
    );

    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (categoryId: number, taskId: number) => {
    const task = categories
      .find(c => c.id === categoryId)
      ?.tasks.find(t => t.id === taskId);

    if (!task) return;

    if (window.confirm(`Вы уверены, что хотите удалить задачу "${task.title}"?`)) {
      setCategories(prevCategories => 
        prevCategories.map(category => 
          category.id === categoryId
            ? { ...category, tasks: category.tasks.filter(t => t.id !== taskId) }
            : category
        )
      );

      setDroppedCategories(prev => 
        prev.map(dc => 
          dc.id === categoryId
            ? { ...dc, tasks: dc.tasks.filter(t => t.id !== taskId) }
            : dc
        )
      );
    }
  };

  const handleTaskAction = (categoryId: number, task: Task, action: 'edit' | 'delete') => {
    if (action === 'edit') {
      setEditingTask({ categoryId, task });
      setIsTaskModalOpen(true);
    } else if (action === 'delete') {
      handleDeleteTask(categoryId, task.id);
    }
  };

  const handleMouseEnter = (category: Category, e: React.MouseEvent) => {
    if (draggedCategory) return;
    
    if (popupTimeoutRef.current) {
      window.clearTimeout(popupTimeoutRef.current);
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    setPopupPosition({
      x: rect.right + 10,
      y: rect.top
    });
    
    popupTimeoutRef.current = window.setTimeout(() => {
      setHoveredCategory(category);
      setShowPopup(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (popupTimeoutRef.current) {
      window.clearTimeout(popupTimeoutRef.current);
    }
    
    if (!draggedCategory) {
      popupTimeoutRef.current = window.setTimeout(() => {
        setShowPopup(false);
        setHoveredCategory(null);
      }, 200);
    }
  };

  const handlePopupMouseEnter = () => {
    if (popupTimeoutRef.current) {
      window.clearTimeout(popupTimeoutRef.current);
    }
  };

  const handlePopupMouseLeave = () => {
    handleMouseLeave();
  };

  const toggleTaskCompletion = (categoryId: number, taskId: number) => {
    setCategories(categories.map(category => 
      category.id === categoryId 
        ? {
            ...category,
            tasks: category.tasks.map(task => 
              task.id === taskId ? { ...task, completed: !task.completed } : task
            )
          }
        : category
    ));

    setDroppedCategories(droppedCategories.map(category =>
      category.id === categoryId
        ? {
            ...category,
            tasks: category.tasks.map(task =>
              task.id === taskId ? { ...task, completed: !task.completed } : task
            )
          }
        : category
    ));
  };

  const removeDroppedCategory = (id: number) => {
    setDroppedCategories(droppedCategories.filter(cat => cat.id !== id));
  };

  // Статистика
  const totalTasks = categories.reduce((sum, cat) => sum + cat.tasks.length, 0);
  const allTasks = categories.flatMap(cat => cat.tasks);
  const completedTasks = allTasks.filter(t => t.completed).length;
  const inProgressTasks = allTasks.filter(t => !t.completed && t.progress > 0).length;

  if (!authChecked) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Проверка авторизации...</p>
      </div>
    );
  }

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <Confetti 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)}
      />

      <Header 
        darkMode={darkMode}
        onThemeToggle={() => setDarkMode(!darkMode)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onProfileAction={handleHeaderProfileAction}
        profileData={profileData}
        onConfettiTrigger={handleConfettiTrigger}
      />
      
      {/* ✅ ПОПАП ПРОФИЛЯ */}
      <ProfilePopup
        isOpen={showProfilePopup}
        onClose={closeProfilePopup}
        onProfileAction={handleProfileAction}
        profileData={profileData}
        position={getProfilePopupPosition()}
      />

      <div className="main-layout">
        <Sidebar 
          categories={categories}
          droppedCategories={droppedCategories.map(dc => ({
            id: dc.id,
            name: dc.name,
            color: dc.color,
            tasks: dc.tasks
          }))}
          draggedCategory={draggedCategory}
          onDragStart={handleDragStart}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onAddCategory={() => {
            setEditingCategory(null);
            setIsCategoryModalOpen(true);
          }}
          onOpenAnalytics={handleOpenAnalytics}
          onTasksClick={handleTasksClick}
          activeTab={activeTab}
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          inProgressTasks={inProgressTasks}
        />

        <main className="content">
            <TimerSection
              backgroundImage={timerSettings.backgroundImage}
              time={time}
              totalTime={getTotalTimeForMode(timerMode)}
              timerState={timerState}
              mode={timerMode}
              completedPomodoros={completedPomodoros}
              droppedCategories={droppedCategories}
              //onToggleTask={toggleTask}
              onToggleTaskCompletion={toggleTaskCompletion}
              //onModeChange={setTimerMode}
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
              onModeChange={handleModeChange}
              formatTime={formatTime}
              //totalTime={getTotalTimeForMode(timerMode)}
            />
          <DropZone 
            droppedCategories={droppedCategories}
            searchQuery={searchQuery}
            isDragOver={isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onRemoveCategory={removeDroppedCategory}
            onToggleTaskCompletion={toggleTaskCompletion}
            onTaskAction={handleTaskAction}
            onEditCategory={handleEditCategoryClick}
            onDeleteCategory={handleDeleteCategory}
          />

          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={() => {
              setIsTaskModalOpen(false);
              setEditingTask(null);
            }}
            onSubmit={editingTask ? handleEditTask : handleCreateTask}
            categories={categories}
            initialData={editingTask ? editingTask.task : null}
          />

          {isCategoryModalOpen && (
            <CategoryModal
              isOpen={isCategoryModalOpen}
              onClose={() => {
                setIsCategoryModalOpen(false);
                setEditingCategory(null);
              }}
              onSubmit={(categoryData) => {
                if (editingCategory) {
                  handleEditCategory(categoryData);
                } else {
                  handleCreateCategory(categoryData);
                }
              }}
              initialData={editingCategory}
            />
          )}

          {/* ✅ МОДАЛЬНОЕ ОКНО ПРОФИЛЯ */}
          {isProfileModalOpen && (
            <ProfileModal
              isOpen={isProfileModalOpen}
              onClose={closeProfileModal}
              onSave={handleProfileSave}
              initialData={profileData}
            />
          )}

          {/* ✅ МОДАЛКА НАСТРОЕК */}
          {isSettingsModalOpen && (
            <SettingsModal
              isOpen={isSettingsModalOpen}
              onClose={() => setIsSettingsModalOpen(false)}
              onSave={handleSaveSettings}
              initialSettings={timerSettings}
            />
          )}

          {isAnalyticsOpen && (
            <Analytics
              isOpen={isAnalyticsOpen}
              onClose={handleCloseAnalytics}
              categories={categories}
            />
          )}

          {showPopup && hoveredCategory && (
            <CategoryPopup 
              category={hoveredCategory!}
              position={popupPosition}
              onMouseEnter={handlePopupMouseEnter}
              onMouseLeave={handlePopupMouseLeave}
              onDragToMain={() => {
                if (!droppedCategories.find(c => c.id === hoveredCategory!.id)) {
                  const newDroppedCategory: DroppedCategory = {
                    ...hoveredCategory!,
                    position: droppedCategories.length
                  };
                  setDroppedCategories([...droppedCategories, newDroppedCategory]);
                }
                setShowPopup(false);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;