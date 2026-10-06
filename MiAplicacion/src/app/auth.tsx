import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../context/session';
import { authApi } from '../services/api';

type Mode = 'login' | 'registro';

export default function AuthScreen() {
  const { setToken } = useSession();
  const [mode, setMode] = useState<Mode>('login'); const [nombre, setNombre] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); const [loading, setLoading] = useState(false);
  async function submit() {
    setMessage('');
    if (!email.trim() || !password) { setMessage('Completa el correo y la contraseña.'); return; }
    if (mode === 'registro' && !nombre.trim()) { setMessage('Completa tu nombre para registrarte.'); return; }
    setLoading(true);
    try {
      if (mode === 'registro') await authApi.registro({ nombre: nombre.trim(), email: email.trim(), password });
      const result = await authApi.login({ email: email.trim(), password });
      setToken(result.token);
      router.replace('/home' as Href);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'No se pudo conectar con la API.';
      setMessage(mode === 'registro' ? `No se pudo completar el registro: ${reason}` : reason);
    } finally { setLoading(false); }
  }
  return <SafeAreaView style={styles.safe}><View style={styles.content}>
    <Text style={styles.kicker}>MI APLICACIÓN · TAREAS</Text><Text style={styles.title}>{mode === 'login' ? 'Bienvenido' : 'Crear cuenta'}</Text><Text style={styles.subtitle}>Inicia sesión o regístrate para continuar.</Text>
    <View style={styles.card}>
      <View style={styles.switcher}><Pressable style={[styles.tab, mode === 'login' && styles.activeTab]} onPress={() => { setMode('login'); setMessage(''); }}><Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>Ingresar</Text></Pressable><Pressable style={[styles.tab, mode === 'registro' && styles.activeTab]} onPress={() => { setMode('registro'); setMessage(''); }}><Text style={[styles.tabText, mode === 'registro' && styles.activeTabText]}>Registrarme</Text></Pressable></View>
      {mode === 'registro' ? <TextInput value={nombre} onChangeText={setNombre} placeholder="Nombre" placeholderTextColor="#8A99A9" style={styles.input} autoCapitalize="words" /> : null}
      <TextInput value={email} onChangeText={setEmail} placeholder="Correo electrónico" placeholderTextColor="#8A99A9" style={styles.input} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
      <TextInput value={password} onChangeText={setPassword} placeholder="Contraseña" placeholderTextColor="#8A99A9" style={styles.input} secureTextEntry autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
      <Pressable style={[styles.button, loading && styles.disabled]} onPress={submit} disabled={loading}>{loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</Text>}</Pressable>
      {message ? <Text style={styles.error}>{message}</Text> : null}
    </View>
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F7FB' }, content: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 }, kicker: { color: '#55708E', fontSize: 12, fontWeight: '800', letterSpacing: 1.4 }, title: { color: '#183B56', fontSize: 32, fontWeight: '800' }, subtitle: { color: '#71849A', fontSize: 15, marginBottom: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 20, gap: 14, borderWidth: 1, borderColor: '#E3EAF1' }, switcher: { flexDirection: 'row', backgroundColor: '#F0F4F7', borderRadius: 13, padding: 4 }, tab: { flex: 1, alignItems: 'center', padding: 11, borderRadius: 10 }, activeTab: { backgroundColor: '#FFFFFF' }, tabText: { color: '#71849A', fontWeight: '700' }, activeTabText: { color: '#205E52' },
  input: { borderWidth: 1, borderColor: '#D7E1EA', borderRadius: 13, padding: 14, color: '#183B56', fontSize: 16, backgroundColor: '#FAFCFE' }, button: { backgroundColor: '#287A68', padding: 15, borderRadius: 13, alignItems: 'center', minHeight: 52, justifyContent: 'center' }, buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 }, disabled: { opacity: 0.65 }, error: { color: '#9B3940', fontWeight: '600', lineHeight: 21 },
});





