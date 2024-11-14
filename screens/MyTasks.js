import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';

export default function MyTasks({ navigation }) {
  const db = useSQLiteContext();
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const result = await db.getAllAsync('SELECT * FROM tasks WHERE status = ?', ['pending']);
      setTasks(result);
    } catch (error) {
      console.log('Error fetching tasks:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My Quests</Text>
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.task_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('TaskDetails', { taskId: item.task_id })} // Navigate to TaskDetails screen
          >
            <View style={[styles.taskContainer, item.status === 'completed' && styles.taskCompleted]}>
              <Ionicons name="calendar" size={24} color="#6c757d" style={styles.taskIcon} />
              <Text style={[styles.taskText, item.status === 'completed' && styles.completedTaskText]}>
                {item.title}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  headerText: { fontSize: 24, fontWeight: 'bold' },
  taskContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e1e7ed', padding: 15, borderRadius: 10, marginVertical: 5 },
  taskIcon: { marginRight: 10 },
  taskText: { fontSize: 16, fontWeight: 'bold', flex: 1 },
  completedTaskText: { textDecorationLine: 'line-through', color: 'gray' },
  taskCompleted: { backgroundColor: '#d3f8e2' },
});
