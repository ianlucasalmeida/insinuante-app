import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  TextInput
} from 'react-native';
import { router } from 'expo-router';
import { getProducts, Product } from '../../api/publicApi';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

// Hook para o Debounce da busca
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const loadProducts = async (query?: string) => {
    setLoading(true);
    const data = await getProducts(query);
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // 2. Carregando dados do seu Backend (PostgreSQL)
  const loadData = async () => {
    try {
      setLoading(true);
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    loadProducts(text);
  };

  // 3. Lógica de filtro atualizada (usando 'name' em vez de 'title')
  const filteredProducts = useMemo(() => {
    let items = products;

    if (debouncedSearchQuery.trim() !== '') {
      const lowerCaseQuery = debouncedSearchQuery.toLowerCase();
      items = items.filter(product =>
        product.name.toLowerCase().includes(lowerCaseQuery)
      );
    }
    return items;
  }, [products, debouncedSearchQuery]);


  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/produto',
      params: { product: JSON.stringify(product) }
    });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // 4. Renderização do Produto (Ajustado para o novo modelo de dados)
  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleProductPress(item)}>
      <Image
        source={{ uri: item.image }}
        style={styles.cardImage}
        resizeMode="contain"
      />
      <Text style={styles.cardCategory}>{item.category}</Text>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>

      
      <View>
        <Text style={styles.cardPrice}>R$ {item.price.toFixed(2)}</Text>
        <Text style={styles.cardSold}>{item.sold || 0} vendidos</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      <Text style={styles.sectionTitle}>Produtos para Você</Text>
    </>
  );

  return (
    <View style={styles.container}>
      {/* BARRA DE BUSCA */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.grey} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar na Shopee"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.grey}
        />
      </View>

      {/* LISTA DE PRODUTOS */}
      <FlatList
        data={filteredProducts}
        ListHeaderComponent={renderHeader}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptySearchText}>Nenhum produto cadastrado ainda.</Text>
            <TouchableOpacity onPress={loadData} style={styles.refreshButton}>
              <Text style={styles.refreshButtonText}>Atualizar</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  list: { paddingHorizontal: 8, paddingBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 8,
    marginTop: 15,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 12,
    height: 45,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    // Removido alignItems: 'flex-start' para permitir preenchimento total da largura
  },
  
  cardImage: { width: '100%', height: 150, marginBottom: 8 },
  cardCategory: {
    fontSize: 10,
    color: Colors.primary,
    backgroundColor: '#fff0ee',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    marginBottom: 5,
  },
  
  cardTitle: { fontSize: 13, color: '#333', height: 36, marginBottom: 4 },
  cardPrice: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
  cardSold: { fontSize: 11, color: '#888', marginTop: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptySearchText: { fontSize: 16, color: '#999', marginBottom: 20 },
  refreshButton: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 5 },
  refreshButtonText: { color: '#fff', fontWeight: 'bold' },
});