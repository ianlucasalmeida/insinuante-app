import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function Recuperar() {
  const [email, setEmail] = useState('');

  const handleRecover = () => {
    // Simulação
    Alert.alert(
      'Verifique seu Email',
      'Se o email estiver cadastrado, um link de recuperação foi enviado.'
    );
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={Colors.grey}
      />
      <Button title="Enviar Link" onPress={handleRecover} color={Colors.primary} />

      <TouchableOpacity onPress={() => router.back()}>
         <Text style={styles.link}>Voltar ao Login</Text>
      </TouchableOpacity>
    </View>
  );
}
// Copie os mesmos 'styles' da tela de Login/Cadastro
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: Colors.light.background },
  title: { fontSize: 32, fontWeight: 'bold', color: Colors.primary, textAlign: 'center', marginBottom: 30 },
  input: { height: 50, borderColor: Colors.grey, borderWidth: 1, borderRadius: 8, marginBottom: 15, paddingHorizontal: 15, fontSize: 16 },
  link: { textAlign: 'center', color: Colors.secondary, marginTop: 20, fontSize: 16 },
});