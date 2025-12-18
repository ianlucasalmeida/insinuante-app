import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Button,
  ActivityIndicator
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

// 🚨 IMPORTANTE: Use o mesmo IP do AuthContext!
const API_URL = 'http://192.168.1.73:3001'; // ⚠️ TROQUE AQUI!

export default function CheckoutPage() {
  const { user } = useAuth();
  const params = useLocalSearchParams();

  // Recebe os dados da tela do Carrinho
  const { total, cartItems: cartItemsString } = params;
  const cartItems = JSON.parse(cartItemsString as string);

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' ou 'pix'
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados para o formulário de cartão
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Lógica de pagamento (A LÓGICA QUE ANTES ESTAVA NO CARRINHO)
  const handlePayment = async () => {
    if (!user) {
      Alert.alert('Erro', 'Sessão inválida. Faça login novamente.');
      return;
    }
    // 1. Validação (só se for cartão)
    if (paymentMethod === 'card') {
      if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
        Alert.alert('Erro', 'Preencha todos os dados do cartão.');
        return;
      }
      // (Aqui entraria a validação do Stripe/PayPal)
    }

    setIsProcessing(true);

    // 2. Cria o objeto do Pedido (Order)
    const order = {
      userId: user.id,
      items: cartItems.map((item: any ) => ({ // Salva os itens no pedido
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total: total,
      createdAt: new Date().toISOString(),
      paymentMethod: paymentMethod // Salva a forma de pagamento
    };

    try {
      // 3. Salva o pedido no db.json
      await axios.post(`${API_URL}/orders`, order);

      // 4. Limpa o carrinho (loop de DELETES)
      const deletePromises = cartItems.map((item: any) =>
        axios.delete(`${API_URL}/carts/${item.id}`)
      );
      await Promise.all(deletePromises);

      // 5. Redireciona para o Sucesso
      router.replace('/pedido-concluido');

    } catch (e) {
      console.error("Erro no Pagamento:", e);
      Alert.alert('Erro', 'Não foi possível processar seu pagamento.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Componente do Formulário de Cartão
  const CardForm = () => (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Nome no Cartão"
        value={cardName}
        onChangeText={setCardName}
        placeholderTextColor={Colors.grey}
      />
      <TextInput
        style={styles.input}
        placeholder="Número do Cartão (ex: 4242...)"
        value={cardNumber}
        onChangeText={setCardNumber}
        keyboardType="numeric"
        placeholderTextColor={Colors.grey}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.flexHalf]}
          placeholder="Validade (MM/AA)"
          value={cardExpiry}
          onChangeText={setCardExpiry}
          keyboardType="numeric"
          placeholderTextColor={Colors.grey}
        />
        <TextInput
          style={[styles.input, styles.flexHalf]}
          placeholder="CVV"
          value={cardCvv}
          onChangeText={setCardCvv}
          keyboardType="numeric"
          secureTextEntry
          placeholderTextColor={Colors.grey}
        />
      </View>
    </View>
  );

  // Componente de Simulação do PIX
  const PixDisplay = () => (
    <View style={styles.pixContainer}>
      <Text style={styles.pixText}>Pague com PIX para aprovação imediata:</Text>
      <Ionicons name="qr-code" size={180} color={Colors.black} />
      <Text style={styles.pixCode} selectable>00020126... (QR Code Simulado)</Text>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Pagamento',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.summary}>
          <Text style={styles.summaryText}>Total a Pagar:</Text>
          <Text style={styles.totalText}>R$ {total}</Text>
        </View>

        {/* Alternador de Pagamento */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, paymentMethod === 'card' && styles.toggleActive]}
            onPress={() => setPaymentMethod('card')}
          >
            <Ionicons name="card" size={20} color={paymentMethod === 'card' ? Colors.white : Colors.primary} />
            <Text style={[styles.toggleText, paymentMethod === 'card' && styles.toggleTextActive]}> Cartão</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, paymentMethod === 'pix' && styles.toggleActive]}
            onPress={() => setPaymentMethod('pix')}
          >
            <Ionicons name="qr-code" size={20} color={paymentMethod === 'pix' ? Colors.white : Colors.primary} />
            <Text style={[styles.toggleText, paymentMethod === 'pix' && styles.toggleTextActive]}> PIX</Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo (Formulário ou PIX) */}
        {paymentMethod === 'card' ? <CardForm /> : <PixDisplay />}

      </ScrollView>

      {/* Botão de Pagar (fixo no rodapé) */}
      <View style={styles.footer}>
        {isProcessing ? (
          <ActivityIndicator size="large" color={Colors.white} />
        ) : (
          <Button
            title={`Pagar R$ ${total}`}
            onPress={handlePayment}
            color={Colors.white}
            disabled={isProcessing}
          />
        )}
      </View>
    </>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGrey,
  },
  summary: {
    backgroundColor: Colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 18,
    color: Colors.grey,
  },
  totalText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  toggleContainer: {
    flexDirection: 'row',
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.white,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  toggleTextActive: {
    color: Colors.white,
  },
  form: {
    padding: 20,
    backgroundColor: Colors.white,
    margin: 20,
    borderRadius: 8,
  },
  input: {
    height: 50,
    borderColor: Colors.grey,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flexHalf: {
    flex: 0.48,
  },
  pixContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.white,
    margin: 20,
    borderRadius: 8,
  },
  pixText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  pixCode: {
    fontSize: 14,
    color: Colors.grey,
    marginTop: 10,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: Colors.primary,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 90,
  },
});