import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getFavoriteProducts, Product } from '../../api/publicApi';
import { useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function FavoritesScreen() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = async () => {
    if (!user) return;
    const data = await getFavoriteProducts(user.id.toString());
    setFavorites(data);
    setLoading(false);
    setRefreshing(false);
  };

  // Recarrega sempre que o utilizador entra na aba
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [user])
  );

  if (loading) {
    return <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>R$ {item.price.toFixed(2)}</Text>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadFavorites} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Você ainda não favoritou nenhum produto.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  loader: { flex: 1, justifyContent: 'center' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 1 },
  name: { fontSize: 16, fontWeight: 'bold' },
  price: { color: Colors.primary, fontWeight: 'bold', marginTop: 5 },
  emptyText: { textAlign: 'center', marginTop: 50, color: Colors.grey }
});