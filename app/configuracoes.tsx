import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Colors } from '../constants/Colors';

// 🚨 IMPORTANTE: Use o mesmo IP do AuthContext!
const API_URL = 'http://192.168.1.73:3001'; // ⚠️ TROQUE AQUI!

export default function ConfigPage() {
  const { user, updateUserContext } = useAuth(); // Pega o usuário e a nova função
  
  // Estados para os campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Busca os dados atuais do usuário quando a tela carrega
  useEffect(() => {
    if (!user) return;
    
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Busca os dados FRESCOS do servidor
        const response = await axios.get(`${API_URL}/users/${user.id}`);
        const data = response.data;
        // Preenche os campos
        setName(data.name || '');
        setEmail(data.email || '');
        setCpf(data.cpf || '');
        setPhone(data.phone || '');
        setBirthdate(data.birthdate || '');
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível carregar seus dados.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  // 2. Salva as alterações
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    // Cria o objeto com os dados atualizados
    const updatedUser = {
      ...user, // Pega o ID e senha (que não mudamos)
      name,
      email,
      cpf,
      phone,
      birthdate,
      // NOTA: Não estamos atualizando a senha aqui, isso seria um fluxo separado
    };

    try {
      // 3. Faz a requisição PUT para o json-server
      const response = await axios.put(`${API_URL}/users/${user.id}`, updatedUser);
      
      // 4. Atualiza o AuthContext e o AsyncStorage!
      await updateUserContext(response.data);
      
      Alert.alert('Sucesso!', 'Seus dados foram atualizados.');
      router.back(); // Volta para o Perfil

    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />;
  }

  return (
    <>
      {/* Define o cabeçalho */}
      <Stack.Screen
        options={{
          title: 'Meus Dados Pessoais',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
        }}
      />
      <ScrollView style={styles.scroll}>
        <View style={styles.container}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholderTextColor={Colors.grey}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={Colors.grey}
          />

          <Text style={styles.label}>CPF</Text>
          <TextInput
            style={styles.input}
            value={cpf}
            onChangeText={setCpf}
            keyboardType="numeric"
            placeholderTextColor={Colors.grey}
          />
          
          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor={Colors.grey}
          />

          <Text style={styles.label}>Data de Nascimento (AAAA-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={birthdate}
            onChangeText={setBirthdate}
            placeholderTextColor={Colors.grey}
          />
          
          <Button 
            title={saving ? "Salvando..." : "Salvar Alterações"} 
            onPress={handleSave} 
            color={Colors.primary} 
            disabled={saving}
          />
        </View>
      </ScrollView>
    </>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGrey,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.lightGrey,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: Colors.grey,
    marginBottom: 5,
    marginLeft: 2,
  },
  input: {
    height: 50,
    backgroundColor: Colors.white,
    borderColor: Colors.grey,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
});