import { View, Text, StyleSheet, Button } from 'react-native';
import React from 'react';
import { Stack, router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function OrderSuccessPage() { // EXPORT DEFAULT EXISTE
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Pedido Concluído',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerLeft: () => null, 
        }}
      />
      <View style={styles.container}>
        <Ionicons name="checkmark-circle" size={100} color={Colors.primary} />
        <Text style={styles.title}>Obrigado!</Text>
        <Text style={styles.subtitle}>Seu pedido foi finalizado com sucesso.</Text>
        <Button
          title="Voltar para a Home"
          onPress={() => router.replace('/(tabs)/')}
          color={Colors.primary}
        />
      </View>
    </>
  );
}

// ...COPIE OS ESTILOS DA RESPOSTA ANTERIOR AQUI...
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.primary, marginTop: 20, marginBottom: 10 },
  subtitle: { fontSize: 18, color: Colors.grey, textAlign: 'center', marginBottom: 30 },
});