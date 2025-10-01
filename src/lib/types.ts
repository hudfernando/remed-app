// lib/types.ts

export interface Product {
  codigo: number; // Este é o ID agora
  descricao: string;
  descricaoFab: string;
  preco: number;
  desconto?: number;
  predesc?: number;
  emEstoque: boolean;
}


export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Filters {
  searchTerm: string;
  //codeFilter: string;
  fabricFilter: string;
}

export interface CartContextType {
  cartItems: CartItem[];
  addItemToCart: (product: Product, quantity: number) => void;
  removeItemFromCart: (productId: number) => void; // Mudei para number
  updateItemQuantity: (productId: number, newQuantity: number) => void; // Mudei para number
  calculateTotal: () => number;
  clearCart: () => void; // Adicionei clearCart que já está no seu CartContext
}

export interface OrderData {
  subject: string;
  cnpj: string;
  email: string;
  prazo: string;
  observacao: string; 
  products: {
    codigo: number;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }[];
  total: number;
}