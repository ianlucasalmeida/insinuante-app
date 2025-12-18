import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  Alert // <-- ⚡ CORREÇÃO AQUI
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Colors } from '../../constants/Colors';
import { useFocusEffect } from 'expo-router';

// 🚨 IMPORTANTE: Verifique se este IP (192.168.0.103) ainda é o IP do seu Fedora!
// Se o "Network Error" continuar, é porque seu IP mudou.
const API_URL = 'http://192.168.1.73:3001'; 

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Busca pedidos e ordena do mais novo para o mais antigo
      const response = await axios.get(`${API_URL}/orders?userId=${user.id}&_sort=createdAt&_order=desc`);
      setOrders(response.data);
    } catch (e) {
      // Agora o Alert.alert() vai funcionar
      Alert.alert('Erro', 'Não foi possível carregar seus pedidos.');
      console.error("Erro ao buscar pedidos:", e); // Adiciona um log
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [user])
  );

  if (loading) {
    return <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />;
  }

  if (orders.length === 0) {
    return <View style={styles.container}><Text style={styles.emptyText}>Você ainda não fez nenhum pedido.</Text></View>;
  }

  const renderOrder = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Pedido #{item.id}</Text>
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleDateString('pt-BR')}
        </Text>
      </View>
      <View style={styles.orderBody}>
        {/* Lista os itens comprados */}
        {item.items.map((prod: any, index: number) => (
          <Text key={index} style={styles.orderItem}>
            {prod.quantity}x {prod.name}
          </Text>
        ))}
      </View>
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>Total: R$ {item.total}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrder}
        contentContainerStyle={{ padding: 10 }}
      />
    </View>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightGrey },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 50, textAlign: 'center', fontSize: 18, color: Colors.grey },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 10,
    marginBottom: 10,
  },
  orderId: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
  orderDate: { fontSize: 14, color: Colors.grey },
  orderBody: { marginBottom: 10 },
  orderItem: { fontSize: 14, color: '#444', marginBottom: 4 },
  orderFooter: { paddingTop: 10, borderTopWidth: 1, borderColor: '#eee' },
  orderTotal: { fontSize: 16, fontWeight: 'bold', textAlign: 'right' },
});