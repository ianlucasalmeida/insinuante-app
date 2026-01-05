import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Product, toggleFavorite, getUserFavorites } from '../api/publicApi';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../constants/Config';

export default function ProductDetail() {
  const { product: productString } = useLocalSearchParams();
  const { user } = useAuth();

  const [isFavorited, setIsFavorited] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  if (!productString || typeof productString !== 'string') {
    return <Text style={styles.errorText}>Produto não encontrado.</Text>;
  }

  const product: Product = JSON.parse(productString);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user && product.id) {
        try {
          const favorites = await getUserFavorites(user.id.toString());
          setIsFavorited(favorites.includes(product.id));
        } catch (e) {
          console.error("Erro ao verificar favoritos:", e);
        }
      }
    };
    checkFavoriteStatus();
  }, [user, product.id]);

  const handleToggleFavorite = async () => {
    if (!user) {
      Alert.alert('Login', 'Inicie sessão para favoritar.', [{ text: 'Login', onPress: () => router.push('/(auth)/login') }]);
      return;
    }
    try {
      const result = await toggleFavorite(user.id.toString(), product.id);
      setIsFavorited(result.favorited);
    } catch (e) {
      Alert.alert('Erro', 'Erro ao atualizar favoritos.');
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert('Login', 'Inicie sessão para comprar.', [{ text: 'Login', onPress: () => router.push('/(auth)/login') }]);
      return;
    }
    setIsAdding(true);
    try {
      await axios.post(`${API_URL}/cart`, {
        userId: user.id.toString(),
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
      router.push('/(tabs)/carrinho');
    } catch (e) {
      Alert.alert('Erro', 'Erro ao conectar com o servidor.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Produto',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerRight: () => (
            <TouchableOpacity onPress={handleToggleFavorite} style={{ marginRight: 15 }}>
              <Ionicons name={isFavorited ? "heart" : "heart-outline"} size={28} color={isFavorited ? "#ffffffff" : Colors.white} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container}>
        <Image source={{ uri: product.image }} style={styles.mainImage} resizeMode="contain" />

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.price}>R$ {product.price.toFixed(2)}</Text>

          <View style={styles.divider} />

          {/* 🏪 SEÇÃO DO VENDEDOR (ESTILO SHOPEE) */}
          <View style={styles.sellerSection}>
            <View style={styles.sellerHeader}>
              <Image
                source={{ uri: product.shop?.image || 'https://placehold.co/100' }}
                style={styles.sellerAvatar}
              />
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{product.shop?.name || 'Loja Parceira'}</Text>
                <Text style={styles.sellerStatus}>Ativo há 12 min</Text>
              </View>
              <TouchableOpacity
                style={styles.viewShopButton}
                onPress={() => router.push({
                  pathname: '/loja',
                  params: { shopId: product.shop?.id }
                })}
              >
                <Text style={styles.viewShopText}>Ver</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sellerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>125</Text>
                <Text style={styles.statLabel}>Produtos</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4.9</Text>
                <Text style={styles.statLabel}>Avaliação</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>99%</Text>
                <Text style={styles.statLabel}>Chat</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Descrição do Produto</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      </ScrollView>

      {/* Botão de Rodapé */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={handleAddToCart}
          disabled={isAdding}
        >
          {isAdding ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="cart-outline" size={24} color="#fff" />
              <Text style={styles.cartButtonText}> Adicionar ao Carrinho</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  mainImage: { width: '100%', height: 350, backgroundColor: '#fff' },
  infoContainer: { padding: 15, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '400', color: '#333', marginBottom: 8 },
  price: { fontSize: 24, fontWeight: 'bold', color: Colors.primary, marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 15 },

  // Estilos da Seção do Vendedor
  sellerSection: { paddingVertical: 5 },
  sellerHeader: { flexDirection: 'row', alignItems: 'center' },
  sellerAvatar: { width: 45, height: 45, borderRadius: 25, borderWidth: 1, borderColor: '#eee' },
  sellerInfo: { flex: 1, marginLeft: 12 },
  sellerName: { fontSize: 16, fontWeight: '500', color: '#333' },
  sellerStatus: { fontSize: 12, color: '#999' },
  viewShopButton: { borderWidth: 1, borderColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 2 },
  viewShopText: { color: Colors.primary, fontSize: 13 },
  sellerStats: { flexDirection: 'row', marginTop: 15, justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { color: Colors.primary, fontWeight: 'bold', fontSize: 14 },
  statLabel: { fontSize: 11, color: '#777' },
  statDivider: { width: 1, height: 20, backgroundColor: '#eee' },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  description: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 100 },

  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', padding: 12, borderTopWidth: 1, borderTopColor: '#eee' },
  cartButton: { backgroundColor: Colors.primary, flexDirection: 'row', padding: 15, borderRadius: 5, justifyContent: 'center', alignItems: 'center' },
  cartButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  errorText: { textAlign: 'center', marginTop: 50, color: 'red' }
});