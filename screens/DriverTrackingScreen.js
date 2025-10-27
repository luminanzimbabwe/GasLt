import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    Platform,
    Dimensions,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DriverMap from './DriverMap';
import { API } from '../api';

let ws = null;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// --- CONFIGURATION ---
const PRIMARY_COLOR = '#1976D2';
const ACCENT_COLOR = '#00BCD4';
const STATUS_COLORS = {
    'En Route': '#4CAF50',
    'On Break': '#FFC107',
};

const DriverTrackingScreen = () => {
    const [drivers, setDrivers] = useState([]);
    const [selectedDriverId, setSelectedDriverId] = useState(null);
    const [loadingDrivers, setLoadingDrivers] = useState(true);
    const [driversError, setDriversError] = useState(null);

    const mapRef = useRef(null);

    const selectedDriver = drivers.find(d => d.id === selectedDriverId);

    // --- FETCH DRIVERS FROM BACKEND ---
    const fetchDrivers = async () => {
        try {
            setLoadingDrivers(true);
            setDriversError(null);
            const response = await fetch(API.ADMIN_DRIVERS, {
                method: 'GET',
                headers: {
                    'X-Admin-Pin': '26344',
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const fetchedDrivers = data.drivers || [];
            const transformedDrivers = fetchedDrivers.map(driver => ({
                id: String(driver._id || driver.id),
                name: driver.username || driver.name || 'Unknown',
                status: 'En Route',
                lat: driver.currentLocation?.lat ?? 34.0522,
                lon: driver.currentLocation?.lng ?? -118.2437,
                speed: driver.speed ?? 0,
                lastUpdate: driver.lastUpdate ? new Date(driver.lastUpdate).toLocaleTimeString() : 'Unknown',
                assignedRoute: 'Unassigned',
            }));
            setDrivers(transformedDrivers);
            if (transformedDrivers.length > 0) setSelectedDriverId(transformedDrivers[0].id);
        } catch (error) {
            console.error('Error fetching drivers:', error);
            setDriversError(error.message);
            Alert.alert('Error', 'Failed to fetch drivers from backend.');
        } finally {
            setLoadingDrivers(false);
        }
    };

    // --- WEBSOCKET REAL-TIME TRACKING ---
    useEffect(() => {
        fetchDrivers();

        const connectWebSocket = () => {
            ws = new WebSocket(API.WS_ADMIN_DRIVERS);

            ws.onopen = () => console.log('WebSocket connected for driver tracking');

            ws.onmessage = event => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('WebSocket message received:', data);

                    if (data.event === 'driver_update' && data.driver) {
                        setDrivers(currentDrivers =>
                            currentDrivers.map(driver =>
                                driver.id === String(data.driver.id)
                                    ? {
                                        ...driver,
                                        lat: data.driver.lat,
                                        lon: data.driver.lon,
                                        speed: data.driver.speed ?? 0,
                                        lastUpdate: new Date(data.driver.lastUpdate).toLocaleTimeString(),
                                        status: data.driver.status ?? 'En Route',
                                        assignedRoute: data.driver.assignedRoute ?? 'Unassigned',
                                    }
                                    : driver
                            )
                        );
                    }
                } catch (err) {
                    console.error('Error parsing WebSocket message:', err);
                }
            };

            ws.onerror = error => console.error('WebSocket error:', error);

            ws.onclose = () => {
                console.log('WebSocket closed, reconnecting...');
                setTimeout(connectWebSocket, 5000);
            };
        };

        connectWebSocket();

        const interval = setInterval(fetchDrivers, 60000);
        return () => {
            if (ws) ws.close();
            clearInterval(interval);
        };
    }, []);

    // --- AUTO-ANIMATE MAP ON DRIVER MOVE ---
    useEffect(() => {
        if (selectedDriver && mapRef.current?.animateToRegion) {
            mapRef.current.animateToRegion({
                latitude: selectedDriver.lat,
                longitude: selectedDriver.lon,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }, 500);
        }
    }, [selectedDriver?.lat, selectedDriver?.lon]);

    const handleDriverSelect = driver => setSelectedDriverId(driver.id);

    // --- DRIVER LIST ITEM ---
    const renderDriverItem = ({ item }) => {
        const isSelected = item.id === selectedDriverId;
        const statusColor = STATUS_COLORS[item.status];
        return (
            <TouchableOpacity
                style={[
                    styles.driverCard,
                    {
                        backgroundColor: isSelected ? '#E3F2FD' : 'white',
                        borderBottomColor: isSelected ? PRIMARY_COLOR : '#E0E0E0',
                        borderBottomWidth: isSelected ? 3 : 1,
                    }
                ]}
                onPress={() => handleDriverSelect(item)}
            >
                <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
                <View style={styles.driverCardDetails}>
                    <Text style={styles.driverName}>{item.name}</Text>
                    <Text style={[styles.driverStatus, { color: statusColor }]}>{item.status}</Text>
                </View>
                <View style={styles.driverCardTail}>
                    <MaterialCommunityIcons name="steering" size={20} color={statusColor} />
                    <Text style={styles.driverID}>{item.id}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    // --- DRIVER INFO PANEL ---
    const DriverInfoPanel = () => selectedDriver && (
        <View style={styles.infoPanel}>
            <Text style={styles.infoTitle}>
                <Ionicons name="location-sharp" size={16} color={PRIMARY_COLOR} /> Current Details: {selectedDriver.name}
            </Text>
            <View style={styles.infoRow}>
                <View style={styles.infoPill}>
                    <Ionicons name="speedometer" size={14} color="#333" />
                    <Text style={styles.infoPillText}>
                        Speed: <Text style={styles.infoPillValue}>{selectedDriver.speed} km/h</Text>
                    </Text>
                </View>
                <View style={styles.infoPill}>
                    <Ionicons name="time" size={14} color="#333" />
                    <Text style={styles.infoPillText}>
                        Last Update: <Text style={styles.infoPillValue}>{selectedDriver.lastUpdate}</Text>
                    </Text>
                </View>
            </View>
            <View style={styles.infoRoute}>
                <MaterialCommunityIcons name="map-marker-path" size={16} color={ACCENT_COLOR} />
                <Text style={styles.infoRouteText}>
                    Route: <Text style={styles.infoRouteValue}>{selectedDriver.assignedRoute}</Text>
                </Text>
            </View>
        </View>
    );

    // --- RENDER ---
    if (loadingDrivers) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            <Text style={{ color: PRIMARY_COLOR, fontSize: 18, marginTop: 10 }}>Loading Driver Data...</Text>
        </View>
    );

    if (driversError && drivers.length === 0) return (
        <View style={styles.loadingContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
            <Text style={{ color: '#F44336', fontSize: 18, marginTop: 10 }}>Error loading drivers</Text>
            <Text style={{ color: '#888', fontSize: 14, marginTop: 5 }}>{driversError}</Text>
        </View>
    );

    if (!selectedDriver) return (
        <View style={styles.loadingContainer}>
            <Text style={{ color: PRIMARY_COLOR, fontSize: 18 }}>No drivers available</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Fleet Tracker Admin</Text>
            </View>
            <FlatList
                data={drivers}
                renderItem={renderDriverItem}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />
            <DriverInfoPanel />
            <View style={{ flex: 1 }}>
                <DriverMap
                    selectedDriver={selectedDriver}
                    drivers={drivers}
                    mapRef={mapRef}
                />
            </View>
        </SafeAreaView>
    );
};



const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F4F7F9' },
    header: { paddingHorizontal: 15, paddingVertical: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
    headerText: { fontSize: 18, fontWeight: '800', color: '#333' },
    listContainer: { paddingHorizontal: 10, paddingVertical: 12 },
    driverCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginRight: 12, minWidth: SCREEN_WIDTH * 0.45, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }, android: { elevation: 2 } }) },
    statusIndicator: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
    driverCardDetails: { flex: 1 },
    driverCardTail: { alignItems: 'flex-end', marginLeft: 15 },
    driverName: { fontSize: 15, fontWeight: '700', color: '#333' },
    driverStatus: { fontSize: 12, marginTop: 2, fontWeight: '600' },
    driverID: { fontSize: 10, color: '#888', marginTop: 3 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7F9' },
    infoPanel: { backgroundColor: '#fff', marginHorizontal: 15, padding: 15, borderRadius: 10, marginBottom: 10, borderLeftWidth: 5, borderLeftColor: PRIMARY_COLOR, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 2 }, android: { elevation: 3 } }) },
    infoTitle: { fontSize: 16, fontWeight: 'bold', color: PRIMARY_COLOR, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 8 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    infoPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7F7F7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, minWidth: '48%' },
    infoPillText: { marginLeft: 5, fontSize: 12, color: '#555', fontWeight: '500' },
    infoPillValue: { fontWeight: '700', color: PRIMARY_COLOR },
    infoRoute: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#EEE' },
    infoRouteText: { marginLeft: 8, fontSize: 14, color: '#333' },
    infoRouteValue: { fontWeight: 'bold', color: ACCENT_COLOR },
});

export default DriverTrackingScreen;
