import React, { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { View, ActivityIndicator, Platform } from 'react-native';
import { Colors } from '../constants/Colors';

// 1. Importação condicional para evitar erro no Web Bundling
let StripeProvider: any = ({ children }: any) => <>{children}</>;
try {
  if (Platform.OS !== 'web') {
    StripeProvider = require('@stripe/stripe-react-native').StripeProvider;
  }
} catch (e) {
  console.warn("Stripe não pôde ser carregado nativamente.");
}

const RootLayoutNav = () => {
  const { user, loading } = useAuth();
  const segments = useSegments();
  
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (user && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

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
      <Stack.Screen 
        name="checkout" 
        options={{ 
          headerShown: true, 
          title: 'Finalizar Compra',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
        }} 
      />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    // 2. O StripeProvider agora é seguro para Web (será apenas um Fragmento no navegador)
    <StripeProvider publishableKey="pk_test_51SlebQDdPE3WOrGj0spalcaUxUlcs8Yk6kMjvdx8paQIQMljxkO9XPHf7SmkTPLBN42709zlCEnrc30cAAaqIkH900WicWkJTU">
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </StripeProvider>
  );
}