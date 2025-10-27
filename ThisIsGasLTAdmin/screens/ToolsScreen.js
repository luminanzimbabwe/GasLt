import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Animated, 
  LayoutAnimation, 
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- SUPER DUMMY DATA ---
const CLEAN_TASKS = [
  { id: 1, name: 'Deep Database Indexing', icon: 'server-outline', estimatedTime: 10000 },
  { id: 2, name: 'Purge Image Thumbnails', icon: 'images-outline', estimatedTime: 800 },
  { id: 3, name: 'Clear Webview Cookies', icon: 'trash-outline', estimatedTime: 500 },
  { id: 4, name: 'Optimize Storage Allocation', icon: 'speedometer-outline', estimatedTime: 20000 },
  { id: 5, name: 'Remove Temp Download Assets', icon: 'cloud-offline-outline', estimatedTime: 700 },
  { id: 6, name: 'Rebuild Search Catalog', icon: 'sync-outline', estimatedTime: 2000 },
  { id: 7, name: 'Archive Historical Data', icon: 'folder-open-outline', estimatedTime: 1800 },
  { id: 8, name: 'Clean Notification Queue', icon: 'notifications-off-outline', estimatedTime: 600 },
  { id: 9, name: 'Verify System Integrity', icon: 'shield-checkmark-outline', estimatedTime: 30000 },
];

// --- ANIMATED PROGRESS BAR COMPONENT ---
const AnimatedProgressBar = ({ progress }) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const width = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.progressBarContainer}>
      <Animated.View style={[styles.progressBar, { width }]} />
    </View>
  );
};

// --- LOG ENTRY WITH FADE IN ANIMATION ---
const AnimatedLogEntry = ({ log }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const isSuccess = log.includes('complete') || log.includes('FINISHED') || log.includes('recovered');

  return (
    <Animated.Text style={[styles.logEntry, isSuccess && styles.logSuccess, { opacity: fadeAnim }]}>
      {log}
    </Animated.Text>
  );
};

// --- ENHANCED CLEANING TOOL COMPONENT WITH PULSE ---
const CleaningTool = ({ task, onPress, status }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;


  useEffect(() => {
    if (status === 'IN_PROGRESS') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1); 
      pulseAnim.stopAnimation();
    }
  }, [status]);

  let statusIcon = 'chevron-forward-outline';
  let statusColor = '#C7C7CC';
  let taskStyle = {};

  if (status === 'IN_PROGRESS') {
    statusIcon = 'ellipsis-horizontal-circle-outline';
    statusColor = '#FF9500'; // Orange for in progress
    taskStyle = { transform: [{ scale: pulseAnim }] };
  } else if (status === 'COMPLETED') {
    statusIcon = 'checkmark-circle-outline';
    statusColor = '#34C759'; // Green for success
  }

  return (
    <Animated.View style={taskStyle}>
      <TouchableOpacity
        style={styles.taskItem}
        onPress={() => onPress(task)}
        disabled={status === 'IN_PROGRESS' || status === 'COMPLETED'}
      >
        <Ionicons name={task.icon} size={26} color={statusColor === '#C7C7CC' ? '#007AFF' : statusColor} style={styles.icon} />
        <Text style={styles.taskText}>{task.name}</Text>
        <Ionicons name={statusIcon} size={20} color={statusColor} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// --- MAIN DUMMY CLEANING SCREEN ---
const DummyCleaningScreen = () => {
  const navigation = useNavigation();
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleaningStatus, setCleaningStatus] = useState({});
  const [logs, setLogs] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const scrollRef = useRef(null);

 
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [logs]);


  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isCleaning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      bounceAnim.setValue(0);
      bounceAnim.stopAnimation();
    }
  }, [isCleaning]);

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -5, 0], 
  });

  const handleTaskPress = (task) => {
    if (isCleaning) return;

    setCleaningStatus({ [task.id]: 'IN_PROGRESS' });
    setIsCleaning(true);
    setOverallProgress(30);

    setLogs((prev) => [`🧹 Started ${task.name}...`, ...prev]);

    setTimeout(() => {
      LayoutAnimation.easeInEaseOut();
      setIsCleaning(false);
      setCleaningStatus({ [task.id]: 'COMPLETED' });
      setOverallProgress(100);

      setLogs((prev) => [
        `✅ Finished ${task.name}!`,
        '--- Single Task Complete ---',
        ...prev,
      ]);
      setTimeout(() => setOverallProgress(0), 1000);
    }, task.estimatedTime + 500);
  };

  const handleCleanAll = () => {
    if (isCleaning) return;

    LayoutAnimation.easeInEaseOut();
    setLogs([]);
    setOverallProgress(0);
    setCleaningStatus({});
    setIsCleaning(true);
    setLogs(['🚀 Starting **Full System Cleanup**...']);

    let totalTime = 0;
    let completedTasks = 0;
    const totalTasks = CLEAN_TASKS.length;

    CLEAN_TASKS.forEach((task, i) => {
      const taskDelay = totalTime + 300;
      totalTime += task.estimatedTime + 300;

      
      setTimeout(() => {
        LayoutAnimation.easeInEaseOut();
        setCleaningStatus((prev) => ({ ...prev, [task.id]: 'IN_PROGRESS' }));
        setLogs((prev) => [`⚙️ Executing: ${task.name}...`, ...prev]);
        setOverallProgress((completedTasks / totalTasks) * 100 + 5);
      }, taskDelay);

      
      setTimeout(() => {
        LayoutAnimation.easeInEaseOut();
        completedTasks++;
        setCleaningStatus((prev) => ({ ...prev, [task.id]: 'COMPLETED' }));
        setLogs((prev) => [`✨ ${task.name} complete!`, ...prev]);
        setOverallProgress((completedTasks / totalTasks) * 100);
      }, totalTime);
    });

   
    setTimeout(() => {
      LayoutAnimation.easeInEaseOut();
      setIsCleaning(false);

    
      const isSuccess = Math.random() > 0.2; 

      if (isSuccess) {
       
        const results = [
          '1GB today',
          '2DB tomorrow',
          '1MB',
          '700MB',
          '500MB',
          '2GB',
          '1.3GB',
          '750MB',
          '3GB',
          '1.5GB',
          '250MB',
          '4GB'
        ];
        const randomResult = results[Math.floor(Math.random() * results.length)];

        setLogs((prev) => [
          '--- **ALL TASKS FINISHED** ---',
          '✅ System cleaning completed successfully!',
          `🎉 **${randomResult} of space** recovered!`,
          ...prev,
        ]);
      } else {
        
        setLogs((prev) => [
          '--- **CLEANING FAILED** ---',
          '❌ System cleaning encountered an error!',
          '⏰ Please try again in 2 minutes.',
          ...prev,
        ]);
      }
    }, totalTime + 1000);
  };

  const progressPercentage = Math.round(overallProgress);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>✨ Super System Purifier</Text>
        <Text style={styles.subHeader}>One-tap optimization for ultimate dummy performance.</Text>

        {/* Global Progress Section */}
        {isCleaning && (
          <View style={styles.progressSection}>
            <Text style={styles.progressText}>
              {progressPercentage}% Complete
              {progressPercentage < 100 && ' (Processing...)'}
            </Text>
            <AnimatedProgressBar progress={overallProgress} />
          </View>
        )}

        {/* Cleaning Tasks List */}
        <View style={styles.taskListCard}>
          {CLEAN_TASKS.map((task, index) => (
            <View key={task.id}>
              <CleaningTool
                task={task}
                onPress={handleTaskPress}
                status={cleaningStatus[task.id]}
              />
              {index < CLEAN_TASKS.length - 1 && (
                <View style={styles.separator} />
              )}
            </View>
          ))}
        </View>

        {/* Global Price Update Button */}
        <TouchableOpacity
          style={styles.priceUpdateButton}
          onPress={() => navigation.navigate('GlobalPriceUpdate')}
        >
          <Ionicons name="pricetag-outline" size={22} color="#fff" />
          <Text style={styles.priceUpdateText}>Update Global Prices</Text>
        </TouchableOpacity>

        {/* Run Full Clean Button */}
        <Animated.View style={[{ transform: [{ translateY }] }]}>
          <TouchableOpacity
            style={[
              styles.cleanAllButton,
              isCleaning && styles.cleanAllButtonDisabled,
            ]}
            onPress={handleCleanAll}
            disabled={isCleaning}
          >
            {isCleaning ? (
              <>
                <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
                <Text style={styles.cleanAllText}>Cleaning In Progress...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles-outline" size={22} color="#fff" />
                <Text style={styles.cleanAllText}>Run Full System Purge</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Cleaning Logs Box */}
        <View style={styles.logsBox}>
          <Text style={styles.logsTitle}>
            <Ionicons name="receipt-outline" size={16} /> Activity Log
          </Text>
          <ScrollView ref={scrollRef} style={styles.logsScroll} contentContainerStyle={styles.logsScrollContent}>
            {logs.length === 0 ? (
              <Text style={styles.noLogs}>No cleaning tasks run yet. Press 'Run Full System Purge' to start!</Text>
            ) : (
              logs.map((log, i) => (
                <AnimatedLogEntry key={i} log={log} />
              ))
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EFF3F9' },
  container: { padding: 15, paddingBottom: 50 },
  header: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 5,
    color: '#1E3A5F',
  },
  subHeader: {
    fontSize: 14,
    color: '#607B96',
    marginBottom: 20,
    fontWeight: '400',
  },
  
  // Progress Bar Styles
  progressSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE6F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A5F',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#EAEAEA',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 5,
  },

  // Task List Styles
  taskListCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  icon: { marginRight: 15 },
  taskText: { flex: 1, fontSize: 16, color: '#333' },
  separator: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 15 },

  // Button Styles
  cleanAllButton: {
    flexDirection: 'row',
    backgroundColor: '#FF3B30',
    borderRadius: 15,
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cleanAllButtonDisabled: {
    backgroundColor: '#A0A0A0',
    shadowColor: 'transparent',
  },
  cleanAllText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
  priceUpdateButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 15,
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  priceUpdateText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },

  // Logs Styles
  logsBox: {
    backgroundColor: '#2D3436',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#4A5354',
    minHeight: 180,
  },
  logsTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#ADFF00',
  },
  logsScroll: {
    maxHeight: 200,
  },
  logsScrollContent: {
    paddingBottom: 5,
    flexDirection: 'column-reverse', 
  },
  noLogs: {
    color: '#999',
    fontStyle: 'italic',
    fontSize: 13,
  },
  logEntry: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 3,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  logSuccess: {
    color: '#34C759',
    fontWeight: '500',
  },
});

export default DummyCleaningScreen;