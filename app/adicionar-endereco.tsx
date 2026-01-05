import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/Colors';
import { API_URL } from '../constants/Config'; //
import { Ionicons } from '@expo/vector-icons';

export default function AdicionarEndereco() {
    const { user } = useAuth(); //
    const params = useLocalSearchParams(); // Captura parâmetros para edição
    const isEditing = !!params.id;

    const [loading, setLoading] = useState(false);
    const [isLocked, setIsLocked] = useState(isEditing);

    // --- Estados do Endereço ---
    // Inicializa com os dados recebidos se for edição
    const [cep, setCep] = useState(params.zipCode as string || '');
    const [street, setStreet] = useState(params.street as string || '');
    const [number, setNumber] = useState(params.number as string || '');
    const [complement, setComplement] = useState(params.complement as string || '');
    const [neighborhood, setNeighborhood] = useState(params.neighborhood as string || '');
    const [city, setCity] = useState(params.city as string || '');
    const [state, setState] = useState(params.state as string || '');
    const [isPrimary, setIsPrimary] = useState(params.isPrimary === 'true');

    // Máscara de CEP simples
    const maskCEP = (value: string) => {
        return value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1');
    };

    // --- Procura automática por CEP ---
    const fetchAddressByCep = async (cepValue: string) => {
        const cleanCep = cepValue.replace(/\D/g, '');
        if (cleanCep.length !== 8) return;

        setLoading(true);
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
            if (response.data.erro) {
                Alert.alert('CEP Não Encontrado', 'Verifique o código postal introduzido.');
                setIsLocked(false);
            } else {
                setStreet(response.data.logradouro);
                setNeighborhood(response.data.bairro);
                setCity(response.data.localidade);
                setState(response.data.uf);
                setIsLocked(true); // Bloqueia campos oficiais
            }
        } catch (error) {
            Alert.alert('Erro', 'Falha ao procurar o endereço.');
        } finally {
            setLoading(false);
        }
    };

    // --- Salvar (Criar ou Atualizar) ---
    const handleSave = async () => {
        if (!cep || !street || !number || !city || !state) {
            Alert.alert('Erro', 'Preencha todos os campos obrigatórios (*).');
            return;
        }

        setLoading(true);
        try {
            const addressData = {
                userId: user?.id,
                zipCode: cep.replace(/\D/g, ''),
                street,
                number,
                complement,
                neighborhood,
                city,
                state,
                isPrimary
            };

            if (isEditing) {
                // Rota de Edição
                await axios.put(`${API_URL}/addresses/${params.id}`, addressData);
                Alert.alert('Sucesso', 'Endereço atualizado!');
            } else {
                // Rota de Criação
                await axios.post(`${API_URL}/addresses`, addressData);
                Alert.alert('Sucesso', 'Endereço adicionado!');
            }

            router.back();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar o endereço.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen
                options={{
                    title: isEditing ? 'Editar Endereço' : 'Novo Endereço',
                    headerStyle: { backgroundColor: Colors.primary },
                    headerTintColor: Colors.white,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                            <Ionicons name="arrow-back" size={24} color={Colors.white} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <View style={styles.content}>
                <Text style={styles.label}>CEP *</Text>
                <View style={styles.cepRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="00000-000"
                        value={cep}
                        onChangeText={(t) => {
                            setCep(maskCEP(t));
                            if (t.length === 0) setIsLocked(false);
                        }}
                        onBlur={() => fetchAddressByCep(cep)}
                        keyboardType="numeric"
                        maxLength={9}
                    />
                    {loading && <ActivityIndicator color={Colors.primary} style={{ marginLeft: 10 }} />}
                </View>

                <Text style={styles.label}>Rua / Logradouro *</Text>
                <TextInput
                    style={[styles.input, isLocked && styles.disabled]}
                    value={street}
                    editable={!isLocked}
                    onChangeText={setStreet}
                    placeholder="Ex: Rua das Flores"
                />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.label}>Número *</Text>
                        <TextInput style={styles.input} value={number} onChangeText={setNumber} keyboardType="numeric" placeholder="123" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Complemento</Text>
                        <TextInput style={styles.input} value={complement} onChangeText={setComplement} placeholder="Apto, Bloco..." />
                    </View>
                </View>

                <Text style={styles.label}>Bairro *</Text>
                <TextInput
                    style={[styles.input, isLocked && styles.disabled]}
                    value={neighborhood}
                    editable={!isLocked}
                    onChangeText={setNeighborhood}
                />

                <View style={styles.row}>
                    <View style={{ flex: 3, marginRight: 10 }}>
                        <Text style={styles.label}>Cidade *</Text>
                        <TextInput style={[styles.input, isLocked && styles.disabled]} value={city} editable={!isLocked} onChangeText={setCity} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>UF *</Text>
                        <TextInput style={[styles.input, isLocked && styles.disabled]} value={state} editable={!isLocked} maxLength={2} onChangeText={setState} autoCapitalize="characters" />
                    </View>
                </View>

                <View style={styles.switchRow}>
                    <Text style={styles.label}>Definir como endereço principal</Text>
                    <Switch
                        value={isPrimary}
                        onValueChange={setIsPrimary}
                        trackColor={{ false: "#ccc", true: Colors.secondary }}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, loading && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    <Text style={styles.saveButtonText}>
                        {isEditing ? 'Guardar Alterações' : 'Adicionar Endereço'}
                    </Text>
                </TouchableOpacity>

                {/* Botão de Voltar/Cancelar no corpo */}
                <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                    <Text style={styles.cancelButtonText}>Cancelar e Voltar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { padding: 20 },
    label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5, marginTop: 28 },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 15,
        backgroundColor: '#fff',
    },
    disabled: { backgroundColor: '#f2f2f2', color: '#888' },
    cepRow: { flexDirection: 'row', alignItems: 'center' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    saveButton: {
        backgroundColor: Colors.primary,
        height: 55,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
    },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    cancelButton: {
        marginTop: 15,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 50
    },
    cancelButtonText: { color: Colors.grey, fontSize: 14, fontWeight: '500' }
});