import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import axios from 'axios'; // Precisamos do axios aqui

export default function Cadastro() {
  const { register } = useAuth(); // Esta função será atualizada no AuthContext
  const [loadingCep, setLoadingCep] = useState(false);

  // --- Estados dos Dados Pessoais ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [password, setPassword] = useState('');

  // --- Estados do Endereço ---
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState(''); // Bairro
  const [city, setCity] = useState('');
  const [state, setState] = useState(''); // UF
  const maskCPF = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove tudo o que não é dígito
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após os primeiros 3 dígitos
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca ponto após os segundos 3 dígitos
      .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca hífen após os terceiros 3 dígitos
      .replace(/(-\d{2})\d+?$/, '$1'); // Limita a 11 dígitos numéricos
  };

  const maskDate = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove tudo o que não é dígito
      .replace(/(\d{2})(\d)/, '$1/$2') // Coloca barra após o dia
      .replace(/(\d{2})(\d)/, '$1/$2') // Coloca barra após o mês
      .replace(/(\d{4})\d+?$/, '$1'); // Limita a 8 dígitos numéricos (DD/MM/AAAA)
  };

  // ⚡ FUNÇÃO DA API VIACEP
  const fetchAddressByCep = async (cepValue: string) => {
    const formattedCep = cepValue.replace(/[^0-9]/g, ''); // Limpa o CEP
    if (formattedCep.length !== 8) {
      return; // Não faz nada se não tiver 8 dígitos
    }

    setLoadingCep(true);
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${formattedCep}/json/`);
      const data = response.data;

      if (data.erro) {
        Alert.alert('CEP Não Encontrado', 'Verifique o CEP digitado.');
        clearAddressFields();
      } else {
        // Preenche os campos automaticamente
        setStreet(data.logradouro);
        setNeighborhood(data.bairro);
        setCity(data.localidade);
        setState(data.uf);
        // O usuário precisará focar no campo "Número"
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível buscar o CEP.');
    } finally {
      setLoadingCep(false);
    }
  };

  const clearAddressFields = () => {
    setStreet('');
    setNeighborhood('');
    setCity('');
    setState('');
  };

  // --- Função de Registro Atualizada ---
  const handleRegister = async () => {
    // Validação de todos os campos (pessoais + endereço)
    if (!name || !email || !password || !cpf || !phone || !birthdate || !cep || !street || !number || !city || !state) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    const addressData = { cep, street, number, complement, neighborhood, city, state };
    const userData = { name, email, cpf, phone, birthdate, password };

    // Passa tudo para a função 'register' do Context
    const result = await register(userData, addressData);
    if (result && result.error) {
      Alert.alert('Erro no Cadastro', result.error);
    }
  };

  return (
    <ScrollView style={styles.scroll}>
      <View style={styles.container}>
        <Text style={styles.title}>Criar Conta</Text>

        <Text style={styles.sectionTitle}>Dados Pessoais</Text>
        <TextInput style={styles.input} placeholder="Nome Completo" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextInput
          style={styles.input}
          placeholder="CPF (000.000.000-00)"
          value={cpf}
          onChangeText={(text) => setCpf(maskCPF(text))} // Aplica a máscara aqui
          keyboardType="numeric"
          maxLength={14} // Tamanho máximo com pontos e hífen
        />
        <TextInput style={styles.input} placeholder="Telefone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextInput
          style={styles.input}
          placeholder="Data de Nascimento (DD/MM/AAAA)" // Placeholder atualizado
          value={birthdate}
          onChangeText={(text) => setBirthdate(maskDate(text))} // Aplica a máscara aqui
          keyboardType="numeric"
          maxLength={10} // Tamanho máximo com as barras
        />
        <TextInput style={styles.input} placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />

        <Text style={styles.sectionTitle}>Endereço Principal</Text>
        <View style={styles.cepContainer}>
          <TextInput
            style={styles.cepInput}
            placeholder="CEP"
            value={cep}
            onChangeText={setCep}
            keyboardType="numeric"
            maxLength={9} // 00000-000
            onBlur={() => fetchAddressByCep(cep)} // 👈 A MÁGICA ACONTECE AQUI
          />
          {loadingCep && <ActivityIndicator size="small" color={Colors.primary} />}
        </View>

        <TextInput style={styles.input} placeholder="Logradouro (Rua, Av.)" value={street} onChangeText={setStreet} />
        <TextInput style={styles.input} placeholder="Bairro" value={neighborhood} onChangeText={setNeighborhood} />
        <View style={styles.row}>
          <TextInput style={[styles.input, styles.flexHalf]} placeholder="Número" value={number} onChangeText={setNumber} keyboardType="numeric" />
          <TextInput style={[styles.input, styles.flexHalf]} placeholder="Complemento" value={complement} onChangeText={setComplement} />
        </View>
        <View style={styles.row}>
          <TextInput style={[styles.input, styles.flexLarge]} placeholder="Cidade" value={city} onChangeText={setCity} />
          <TextInput style={[styles.input, styles.flexSmall]} placeholder="UF" value={state} onChangeText={setState} maxLength={2} />
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Cadastrar" onPress={handleRegister} color={Colors.primary} />
        </View>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Já tem conta? Faça Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// --- ESTILOS ATUALIZADOS ---
const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.light.background },
  container: { flex: 1, justifyContent: 'center', padding: 20, paddingTop: 60 },
  title: { fontSize: 32, fontWeight: 'bold', color: Colors.primary, textAlign: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 15, marginBottom: 10, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 5 },
  input: { height: 50, borderColor: Colors.grey, borderWidth: 1, borderRadius: 8, marginBottom: 15, paddingHorizontal: 15, fontSize: 16, backgroundColor: Colors.white },
  cepContainer: { flexDirection: 'row', alignItems: 'center' },
  cepInput: { flex: 1, height: 50, borderColor: Colors.grey, borderWidth: 1, borderRadius: 8, marginBottom: 15, paddingHorizontal: 15, fontSize: 16, backgroundColor: Colors.white },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  flexHalf: { flex: 0.48 },
  flexLarge: { flex: 0.7 },
  flexSmall: { flex: 0.28 },
  buttonContainer: { marginTop: 10 },
  link: { textAlign: 'center', color: Colors.secondary, marginTop: 20, fontSize: 16, paddingBottom: 40 },
});