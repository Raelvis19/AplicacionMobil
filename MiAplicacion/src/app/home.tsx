import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../context/session';


const NOMBRE_ESTUDIANTE = 'Raelvis Paulino';
const CARNET_ESTUDIANTE = '2023-0724';

export default function HomeScreen() {
  const { token, setToken } = useSession();
  useEffect(() => { if (!token) router.replace('/'); }, [token]);
  if (!token) return null;
  return <SafeAreaView style={styles.safe}><View style={styles.content}>
    <Text style={styles.eyebrow}>INICIO</Text><View style={styles.hero}><Text style={styles.avatar}>👋</Text><Text style={styles.title}>¡Hola, {NOMBRE_ESTUDIANTE}!</Text><Text style={styles.subtitle}>Tu espacio personal está listo.</Text></View>
    <View style={styles.card}><Text style={styles.label}>NOMBRE</Text><Text style={styles.name}>{NOMBRE_ESTUDIANTE}</Text><Text style={styles.label}>CARNET</Text><Text style={styles.name}>{CARNET_ESTUDIANTE}</Text></View>
    <Pressable style={styles.primary} onPress={() => router.push('/explore')}><Text style={styles.primaryText}>Ir a mis tareas  →</Text></Pressable>
    <Pressable style={styles.secondary} onPress={() => { setToken(null); router.replace('/'); }}><Text style={styles.secondaryText}>Cerrar sesión</Text></Pressable>
    <Text style={styles.footer}>Tu cuenta está conectada con JWT</Text>
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F7FB' }, content: { flex: 1, padding: 24, justifyContent: 'center', gap: 18 }, eyebrow: { color: '#55708E', fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  hero: { backgroundColor: '#183B56', borderRadius: 28, padding: 28, gap: 8 }, avatar: { fontSize: 38 }, title: { color: '#FFFFFF', fontSize: 30, fontWeight: '800' }, subtitle: { color: '#D6E6F2', fontSize: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 22, gap: 7, borderWidth: 1, borderColor: '#E3EAF1' }, label: { color: '#71849A', fontSize: 11, fontWeight: '800', letterSpacing: 1.1, marginTop: 5 }, name: { color: '#183B56', fontSize: 19, fontWeight: '700', marginBottom: 4 },
  primary: { backgroundColor: '#287A68', padding: 17, borderRadius: 16, alignItems: 'center' }, primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }, secondary: { padding: 14, borderRadius: 16, backgroundColor: '#E3F0EC', alignItems: 'center' }, secondaryText: { color: '#205E52', fontSize: 15, fontWeight: '700' }, footer: { color: '#8998A8', textAlign: 'center', fontSize: 12 },
});
