import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import axios from 'axios';

export default function Cadastro() {
  const { register } = useAuth();
  const [loadingCep, setLoadingCep] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // --- Estados Pessoais ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- Estados de Erro ---
  const [passwordError, setPasswordError] = useState('');

  // --- Estados do Endereço ---
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  // --- Máscaras de Input ---
  const maskCPF = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskPhone = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
  };

  const maskDate = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{4})\d+?$/, '$1');
  };

  // --- Lógica de CEP ---
  const fetchAddressByCep = async (cepValue: string) => {
    const formattedCep = cepValue.replace(/[^0-9]/g, '');
    if (formattedCep.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${formattedCep}/json/`);
      if (response.data.erro) {
        Alert.alert('CEP Não Encontrado', 'Verifique o código postal.');
        setIsLocked(false);
      } else {
        setStreet(response.data.logradouro);
        setNeighborhood(response.data.bairro);
        setCity(response.data.localidade);
        setState(response.data.uf);
        setIsLocked(true);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível buscar o CEP.');
    } finally {
      setLoadingCep(false);
    }
  };

  // --- Submissão do Formulário ---
  const handleRegister = async () => {
    setPasswordError('');

    // 1. Verificação de Campos Obrigatórios
    if (!name || !email || !cpf || !phone || !birthdate || !password || !confirmPassword || !cep || !street || !number || !city || !state) {
      Alert.alert('Atenção', 'Todos os campos com * são de preenchimento obrigatório.');
      return;
    }

    // 2. Validação de Senha (8 dígitos)
    if (password.length < 8) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    // 3. Verificação de Confirmação de Senha
    if (password !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }

    // 4. Validação de Maioridade (+18)
    const dateParts = birthdate.split('/');
    if (dateParts.length === 3) {
      const birthDateObj = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
      const today = new Date();
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const m = today.getMonth() - birthDateObj.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) age--;

      if (age < 18) {
        Alert.alert('Insucesso', 'Registo permitido apenas para maiores de 18 anos.');
        return;
      }
    }

    const addressData = { cep, street, number, complement, neighborhood, city, state };
    const userData = { name, email, cpf, phone, birthdate, password };

    const result = await register(userData, addressData);
    if (result && result.error) {
      Alert.alert('Erro no Cadastro', result.error);
    }
  };

  return (
    <ScrollView style={styles.scroll}>
      <View style={styles.container}>
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.requiredLegend}>* Todos os campos são obrigatórios</Text>

        <Text style={styles.sectionTitle}>Dados Pessoais</Text>

        <Text style={styles.label}>Nome Completo *</Text>
        <TextInput style={styles.input} placeholder="Seu nome" value={name} onChangeText={setName} />

        <Text style={styles.label}>E-mail *</Text>
        <TextInput style={styles.input} placeholder="exemplo@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>CPF *</Text>
        <TextInput style={styles.input} placeholder="000.000.000-00" value={cpf} onChangeText={t => setCpf(maskCPF(t))} keyboardType="numeric" maxLength={14} />

        <Text style={styles.label}>Telefone *</Text>
        <TextInput style={styles.input} placeholder="(00) 00000-0000" value={phone} onChangeText={t => setPhone(maskPhone(t))} keyboardType="phone-pad" maxLength={15} />

        <Text style={styles.label}>Data de Nascimento *</Text>
        <TextInput style={styles.input} placeholder="DD/MM/AAAA" value={birthdate} onChangeText={t => setBirthdate(maskDate(t))} keyboardType="numeric" maxLength={10} />

        <Text style={styles.label}>Senha (mínimo 8 dígitos) *</Text>
        <TextInput style={[styles.input, passwordError ? styles.inputError : null]} placeholder="Crie sua senha" value={password} onChangeText={setPassword} secureTextEntry />

        <Text style={styles.label}>Confirmar Senha *</Text>
        <TextInput style={[styles.input, passwordError ? styles.inputError : null]} placeholder="Repita a senha" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        <Text style={styles.sectionTitle}>Endereço Principal</Text>

        <Text style={styles.label}>CEP *</Text>
        <View style={styles.cepContainer}>
          <TextInput style={styles.cepInput} placeholder="00000-000" value={cep} onChangeText={t => { setCep(t); if (t.length === 0) setIsLocked(false); }} keyboardType="numeric" maxLength={9} onBlur={() => fetchAddressByCep(cep)} />
          {loadingCep && <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 10 }} />}
        </View>

        <Text style={styles.label}>Rua *</Text>
        <TextInput style={[styles.input, isLocked && styles.inputDisabled]} value={street} editable={!isLocked} onChangeText={setStreet} />

        <Text style={styles.label}>Bairro *</Text>
        <TextInput style={[styles.input, isLocked && styles.inputDisabled]} value={neighborhood} editable={!isLocked} onChangeText={setNeighborhood} />

        <View style={styles.row}>
          <View style={styles.flexHalf}>
            <Text style={styles.label}>Número *</Text>
            <TextInput style={styles.input} placeholder="123" value={number} onChangeText={setNumber} keyboardType="numeric" />
          </View>
          <View style={styles.flexHalf}>
            <Text style={styles.label}>Complemento</Text>
            <TextInput style={styles.input} placeholder="Apto, Bloco" value={complement} onChangeText={setComplement} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.flexLarge}>
            <Text style={styles.label}>Cidade *</Text>
            <TextInput style={[styles.input, isLocked && styles.inputDisabled]} value={city} editable={!isLocked} onChangeText={setCity} />
          </View>
          <View style={styles.flexSmall}>
            <Text style={styles.label}>UF *</Text>
            <TextInput style={[styles.input, isLocked && styles.inputDisabled]} value={state} editable={!isLocked} maxLength={2} onChangeText={setState} />
          </View>
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Finalizar Cadastro</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Já tem conta? Faça Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.light.background },
  container: { flex: 1, padding: 20, paddingTop: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.primary, textAlign: 'center', marginBottom: 10 },
  requiredLegend: { fontSize: 12, color: '#ee4d2d', textAlign: 'center', marginBottom: 20, fontStyle: 'italic' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 10, marginBottom: 15, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 5 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
  input: { height: 48, borderColor: Colors.grey, borderWidth: 1, borderRadius: 8, marginBottom: 15, paddingHorizontal: 12, fontSize: 15, backgroundColor: Colors.white },
  inputDisabled: { backgroundColor: '#f2f2f2', color: '#888' },
  inputError: { borderColor: '#ee4d2d', borderWidth: 1.5 },
  errorText: { color: '#ee4d2d', fontSize: 12, marginTop: -10, marginBottom: 15, fontWeight: 'bold' },
  cepContainer: { flexDirection: 'row', alignItems: 'center' },
  cepInput: { flex: 1, height: 48, borderColor: Colors.grey, borderWidth: 1, borderRadius: 8, marginBottom: 15, paddingHorizontal: 12, backgroundColor: Colors.white },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  flexHalf: { width: '48%' },
  flexLarge: { width: '68%' },
  flexSmall: { width: '28%' },
  registerButton: { backgroundColor: Colors.primary, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  registerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { textAlign: 'center', color: Colors.secondary, marginTop: 20, fontSize: 15, paddingBottom: 40 },
});