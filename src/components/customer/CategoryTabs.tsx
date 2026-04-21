import { useRef, useEffect, useState } from 'react';
import type { Category } from '../../lib/types';
import styles from './CategoryTabs.module.css';

const CATEGORY_ICONS: Record<string, string> = {
  'Cafés': '☕',
  'Tés e infusiones': '🍵',
  'Batidos y smoothies': '🥤',
  'Bollería y dulces': '🥐',
  'Tostas y salados': '🥑',
  'Bebidas frías': '🧊',
  'Cachimbas': '💨',
  'Especiales': '✨',
};

interface Props {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (categoryId: string) => void;
}

export default function CategoryTabs({ categories, activeCategory, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Actualizar indicadores de scroll
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [categories]);

  // Hacer visible el tab activo SIN re-centrar — solo si está fuera de vista
  useEffect(() => {
    if (!activeCategory || !scrollRef.current) return;
    const el = scrollRef.current;
    const activeBtn = el.querySelector(`[data-cat-id="${activeCategory}"]`) as HTMLElement;
    if (activeBtn) {
      const btnLeft = activeBtn.offsetLeft;
      const btnRight = btnLeft + activeBtn.offsetWidth;
      const viewLeft = el.scrollLeft;
      const viewRight = viewLeft + el.clientWidth;
      // Solo hacer scroll si el tab activo NO está visible
      if (btnLeft < viewLeft + 16) {
        el.scrollTo({ left: Math.max(0, btnLeft - 16), behavior: 'smooth' });
      } else if (btnRight > viewRight - 16) {
        el.scrollTo({ left: btnRight - el.clientWidth + 16, behavior: 'smooth' });
      }
    }
  }, [activeCategory]);

  return (
    <div className={`${styles.wrapper} ${canScrollLeft ? styles.fadeLeft : ''} ${canScrollRight ? styles.fadeRight : ''}`}>
      <div className={styles.tabs} ref={scrollRef}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            data-cat-id={cat.id}
            className={`${styles.tab} ${activeCategory === cat.id ? styles.active : ''}`}
            onClick={() => onSelect(cat.id)}
          >
            <span className={styles.icon}>{CATEGORY_ICONS[cat.name] || '📋'}</span>
            <span className={styles.label}>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
