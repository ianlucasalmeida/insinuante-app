import React, { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';

// Componente principal que usa o contexto
const RootLayoutNav = () => {
  const { user, loading } = useAuth();
  const segments = useSegments();
  
  useEffect(() => {
    if (loading) return; // Espera o contexto carregar o usuário

    const inAuthGroup = segments[0] === '(auth)';

    if (user && inAuthGroup) {
      // Usuário logado, mas na tela de auth? Redireciona para home.
      router.replace('/(tabs)');
    } else if (!user && !inAuthGroup) {
      // Usuário não logado e não está no grupo de auth? Redireciona para login.
      router.replace('/(auth)/login');
    }
  }, [user, loading, segments]);

  if (loading) {
    // Tela de carregamento enquanto o AsyncStorage é verificado
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Define as Stacks (Telas) principais do app
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen 
        name="produto" 
        options={{ 
          headerShown: true, 
          title: 'Detalhes do Produto',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
        }} 
      />
      <Stack.Screen 
        name="pedido-concluido" 
        options={{ 
          headerShown: true, 
          title: 'Pedido Concluído!',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
        }} 
      />
    </Stack>
  );
};

// Layout Raiz que envolve tudo no Provedor de Autenticação
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}