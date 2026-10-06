import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { SessionContext } from '../context/session';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [token, setToken] = useState<string | null>(null);
  const session = useMemo(() => ({ token, setToken }), [token]);
  return <SessionContext.Provider value={session}><ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}><Stack screenOptions={{ headerShown: false }} /></ThemeProvider></SessionContext.Provider>;
}
