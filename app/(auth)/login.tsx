import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }
    const result = await login(email, password);
    if (result && result.error) {
      Alert.alert('Erro no Login', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insinuante</Text>
      <TextInput
        style={styles.input}
        placeholder="Email (teste@insinuante.com)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={Colors.grey}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha (123)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={Colors.grey}
      />
      <Button title="Entrar" onPress={handleLogin} color={Colors.primary} />

      <Link href="/(auth)/cadastro" asChild>
        <TouchableOpacity>
          <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/(auth)/recuperar" asChild>
         <TouchableOpacity>
           <Text style={styles.link}>Esqueci minha senha</Text>
         </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: Colors.light.background 
  },
  title: { 
    fontSize: 36, 
    fontWeight: 'bold', 
    color: Colors.primary, 
    textAlign: 'center', 
    marginBottom: 30 
  },
  input: { 
    height: 50, 
    borderColor: Colors.grey, 
    borderWidth: 1, 
    borderRadius: 8, 
    marginBottom: 15, 
    paddingHorizontal: 15,
    fontSize: 16
  },
  link: { 
    textAlign: 'center', 
    color: Colors.secondary, 
    marginTop: 20,
    fontSize: 16
  },
});