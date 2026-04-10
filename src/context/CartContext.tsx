// context/CartContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Product, CartItem, CartContextType } from '@/lib/types';

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_QUERY_KEY = ['cart'];

// 1. Função auxiliar para buscar do localStorage (substitui o useEffect de montagem)
const getCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    try {
      const parsedCart = JSON.parse(savedCart);
      // PERMITE ITENS ZERADOS: >= 0
      return parsedCart.filter((item: CartItem) => item.quantity >= 0);
    } catch (e) {
      console.error('Falha ao processar dados do carrinho', e);
      return [];
    }
  }
  return [];
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // 2. Usamos o useQuery para gerir o estado inicial (sem useState/useEffect)
  const { data: cartItems = [] } = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: getCartFromStorage,
    staleTime: Infinity, // O dado nunca fica obsoleto sozinho
  });

  // 3. Função centralizada para atualizar o estado e o localStorage (substitui o useEffect de salvamento)
  const updateCart = (updater: (prevItems: CartItem[]) => CartItem[]) => {
    queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, (oldItems = []) => {
      const newItems = updater(oldItems);
      // Salva no localStorage imediatamente
      if (typeof window !== 'undefined') {
        const itemsToSave = newItems.filter(item => item.quantity >= 0);
        localStorage.setItem('cart', JSON.stringify(itemsToSave));
      }
      return newItems;
    });
  };

  const addItemToCart = (product: Product, quantityToAdd: number = 1) => {
    updateCart((prevItems) => {
      const existingItem = prevItems.find((item) => item.codigo === product.codigo);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantityToAdd;
        // PERMITE ITENS ZERADOS: Agora só remove se for menor que 0
        if (newQuantity < 0) return prevItems.filter((item) => item.codigo !== product.codigo);
        
        return prevItems.map((item) =>
          item.codigo === product.codigo ? { ...item, quantity: newQuantity } : item
        );
      } else {
        if (quantityToAdd >= 0) {
          return [...prevItems, { ...product, quantity: quantityToAdd }];
        }
        return prevItems;
      }
    });
  };

  const removeItemFromCart = (productCodigo: number) => {
    updateCart((prevItems) => prevItems.filter((item) => item.codigo !== productCodigo));
  };

  const updateItemQuantity = (productCodigo: number, newQuantity: number) => {
    updateCart((prevItems) => {
      // PERMITE ITENS ZERADOS
      if (newQuantity < 0) return prevItems.filter((item) => item.codigo !== productCodigo);
      
      return prevItems.map((item) =>
        item.codigo === productCodigo ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.predesc !== undefined && item.predesc !== null ? item.predesc : item.preco;
      return total + price * item.quantity;
    }, 0);
  };

  const clearCart = () => {
    updateCart(() => []);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addItemToCart,
      removeItemFromCart,
      updateItemQuantity,
      calculateTotal,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}