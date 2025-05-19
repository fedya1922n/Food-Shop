export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  discount?: number;
  category: string;
  imageQuery: string;
  ingredients: string[];
  nutritionalInfo: { calories: number; protein: number; fat: number; carbs: number };
  type: string;
}