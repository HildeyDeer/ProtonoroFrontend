import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../api/auth';
import Header from '../../components/layout/Header/Header';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import TimerSection from '../../components/layout/timer/TimerSection';
import DropZone from '../../components/layout/dropzone/DropZone';
import CategoryPopup from '../../components/layout/Modals/CategoryPopup/CategoryPopup';
import CategoryModal from '../../components/layout/Modals/CategoryModal/CategoryModal';
import TaskModal from '../../components/layout/Modals/TaskModal/TaskModal';
import ProfileModal from '../../components/layout/Modals/ProfileModal/ProfileModal';
import Analytics from '../../components/layout/Analytics/Analytics';
import Confetti from '../../components/layout/Confetti/Confetti';
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
  const [darkMode, setDarkMode] = useState(false);
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

  // Обновляем данные профиля при изменении user
  useEffect(() => {
    if (user) {
      // ✅ ПРАВИЛЬНОЕ ФОРМИРОВАНИЕ ИМЕНИ
      const userFullName = user.full_name || user.fullName || '';
      const userEmail = user.email || '';
      const userName = user.username || userEmail.split('@')[0] || 'Пользователь';
      
      setProfileData({
        name: userFullName || userName, // Отображаем полное имя, если есть
        email: userEmail,
        role: 'Пользователь',
        full_name: userFullName || null,
        username: userName
      });
      
      console.log('Profile data updated:', {
        full_name: userFullName,
        username: userName,
        email: userEmail
      });
    } else {
      setProfileData({
        name: 'Гость',
        email: 'Войдите в аккаунт',
        role: 'Гость',
        full_name: null,
        username: null
      });
    }
  }, [user]);

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

  // Переключение темы
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

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

  // Функция для обработки завершения таймера
  const handleTimerComplete = () => {
    setTimerState('stopped');
    
    if (timerMode === 'pomodoro') {
      setCompletedPomodoros(prev => prev + 1);
      
      if (completedPomodoros % 4 === 3) {
        setTimeout(() => {
          setTimerMode('longBreak');
          setTime(15 * 60);
        }, 1000);
      } else {
        setTimeout(() => {
          setTimerMode('shortBreak');
          setTime(5 * 60);
        }, 1000);
      }
    } else {
      setTimeout(() => {
        setTimerMode('pomodoro');
        setTime(25 * 60);
      }, 1000);
    }
  };

  // Функция для изменения режима таймера
  const handleModeChange = (mode: TimerMode) => {
    setTimerState('stopped');
    setTimerMode(mode);
    
    switch (mode) {
      case 'pomodoro':
        setTime(25 * 60);
        break;
      case 'shortBreak':
        setTime(5 * 60);
        break;
      case 'longBreak':
        setTime(15 * 60);
        break;
    }
  };

  const startTimer = () => {
    if (time === 0) {
      resetTimer();
    }
    setTimerState('running');
  };

  const pauseTimer = () => setTimerState('paused');
  
  const resetTimer = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerState('stopped');
    
    switch (timerMode) {
      case 'pomodoro':
        setTime(25 * 60);
        break;
      case 'shortBreak':
        setTime(5 * 60);
        break;
      case 'longBreak':
        setTime(15 * 60);
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

  // ✅ ОБНОВЛЕННЫЕ ОБРАБОТЧИКИ ПРОФИЛЯ
  const handleProfileAction = async (action: string) => {
    console.log(`Profile action: ${action}`);
    
    switch (action) {
      case 'profile':
        setIsProfileModalOpen(true);
        break;
      case 'settings':
        alert('Настройки приложения скоро будут доступны!');
        break;
      case 'help':
        alert('Помощь и поддержка скоро будут доступны!');
        break;
      case 'logout':
        if (window.confirm('Вы уверены, что хотите выйти?')) {
          try {
            await logout();
            navigate('/login');
          } catch (error) {
            console.error('Logout error:', error);
            alert('Произошла ошибка при выходе');
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
        console.log(`Unknown action: ${action}`);
    }
  };

  // Функция для обновления профиля
  const handleProfileSave = (updatedProfile: any) => {
    setProfileData(prev => ({
      ...prev,
      ...updatedProfile
    }));
    console.log('Profile saved:', updatedProfile);
  };
  // Функция для открытия страницы профиля
  const handleOpenProfilePage = () => {
    setIsProfileModalOpen(false);
    navigate('/profile');
  };

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
        onProfileAction={handleProfileAction}
        profileData={profileData}
        onConfettiTrigger={handleConfettiTrigger}
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
            time={time}
            timerState={timerState}
            mode={timerMode}
            completedPomodoros={completedPomodoros}
            onStart={startTimer}
            onPause={pauseTimer}
            onReset={resetTimer}
            onModeChange={handleModeChange}
            formatTime={formatTime}
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

          {isProfileModalOpen && (
            <ProfileModal
              isOpen={isProfileModalOpen}
              onClose={() => setIsProfileModalOpen(false)}
              onSave={handleProfileSave}
              onOpenProfilePage={handleOpenProfilePage}
              initialData={profileData}
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
              category={hoveredCategory}
              position={popupPosition}
              onMouseEnter={handlePopupMouseEnter}
              onMouseLeave={handlePopupMouseLeave}
              onDragToMain={() => {
                if (!droppedCategories.find(c => c.id === hoveredCategory.id)) {
                  const newDroppedCategory: DroppedCategory = {
                    ...hoveredCategory,
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