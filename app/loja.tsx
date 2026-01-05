import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { getProducts, getShopDetails, Product } from '../api/publicApi'; //
import { Colors } from '../constants/Colors'; //
import { Ionicons } from '@expo/vector-icons';

export default function LojaPage() {
    const { shopId } = useLocalSearchParams<{ shopId: string }>();
    const [shop, setShop] = useState<any>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            if (!shopId) return;
            setLoading(true);
            const [shopData, productsData] = await Promise.all([
                getShopDetails(shopId), //
                getProducts(undefined, shopId) //
            ]);
            setShop(shopData);
            setProducts(productsData);
            setLoading(false);
        }
        loadData();
    }, [shopId]);

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity
            style={styles.productCard}
            onPress={() => router.push({ pathname: '/produto', params: { product: JSON.stringify(item) } })} //
        >
            <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="contain" />
            <Text style={styles.productTitle} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.productPrice}>R$ {item.price.toFixed(2)}</Text>
            <Text style={styles.productSold}>{item.sold || 0} vendidos</Text>
        </TouchableOpacity>
    );

    // 👇 FUNÇÃO PARA RENDERIZAR O CABEÇALHO DENTRO DO SCROLL
    const renderShopHeader = () => (
        <View>
            <View style={styles.shopHeader}>
                <Image source={{ uri: shop?.image || 'https://placehold.co/100' }} style={styles.shopLogo} />
                <View style={styles.shopInfo}>
                    <Text style={styles.shopName}>{shop?.name}</Text>
                    <Text style={styles.shopDescription}>
                        {shop?.description || 'Nenhuma descrição disponível.'}
                    </Text>
                </View>
            </View>

            <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Todos os Produtos</Text>
                <Text style={styles.productCount}>{products.length} itens</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                title: shop?.name || 'Loja',
                headerTintColor: Colors.primary
            }} />

            <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.list}
                // 👇 ESTA É A CHAVE: O cabeçalho agora desliza junto com os produtos
                ListHeaderComponent={renderShopHeader}
                ListEmptyComponent={<Text style={styles.emptyText}>Esta loja ainda não possui produtos.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    shopHeader: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 20,
        alignItems: 'flex-start', // Alinha logo ao topo com a descrição
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    shopLogo: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#f0f0f0' },
    shopInfo: { flex: 1, marginLeft: 15 },
    shopName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    shopDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 6,
        lineHeight: 20
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    productCount: { fontSize: 13, color: '#888' },
    list: { paddingBottom: 20 },
    productCard: {
        flex: 0.5, // Garante 2 colunas proporcionais
        margin: 6,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        elevation: 2,
    },
    productImage: { width: '100%', height: 140, marginBottom: 8 },
    productTitle: { fontSize: 13, color: '#333', height: 36, marginBottom: 4 },
    productPrice: { fontSize: 16, fontWeight: 'bold', color: Colors.primary }, //
    productSold: { fontSize: 11, color: '#888', marginTop: 4 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
});