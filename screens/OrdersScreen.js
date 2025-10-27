import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  SafeAreaView,
  Vibration,
  Modal,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { API } from '../api';

// --- 🎨 BRAND PALETTE & MODE CONFIGURATION ---
const PRIMARY_COLOR = "#007AFF"; // Professional Blue
const SECONDARY_COLOR = "#FF9F1C"; // Energetic Orange (Action/Warning)
const DANGER_COLOR = "#E74C3C"; // Red
const SUCCESS_COLOR = "#2ECC71"; // Green

const LIGHT_THEME = {
  BG: "#F5F7F9",
  CARD_BG: "#FFFFFF",
  TEXT: "#2C3E50",
  SUBTEXT: "#7F8C8D",
  BORDER: "#E0E0E0",
};

const DARK_THEME = {
  BG: "#121212",
  CARD_BG: "#1E1E1E",
  TEXT: "#F5F7F9",
  SUBTEXT: "#A0A0A0",
  BORDER: "#333333",
};

const StatusTag = ({ status }) => {
  let color = "#333";
  let backgroundColor = "#E0E0E0";
  switch (status.toLowerCase()) {
    case "delivered": color = "#1D8348"; backgroundColor = "#D4EFDF"; break;
    case "pending": color = "#B7950B"; backgroundColor = "#FCF3CF"; break;
    case "cancelled": color = "#B03A2E"; backgroundColor = "#FADBD8"; break;
    default: color = "#5D6D7E"; backgroundColor = "#EAEDED"; break;
  }

  return (
    <View style={[styles.statusTag, { backgroundColor }]}>
      <Text style={[styles.statusTagText, { color }]}>{status}</Text>
    </View>
  );
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newUnitPrice, setNewUnitPrice] = useState('');
  const [updating, setUpdating] = useState(false);

  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API.ADMIN_ORDERS_DETAILS, {
        method: 'GET',
        headers: {
          'X-Admin-Pin': '26344',
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
      Alert.alert('Error', 'Failed to fetch orders details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Real-time updates every 60 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders().finally(() => setRefreshing(false));
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = searchQuery === '' ||
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.product_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'All' || order.order_status.toLowerCase() === selectedStatus.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, selectedStatus]);

  const updateUnitPrice = async () => {
    if (!newUnitPrice || isNaN(newUnitPrice) || parseFloat(newUnitPrice) <= 0) {
      Alert.alert('Error', 'Please enter a valid unit price.');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(API.ADMIN_UPDATE_UNIT_PRICE(selectedOrder._id), {
        method: 'POST',
        headers: {
          'X-Admin-Pin': '26344',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ unit_price: parseFloat(newUnitPrice) }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      Alert.alert('Success', 'Unit price updated successfully!');
      setModalVisible(false);
      setNewUnitPrice('');
      setSelectedOrder(null);
      fetchOrders(); // Refresh orders
    } catch (error) {
      console.error('Error updating unit price:', error);
      Alert.alert('Error', 'Failed to update unit price.');
    } finally {
      setUpdating(false);
    }
  };

  const renderOrder = ({ item }) => (
    <View style={[styles.orderItem, { backgroundColor: theme.CARD_BG, borderColor: theme.BORDER }]}>
      <TouchableOpacity
        style={styles.orderContent}
        onPress={() => {
          Vibration.vibrate(10);
          const details = `
ID: ${item._id}
Customer: ${item.customer_name} (${item.customer_phone})
Product: ${item.product_name} (${item.quantity} x ${item.weight}kg)
Unit Price: $${item.unit_price || 'N/A'}
Total: $${item.total_price}
Status: ${item.order_status}
Address: ${item.delivery_address}
Payment: ${item.payment_method} - ${item.payment_status}
Notes: ${item.notes || 'None'}
Created: ${new Date(item.created_at).toLocaleString()}
          `.trim();
          Alert.alert('Order Details', details);
        }}
      >
        <View style={styles.orderHeader}>
          <Text style={[styles.orderId, { color: theme.TEXT }]}>Order #{item._id.slice(-6)}</Text>
          <StatusTag status={item.order_status} />
        </View>
        <Text style={[styles.customer, { color: theme.SUBTEXT }]}>{item.customer_name}</Text>
        <Text style={[styles.product, { color: theme.TEXT }]}>{item.product_name} - {item.quantity} units</Text>
        <Text style={[styles.total, { color: PRIMARY_COLOR }]}>Total: ${item.total_price}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.updateButton, { backgroundColor: SECONDARY_COLOR }]}
        onPress={() => {
          setSelectedOrder(item);
          setNewUnitPrice(item.unit_price ? item.unit_price.toString() : '');
          setModalVisible(true);
        }}
      >
        <Text style={styles.updateButtonText}>Update Price</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.BG }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={[styles.loadingText, { color: theme.SUBTEXT }]}>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.BG }]}>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={DANGER_COLOR} />
          <Text style={[styles.error, { color: DANGER_COLOR }]}>Error: {error}</Text>
          <TouchableOpacity onPress={fetchOrders} style={[styles.retryButton, { backgroundColor: PRIMARY_COLOR }]}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.BG }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.TEXT }]}>Order History</Text>
        <TouchableOpacity
          style={[styles.modeToggle, { backgroundColor: theme.CARD_BG, borderColor: theme.BORDER }]}
          onPress={() => setIsDarkMode(!isDarkMode)}
        >
          <Ionicons name={isDarkMode ? "sunny-outline" : "moon-outline"} size={20} color={isDarkMode ? SECONDARY_COLOR : PRIMARY_COLOR} />
          <Text style={[styles.modeToggleText, { color: isDarkMode ? SECONDARY_COLOR : PRIMARY_COLOR }]}>
            {isDarkMode ? "Light" : "Dark"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <View style={[styles.searchContainer, { backgroundColor: theme.CARD_BG, borderColor: theme.BORDER }]}>
          <Ionicons name="search" size={20} color={theme.SUBTEXT} />
          <TextInput
            style={[styles.searchInput, { color: theme.TEXT }]}
            placeholder="Search orders..."
            placeholderTextColor={theme.SUBTEXT}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.statusFilters}>
          {['All', 'Pending', 'Delivered', 'Cancelled'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterButton,
                { backgroundColor: selectedStatus === status ? PRIMARY_COLOR : theme.CARD_BG, borderColor: theme.BORDER }
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text style={[styles.filterText, { color: selectedStatus === status ? '#FFF' : theme.TEXT }]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrder}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY_COLOR}
            progressBackgroundColor={theme.CARD_BG}
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="document-text-outline" size={48} color={theme.SUBTEXT} />
            <Text style={[styles.empty, { color: theme.SUBTEXT }]}>No orders found.</Text>
          </View>
        }
        contentContainerStyle={filteredOrders.length === 0 ? { flex: 1 } : {}}
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.CARD_BG }]}>
            <Text style={[styles.modalTitle, { color: theme.TEXT }]}>Update Unit Price</Text>
            <Text style={[styles.modalSubtitle, { color: theme.SUBTEXT }]}>
              Order: {selectedOrder ? selectedOrder._id.slice(-6) : ''}
            </Text>
            <TextInput
              style={[styles.modalInput, { color: theme.TEXT, borderColor: theme.BORDER }]}
              placeholder="Enter new unit price per kg"
              placeholderTextColor={theme.SUBTEXT}
              keyboardType="numeric"
              value={newUnitPrice}
              onChangeText={setNewUnitPrice}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: DANGER_COLOR }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: updating ? theme.SUBTEXT : SUCCESS_COLOR }]}
                onPress={updateUnitPrice}
                disabled={updating}
              >
                <Text style={styles.modalButtonText}>
                  {updating ? 'Updating...' : 'Update'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  modeToggleText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  filters: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  statusFilters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderItem: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
  },
  orderContent: {
    padding: 16,
  },
  updateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  updateButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
