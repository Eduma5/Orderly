import { useState, useEffect, useRef } from 'react';
import { IoClose, IoSendOutline, IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import type { Product, Category, ChatMessage, AllergenId } from '../../lib/types';
import { ALLERGEN_INFO } from '../../lib/types';
import { useCartStore } from '../../lib/store';
import styles from './Chatbot.module.css';

interface Props {
  products: Product[];
  categories: Category[];
  activeCategory: string;
}

const QUICK_ACTIONS = [
  '¿Qué me recomiendas?',
  'Algo frío',
  'Algo dulce',
  'Sin cafeína',
  'Sin lactosa',
  'Sin gluten',
  'Soy vegetariano',
  'Cachimba popular',
  'Para compartir',
];

// Mapa de palabras clave en español a allergen IDs
const ALLERGEN_KEYWORDS: Record<string, AllergenId[]> = {
  'gluten': ['gluten'],
  'celíaco': ['gluten'],
  'celiaco': ['gluten'],
  'sin gluten': ['gluten'],
  'trigo': ['gluten'],
  'leche': ['lacteos'],
  'lácteo': ['lacteos'],
  'lacteo': ['lacteos'],
  'lactosa': ['lacteos'],
  'sin lactosa': ['lacteos'],
  'intolerante a la lactosa': ['lacteos'],
  'huevo': ['huevos'],
  'huevos': ['huevos'],
  'pescado': ['pescado'],
  'marisco': ['crustaceos', 'moluscos'],
  'crustáceo': ['crustaceos'],
  'crustaceo': ['crustaceos'],
  'gamba': ['crustaceos'],
  'langostino': ['crustaceos'],
  'cacahuete': ['cacahuetes'],
  'cacahuetes': ['cacahuetes'],
  'soja': ['soja'],
  'frutos secos': ['frutos_cascara'],
  'nuez': ['frutos_cascara'],
  'nueces': ['frutos_cascara'],
  'almendra': ['frutos_cascara'],
  'avellana': ['frutos_cascara'],
  'apio': ['apio'],
  'mostaza': ['mostaza'],
  'sésamo': ['sesamo'],
  'sesamo': ['sesamo'],
  'sulfito': ['sulfitos'],
  'sulfitos': ['sulfitos'],
  'altramuz': ['altramuces'],
  'altramuces': ['altramuces'],
  'molusco': ['moluscos'],
  'moluscos': ['moluscos'],
};

// Mapeo de categoría a tags relevantes
const CATEGORY_TAG_MAP: Record<string, string[]> = {
  'Cafés': ['hot', 'energizing'],
  'Tés e infusiones': ['hot', 'relaxing', 'healthy'],
  'Batidos y smoothies': ['cold', 'sweet', 'fruity'],
  'Bollería y dulces': ['sweet'],
  'Tostas y salados': ['salty'],
  'Bebidas frías': ['cold', 'fresh'],
  'Cachimbas': ['hookah'],
  'Especiales': ['special'],
};

// Dietas especiales
const DIET_FILTERS: Record<string, { excludeAllergens: AllergenId[]; text: string }> = {
  'vegetariano': {
    excludeAllergens: ['pescado', 'crustaceos', 'moluscos'],
    text: '🌿 Como vegetariano, estos productos son aptos para ti:',
  },
  'vegetariana': {
    excludeAllergens: ['pescado', 'crustaceos', 'moluscos'],
    text: '🌿 Como vegetariana, estos productos son aptos para ti:',
  },
  'vegano': {
    excludeAllergens: ['lacteos', 'huevos', 'pescado', 'crustaceos', 'moluscos'],
    text: '🌱 Como vegano, estos productos son aptos para ti:',
  },
  'vegana': {
    excludeAllergens: ['lacteos', 'huevos', 'pescado', 'crustaceos', 'moluscos'],
    text: '🌱 Como vegana, estos productos son aptos para ti:',
  },
};

const MEAT_KEYWORDS = ['jamón', 'jamon', 'pollo', 'bikini', 'salmón', 'salmon'];

function filterProductsWithoutAllergens(products: Product[], allergens: AllergenId[]): Product[] {
  return products.filter((p) => {
    if (!p.available) return false;
    const productAllergens = p.allergens || [];
    return !allergens.some((a) => productAllergens.includes(a));
  });
}

function filterForDiet(products: Product[], diet: string): Product[] {
  const filter = DIET_FILTERS[diet];
  if (!filter) return [];
  return products.filter((p) => {
    if (!p.available) return false;
    const productAllergens = p.allergens || [];
    if (filter.excludeAllergens.some((a) => productAllergens.includes(a))) return false;
    const name = p.name.toLowerCase();
    if (MEAT_KEYWORDS.some((k) => name.includes(k))) return false;
    return true;
  });
}

// Busca un producto concreto por nombre en la consulta
function findSpecificProduct(query: string, products: Product[]): Product | null {
  const q = query.toLowerCase();
  const available = products.filter((p) => p.available);
  // Buscar coincidencia exacta o parcial del nombre del producto
  for (const p of available) {
    const name = p.name.toLowerCase();
    if (q.includes(name) || name.split(' ').every((w) => w.length > 2 && q.includes(w))) {
      return p;
    }
  }
  // Buscar por palabras clave del nombre (al menos 2 palabras coincidentes)
  for (const p of available) {
    const words = p.name.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const matches = words.filter((w) => q.includes(w));
    if (matches.length >= 2 || (words.length === 1 && matches.length === 1)) {
      return p;
    }
  }
  return null;
}

function findProducts(query: string, products: Product[], activeCategoryId: string, categories: Category[]): Product[] {
  const q = query.toLowerCase();
  const tagMap: Record<string, string[]> = {
    'frío': ['cold', 'fresh'],
    'frio': ['cold', 'fresh'],
    'caliente': ['hot'],
    'dulce': ['sweet'],
    'salado': ['salty'],
    'saludable': ['healthy'],
    'energía': ['energizing'],
    'energia': ['energizing'],
    'relajante': ['relaxing'],
    'cachimba': ['hookah'],
    'hookah': ['hookah'],
    'café': ['energizing'],
    'cafe': ['energizing'],
    'chocolate': ['chocolate'],
    'fruta': ['fruity'],
    'tropical': ['tropical'],
    'compartir': ['sharing'],
    'especial': ['special'],
    'popular': ['popular'],
    'sin cafeína': ['relaxing', 'healthy'],
    'sin cafeina': ['relaxing', 'healthy'],
    'cremoso': ['creamy'],
    'picante': ['spicy'],
  };

  // Detectar si la consulta menciona una categoría específica
  let targetCategoryId: string | null = null;
  const catKeywords: Record<string, string> = {
    'cachimba': 'Cachimbas',
    'shisha': 'Cachimbas',
    'hookah': 'Cachimbas',
    'café': 'Cafés',
    'cafe': 'Cafés',
    'batido': 'Batidos y smoothies',
    'smoothie': 'Batidos y smoothies',
    'tosta': 'Tostas y salados',
    'bollería': 'Bollería y dulces',
    'bolleria': 'Bollería y dulces',
    'dulce': 'Bollería y dulces',
    'té': 'Tés e infusiones',
    'te ': 'Tés e infusiones',
    'infusión': 'Tés e infusiones',
    'infusion': 'Tés e infusiones',
  };

  for (const [kw, catName] of Object.entries(catKeywords)) {
    if (q.includes(kw)) {
      const cat = categories.find((c) => c.name === catName);
      if (cat) targetCategoryId = cat.id;
      break;
    }
  }

  // Si se detectó una categoría específica, filtrar SOLO esa categoría
  const baseProducts = targetCategoryId
    ? products.filter((p) => p.category_id === targetCategoryId)
    : products;

  let matchTags: string[] = [];
  for (const [keyword, tags] of Object.entries(tagMap)) {
    if (q.includes(keyword)) {
      matchTags.push(...tags);
    }
  }

  if (matchTags.length === 0) {
    // Buscar por nombre o descripción
    const nameMatches = baseProducts.filter(
      (p) =>
        p.available &&
        (p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q))
    );
    if (nameMatches.length > 0) return nameMatches.slice(0, 5);

    // Si hay categoría detectada, devolver los de esa categoría
    if (targetCategoryId) {
      const catProducts = baseProducts.filter((p) => p.available);
      return catProducts.slice(0, 5);
    }

    // Si hay categoría activa y la consulta es genérica ("recomienda", "qué pido"),
    // priorizar la categoría activa
    const isGenericQuery = q.includes('recomienda') || q.includes('sugieres') || q.includes('qué pido') || q.includes('que pido');
    if (isGenericQuery && activeCategoryId) {
      const catProducts = products.filter((p) => p.available && p.category_id === activeCategoryId);
      if (catProducts.length > 0) {
        const shuffled = [...catProducts].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 4);
      }
    }

    // Recomendación aleatoria
    const avail = products.filter((p) => p.available);
    const shuffled = [...avail].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }

  const scored = baseProducts
    .filter((p) => p.available)
    .map((p) => {
      const tags = p.tags || [];
      const score = matchTags.filter((t) => tags.includes(t)).length;
      return { product: p, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    return scored.slice(0, 5).map((s) => s.product);
  }

  // Si no hay coincidencias por tag pero hay categoría, devolver de esa categoría
  if (targetCategoryId) {
    return baseProducts.filter((p) => p.available).slice(0, 5);
  }

  return [];
}

function formatAllergenList(allergens: AllergenId[]): string {
  return allergens
    .map((a) => `${ALLERGEN_INFO[a]?.icon || '⚠️'} ${ALLERGEN_INFO[a]?.label || a}`)
    .join(', ');
}

function generateBotResponse(
  query: string,
  products: Product[],
  activeCategoryId: string,
  categories: Category[],
): { text: string; suggested: Product[] } {
  const q = query.toLowerCase();

  // ── Pregunta por alérgenos de un producto específico ──
  // "tiene leche el cappuccino?", "el cappuccino tiene lactosa?", "alergenos del café con leche"
  const isProductAllergenQuery =
    (q.includes('tiene') || q.includes('lleva') || q.includes('contiene') || q.includes('alérgeno') || q.includes('alergeno'))
    && !q.includes('no puedo') && !q.includes('alérgic') && !q.includes('alergic');

  if (isProductAllergenQuery) {
    const product = findSpecificProduct(q, products);
    if (product) {
      const allergens = product.allergens || [];
      if (allergens.length > 0) {
        return {
          text: `El "${product.name}" contiene: ${formatAllergenList(allergens)}. Ten cuidado si eres alérgico a alguno de estos.`,
          suggested: [product],
        };
      }
      return {
        text: `El "${product.name}" no tiene alérgenos registrados. Aun así te recomendamos consultarlo con el personal si tienes alergias severas.`,
        suggested: [product],
      };
    }
  }

  // ── Allergen / dietary queries ──
  const isAllergyQuery = q.includes('alérgic') || q.includes('alergic') || q.includes('alergia')
    || q.includes('intolerante') || q.includes('intolerancia')
    || q.includes('no puedo') || q.includes('sin ')
    || (q.includes('tiene') && (q.includes('gluten') || q.includes('lactosa') || q.includes('huevo')));

  // Check for diet queries
  for (const [diet, filter] of Object.entries(DIET_FILTERS)) {
    if (q.includes(diet)) {
      const safeProducts = filterForDiet(products, diet);
      if (safeProducts.length > 0) {
        return {
          text: filter.text,
          suggested: safeProducts.slice(0, 6),
        };
      }
      return {
        text: `Lo siento, no he encontrado productos para dieta ${diet} en nuestra carta. Consulta con el personal. 😊`,
        suggested: [],
      };
    }
  }

  // Check for specific allergen mentions
  if (isAllergyQuery) {
    const detectedAllergens: AllergenId[] = [];
    for (const [keyword, allergenIds] of Object.entries(ALLERGEN_KEYWORDS)) {
      if (q.includes(keyword)) {
        allergenIds.forEach((a) => { if (!detectedAllergens.includes(a)) detectedAllergens.push(a); });
      }
    }

    if (detectedAllergens.length > 0) {
      const safeProducts = filterProductsWithoutAllergens(products, detectedAllergens);
      const allergenNames = formatAllergenList(detectedAllergens);

      // Mostrar también qué productos SÍ contienen ese alérgeno
      const unsafeProducts = products.filter((p) =>
        p.available && (p.allergens || []).some((a) => detectedAllergens.includes(a))
      );
      const warningText = unsafeProducts.length > 0
        ? `\n\nEvita: ${unsafeProducts.map((p) => p.name).slice(0, 5).join(', ')}${unsafeProducts.length > 5 ? '...' : ''}`
        : '';

      if (safeProducts.length > 0) {
        return {
          text: `He filtrado productos sin ${allergenNames}. Estos son aptos para ti ✅${warningText}`,
          suggested: safeProducts.slice(0, 6),
        };
      }
      return {
        text: `No he encontrado productos sin ${allergenNames} en la carta. Te recomiendo consultar con nuestro personal. 🙏`,
        suggested: [],
      };
    }
  }

  // Buscar productos con findProducts (ahora category-aware)
  const suggested = findProducts(q, products, activeCategoryId, categories);

  // Get active category name for context
  const activeCatName = categories.find((c) => c.id === activeCategoryId)?.name || '';

  if (q.includes('recomienda') || q.includes('sugieres') || q.includes('qué pido') || q.includes('que pido')) {
    const catContext = activeCatName ? ` de ${activeCatName}` : '';
    return {
      text: `¡Te recomiendo estos productos${catContext}! 🌟`,
      suggested,
    };
  }
  if (q.includes('frío') || q.includes('frio') || q.includes('refrescante')) {
    return {
      text: 'Para refrescarte te propongo esto 🧊',
      suggested,
    };
  }
  if (q.includes('dulce') || q.includes('postre') || q.includes('tarta')) {
    return {
      text: 'Si te apetece algo dulce, mira estas opciones 🍰',
      suggested,
    };
  }
  if (q.includes('cachimba') || q.includes('hookah') || q.includes('shisha')) {
    return {
      text: 'Estas son nuestras cachimbas más populares 💨',
      suggested,
    };
  }
  if (q.includes('compartir') || q.includes('grupo') || q.includes('amigos')) {
    return {
      text: 'Para compartir entre amigos, te recomiendo 👫',
      suggested,
    };
  }
  if (q.includes('sin cafeína') || q.includes('sin cafeina') || q.includes('descafeinado')) {
    return {
      text: 'Sin cafeína pero igual de ricos, prueba estos 🌿',
      suggested,
    };
  }
  if (q.includes('hola') || q.includes('buenas') || q.includes('hey')) {
    return {
      text: '¡Hola! 👋 Soy el asistente de ORDERLY. Puedo recomendarte bebidas, comida o cachimbas. También puedo filtrar por alergias o dietas. ¿Qué te apetece?',
      suggested: [],
    };
  }
  if (q.includes('gracias') || q.includes('perfecto') || q.includes('genial')) {
    return {
      text: '¡De nada! Si necesitas algo más, aquí estoy 😊',
      suggested: [],
    };
  }
  if (q.includes('precio') || q.includes('cuánto') || q.includes('cuanto') || q.includes('cuesta')) {
    const product = findSpecificProduct(q, products);
    if (product) {
      return {
        text: `"${product.name}" cuesta ${product.price.toFixed(2)} €.`,
        suggested: [product],
      };
    }
    return {
      text: 'Puedes ver los precios en el menú. ¿Quieres que te recomiende algo en concreto?',
      suggested: [],
    };
  }
  if (q.includes('cafeina') || q.includes('cafeína') || q.includes('energía') || q.includes('energia')) {
    return {
      text: 'Para darte un boost de energía, prueba esto ⚡',
      suggested,
    };
  }

  if (suggested.length > 0) {
    return {
      text: 'Mira lo que he encontrado para ti 👀',
      suggested,
    };
  }

  return {
    text: 'No estoy seguro de qué buscas. Prueba a decirme algo como "algo frío", "dulce", "cachimba", "sin gluten", "soy vegetariano" o "sin cafeína" 😊',
    suggested: [],
  };
}

export default function Chatbot({ products, categories, activeCategory }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);

  // Mensaje de bienvenida
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'bot',
          text: '¡Hola! 👋 Soy el asistente de ORDERLY. Puedo ayudarte a elegir qué pedir, filtrar por alergias y dietas, o decirte qué alérgenos tiene cada producto. Dime qué te apetece.',
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const { text: botText, suggested } = generateBotResponse(text, products, activeCategory, categories);
      const botMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'bot',
        text: botText,
        products: suggested,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, 600 + Math.random() * 800);
  };

  const handleAddProduct = (product: Product) => {
    addItem(product);
    // Mostrar alérgenos al añadir si los tiene
    const allergenWarning = (product.allergens && product.allergens.length > 0)
      ? `\nContiene: ${formatAllergenList(product.allergens)}`
      : '';
    const confirmMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'bot',
      text: `✅ He añadido "${product.name}" a tu pedido.${allergenWarning} ¿Algo más?`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, confirmMsg]);
  };

  if (!isOpen) {
    return (
      <button className={styles.fab} onClick={() => setIsOpen(true)} title="Asistente ORDERLY">
        <IoChatbubbleEllipsesOutline size={24} />
      </button>
    );
  }

  return (
    <>
      <div className={styles.overlay}>
        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <div className={styles.avatar}>🍽️</div>
              <div className={styles.headerText}>
                <h3>Asistente ORDERLY</h3>
                <span>Siempre disponible</span>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
              <IoClose size={18} />
            </button>
          </div>

          <div className={styles.messages}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.message} ${
                  msg.role === 'bot' ? styles.messageBot : styles.messageUser
                }`}
              >
                <div className={styles.bubble}>{msg.text}</div>
                {msg.products && msg.products.length > 0 && (
                  <div className={styles.productSuggestions}>
                    {msg.products.map((p) => (
                      <button
                        key={p.id}
                        className={styles.suggestionCard}
                        onClick={() => handleAddProduct(p)}
                      >
                        {p.image_url && (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className={styles.suggestionImg}
                          />
                        )}
                        <div className={styles.suggestionInfo}>
                          <span className={styles.suggestionName}>{p.name}</span>
                          <span className={styles.suggestionPrice}>
                            {p.price.toFixed(2)} €
                          </span>
                          {p.allergens && p.allergens.length > 0 && (
                            <span className={styles.suggestionAllergens}>
                              {p.allergens.map((a) => ALLERGEN_INFO[a]?.icon || '⚠️').join(' ')}
                            </span>
                          )}
                        </div>
                        <span className={styles.addTag}>+ Añadir</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className={`${styles.message} ${styles.messageBot}`}>
                <div className={`${styles.bubble} ${styles.typing}`}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.quickActions}>
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                className={styles.quickBtn}
                onClick={() => sendMessage(action)}
              >
                {action}
              </button>
            ))}
          </div>

          <div className={styles.inputBar}>
            <input
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Escribe tu pregunta..."
            />
            <button
              className={styles.sendBtn}
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
            >
              <IoSendOutline size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
