import { useEffect, useState } from 'react';
import styles from './Confetti.module.css';

interface ConfettiProps {
  isActive: boolean;
  onComplete?: () => void;
}

const Confetti = ({ isActive, onComplete }: ConfettiProps) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    rotation: number;
    scale: number;
    color: string;
    shape: string;
    speedX: number;
    speedY: number;
    rotationSpeed: number;
  }>>([]);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', 
    '#EF476F', '#9D4EDD', '#FF9E00', '#00BBF9', '#00F5D4'
  ];

  const shapes = ['circle', 'square', 'triangle'];

  useEffect(() => {
    if (isActive) {
      // Создаем 150 частиц конфетти
      const newParticles = Array.from({ length: 150 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        speedX: -5 + Math.random() * 10,
        speedY: 2 + Math.random() * 6,
        rotationSpeed: -2 + Math.random() * 4
      }));

      setParticles(newParticles);

      // Запускаем анимацию падения
      const animationDuration = 3000;
      const interval = 16; // ~60fps

      const animationInterval = setInterval(() => {
        setParticles(prev => 
          prev.map(particle => ({
            ...particle,
            x: particle.x + particle.speedX * 0.1,
            y: particle.y + particle.speedY * 0.1,
            rotation: particle.rotation + particle.rotationSpeed,
            speedY: particle.speedY + 0.05 // гравитация
          })).filter(particle => particle.y < 110) // Удаляем частицы, которые упали слишком низко
        );
      }, interval);

      // Останавливаем анимацию через 3 секунды
      const stopTimer = setTimeout(() => {
        clearInterval(animationInterval);
        setParticles([]);
        if (onComplete) {
          onComplete();
        }
      }, animationDuration);

      return () => {
        clearInterval(animationInterval);
        clearTimeout(stopTimer);
      };
    }
  }, [isActive]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className={styles.confettiContainer}>
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`${styles.confettiParticle} ${styles[particle.shape]}`}
          style={{
            left: `${particle.x}vw`,
            top: `${particle.y}vh`,
            transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
            backgroundColor: particle.color,
            opacity: particle.y > 90 ? 1 - (particle.y - 90) / 20 : 1 // исчезают внизу
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;