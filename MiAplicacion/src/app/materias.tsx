import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../context/session';
import { materiasApi, type Materia } from '../services/api';

export default function MateriasScreen() {
  const { token } = useSession();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [nombre, setNombre] = useState('');
  const [editando, setEditando] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState('');
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { router.replace('/'); return; }
    let active = true;
    materiasApi.listar(token)
      .then((data) => { if (active) setMaterias(data); })
      .catch((e: unknown) => { if (active) setError(e instanceof Error ? e.message : 'No se pudieron cargar las materias.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  async function refresh() {
    if (!token) return;
    setLoading(true); setError('');
    try { setMaterias(await materiasApi.listar(token)); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudieron cargar las materias.'); }
    finally { setLoading(false); }
  }

  async function agregar() {
    const value = nombre.trim();
    if (!token || !value) { setError('Escribe el nombre de la materia.'); return; }
    setGuardando(true); setError('');
    try {
      const creada = await materiasApi.crear(token, value);
      setMaterias((current) => [creada, ...current]);
      setNombre('');
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo agregar la materia.'); }
    finally { setGuardando(false); }
  }

  async function guardarEdicion(id: number) {
    const value = nombreEditado.trim();
    if (!token || !value) { setError('El nombre no puede quedar vacío.'); return; }
    setGuardando(true); setError('');
    try {
      const actualizada = await materiasApi.actualizar(token, id, value);
      setMaterias((current) => current.map((materia) => materia.id === id ? actualizada : materia));
      setEditando(null); setNombreEditado('');
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo editar la materia.'); }
    finally { setGuardando(false); }
  }

  function confirmarEliminacion(materia: Materia) {
    Alert.alert('Eliminar materia', `¿Quieres eliminar “${materia.nombre}”?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => { void eliminar(materia.id); } },
    ]);
  }

  async function eliminar(id: number) {
    if (!token) return;
    setError('');
    try {
      await materiasApi.eliminar(token, id);
      setMaterias((current) => current.filter((materia) => materia.id !== id));
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo eliminar la materia.'); }
  }

  if (!token) return null;
  return <SafeAreaView style={styles.safe}>
    <View style={styles.header}>
      <Pressable onPress={() => router.replace('/home' as Href)} style={styles.back}><Text style={styles.backText}>← Home</Text></Pressable>
      <Text style={styles.title}>Mis materias</Text>
      <Text style={styles.subtitle}>Organiza las materias de tu cuenta</Text>
    </View>
    <View style={styles.form}>
      <Text style={styles.formTitle}>Agregar materia</Text>
      <View style={styles.row}>
        <TextInput value={nombre} onChangeText={setNombre} placeholder="Nombre de la materia" placeholderTextColor="#8A99A9" style={styles.input} maxLength={100} returnKeyType="done" onSubmitEditing={agregar} />
        <Pressable style={[styles.addButton, guardando && styles.disabled]} onPress={agregar} disabled={guardando} accessibilityLabel="Agregar materia">
          {guardando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.addText}>＋</Text>}
        </Pressable>
      </View>
    </View>
    {error ? <Text style={styles.error}>{error}</Text> : null}
    {loading ? <View style={styles.loading}><ActivityIndicator color="#287A68" /><Text style={styles.secondaryText}>Cargando materias…</Text></View> :
      <FlatList data={materias} keyExtractor={(item) => String(item.id)} contentContainerStyle={styles.list} onRefresh={refresh} refreshing={loading}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyIcon}>📘</Text><Text style={styles.emptyTitle}>Todavía no tienes materias</Text><Text style={styles.secondaryText}>Agrega una materia arriba para empezar.</Text></View>}
        renderItem={({ item }) => <View style={styles.item}>
          {editando === item.id ? <>
            <TextInput value={nombreEditado} onChangeText={setNombreEditado} style={[styles.input, styles.editInput]} maxLength={100} autoFocus />
            <Pressable onPress={() => void guardarEdicion(item.id)} disabled={guardando} style={styles.action}><Text style={styles.saveText}>Guardar</Text></Pressable>
            <Pressable onPress={() => { setEditando(null); setNombreEditado(''); }} style={styles.action}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
          </> : <>
            <Text style={styles.book}>📚</Text><Text style={styles.itemName}>{item.nombre}</Text>
            <Pressable onPress={() => { setEditando(item.id); setNombreEditado(item.nombre); }} style={styles.iconButton} accessibilityLabel={`Editar ${item.nombre}`}><Text style={styles.editText}>Editar</Text></Pressable>
            <Pressable onPress={() => confirmarEliminacion(item)} style={styles.deleteButton} accessibilityLabel={`Eliminar ${item.nombre}`}><Text style={styles.deleteText}>×</Text></Pressable>
          </>}
        </View>}
      />}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F7FB' }, header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 }, back: { alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 12 }, backText: { color: '#287A68', fontWeight: '800', fontSize: 15 }, title: { color: '#183B56', fontWeight: '800', fontSize: 30, marginTop: 8 }, subtitle: { color: '#71849A', fontSize: 15, marginTop: 4 },
  form: { margin: 20, marginTop: 10, backgroundColor: '#FFFFFF', padding: 18, borderRadius: 20, gap: 12, borderWidth: 1, borderColor: '#E3EAF1' }, formTitle: { color: '#183B56', fontSize: 18, fontWeight: '800' }, row: { flexDirection: 'row', gap: 10 }, input: { flex: 1, borderWidth: 1, borderColor: '#D7E1EA', borderRadius: 13, paddingHorizontal: 14, color: '#183B56', fontSize: 15, backgroundColor: '#FAFCFE', minHeight: 50 }, addButton: { width: 50, height: 50, backgroundColor: '#287A68', borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, addText: { color: '#FFFFFF', fontSize: 27, fontWeight: '600' }, disabled: { opacity: 0.65 },
  list: { padding: 20, paddingTop: 0, gap: 12, flexGrow: 1 }, item: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E3EAF1' }, book: { fontSize: 22 }, itemName: { flex: 1, color: '#183B56', fontWeight: '700', fontSize: 15 }, editInput: { minWidth: 100, paddingHorizontal: 10 }, action: { paddingHorizontal: 4, paddingVertical: 8 }, iconButton: { paddingHorizontal: 6, paddingVertical: 8 }, editText: { color: '#287A68', fontWeight: '700', fontSize: 13 }, saveText: { color: '#287A68', fontWeight: '800', fontSize: 13 }, cancelText: { color: '#71849A', fontWeight: '700', fontSize: 13 }, deleteButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' }, deleteText: { color: '#9B3940', fontSize: 24 },
  error: { color: '#9B3940', marginHorizontal: 20, marginBottom: 10, fontWeight: '600' }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }, empty: { flex: 1, minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 8 }, emptyIcon: { fontSize: 34 }, emptyTitle: { color: '#183B56', fontSize: 18, fontWeight: '800' }, secondaryText: { color: '#71849A', fontSize: 14 },
});
