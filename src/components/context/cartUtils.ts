export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  discount?: number;
  category?: string;
  imageQuery?: string;
  ingredients?: string[];
  nutritionalInfo?: { calories: number; protein: number; fat: number; carbs: number };
  type?: string;
}

export const MAX_CART_ITEMS = 100;

export const isValidImageUrl = (url: string): boolean => {
  return /^https?:\/\/.*\.(png|jpg|jpeg|gif|svg|webp)(\?.*)?$/.test(url) || /^\/.*\.(png|jpg|jpeg|gif|svg|webp)(\?.*)?$/.test(url);
};

export const isValidProduct = (product: Product): boolean => {
  return (
    typeof product.id === 'string' &&
    product.id.trim().length > 0 &&
    typeof product.name === 'string' &&
    product.name.trim().length > 0 &&
    typeof product.price === 'number' &&
    product.price >= 0 &&
    typeof product.image === 'string' &&
    isValidImageUrl(product.image)
  );
};