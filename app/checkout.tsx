import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/Colors';
import { getUserAddresses, createOrder, clearUserCart } from '../api/publicApi';
import { useStripe, CardField } from '@stripe/stripe-react-native';
import axios from 'axios';
import { API_URL } from '../constants/Config';

export default function CheckoutPage() {
  const { confirmPayment } = useStripe();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const { total, cartItems: cartItemsString } = params;
  const cartItems = JSON.parse(cartItemsString as string);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Removidos estados individuais de número, validade e CVV.
  // O CardField gerencia isso internamente para o Stripe.

  useEffect(() => {
    if (user) {
      getUserAddresses(user.id.toString()).then(data => {
        setAddresses(data);
        if (data.length > 0) setSelectedAddress(data[0].id);
      });
    }
  }, [user]);

  const handleFinalizeOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Atenção', 'Selecione um endereço de entrega.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Pedir o clientSecret ao Backend
      const { data: { clientSecret } } = await axios.post(`${API_URL}/payments/intent`, {
        amount: Math.round(parseFloat(total as string) * 100)
      });

      // 2. Confirmar o pagamento
      // O confirmPayment agora detectará automaticamente os dados inseridos no CardField
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            name: user?.name,
            email: user?.email
          },
        },
      });

      if (error) {
        Alert.alert('Erro no Pagamento', error.message);
        setIsProcessing(false);
        return;
      }

      // 3. Se sucesso, cria o pedido no banco de dados
      if (paymentIntent?.status === 'Succeeded') {
        const orderData = {
          customerId: user?.id.toString(),
          total: parseFloat(total as string),
          paymentMethod: 'Cartão Stripe',
          addressId: selectedAddress,
          items: cartItems.map((item: any) => ({
            id: item.productId || item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          }))
        };

        await createOrder(orderData);
        await clearUserCart(user?.id.toString() || '');
        router.replace('/pedido-concluido');
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível processar a transação.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ title: 'Finalizar Compra', headerTitleAlign: 'center' }} />

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Endereço */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
          </View>
          {addresses.map(addr => (
            <TouchableOpacity
              key={addr.id}
              style={[styles.addressCard, selectedAddress === addr.id && styles.selectedCard]}
              onPress={() => setSelectedAddress(addr.id)}
            >
              <Text style={styles.addressText}>{addr.street}, {addr.number} - {addr.city}</Text>
              {selectedAddress === addr.id && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Itens do Pedido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
          {cartItems.map((item: any) => (
            <View key={item.id} style={styles.productRow}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text numberOfLines={1}>{item.name}</Text>
                <Text style={styles.productPrice}>R$ {item.price.toFixed(2)} x {item.quantity}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Métodos de Pagamento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de Pagamento</Text>
          <View style={styles.paymentToggle}>
            <TouchableOpacity
              style={[styles.methodBtn, paymentMethod === 'card' && styles.methodBtnActive]}
              onPress={() => setPaymentMethod('card')}
            >
              <Ionicons name="card-outline" size={20} color={paymentMethod === 'card' ? '#fff' : '#666'} />
              <Text style={[styles.methodText, paymentMethod === 'card' && styles.methodTextActive]}>Cartão</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.methodBtn, paymentMethod === 'pix' && styles.methodBtnActive]}
              onPress={() => setPaymentMethod('pix')}
            >
              <Ionicons name="qr-code-outline" size={20} color={paymentMethod === 'pix' ? '#fff' : '#666'} />
              <Text style={[styles.methodText, paymentMethod === 'pix' && styles.methodTextActive]}>PIX</Text>
            </TouchableOpacity>
          </View>

          {/* Área Dinâmica de Pagamento */}
          {paymentMethod === 'card' ? (
            <View style={styles.cardFormContainer}>
              <Text style={styles.label}>Dados do Cartão</Text>
              {/* 2. Substituídos TextInputs pelo CardField oficial */}
              <CardField
                postalCodeEnabled={false}
                cardStyle={{
                  backgroundColor: '#FFFFFF',
                  textColor: '#000000',
                  placeholderColor: '#999999',
                }}
                style={styles.cardField}
              />
            </View>
          ) : (
            <View style={styles.pixInfo}>
              <Text style={styles.pixText}>Você receberá um código PIX para copiar e colar no app do seu banco após clicar em confirmar.</Text>
            </View>
          )}
        </View>

        {/* Resumo de Valores */}
        <View style={styles.section}>
          <View style={styles.totalRow}><Text>Subtotal</Text><Text>R$ {total}</Text></View>
          <View style={styles.totalRow}><Text>Frete</Text><Text style={{ color: 'green' }}>Grátis</Text></View>
          <View style={[styles.totalRow, { marginTop: 10 }]}><Text style={styles.grandTotalText}>Total</Text><Text style={styles.grandTotalAmount}>R$ {total}</Text></View>
        </View>

      </ScrollView>

      {/* Botão Fixo */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleFinalizeOrder} disabled={isProcessing}>
          {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Confirmar Pedido</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1 },
  section: { backgroundColor: '#fff', padding: 15, marginBottom: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 5 },
  addressCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 8
  },
  selectedCard: { borderColor: Colors.primary, backgroundColor: '#fff5f2' },
  addressText: { color: '#444', fontSize: 14 },
  productRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'center' },
  productImage: { width: 50, height: 50, borderRadius: 4, marginRight: 10 },
  productInfo: { flex: 1 },
  productPrice: { color: '#888', fontSize: 13 },
  paymentToggle: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  methodBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, backgroundColor: '#f0f0f0' },
  methodBtnActive: { backgroundColor: Colors.primary },
  methodText: { marginLeft: 8, color: '#666', fontWeight: 'bold' },
  methodTextActive: { color: '#fff' },

  // Estilos do formulário Stripe
  cardFormContainer: { paddingVertical: 10 },
  label: { fontSize: 14, color: '#666', marginBottom: 8 },
  cardField: { width: '100%', height: 50, marginVertical: 10 },

  pixInfo: { padding: 15, backgroundColor: '#e3f2fd', borderRadius: 8 },
  pixText: { color: '#1976d2', fontSize: 13, textAlign: 'center' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  grandTotalText: { fontSize: 18, fontWeight: 'bold' },
  grandTotalAmount: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 15, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  confirmBtn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 8, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});