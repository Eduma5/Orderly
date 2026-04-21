import { useState, useEffect } from 'react';
import { IoAddOutline, IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import { toast } from 'react-hot-toast';
import type { Category, Product, AllergenId } from '../../lib/types';
import { ALLERGEN_INFO } from '../../lib/types';
import { getCategories, getProducts, upsertProduct, deleteProduct, toggleProductAvailability } from '../../lib/db';
import styles from './MenuManager.module.css';

export default function MenuManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCat, setActiveCat] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formAvailable, setFormAvailable] = useState(true);
  const [formAllergens, setFormAllergens] = useState<AllergenId[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
        setCategories(cats);
        setProducts(prods);
        if (cats.length > 0) setActiveCat(cats[0].id);
      } catch (err) {
        console.error('Error loading menu:', err);
        toast.error('Error al cargar el menú');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredProducts = products.filter((p) => p.category_id === activeCat);

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormPrice('');
    setFormCost('');
    setFormImage('');
    setFormAvailable(true);
    setFormAllergens([]);
    setEditingProduct(null);
    setShowForm(false);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormDesc(product.description || '');
    setFormPrice(product.price.toString());
    setFormCost(product.cost?.toString() || '');
    setFormImage(product.image_url || '');
    setFormAvailable(product.available);
    setFormAllergens(product.allergens || []);
    setShowForm(true);
  };

  const openNewForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName || !formPrice) {
      toast.error('Nombre y precio son obligatorios');
      return;
    }

    const price = parseFloat(formPrice);
    if (isNaN(price) || price < 0) {
      toast.error('Precio inválido');
      return;
    }
    const cost = formCost ? parseFloat(formCost) : undefined;
    if (formCost && (isNaN(cost!) || cost! < 0)) {
      toast.error('Coste inválido');
      return;
    }

    try {
      const productData: any = {
        category_id: activeCat,
        name: formName,
        description: formDesc || null,
        price,
        cost: cost ?? null,
        image_url: formImage || null,
        available: formAvailable,
        allergens: formAllergens,
        tags: editingProduct?.tags || [],
        order: editingProduct?.order ?? filteredProducts.length + 1,
      };

      if (editingProduct) {
        productData.id = editingProduct.id;
      }

      const saved = await upsertProduct(productData);

      if (editingProduct) {
        setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
        toast.success('Producto actualizado');
      } else {
        setProducts((prev) => [...prev, saved]);
        toast.success('Producto añadido');
      }
      resetForm();
    } catch (err) {
      console.error('Error saving product:', err);
      toast.error('Error al guardar el producto');
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success('Producto eliminado');
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Error al eliminar el producto');
    }
  };

  const handleToggleAvailability = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    try {
      await toggleProductAvailability(productId, !product.available);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, available: !p.available } : p
        )
      );
    } catch (err) {
      console.error('Error toggling availability:', err);
      toast.error('Error al cambiar disponibilidad');
    }
  };

  if (loading) {
    return <div className={styles.manager}><p style={{ textAlign: 'center', padding: '2rem' }}>Cargando menú...</p></div>;
  }

  return (
    <div className={styles.manager}>
      <div className={styles.catBar}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.catBtn} ${activeCat === cat.id ? styles.catActive : ''}`}
            onClick={() => setActiveCat(cat.id)}
          >
            {cat.name}
            <span className={styles.catCount}>
              {products.filter((p) => p.category_id === cat.id).length}
            </span>
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <span className={styles.productCount}>
          {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
        </span>
        <button className="btn btn-primary btn-sm" onClick={openNewForm}>
          <IoAddOutline size={16} /> Añadir producto
        </button>
      </div>

      {showForm && (
        <div className={styles.form}>
          <h3>{editingProduct ? 'Editar producto' : 'Nuevo producto'}</h3>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Nombre</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Nombre del producto"
              />
            </div>
            <div className={styles.field}>
              <label>Precio (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className={styles.field}>
              <label>Coste (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formCost}
                onChange={(e) => setFormCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label>Descripción</label>
              <input
                type="text"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Descripción opcional"
              />
            </div>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label>URL de imagen</label>
              <input
                type="text"
                value={formImage}
                onChange={(e) => setFormImage(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className={`${styles.field} ${styles.fieldFull}`}>
              <label>Alérgenos</label>
              <div className={styles.allergenGrid}>
                {(Object.keys(ALLERGEN_INFO) as AllergenId[]).map((key) => (
                  <label key={key} className={`${styles.allergenChip} ${formAllergens.includes(key) ? styles.allergenActive : ''}`}>
                    <input
                      type="checkbox"
                      checked={formAllergens.includes(key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormAllergens((prev) => [...prev, key]);
                        } else {
                          setFormAllergens((prev) => prev.filter((a) => a !== key));
                        }
                      }}
                    />
                    <span>{ALLERGEN_INFO[key].icon}</span>
                    <span>{ALLERGEN_INFO[key].label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={formAvailable}
                  onChange={(e) => setFormAvailable(e.target.checked)}
                />
                Disponible
              </label>
            </div>
          </div>
          <div className={styles.formActions}>
            <button className="btn btn-outline btn-sm" onClick={resetForm}>
              Cancelar
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleSave}>
              {editingProduct ? 'Guardar cambios' : 'Añadir'}
            </button>
          </div>
        </div>
      )}

      <div className={styles.products}>
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`${styles.product} ${!product.available ? styles.unavailable : ''}`}
          >
            <div className={styles.productInfo}>
              <span className={styles.productName}>{product.name}</span>
              {product.description && (
                <span className={styles.productDesc}>{product.description}</span>
              )}
            </div>
            <div className={styles.productPrices}>
              <span className={styles.productPrice}>{product.price.toFixed(2)} €</span>
              {product.cost != null && (
                <span className={styles.productCost}>Coste: {product.cost.toFixed(2)} €</span>
              )}
            </div>
            <div className={styles.productActions}>
              <button
                className={styles.actionBtn}
                onClick={() => handleToggleAvailability(product.id)}
                title={product.available ? 'Deshabilitar' : 'Habilitar'}
              >
                <span
                  className={`${styles.dot} ${product.available ? styles.dotGreen : styles.dotRed}`}
                />
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => openEditForm(product)}
                title="Editar"
              >
                <IoCreateOutline size={16} />
              </button>
              <button
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                onClick={() => handleDelete(product.id)}
                title="Eliminar"
              >
                <IoTrashOutline size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
