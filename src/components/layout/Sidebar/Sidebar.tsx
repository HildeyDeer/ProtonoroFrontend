import { Target, BarChart3, CheckCircle, Clock, GripVertical, ChevronRight, Plus } from 'lucide-react';
import styles from './Sidebar.module.css';
import type { Category } from '../../../types';

interface SidebarProps {
  categories: Category[];
  droppedCategories: Category[];
  draggedCategory: Category | null;
  onDragStart: (category: Category, e: React.DragEvent) => void;
  onMouseEnter: (category: Category, e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  onAddCategory: () => void;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
}

const Sidebar = ({
  categories,
  droppedCategories,
  draggedCategory,
  onDragStart,
  onMouseEnter,
  onMouseLeave,
  onAddCategory,
  totalTasks,
  completedTasks,
  inProgressTasks
}: SidebarProps) => {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.sidebarNav}>
        <a href="#" className={`${styles.navItem} ${styles.active}`}>
          <Target size={20} />
          <span>Tasks</span>
        </a>
        <a href="#" className={styles.navItem}>
          <BarChart3 size={20} />
          <span>Analytics</span>
        </a>
      </nav>

      <div className={styles.categoriesSection}>
        <div className={styles.sectionHeader}>
          <h3>Categories</h3>
          <button 
            className={styles.addCategoryButton}
            onClick={onAddCategory}
            title="Add new category"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className={styles.categoryFilters}>
          {categories.map(category => (
            <div 
              key={category.id}
              className={`${styles.categoryFilter} ${
                droppedCategories.find(c => c.id === category.id) ? styles.dropped : ''
              } ${draggedCategory?.id === category.id ? styles.dragging : ''}`}
              draggable
              onDragStart={(e) => onDragStart(category, e)}
              onDragEnd={() => {}}
              onMouseEnter={(e) => onMouseEnter(category, e)}
              onMouseLeave={onMouseLeave}
              style={{ '--category-color': category.color } as React.CSSProperties}
            >
              <GripVertical className={styles.dragHandle} size={16} />
              <div className={styles.categoryColorDot} />
              <span>{category.name}</span>
              <span className={styles.badge}>{category.tasks.length}</span>
              <ChevronRight className={styles.categoryArrow} size={16} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.statsWidget}>
        <h3>Overview</h3>
        <div className={styles.statItem}>
          <div className={`${styles.statIcon} ${styles.completed}`}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div className={styles.statValue}>{completedTasks}</div>
            <div className={styles.statLabel}>Completed</div>
          </div>
        </div>
        <div className={styles.statItem}>
          <div className={`${styles.statIcon} ${styles.inProgress}`}>
            <Clock size={20} />
          </div>
          <div>
            <div className={styles.statValue}>{inProgressTasks}</div>
            <div className={styles.statLabel}>In Progress</div>
          </div>
        </div>
        <div className={styles.statItem}>
          <div className={`${styles.statIcon} ${styles.total}`}>
            <Target size={20} />
          </div>
          <div>
            <div className={styles.statValue}>{totalTasks}</div>
            <div className={styles.statLabel}>Total Tasks</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;