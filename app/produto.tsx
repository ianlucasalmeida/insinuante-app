import { View, Text, Button, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import React from 'react';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Product } from '../api/publicApi'; 
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// 🚨 IMPORTANTE: Use o mesmo IP do AuthContext!
const API_URL = 'http://192.168.0.103:3001'; // ⚠️ VERIFIQUE SEU IP!

export default function ProductDetail() {
  const { product: productString } = useLocalSearchParams();
  const { user } = useAuth();
  
  if (!productString || typeof productString !== 'string') {
    return <Text>Produto não encontrado.</Text>;
  }

  const product: Product = JSON.parse(productString);

  // --- ⚡ LÓGICA CORRIGIDA AQUI ⚡ ---
  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert('Login Necessário', 'Você precisa estar logado.', [
        { text: 'OK', onPress: () => router.push('/(auth)/login') }
      ]);
      return;
    }

    try {
      // 1. Verifica se o item JÁ EXISTE no carrinho do usuário
      // A CORREÇÃO É AQUI: Adicionamos &productApiSource=${product.apiSource}
      // Isso garante que estamos checando (ex: productId=1 E apiSource='platzi')
      const checkResponse = await axios.get(
        `${API_URL}/carts?userId=${user.id}&productId=${product.originalId}&productApiSource=${product.apiSource}`
      );
      
      const existingItem = checkResponse.data[0];

      if (existingItem) {
        // 2. SE EXISTE: Atualiza a quantidade (PUT)
        const newQuantity = existingItem.quantity + 1;
        await axios.put(`${API_URL}/carts/${existingItem.id}`, {
          ...existingItem, 
          quantity: newQuantity,
        });
        
        Alert.alert('Quantidade Atualizada!', 'Mais um item foi adicionado ao carrinho.');

      } else {
        // 3. SE NÃO EXISTE: Cria um novo item (POST)
        const cartItem = {
          userId: user.id,
          productId: product.originalId,
          productApiSource: product.apiSource, // Salva a origem
          name: product.title,
          price: product.price,
          image: product.image,
          quantity: 1, 
        };
        await axios.post(`${API_URL}/carts`, cartItem);
        
        Alert.alert('Sucesso!', 'Produto adicionado ao carrinho.');
      }
      
      router.push('/(tabs)/carrinho'); 

    } catch (e) {
      console.error("Erro ao adicionar ao carrinho:", e);
      Alert.alert('Erro', 'Não foi possível adicionar o produto.');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Detalhes',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleAlign: 'center',
        }}
      />
      <ScrollView style={styles.container}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
        <View style={styles.details}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>R$ {product.price.toFixed(2)}</Text>
          <Text style={styles.description}>{product.description}</Text>
          <View style={styles.buttonContainer}>
            <Button title="Adicionar ao Carrinho" onPress={handleAddToCart} color={Colors.primary} />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

// --- ESTILOS (Sem alterações) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  image: { width: '100%', height: 300, backgroundColor: '#FFF', marginTop: 10 },
  details: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  price: { fontSize: 28, fontWeight: 'bold', color: Colors.primary, marginBottom: 15 },
  description: { fontSize: 16, color: Colors.grey, lineHeight: 24, marginBottom: 20 },
  buttonContainer: { marginVertical: 20 },
});