import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export default function OrderCompleted() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Pedido Confirmado',
          headerLeft: () => null, // Remove o botão de voltar para evitar que o usuário pague duas vezes
          headerTitleAlign: 'center',
        }} 
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Ícone de Sucesso animado ou estático */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-sharp" size={80} color={Colors.white} />
        </View>

        <Text style={styles.title}>Obrigado pela sua compra!</Text>
        <Text style={styles.subtitle}>
          Seu pagamento foi processado com sucesso e o vendedor já foi notificado.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>O que acontece agora?</Text>
          
          <View style={styles.stepRow}>
            <Ionicons name="time-outline" size={24} color={Colors.primary} />
            <Text style={styles.stepText}>O vendedor irá preparar o seu pacote para envio.</Text>
          </View>

          <View style={styles.stepRow}>
            <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
            <Text style={styles.stepText}>Você receberá uma notificação assim que o produto for postado.</Text>
          </View>

          <View style={styles.stepRow}>
            <Ionicons name="shield-checkmark-outline" size={24} color={Colors.primary} />
            <Text style={styles.stepText}>Sua compra está protegida pela Garantia Shopee.</Text>
          </View>
        </View>

        {/* Ações do Usuário */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.replace('/(tabs)/pedidos')}
          >
            <Text style={styles.primaryButtonText}>Ver Meus Pedidos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.secondaryButtonText}>Continuar Comprando</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 60,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#28a745', // Verde de sucesso
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    // Sombra para o círculo
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});