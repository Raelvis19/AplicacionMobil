import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../context/session';
import { tareasApi, type Tarea } from '../services/api';

export default function TasksScreen() {
  const { token } = useSession();
  const [tasks, setTasks] = useState<Tarea[]>([]); const [titulo, setTitulo] = useState('');
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  useEffect(() => {
    if (!token) { router.replace('/'); return; }
    let active = true;
    tareasApi.listar(token)
      .then((data) => { if (active) setTasks(data); })
      .catch((e: unknown) => { if (active) setError(e instanceof Error ? e.message : 'No se pudieron cargar las tareas.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  async function refreshTasks() {
    if (!token) return;
    setLoading(true); setError('');
    try { setTasks(await tareasApi.listar(token)); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudieron cargar las tareas.'); }
    finally { setLoading(false); }
  }

  async function addTask() {
    if (!token || !titulo.trim()) { setError('Escribe el título de la tarea.'); return; }
    setSaving(true); setError('');
    try { const created = await tareasApi.crear(token, titulo.trim()); setTasks((current) => [...current, created]); setTitulo(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo crear la tarea.'); }
    finally { setSaving(false); }
  }
  async function toggleTask(task: Tarea) {
    if (!token) return;
    setError('');
    try { const updated = await tareasApi.actualizar(token, task, !task.completada); setTasks((current) => current.map((item) => item.id === task.id ? updated : item)); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo actualizar la tarea.'); }
  }
  async function removeTask(id: number) {
    if (!token) return;
    setError('');
    try { await tareasApi.eliminar(token, id); setTasks((current) => current.filter((task) => task.id !== id)); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo eliminar la tarea.'); }
  }

  if (!token) return null;
  return <SafeAreaView style={styles.safe}><View style={styles.header}><Pressable onPress={() => router.replace('/home' as Href)} style={styles.back}><Text style={styles.backText}>← Home</Text></Pressable><Text style={styles.title}>Mis tareas</Text><Text style={styles.subtitle}>Tus tareas guardadas en la API</Text></View>
    <View style={styles.createCard}><Text style={styles.formTitle}>Nueva tarea</Text><View style={styles.createRow}><TextInput value={titulo} onChangeText={setTitulo} placeholder="¿Qué necesitas hacer?" placeholderTextColor="#8A99A9" style={styles.input} returnKeyType="done" onSubmitEditing={addTask} /><Pressable style={[styles.addButton, saving && styles.disabled]} disabled={saving} onPress={addTask}>{saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.addText}>＋</Text>}</Pressable></View></View>
    {error ? <Text style={styles.error}>{error}</Text> : null}
    {loading ? <View style={styles.loading}><ActivityIndicator color="#287A68" /><Text style={styles.emptyText}>Cargando tus tareas…</Text></View> :
      <FlatList data={tasks} keyExtractor={(item) => String(item.id)} contentContainerStyle={styles.list} onRefresh={refreshTasks} refreshing={loading}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyIcon}>📝</Text><Text style={styles.emptyTitle}>Todavía no hay tareas</Text><Text style={styles.emptyText}>Agrega una arriba para empezar.</Text></View>}
        renderItem={({ item }) => <View style={styles.task}><Pressable style={[styles.check, item.completada && styles.checked]} onPress={() => void toggleTask(item)} accessibilityLabel={item.completada ? 'Marcar pendiente' : 'Marcar completada'}><Text style={styles.checkText}>{item.completada ? '✓' : ''}</Text></Pressable><Text style={[styles.taskTitle, item.completada && styles.completed]}>{item.titulo}</Text><Pressable style={styles.delete} onPress={() => void removeTask(item.id)} accessibilityLabel={`Eliminar ${item.titulo}`}><Text style={styles.deleteText}>×</Text></Pressable></View>}
      />}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F7FB' }, header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 }, back: { alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 12 }, backText: { color: '#287A68', fontWeight: '800', fontSize: 15 }, title: { color: '#183B56', fontWeight: '800', fontSize: 30, marginTop: 8 }, subtitle: { color: '#71849A', fontSize: 15, marginTop: 4 },
  createCard: { margin: 20, marginTop: 10, backgroundColor: '#FFFFFF', padding: 18, borderRadius: 20, gap: 12, borderWidth: 1, borderColor: '#E3EAF1' }, formTitle: { fontSize: 18, fontWeight: '800', color: '#183B56' }, createRow: { flexDirection: 'row', gap: 10 }, input: { flex: 1, borderWidth: 1, borderColor: '#D7E1EA', borderRadius: 13, paddingHorizontal: 14, color: '#183B56', fontSize: 15, backgroundColor: '#FAFCFE' }, addButton: { width: 50, height: 50, backgroundColor: '#287A68', borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, addText: { color: '#FFFFFF', fontSize: 27, lineHeight: 31, fontWeight: '600' }, disabled: { opacity: 0.65 },
  list: { padding: 20, paddingTop: 0, gap: 12, flexGrow: 1 }, task: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 15, borderWidth: 1, borderColor: '#E3EAF1' }, check: { width: 27, height: 27, borderRadius: 9, borderWidth: 2, borderColor: '#9FB2C3', alignItems: 'center', justifyContent: 'center' }, checked: { backgroundColor: '#287A68', borderColor: '#287A68' }, checkText: { color: '#FFFFFF', fontWeight: '900' }, taskTitle: { flex: 1, color: '#183B56', fontWeight: '700', fontSize: 15 }, completed: { textDecorationLine: 'line-through', color: '#8998A8' }, delete: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }, deleteText: { color: '#9B3940', fontSize: 25, fontWeight: '500' },
  error: { color: '#9B3940', marginHorizontal: 20, marginBottom: 10, fontWeight: '600' }, loading: { alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12 }, empty: { flex: 1, minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 8 }, emptyIcon: { fontSize: 34 }, emptyTitle: { color: '#183B56', fontSize: 18, fontWeight: '800' }, emptyText: { color: '#71849A', fontSize: 14 },
});


