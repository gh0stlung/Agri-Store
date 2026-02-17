export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string;
  stock: number;
  created_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  created_at: string;
  total_price: number;
  items: CartItem[]; // Stored as JSONB in Supabase
  status?: string;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}