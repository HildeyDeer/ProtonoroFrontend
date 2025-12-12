import { useState, useEffect, useRef } from 'react';
import Header from './components/layout/Header/Header';
import Sidebar from './components/layout/Sidebar/Sidebar';
import TimerSection from './components/layout/Timer/TimerSection';
import DropZone from './components/layout/Dropzone/DropZone';
import CategoryPopup from './components/layout/Modals/CategoryPopup/CategoryPopup';
import CategoryModal from './components/layout/Modals/CategoryModal/CategoryModal';
import TaskModal from './components/layout/Modals/TaskModal/TaskModal';
import ProfileModal from './components/layout/Modals/ProfileModal/ProfileModal';
import Analytics from './components/layout/Analytics/Analytics';
import Confetti from './components/layout/Confetti/Confetti'; // Импортируем компонент конфетти
import type { Category, TimerState, TimerMode, DroppedCategory, Task } from './types';
import './styles/App.css';

const App = () => {

  // Состояние для конфетти
  const [showConfetti, setShowConfetti] = useState(false);

  // Темная тема
  const [darkMode, setDarkMode] = useState(false);
  
  // Таймер
  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro');
  const [time, setTime] = useState(25 * 60); // 25 минут по умолчанию
  const [timerState, setTimerState] = useState<TimerState>('stopped');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const intervalRef = useRef<number | null>(null);
  
  // Drag and Drop
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);
  const [droppedCategories, setDroppedCategories] = useState<DroppedCategory[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Модальные окна
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  
  // Редактирование
  const [editingTask, setEditingTask] = useState<{ categoryId: number; task: Task } | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Popup state
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [showPopup, setShowPopup] = useState(false);
  const popupTimeoutRef = useRef<number | null>(null);
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Профиль пользователя
  const [profileData, setProfileData] = useState({
    name: 'Alex Doe',
    email: 'alex.doe@protonoro.com',
    role: 'Product Manager'
  });

  // Активная вкладка (задачи / аналитика)
  const [activeTab, setActiveTab] = useState<'tasks' | 'analytics'>('tasks');
  // Данные
  const [categories, setCategories] = useState<Category[]>([
    { 
      id: 1, 
      name: 'Category 1', 
      color: '#3b82f6', 
      tasks: [
        { id: 1, title: 'on employee targets', description: 'Set quarterly targets for sales team', category: 'Category 1', date: '01/9/2026', time: '09:00', progress: 75, completed: false },
        { id: 2, title: 'on employee target range', description: 'Define target ranges for different roles', category: 'Category 1', date: '01/9/2026', time: '11:30', progress: 100, completed: true },
        { id: 6, title: 'Team Meeting', description: 'Weekly team sync meeting', category: 'Category 1', date: '03/9/2026', time: '15:00', progress: 100, completed: true },
      ]
    },
    { 
      id: 2, 
      name: 'Category 2', 
      color: '#10b981', 
      tasks: [
        { id: 3, title: 'on employee targets range', description: 'Review and adjust target ranges', category: 'Category 2', date: '02/9/2026', time: '14:00', progress: 30, completed: false },
        { id: 7, title: 'Budget Planning', description: 'Prepare Q4 budget report', category: 'Category 2', date: '04/9/2026', time: '11:00', progress: 60, completed: false },
      ]
    },
    { 
      id: 3, 
      name: 'Category 3', 
      color: '#8b5cf6', 
      tasks: [
        { id: 4, title: 'Performance Review Q3', description: 'Conduct quarterly performance reviews', category: 'Category 3', date: '05/9/2026', time: '10:00', progress: 0, completed: false },
        { id: 8, title: 'Client Presentation', description: 'Prepare slides for client meeting', category: 'Category 3', date: '06/9/2026', time: '13:00', progress: 40, completed: false },
        { id: 9, title: 'Documentation Update', description: 'Update project documentation', category: 'Category 3', date: '07/9/2026', time: '16:00', progress: 20, completed: false },
      ]
    },
    { 
      id: 4, 
      name: 'Category 4', 
      color: '#f59e0b', 
      tasks: [
        { id: 5, title: 'Training Program Setup', description: 'Launch new employee training program', category: 'Category 4', date: '10/9/2026', time: '13:45', progress: 50, completed: false },
        { id: 10, title: 'System Migration', description: 'Migrate to new CRM system', category: 'Category 4', date: '12/9/2026', time: '09:30', progress: 80, completed: false },
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

  // Логика таймера с автоматическим переключением режимов
  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = window.setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            // Таймер завершился, переключаем режим
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
    console.log('🎊 Confetti triggered! 🎊');
    
    // Автоматически скрываем конфетти через 3 секунды
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  // Функция для обработки завершения таймера
  const handleTimerComplete = () => {
    setTimerState('stopped');
    
    // Воспроизводим звук уведомления (опционально)
    if (typeof window !== 'undefined' && window.Notification && Notification.permission === 'granted') {
      new Notification('Timer Complete!', {
        body: `${timerMode === 'pomodoro' ? 'Focus time is over!' : 'Break is over!'}`,
        icon: '/favicon.ico'
      });
    }

    // Автоматическое переключение режимов
    if (timerMode === 'pomodoro') {
      setCompletedPomodoros(prev => prev + 1);
      
      // После каждых 4 помодоро длинный перерыв, иначе короткий
      if (completedPomodoros % 4 === 3) {
        setTimeout(() => {
          setTimerMode('longBreak');
          setTime(15 * 60); // 15 минут
        }, 1000);
      } else {
        setTimeout(() => {
          setTimerMode('shortBreak');
          setTime(5 * 60); // 5 минут
        }, 1000);
      }
    } else {
      // После перерыва возвращаемся к работе
      setTimeout(() => {
        setTimerMode('pomodoro');
        setTime(25 * 60); // 25 минут
      }, 1000);
    }
  };

  // Функция для изменения режима таймера с анимацией
  const handleModeChange = (mode: TimerMode) => {
    // Сначала останавливаем таймер
    setTimerState('stopped');
    
    // Меняем режим
    setTimerMode(mode);
    
    // Устанавливаем время в зависимости от режима
    switch (mode) {
      case 'pomodoro':
        setTime(25 * 60); // 25 минут
        break;
      case 'shortBreak':
        setTime(5 * 60); // 5 минут
        break;
      case 'longBreak':
        setTime(15 * 60); // 15 минут
        break;
    }
  };

  // Обновленные функции управления таймером
  const startTimer = () => {
    if (time === 0) {
      // Если время закончилось, сбрасываем таймер
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
    
    // Сбрасываем время в зависимости от текущего режима
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

  

  // ========== ОБРАБОТЧИК АНАЛИТИКИ ==========
  const handleOpenAnalytics = () => {
    setActiveTab('analytics');
    setIsAnalyticsOpen(true);
  };
  // ========= ОБРАБОТЧИК ЗАКРЫТИЯ АНАЛИТИКИ ==========
  const handleCloseAnalytics = () => {
  setActiveTab('tasks');
  setIsAnalyticsOpen(false);
  };

  // ========== ОБРАБОТЧИК НАЖАТИЯ НА ЗАДАЧИ ==========
  const handleTasksClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab('tasks');
    setIsAnalyticsOpen(false);
  };

  // ========== ОБРАБОТЧИКИ ПРОФИЛЯ ==========
  const handleProfileAction = (action: string) => {
    console.log(`Profile action: ${action}`);
    
    switch (action) {
      case 'profile':
        setIsProfileModalOpen(true);
        break;
      case 'settings':
        // Можно добавить модальное окно настроек приложения
        console.log('Open app settings');
        alert('App settings will be implemented soon!');
        break;
      case 'help':
        // Можно добавить страницу помощи
        console.log('Open help');
        alert('Help & Support will be implemented soon!');
        break;
      case 'logout':
        if (window.confirm('Are you sure you want to logout?')) {
          console.log('User logged out');
          // Здесь будет логика выхода (редирект, очистка токенов и т.д.)
          alert('Logged out successfully!');
        }
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  const handleProfileSave = (profileData: any) => {
    setProfileData(profileData);
    console.log('Profile saved:', profileData);
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

  // ========== ОБРАБОТЧИКИ КАТЕГОРИЙ ==========
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

    // Обновляем основную коллекцию категорий
    setCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === editingCategory.id
          ? { ...category, ...categoryData }
          : category
      )
    );

    // Обновляем droppedCategories
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

    if (window.confirm(`Are you sure you want to delete category "${category.name}"? All ${category.tasks.length} tasks in this category will be permanently deleted.`)) {
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      setDroppedCategories(prev => prev.filter(dc => dc.id !== categoryId));
    }
  };

  const handleEditCategoryClick = (categoryId: number) => {
    // Находим категорию в основной коллекции или в droppedCategories
    const category = categories.find(c => c.id === categoryId) || 
                    droppedCategories.find(dc => dc.id === categoryId);
    
    if (category) {
      setEditingCategory(category);
      setIsCategoryModalOpen(true);
    }
  };

  // ========== ОБРАБОТЧИКИ ЗАДАЧ ==========
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

    if (window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
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

  // ========== ОБРАБОТЧИКИ POPUP ==========
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

  // ========== ОБРАБОТЧИК ЗАВЕРШЕНИЯ ЗАДАЧ ==========
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



  // ========== УДАЛЕНИЕ КАТЕГОРИИ ИЗ DROP ZONE ==========
  const removeDroppedCategory = (id: number) => {
    setDroppedCategories(droppedCategories.filter(cat => cat.id !== id));
  };

  // ========== СТАТИСТИКА ==========
  const totalTasks = categories.reduce((sum, cat) => sum + cat.tasks.length, 0);
  const allTasks = categories.flatMap(cat => cat.tasks);
  const completedTasks = allTasks.filter(t => t.completed).length;
  const inProgressTasks = allTasks.filter(t => !t.completed && t.progress > 0).length;

return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      {/* Компонент конфетти */}
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
        onConfettiTrigger={handleConfettiTrigger} // Передаем функцию в Header
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

          {/* Модальное окно для задачи */}
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

          {/* Модальное окно для категории */}
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

          {/* Модальное окно для профиля */}
          {isProfileModalOpen && (
            <ProfileModal
              isOpen={isProfileModalOpen}
              onClose={() => setIsProfileModalOpen(false)}
              onSave={handleProfileSave}
              initialData={profileData}
            />
          )}

          {/* Окно аналитики */}
          {isAnalyticsOpen && (
            <Analytics
              isOpen={isAnalyticsOpen}
              onClose={handleCloseAnalytics} // Используем обновленный обработчик
              categories={categories}
            />
          )}

          {/* Popup при наведении на категорию */}
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

export default App;