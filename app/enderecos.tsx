import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../constants/Config'; //

export default function AddressesPage() {
  const { user } = useAuth(); //
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Busca os endereços no backend
  const fetchAddresses = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Ajustado para usar o endpoint correto do seu servidor
      const response = await axios.get(`${API_URL}/addresses/user/${user.id}`);
      setAddresses(response.data);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar os seus endereços.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [user])
  );

  const handleRemoveAddress = async (addressId: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja remover este endereço?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim', onPress: async () => {
            try {
              await axios.delete(`${API_URL}/addresses/${addressId}`);
              fetchAddresses();
            } catch (e) {
              Alert.alert('Erro', 'Não foi possível remover o endereço.');
            }
          }
        }
      ]
    );
  };

  const renderAddress = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardStreet} numberOfLines={1}>
          {item.street}, {item.number}
        </Text>
        {item.isPrimary && (
          <View style={styles.primaryBadge}>
            <Text style={styles.primaryText}>Principal</Text>
          </View>
        )}
      </View>

      <Text style={styles.cardComplement}>
        {item.neighborhood}{item.complement ? ` - ${item.complement}` : ''}
      </Text>

      <Text style={styles.cardCity}>
        {item.city} - {item.state} / {item.zipCode}
      </Text>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push({ pathname: '/adicionar-endereco', params: { ...item } })}
        >
          <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleRemoveAddress(item.id)}>
          <Ionicons name="trash-outline" size={18} color={Colors.primary} />
          <Text style={styles.actionText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Configuração do Cabeçalho */}
      <Stack.Screen
        options={{
          title: 'Meus Endereços',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleAlign: 'center',
          // 👇 BOTÃO DE VOLTAR CONFIGURADO AQUI
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/adicionar-endereco')}>
              <Ionicons name="add" size={30} color={Colors.white} style={{ marginRight: 15 }} />
            </TouchableOpacity>
          ),
        }}
      />

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAddress}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={50} color={Colors.grey} />
              <Text style={styles.emptyText}>Nenhum endereço cadastrado.</Text>
            </View>
          ) : null
        }
      />

      {/* Botão Flutuante (FAB) como alternativa de navegação */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/adicionar-endereco')}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGrey,
  },
  listContainer: {
    padding: 10,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: Colors.grey,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 5,
    borderLeftColor: Colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  cardStreet: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  primaryBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  primaryText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardComplement: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cardCity: {
    fontSize: 14,
    color: Colors.grey,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    padding: 5,
  },
  actionText: {
    color: Colors.primary,
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: Colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});