import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

// ===============================
// 1. IMPORT SCREENS
// ===============================
import DashboardScreen from './screens/DashboardScreen';
import OrdersScreen from './screens/OrdersScreen';
import UserManagementScreen from './screens/UserManagementScreen';
import FinanceScreen from './screens/FinanceScreen';
import ToolsScreen from './screens/ToolsScreen';
import SupportScreen from './screens/SupportScreen';
import DriverTrackingScreen from './screens/DriverTrackingScreen';
import GlobalPriceUpdateScreen from './screens/GlobalPriceUpdateScreen';

// ===============================
// 2. CONVERSATION PLACEHOLDER
// ===============================
const ConversationScreen = ({ route }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
      Chat with {route.params?.driverName || 'Driver'}
    </Text>
    <Text style={{ marginTop: 10, color: '#888' }}>
      This screen provides the messaging interface.
    </Text>
  </View>
);

// ===============================
// 3. DEFINE NAVIGATORS
// ===============================
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ===============================
// 4. TAB NAVIGATOR
// ===============================
function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="DashboardTab"
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
          backgroundColor: '#fff',
          borderTopWidth: 0.3,
          borderTopColor: '#ddd',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          title: 'Dash',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="TrackTab"
        component={DriverTrackingScreen}
        options={{
          title: 'Track',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="navigate-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="FinanceTab"
        component={FinanceScreen}
        options={{
          title: 'Finance',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="ToolsTab"
        component={ToolsScreen}
        options={{
          title: 'Tools',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />

    </Tab.Navigator>
  );
}

// ===============================
// 5. ROOT STACK NAVIGATOR
// ===============================
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Conversation"
          component={ConversationScreen}
          options={({ route }) => ({
            title: `Chat: ${route.params?.driverName || 'Driver'}`,
          })}
        />
        <Stack.Screen
          name="DriverTracking"
          component={DriverTrackingScreen}
          options={{ title: 'Live Driver Tracking' }}
        />
        <Stack.Screen
          name="OrderHistory"
          component={OrdersScreen}
          options={{ title: 'Order History' }}
        />
        <Stack.Screen
          name="UserManagement"
          component={UserManagementScreen}
          options={{ title: 'Customer Management' }}
        />
        <Stack.Screen
          name="Support"
          component={SupportScreen}
          options={{ title: 'Help & Support' }}
        />
        <Stack.Screen
          name="GlobalPriceUpdate"
          component={GlobalPriceUpdateScreen}
          options={{ title: 'Global Price Update' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
