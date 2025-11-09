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
import { fetchAggregatedProducts, fetchPlatziCategories, Product } from '../../api/publicApi';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

// 1. Hook customizado para o "Debounce"
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Seta um timer para atualizar o valor
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpa o timer se o valor mudar (usuário continua digitando)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Roda de novo só se o valor ou o delay mudar

  return debouncedValue;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]); 
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Estados de Busca e Filtro ---
  const [searchQuery, setSearchQuery] = useState(''); // O que o usuário digita
  const [storeFilter, setStoreFilter] = useState<'all' | 'platzi' | 'fake-store'>('all');
  
  // 2. O valor "atrasado" (debounce) da busca
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Atraso de 300ms

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [fetchedProducts, fetchedCategories] = await Promise.all([
        fetchAggregatedProducts(),
        fetchPlatziCategories()
      ]);
      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setLoading(false);
    };
    loadData();
  }, []);

  // 3. A lógica de filtro agora usa o valor "atrasado"
  const filteredProducts = useMemo(() => {
    let items = products;

    if (storeFilter !== 'all') {
      items = items.filter(product => product.apiSource === storeFilter);
    }

    // Usa o 'debouncedSearchQuery' aqui!
    if (debouncedSearchQuery.trim() !== '') {
      const lowerCaseQuery = debouncedSearchQuery.toLowerCase();
      items = items.filter(product => 
        product.title.toLowerCase().includes(lowerCaseQuery)
      );
    }
    return items;
  }, [products, debouncedSearchQuery, storeFilter]); // Só recalcula quando o debounce mudar


  const handleProductPress = (product: Product) => {
    router.push({
      pathname: '/produto',
      params: { product: JSON.stringify(product) }
    });
  };

  if (loading) {
    return <View style={styles.loaderContainer}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  // --- Componentes de Renderização ---

  const renderCategory = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleProductPress(item)}>
      <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="contain" />
      <Text style={styles.cardApiSource}>{item.apiSource === 'platzi' ? 'Loja 1' : 'Loja 2'}</Text>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.cardPrice}>R$ {item.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  // 4. O Cabeçalho da Lista (AGORA SEM A BARRA DE BUSCA)
  const renderHeader = () => (
    <>
      {/* --- FILTRO DE LOJA --- */}
      <Text style={styles.sectionTitle}>Filtrar por Loja</Text>
      <View style={styles.storeFilterContainer}>
        {/* ... (Botões de filtro de loja - sem alteração) ... */}
         <TouchableOpacity
          style={[styles.storeButton, storeFilter === 'all' && styles.storeButtonActive]}
          onPress={() => setStoreFilter('all')}
        >
          <Text style={[styles.storeButtonText, storeFilter === 'all' && styles.storeButtonTextActive]}>Todas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.storeButton, storeFilter === 'platzi' && styles.storeButtonActive]}
          onPress={() => setStoreFilter('platzi')}
        >
          <Text style={[styles.storeButtonText, storeFilter === 'platzi' && styles.storeButtonTextActive]}>Loja 1 (Platzi)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.storeButton, storeFilter === 'fake-store' && styles.storeButtonActive]}
          onPress={() => setStoreFilter('fake-store')}
        >
          <Text style={[styles.storeButtonText, storeFilter === 'fake-store' && styles.storeButtonTextActive]}>Loja 2 (Fake API)</Text>
        </TouchableOpacity>
      </View>

      {/* --- CATEGORIAS --- */}
      <Text style={styles.sectionTitle}>Categorias</Text>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />

      <Text style={styles.sectionTitle}>Produtos</Text>
    </>
  );

  // 5. O RETORNO PRINCIPAL
  return (
    <View style={styles.container}>
      {/* --- BARRA DE BUSCA (FORA DA LISTA) --- */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.grey} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por item..."
          value={searchQuery}
          onChangeText={setSearchQuery} // 👈 Atualiza o 'searchQuery' (rápido)
          placeholderTextColor={Colors.grey}
        />
      </View>

      {/* --- A LISTA --- */}
      <FlatList
        data={filteredProducts} // Usa os produtos filtrados (pelo debounce)
        ListHeaderComponent={renderHeader}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        keyboardDismissMode="on-drag" // Teclado some ao rolar
        ListEmptyComponent={
          <Text style={styles.emptySearchText}>Nenhum produto encontrado para sua busca.</Text>
        }
      />
    </View>
  );
}

// --- ESTILOS (Sem grandes mudanças) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightGrey },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white },
  list: { paddingHorizontal: 8 },
  emptySearchText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: Colors.grey
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  // --- Estilos da Busca ---
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 5, // Espaço entre a busca e o resto
    paddingHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#333', 
  },
  // --- Estilos do Filtro de Loja ---
  storeFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  storeButton: {
    flex: 1,
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  storeButtonActive: {
    backgroundColor: Colors.primary,
  },
  storeButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  storeButtonTextActive: {
    color: Colors.white,
  },
  // --- Estilos do Card ---
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
  },
  cardImage: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  cardApiSource: {
    fontSize: 10,
    color: Colors.white,
    backgroundColor: Colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'absolute',
    top: 8,
    right: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    height: 40,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 6,
  },
  // --- Estilos da Categoria ---
  categoryList: { paddingHorizontal: 16, paddingBottom: 10 },
  categoryItem: { marginRight: 12, alignItems: 'center', width: 80 },
  categoryImage: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#eee', borderWidth: 2, borderColor: Colors.primary },
  categoryName: { marginTop: 5, fontSize: 12, color: '#555', textAlign: 'center' },
});