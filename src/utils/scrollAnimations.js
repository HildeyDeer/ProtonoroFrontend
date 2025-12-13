// utils/scrollAnimations.js
export const initScrollAnimations = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        
        // Анимация счетчиков
        const counters = entry.target.querySelectorAll('[data-count]');
        counters.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-count'));
          const duration = 2000; // 2 секунды
          const increment = target / (duration / 16); // 60fps
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
    observer.observe(el);
  });
};

// Добавьте этот код в WelcomeForm.tsx в useEffect