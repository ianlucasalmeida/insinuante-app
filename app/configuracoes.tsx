import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/Colors';
import { router } from 'expo-router';
import axios from 'axios';
import { API_URL } from '../constants/Config'; // 1. Importação corrigida

export default function Configuracoes() {
  const { user, updateUserContext } = useAuth(); // 2. Uso de updateUserContext corrigido
  const [loading, setLoading] = useState(false);

  // Estados dos campos
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [birthdate, setBirthdate] = useState(user?.birthdate || '');
  
  // 3. Senhas iniciam vazias pois não existem no objeto User do contexto
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const maskPhone = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
  };

  const maskDate = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{4})\d+?$/, '$1');
  };

  const handleUpdate = async () => {
    if (!name || !phone || !birthdate) {
      Alert.alert("Erro", "Campos obrigatórios não podem ficar vazios.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      // 4. Chamada de API usando API_URL diretamente
      const response = await axios.put(`${API_URL}/users/${user?.id}`, {
        name,
        phone,
        birthdate,
        password: password || undefined // Só envia senha se o utilizador digitou algo
      });

      if (response.data) {
        // 5. Atualiza o contexto e o armazenamento persistente
        await updateUserContext(response.data); 
        Alert.alert("Sucesso", "Os seus dados foram atualizados!");
        router.back();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível atualizar os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Meus Dados Pessoais</Text>
        <Text style={styles.subtitle}>Edite as informações da sua conta Shopee.</Text>

        <Text style={styles.label}>Nome Completo</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Telemóvel</Text>
        <TextInput 
          style={styles.input} 
          value={phone} 
          onChangeText={(t) => setPhone(maskPhone(t))} 
          keyboardType="phone-pad"
          maxLength={15}
        />

        <Text style={styles.label}>Data de Nascimento</Text>
        <TextInput 
          style={styles.input} 
          value={birthdate} 
          onChangeText={(t) => setBirthdate(maskDate(t))} 
          keyboardType="numeric"
          maxLength={10}
        />

        <View style={styles.divider} />

        <Text style={styles.label}>Nova Senha (deixe vazio para não alterar)</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

        <Text style={styles.label}>Confirmar Nova Senha</Text>
        <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

        <TouchableOpacity 
          style={[styles.saveButton, loading && { backgroundColor: '#ccc' }]} 
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Alterações</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.primary, marginBottom: 5, marginTop: 40 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 25, marginTop: 2 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 5, marginTop: 10 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9'
  },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  saveButton: {
    backgroundColor: Colors.primary,
    height: 55,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 50
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});