import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const Dashboard = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.firstheader}>
        <Text style={styles.home}>Home</Text>
        <Image
            style={styles.profileImage}
            source={require('../assets/Profile.png')} // Replace with your profile image URL
          />
      </View>
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome to TaskVenture!</Text>
        
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabButton, styles.activeTab]}>
          <Text style={styles.tabText}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, styles.activeTab]}>
          <Text style={styles.tabText}>Prioritize</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Section */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Track your progress</Text>
        <Text style={styles.progressSubtitle}>View your daily task achievements</Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: '76%' }]} />
        </View>
        <Text style={styles.progressPercentage}>76%</Text>
      </View>

      {/* Task Categories */}
      <View style={styles.taskCategoryContainer}>
        <TaskCategory title="Organize" newTasks={5} />
        <TaskCategory title="Manage" newTasks={2} />
        <TaskCategory title="Work-related" newTasks={9} />
        <TaskCategory title="Tasks" newTasks={5} urgent />
      </View>
    </View>
  );
};

// TaskCategory Component
const TaskCategory = ({ title, newTasks, urgent }) => {
  return (
    <View style={[styles.taskCategory, urgent && styles.urgentTask]}>
      <Text style={styles.taskCount}>{newTasks} New {urgent ? 'Urgent' : ''} Tasks</Text>
      <Text style={styles.taskTitle}>{title}</Text>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginTop:25
  },
  firstheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  home: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    width:250
    
  },
  tabButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10
    
  },
  activeTab: {
    backgroundColor: '#4a90e2',
  },
  tabText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  progressContainer: {
    backgroundColor: '#e1e7ed',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 10,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#d3d3d3',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4a90e2',
  },
  progressPercentage: {
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#4a90e2',
    marginTop: 5,
  },
  taskCategoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  taskCategory: {
    width: '48%',
    backgroundColor: '#e1e7ed',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
  },
  urgentTask: {
    borderColor: '#ff3b30',
    borderWidth: 2,
  },
  taskCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6c757d',
    marginBottom: 5,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Dashboard;
