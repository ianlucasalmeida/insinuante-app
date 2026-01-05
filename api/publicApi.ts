import axios from 'axios';
import { API_URL } from '../constants/Config';

const api = axios.create({
  baseURL: API_URL,
});

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  images: string[];
  rating?: number;
  reviews?: number;
  sold?: number;
  // 👈 ADICIONA ESTE CAMPO:
  shop?: {
    id: string;
    name: string;
    image: string;
  };
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface OrderData {
  customerId: string;
  total: number;
  items: OrderItem[];
  paymentMethod: string;
  addressId: string;
  status: string;
  date: string;
}

// Busca os produtos que os Vendedores cadastraram no Shopee-Web
export const getProducts = async (search?: string, shopId?: string): Promise<Product[]> => {
  try {
    let url = '/products';
    const params = new URLSearchParams();
    
    if (search) params.append('search', search);
    if (shopId) params.append('shopId', shopId);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return [];
  }
};

export const createOrder = async (orderData: any) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    throw error;
  }
};

export const clearUserCart = async (userId: string) => {
  try {
    await api.delete(`/cart/user/${userId}`);
  } catch (error) {
    console.error("Erro ao limpar carrinho:", error);
  }
};

export const fetchCart = async (userId: string) => {
  const response = await api.get(`/cart/${userId}`);
  return response.data;
};

export const addToCart = async (itemData: any) => {
  const response = await api.post('/cart', itemData);
  return response.data;
};

export const updateCartQuantity = async (id: string, quantity: number) => {
  const response = await api.put(`/cart/${id}`, { quantity });
  return response.data;
};

export const removeFromCart = async (id: string) => {
  await api.delete(`/cart/${id}`);
};

export const toggleFavorite = async (userId: string, productId: string) => {
  const response = await api.post('/favorites/toggle', { userId, productId });
  return response.data; // { favorited: boolean }
};

export const getUserFavorites = async (userId: string): Promise<string[]> => {
  const response = await api.get(`/favorites/user/${userId}`);
  return response.data; // Retorna array de IDs: ["id1", "id2"]
};

export const getFavoriteProducts = async (userId: string): Promise<Product[]> => {
  try {
    const response = await api.get(`/favorites/details/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar produtos favoritos:", error);
    return [];
  }
};

export const getUserAddresses = async (userId: string) => {
  const response = await api.get(`/addresses/user/${userId}`);
  return response.data;
};

export const getShopDetails = async (shopId: string) => {
  try {
    const response = await api.get(`/shops/${shopId}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados da loja:", error);
    return null;
  }
};

export default api;