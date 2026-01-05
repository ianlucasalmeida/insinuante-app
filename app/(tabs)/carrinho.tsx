import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Colors } from '../../constants/Colors';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../constants/Config';

export default function CartPage() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCartItems = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Rota corrigida: /cart/:userId
      const response = await axios.get(`${API_URL}/cart/${user.id}`);
      setCartItems(response.data);
    } catch (e) {
      console.error("Erro ao carregar carrinho:", e);
      Alert.alert('Erro', 'Não foi possível carregar o carrinho do PostgreSQL.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCartItems();
    }, [user])
  );

  const handleUpdateQuantity = async (item: any, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(item.id);
      return;
    }
    try {
      // Atualiza apenas a quantidade no banco
      await axios.put(`${API_URL}/cart/${item.id}`, {
        quantity: newQuantity,
      });
      fetchCartItems(); // Recarrega para garantir sincronia
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível atualizar a quantidade.');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await axios.delete(`${API_URL}/cart/${itemId}`);
      fetchCartItems();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível remover o item.');
    }
  };

  // --- ⚡ CORREÇÃO E ATUALIZAÇÃO AQUI ⚡ ---
  // A função de checkout agora passa os dados para a tela de pagamento
  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    // 1. Calcula o total
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 2. Navega para a tela de checkout
    // Passa o 'total' e os 'cartItems' (como string) para a próxima tela
    router.push({
      pathname: '/checkout',
      params: {
        total: total.toFixed(2),
        cartItems: JSON.stringify(cartItems)
      }
    });
  };

  // --- (Render Lógica) ---

  if (loading) {
    return <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />;
  }

  if (cartItems.length === 0) {
    return <View style={styles.container}><Text style={styles.emptyText}>Seu carrinho está vazio.</Text></View>;
  }

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>R$ {(item.price * item.quantity).toFixed(2)}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item, item.quantity - 1)}
          >
            <Ionicons name="remove" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item, item.quantity + 1)}
          >
            <Ionicons name="add" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={styles.removeButton}>
        <Ionicons name="trash-outline" size={24} color={Colors.grey} />
      </TouchableOpacity>
    </View>
  );

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
      {/* --- Footer --- */}
      <View style={styles.footer}>
        <Text style={styles.totalText}>Total: R$ {total.toFixed(2)}</Text>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          {/* O texto do botão continua o mesmo */}
          <Text style={styles.checkoutButtonText}>Finalizar Compra</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- ESTILOS (Sem alteração) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightGrey },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 50, textAlign: 'center', fontSize: 18, color: Colors.grey },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginVertical: 6,
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    resizeMode: 'contain'
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4
  },
  itemPrice: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  removeButton: {
    padding: 10,
    marginLeft: 'auto',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    padding: 5,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    borderRadius: 5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 15,
    minWidth: 20,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderColor: '#eee',
    padding: 20,
    elevation: 10,
  },
  totalText: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  checkoutButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
});