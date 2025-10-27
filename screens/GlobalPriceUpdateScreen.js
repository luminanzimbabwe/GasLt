import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

// Helper function to get CSRF token from cookies
const getCSRFToken = () => {
  const name = 'csrftoken=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return '';
};

export default function GlobalPriceUpdateScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [productName, setProductName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [updating, setUpdating] = useState(false);
  const [currentPrices, setCurrentPrices] = useState({});
  const [loadingPrices, setLoadingPrices] = useState(true);

  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  // Fetch current global prices (assuming there's an endpoint for this)
  const fetchCurrentPrices = async () => {
    try {
      setLoadingPrices(true);
      // Note: You might need to add an endpoint to fetch current prices
      // For now, we'll use a placeholder
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
      // Extract unique products and their prices from orders
      const prices = {};
      data.orders.forEach(order => {
        if (!prices[order.product_name]) {
          prices[order.product_name] = order.unit_price || 'Not set';
        }
      });
      setCurrentPrices(prices);
    } catch (err) {
      console.error('Error fetching current prices:', err);
      Alert.alert('Error', 'Failed to fetch current prices.');
    } finally {
      setLoadingPrices(false);
    }
  };

  useEffect(() => {
    fetchCurrentPrices();
  }, []);

  const updateGlobalPrice = async () => {
    console.log('🚀 Starting updateGlobalPrice function');
    console.log('📝 Product Name:', productName.trim());
    console.log('💰 Unit Price:', unitPrice);

    if (!productName.trim()) {
      console.log('❌ Error: Product name is empty');
      Alert.alert('Error', 'Please enter a product name.');
      return;
    }
    if (!unitPrice || isNaN(unitPrice) || parseFloat(unitPrice) <= 0) {
      console.log('❌ Error: Invalid unit price');
      Alert.alert('Error', 'Please enter a valid unit price.');
      return;
    }

    console.log('🔄 Setting updating state to true');
    setUpdating(true);

    const requestBody = {
      product_name: productName.trim(),
      unit_price: parseFloat(unitPrice),
    };
    const requestHeaders = {
      'X-Admin-Pin': '26344',
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken(),
    };

    console.log('📡 Preparing to send request to:', API.ADMIN_UPDATE_GLOBAL_PRICE);
    console.log('📨 Request Headers:', requestHeaders);
    console.log('📦 Request Body:', requestBody);

    try {
      console.log('🌐 Sending fetch request...');
      const response = await fetch(API.ADMIN_UPDATE_GLOBAL_PRICE, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response received');
      console.log('📊 Response Status:', response.status);
      console.log('📝 Response Status Text:', response.statusText);
      console.log('🔍 Response Headers:', [...response.headers.entries()]);

      if (!response.ok) {
        console.log('❌ Response not OK, throwing error');
        const errorText = await response.text();
        console.log('📄 Error Response Text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      console.log('✅ Response OK, parsing JSON');
      const data = await response.json();
      console.log('📋 Response Data:', data);

      console.log('🎉 Success! Showing alert');
      Alert.alert('Success', `Global price for ${productName} updated to $${unitPrice} per liter!`);
      setProductName('');
      setUnitPrice('');
      console.log('🔄 Refreshing current prices');
      fetchCurrentPrices(); // Refresh current prices
    } catch (error) {
      console.error('💥 Error updating global price:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      Alert.alert('Error', 'Failed to update global price.');
    } finally {
      console.log('🏁 Setting updating state to false');
      setUpdating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.BG }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.TEXT }]}>Global Price Update</Text>
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

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.card, { backgroundColor: theme.CARD_BG, borderColor: theme.BORDER }]}>
          <Text style={[styles.cardTitle, { color: theme.TEXT }]}>Update Global Price</Text>
          <Text style={[styles.cardSubtitle, { color: theme.SUBTEXT }]}>
            This will update the price for all future orders of the selected product.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.TEXT }]}>Product Name</Text>
            <TextInput
              style={[styles.input, { color: theme.TEXT, borderColor: theme.BORDER }]}
              placeholder="e.g., Gasoline"
              placeholderTextColor={theme.SUBTEXT}
              value={productName}
              onChangeText={setProductName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.TEXT }]}>Unit Price (per liter)</Text>
            <TextInput
              style={[styles.input, { color: theme.TEXT, borderColor: theme.BORDER }]}
              placeholder="e.g., 2.50"
              placeholderTextColor={theme.SUBTEXT}
              keyboardType="numeric"
              value={unitPrice}
              onChangeText={setUnitPrice}
            />
          </View>

          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: updating ? theme.SUBTEXT : PRIMARY_COLOR }]}
            onPress={updateGlobalPrice}
            disabled={updating}
          >
            <Text style={styles.updateButtonText}>
              {updating ? 'Updating...' : 'Update Global Price'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: theme.CARD_BG, borderColor: theme.BORDER }]}>
          <Text style={[styles.cardTitle, { color: theme.TEXT }]}>Current Global Prices</Text>
          {loadingPrices ? (
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          ) : (
            Object.keys(currentPrices).length > 0 ? (
              Object.entries(currentPrices).map(([product, price]) => (
                <View key={product} style={styles.priceItem}>
                  <Text style={[styles.productName, { color: theme.TEXT }]}>{product}</Text>
                  <Text style={[styles.productPrice, { color: PRIMARY_COLOR }]}>${price} per liter</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.noPrices, { color: theme.SUBTEXT }]}>No current prices available.</Text>
            )
          )}
        </View>
      </ScrollView>
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
  scrollContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  updateButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noPrices: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});
