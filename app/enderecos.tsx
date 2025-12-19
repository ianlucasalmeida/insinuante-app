import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator, Button, TouchableOpacity } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

// 🚨 IMPORTANTE: Use o mesmo IP do AuthContext!
const API_URL = 'http://192.168.1.64:3333'; // ⚠️ TROQUE AQUI!

export default function AddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Busca os endereços no db.json
  const fetchAddresses = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/addresses?userId=${user.id}`);
      setAddresses(response.data);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar seus endereços.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [user])
  );

  const handleRemoveAddress = async (addressId: number) => {
    // Lógica para deletar (ficará aqui)
    Alert.alert(
      'Confirmar Exclusão', 
      'Tem certeza que deseja remover este endereço?',
      [
        { text: 'Cancelar' },
        { text: 'Sim', onPress: async () => {
          try {
            await axios.delete(`${API_URL}/addresses/${addressId}`);
            fetchAddresses(); // Recarrega a lista
          } catch (e) {
            Alert.alert('Erro', 'Não foi possível remover o endereço.');
          }
        }}
      ]
    );
  };

  const renderAddress = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {item.isPrimary && (
        <View style={styles.primaryBadge}>
          <Text style={styles.primaryText}>Principal</Text>
        </View>
      )}
      <Text style={styles.cardStreet}>{item.street}, {item.complement}</Text>
      <Text style={styles.cardCity}>{item.city} - {item.state} / {item.zip}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="pencil" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleRemoveAddress(item.id)}>
          <Ionicons name="trash" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      {/* Define o cabeçalho */}
      <Stack.Screen
        options={{
          title: 'Meus Endereços',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerRight: () => (
            <TouchableOpacity onPress={() => alert('Tela de Adicionar Endereço (a construir)')}>
              <Ionicons name="add" size={30} color={Colors.white} style={{ marginRight: 15 }} />
            </TouchableOpacity>
          ),
        }}
      />
      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAddress}
        style={styles.container}
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} /> : null
        }
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>Nenhum endereço cadastrado.</Text> : null
        }
      />
    </>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGrey,
    padding: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: Colors.grey,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: Colors.primary,
  },
  primaryBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  primaryText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardStreet: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardCity: {
    fontSize: 14,
    color: Colors.grey,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  actionButton: {
    marginLeft: 20,
    padding: 5,
  },
});