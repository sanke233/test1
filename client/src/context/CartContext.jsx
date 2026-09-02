import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { token } = useAuth();
  const [items, setItems] = useState([]);

  const loadCart = useCallback(async () => {
    if (!token) { setItems([]); return; }
    try {
      const data = await api.get('/cart');
      setItems(data.sepet || []);
    } catch {
      setItems([]);
    }
  }, [token]);

  const addToCart = useCallback(async (productId, qty = 1) => {
    const data = await api.post('/cart', { urunId: productId, adet: qty });
    setItems(data.sepet || []);
    return data;
  }, []);

  const updateQty = useCallback(async (productId, qty) => {
    const data = await api.put('/cart/' + productId, { adet: qty });
    setItems(data.sepet || []);
    return data;
  }, []);

  const removeFromCart = useCallback(async (productId) => {
    const data = await api.delete('/cart/' + productId);
    setItems(data.sepet || []);
    return data;
  }, []);

  const clearCart = useCallback(async () => {
    try { await api.delete('/cart'); } catch {}
    setItems([]);
  }, []);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.fiyat * item.adet), 0);
  }, [items]);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.adet, 0);
  }, [items]);

  return (
    <CartContext.Provider value={{ items, loadCart, addToCart, updateQty, removeFromCart, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
