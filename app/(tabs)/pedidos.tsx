import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Colors } from '../../constants/Colors';
import { useFocusEffect } from 'expo-router';
import { API_URL } from '../../constants/Config';

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API_URL}/orders/customer/${user.id}`);
      setOrders(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchOrders(); }, [user]));

  const renderOrder = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Pedido #{item.id.slice(0, 8)}</Text>
        <Text style={[styles.status, { color: item.status === 'A Enviar' ? Colors.primary : '#2ecc71' }]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.date}>{new Date(item.date).toLocaleDateString('pt-BR')}</Text>
      <View style={styles.itemsPreview}>
        {item.items.map((prod: any) => (
          <Text key={prod.id} style={styles.itemText}>• {prod.name} (x{prod.quantity})</Text>
        ))}
      </View>
      <Text style={styles.total}>Total: R$ {item.total.toFixed(2)}</Text>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" color={Colors.primary} style={{flex: 1}} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchOrders} />}
        ListEmptyComponent={<Text style={styles.empty}>Você ainda não fez nenhum pedido.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  orderCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  orderId: { fontWeight: 'bold', fontSize: 16 },
  status: { fontWeight: 'bold' },
  date: { color: '#888', marginBottom: 10 },
  itemsPreview: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10, marginBottom: 10 },
  itemText: { color: '#555', fontSize: 14 },
  total: { fontWeight: 'bold', fontSize: 18, textAlign: 'right', color: Colors.primary },
  empty: { textAlign: 'center', marginTop: 50, color: '#888' }
});