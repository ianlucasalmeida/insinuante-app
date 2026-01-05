import { View, Text, StyleSheet, Button, ScrollView, TouchableOpacity, Switch } from 'react-native';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// 1. Defina a Interface para as Props
interface ProfileMenuItemProps {
  icon: keyof typeof Ionicons.glyphMap; // Garante que o nome do ícone seja válido
  text: string;
  onPress: () => void;
}

// 2. Aplique a Interface no Componente
const ProfileMenuItem = ({ icon, text, onPress }: ProfileMenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIcon}>
      <Ionicons name={icon} size={24} color={Colors.primary} />
    </View>
    <Text style={styles.menuText}>{text}</Text>
    <Ionicons name="chevron-forward" size={22} color={Colors.grey} />
  </TouchableOpacity>
);

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);

  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho do Perfil */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person-circle" size={80} color={Colors.primary} />
        </View>
        <Text style={styles.headerName}>{user?.name}</Text>
        <Text style={styles.headerEmail}>{user?.email}</Text>
      </View>

      {/* Menu de Navegação */}
      <View style={styles.menuSection}>
        <ProfileMenuItem
          icon="person-circle-outline"
          text="Meus Dados Pessoais"
          onPress={() => router.push('/configuracoes')}
        />
        <ProfileMenuItem
          icon="list"
          text="Meus Pedidos"
          onPress={() => router.push('/(tabs)/pedidos')}
        />
        <ProfileMenuItem
          icon="location-outline"
          text="Meus Endereços"
          onPress={() => router.push('/enderecos')}
        />
        <ProfileMenuItem
          icon="heart-outline"
          text="Favoritos"
          onPress={() => router.push('/favoritos')}
        />
      </View>

      {/* Seção de Configurações */}
      <View style={styles.menuSection}>
        <View style={styles.settingItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.menuText}>Notificações</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#ccc', true: Colors.secondary }}
            thumbColor={Colors.white}
          />
        </View>
      </View>
      
      {/* Logout */}
      <View style={styles.logoutButton}>
        <Button 
          title="Sair (Logout)" 
          onPress={logout}
          color={Colors.primary} 
        />
      </View>
    </ScrollView>
  );
}

// --- ESTILOS MANTIDOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightGrey },
 header: {
    backgroundColor: Colors.white,
    paddingVertical: 20,
    paddingHorizontal: 20, // 👈 Adicionado: Evita que o texto encoste nas bordas da tela
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
    width: '100%',          // 👈 Adicionado: Garante que o header ocupe a largura total
  },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  headerName: { fontSize: 22, fontWeight: 'bold', marginTop: 10, color: '#333' },
  headerEmail: {
    fontSize: 16,
    color: Colors.grey,
    marginTop: 4,
    textAlign: 'center',    // 👈 Adicionado: Garante que o texto longo expanda do centro para as bordas
    width: '100%',          // 👈 Adicionado: Permite que o texto use todo o espaço do container
  },
  menuSection: { backgroundColor: Colors.white, marginTop: 10, borderRadius: 8, marginHorizontal: 10, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: Colors.lightGrey },
  menuIcon: { width: 40, alignItems: 'center' },
  menuText: { flex: 1, fontSize: 16, color: '#333', marginLeft: 10 },
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  logoutButton: { margin: 20, marginTop: 30 }
});