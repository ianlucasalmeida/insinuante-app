import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Product, toggleFavorite, getUserFavorites } from '../api/publicApi'; //
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext'; //
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';


const API_URL = 'http://192.168.1.64:3333';

export default function ProductDetail() {
  const { product: productString } = useLocalSearchParams();
  const { user } = useAuth(); //

  const [isFavorited, setIsFavorited] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  if (!productString || typeof productString !== 'string') {
    return <Text style={styles.errorText}>Produto não encontrado.</Text>;
  }

  const product: Product = JSON.parse(productString); //

  // 1. Verificar se o produto já está favoritado ao carregar
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

  // 2. Alternar Favorito (Coração)
  const handleToggleFavorite = async () => {
    if (!user) {
      Alert.alert('Ação Necessária', 'Inicie sessão para guardar favoritos.', [
        { text: 'Login', onPress: () => router.push('/(auth)/login') },
        { text: 'Cancelar', style: 'cancel' }
      ]);
      return;
    }

    try {
      const result = await toggleFavorite(user.id.toString(), product.id);
      setIsFavorited(result.favorited);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível atualizar os seus favoritos.');
    }
  };

  // 3. Adicionar ao Carrinho (Rota Profissional /cart)
  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert('Login Necessário', 'Inicie sessão para comprar.', [
        { text: 'Fazer Login', onPress: () => router.push('/(auth)/login') }
      ]);
      return;
    }

    setIsAdding(true);
    try {
      // O Prisma no backend já verifica se o item existe e soma a quantidade!
      const cartItem = {
        userId: user.id.toString(),
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      };

      // Rota unificada no singular: /cart
      await axios.post(`${API_URL}/cart`, cartItem);

      Alert.alert('Sucesso!', 'Produto adicionado ao seu carrinho.');
      router.push('/(tabs)/carrinho');

    } catch (e) {
      console.error("Erro ao adicionar ao carrinho:", e);
      Alert.alert('Erro', 'Ocorreu um problema ao conectar com o servidor.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Detalhes do Produto',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleAlign: 'center',
          // Ícone de Favorito no Cabeçalho
          headerRight: () => (
            <TouchableOpacity onPress={handleToggleFavorite} style={{ marginRight: 15 }}>
              <Ionicons
                name={isFavorited ? "heart" : "heart-outline"}
                size={28}
                color={isFavorited ? "#ff424e" : Colors.white}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
        </View>

        <View style={styles.details}>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.price}>R$ {product.price.toFixed(2)}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.buyButton, isAdding && { opacity: 0.7 }]}
              onPress={handleAddToCart}
              disabled={isAdding}
            >
              <Text style={styles.buyButtonText}>
                {isAdding ? 'Processando...' : 'Adicionar ao Carrinho'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  imageContainer: { backgroundColor: '#f9f9f9', width: '100%', height: 350, justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  details: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  price: { fontSize: 28, fontWeight: 'bold', color: Colors.primary, marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  description: { fontSize: 16, color: '#666', lineHeight: 24, marginBottom: 30 },
  buttonContainer: { marginBottom: 30 },
  buyButton: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },
  errorText: { textAlign: 'center', marginTop: 50, fontSize: 18, color: 'red' }
});