import type { Product } from '../../lib/types';
import { ALLERGEN_INFO } from '../../lib/types';
import type { AllergenId } from '../../lib/types';
import { useCartStore } from '../../lib/store';
import { IoAdd, IoRemove, IoHeart, IoHeartOutline } from 'react-icons/io5';
import { getBestProductImage } from '../../lib/productImages';
import styles from './ProductCard.module.css';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const toggleFavorite = useCartStore((s) => s.toggleFavorite);
  const isFavorite = useCartStore((s) => s.isFavorite);
  const items = useCartStore((s) => s.items);
  const quantity = items.find((i) => i.product.id === product.id)?.quantity || 0;
  const favorite = isFavorite(product.id);
  const imageUrl = getBestProductImage(product);

  return (
    <div className={`${styles.card} ${quantity > 0 ? styles.inCart : ''}`}>
      {imageUrl && (
        <div className={styles.imageWrap}>
          <img
            src={imageUrl}
            alt={product.name}
            className={styles.image}
            loading="lazy"
          />
          <button
            className={styles.favoriteBtn}
            onClick={() => toggleFavorite(product.id)}
            aria-label={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            {favorite ? <IoHeart size={16} /> : <IoHeartOutline size={16} />}
          </button>
          {!product.available && <div className={styles.unavailable}>Agotado</div>}
        </div>
      )}
      <div className={styles.info}>
        <div className={styles.top}>
          <h3 className={styles.name}>{product.name}</h3>
          {product.description && (
            <p className={styles.desc}>{product.description}</p>
          )}
          {product.allergens && product.allergens.length > 0 && (
            <div className={styles.allergens}>
              {product.allergens.map((a: AllergenId) => (
                <span key={a} className={styles.allergenBadge} title={ALLERGEN_INFO[a]?.label || a}>
                  {ALLERGEN_INFO[a]?.icon || '⚠️'}
                  <span className={styles.allergenLabel}>{ALLERGEN_INFO[a]?.label || a}</span>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className={styles.bottom}>
          <span className={styles.price}>{product.price.toFixed(2)} €</span>
          {quantity > 0 ? (
            <div className={styles.qtyControls}>
              <button className={styles.qtyBtn} onClick={() => updateQuantity(product.id, quantity - 1)}>
                <IoRemove size={14} />
              </button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button className={styles.qtyBtn} onClick={() => addItem(product)}>
                <IoAdd size={14} />
              </button>
            </div>
          ) : (
            <button
              className={styles.addBtn}
              onClick={() => addItem(product)}
              disabled={!product.available}
            >
              <IoAdd size={18} />
              <span>Añadir</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
