import { GripVertical } from 'lucide-react';
import styles from './CategoryPopup.module.css';
import type { Category } from '../../../../../types';

interface CategoryPopupProps {
  category: Category;
  position: { x: number; y: number };
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDragToMain: () => void;
}

const CategoryPopup = ({
  category,
  position,
  onMouseEnter,
  onMouseLeave,
  onDragToMain
}: CategoryPopupProps) => {
  return (
    <div 
      className={styles.categoryPopup}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={styles.popupHeader}>
        <div className={styles.popupCategoryTitle}>
          <div 
            className={styles.categoryColorDot} 
            style={{ backgroundColor: category.color }}
          />
          <h4>{category.name}</h4>
        </div>
        <div className={styles.popupStats}>
          <span className={styles.taskCount}>{category.tasks.length} tasks</span>
          <span className={styles.completedCount}>
            {category.tasks.filter(t => t.completed).length} completed
          </span>
        </div>
      </div>
      
      <div className={styles.popupTasks}>
        {category.tasks.map(task => (
          <div key={task.id} className={styles.popupTask}>
            <div className={styles.popupTaskHeader}>
              <span className={`${styles.popupTaskStatus} ${task.completed ? styles.completed : ''}`}>
                {task.completed ? '✓' : '○'}
              </span>
              <span className={styles.popupTaskTitle}>{task.title}</span>
              <span className={styles.popupTaskTime}>{task.time}</span>
            </div>
            <div className={styles.popupTaskProgress}>
              <div className={styles.popupProgressBar}>
                <div 
                  className={styles.popupProgressFill} 
                  style={{ 
                    width: `${task.progress}%`,
                    backgroundColor: category.color
                  }}
                />
              </div>
              <span className={styles.popupProgressText}>{task.progress}%</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.popupFooter}>
        <button 
          className={styles.popupDragBtn}
          onClick={onDragToMain}
        >
          <GripVertical size={14} />
          Drag to main area
        </button>
      </div>
    </div>
  );
};

export default CategoryPopup;