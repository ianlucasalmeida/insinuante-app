import { Stack } from 'expo-router';
import React from 'react';

// Layout para o grupo de autenticação (sem header)
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}