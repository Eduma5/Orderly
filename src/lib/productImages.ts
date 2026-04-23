import type { Product } from './types';

const IMAGE_BY_KEYWORD: Array<{ keywords: string[]; image: string }> = [
  { keywords: ['cafe', 'espresso', 'latte', 'cappuccino', 'cortado', 'bombon', 'affogato'], image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop' },
  { keywords: ['te', 'infusion', 'manzanilla', 'matcha', 'rooibos', 'chai'], image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&h=600&fit=crop' },
  { keywords: ['batido', 'smoothie', 'acai', 'açaí', 'zumo', 'limonada', 'granizado'], image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&h=600&fit=crop' },
  { keywords: ['croissant', 'napolitana', 'cookie', 'cheesecake', 'brownie', 'muffin', 'carrot cake', 'tarta'], image: 'https://images.unsplash.com/photo-1509365390695-33aee754301f?w=600&h=600&fit=crop' },
  { keywords: ['tosta', 'wrap', 'nachos', 'hummus', 'bikini', 'tortilla'], image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=600&h=600&fit=crop' },
  { keywords: ['refresco', 'agua', 'cerveza', 'tinto', 'mojito'], image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=600&h=600&fit=crop' },
  { keywords: ['cachimba', 'hookah', 'love 66'], image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&h=600&fit=crop' },
  { keywords: ['combo', 'brunch', 'merienda', 'especial'], image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&h=600&fit=crop' },
];

export function getBestProductImage(product: Product): string {
  const name = `${product.name} ${product.description || ''}`.toLowerCase();
  const match = IMAGE_BY_KEYWORD.find((entry) => entry.keywords.some((k) => name.includes(k)));
  if (match) return match.image;
  if (product.image_url) return product.image_url;
  return 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&h=600&fit=crop';
}
