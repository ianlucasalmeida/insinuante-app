import axios from 'axios';

const PLATZI_API = 'https://api.escuelajs.co/api/v1';
const FAKE_STORE_API = 'https://fakestoreapi.com';

// Interface Normalizada (Nosso modelo de Produto Padrão)
export interface Product {
  id: string; // ID único (ex: "platzi-1" ou "fake-store-1")
  originalId: number;
  apiSource: 'platzi' | 'fake-store';
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

// Converte um produto da Platzi para o nosso formato Product
const normalizePlatziProduct = (item: any): Product => ({
  id: `platzi-${item.id}`,
  originalId: item.id,
  apiSource: 'platzi',
  title: item.title,
  price: item.price,
  description: item.description,
  // Platzi usa um array 'images', pegamos a primeira
  image: (item.images && item.images.length > 0) ? item.images[0] : 'https://via.placeholder.com/150', 
  category: item.category.name,
});

// Converte um produto da Fake Store para o nosso formato Product
const normalizeFakeStoreProduct = (item: any): Product => ({
  id: `fake-store-${item.id}`,
  originalId: item.id,
  apiSource: 'fake-store',
  title: item.title,
  price: item.price,
  description: item.description,
  image: item.image, // Fake Store usa 'image' string
  category: item.category,
});

// Função principal que busca e mescla tudo
export const fetchAggregatedProducts = async (): Promise<Product[]> => {
  try {
    const [platziResponse, fakeStoreResponse] = await Promise.all([
      axios.get(`${PLATZI_API}/products?limit=20&offset=0`),
      axios.get(`${FAKE_STORE_API}/products?limit=20`)
    ]);

    const platziProducts = platziResponse.data.map(normalizePlatziProduct);
    const fakeStoreProducts = fakeStoreResponse.data.map(normalizeFakeStoreProduct);

    // Intercala os produtos para uma vitrine mais dinâmica
    let merged: Product[] = [];
    let i = 0;
    while (i < platziProducts.length || i < fakeStoreProducts.length) {
      if (platziProducts[i]) merged.push(platziProducts[i]);
      if (fakeStoreProducts[i]) merged.push(fakeStoreProducts[i]);
      i++;
    }
    
    return merged;

  } catch (error) {
    console.error("Failed to fetch aggregated products:", error);
    return [];
  }
};

// Função para buscar as categorias da Platzi (para o carrossel)
export const fetchPlatziCategories = async () => {
  try {
    const response = await axios.get(`${PLATZI_API}/categories?limit=10`);
    return response.data; // Retorna ex: [{ id: 1, name: 'Clothes', image: '...' }]
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
};