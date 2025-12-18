import { useState, useEffect } from 'react';
import { X, Palette } from 'lucide-react';
import styles from './CategoryModal.module.css';
import type { Category } from '../../../../../../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (categoryData: any) => void;
  initialData?: Category | null;
}

const CategoryModal = ({ isOpen, onClose, onSubmit, initialData }: CategoryModalProps) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#8b5cf6', // purple
    '#f59e0b', // orange
    '#ef4444', // red
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
  ];

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setColor(initialData.color);
    } else {
      setName('');
      setColor('#3b82f6');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, color });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{initialData ? 'Изменить Категорию' : 'Создать Категорию'}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Название Категории *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название категории"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              <Palette size={16} />
              Цвет
            </label>
            <div className={styles.colorGrid}>
              {colors.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  className={`${styles.colorOption} ${color === colorOption ? styles.selected : ''}`}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => setColor(colorOption)}
                  title={colorOption}
                />
              ))}
            </div>
            <div className={styles.selectedColor}>
              Выбранно: 
              <span 
                className={styles.colorPreview} 
                style={{ backgroundColor: color }}
              />
              <span className={styles.colorValue}>{color}</span>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Закрыть
            </button>
            <button type="submit" className={styles.submitButton}>
              {initialData ? 'Обновить Категорию' : 'Создать категорию'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;