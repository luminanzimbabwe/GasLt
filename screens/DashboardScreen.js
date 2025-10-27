import React, { useState, useEffect, useRef, useMemo } from "react";
import {
    View,
    Text,
    TouchableOpacity, 
    Pressable,        
    StyleSheet,
    Dimensions,
    Animated,
    RefreshControl,
    SafeAreaView,
    Alert,
    Vibration,
    Platform,
    ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart, BarChart } from "react-native-chart-kit";
import { LinearGradient } from 'expo-linear-gradient';
import { API } from '../api';

const { width } = Dimensions.get("window");

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
    HEADER_GRADIENT: [`${PRIMARY_COLOR}10`, 'transparent'],
    HEALTH_BANNER_GRADIENT: ['#fff', '#f8f9fa'],
};

const DARK_THEME = {
    BG: "#121212",
    CARD_BG: "#1E1E1E",
    TEXT: "#F5F7F9",
    SUBTEXT: "#A0A0A0",
    BORDER: "#333333",
    HEADER_GRADIENT: [`${PRIMARY_COLOR}40`, 'transparent'],
    HEALTH_BANNER_GRADIENT: ['#1E1E1E', '#161616'],
};




// --- CORE UI COMPONENTS ---

const AnimatedCounter = React.memo(({ value, duration = 2000, style }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        animatedValue.removeAllListeners();
        animatedValue.addListener(({ value }) => {
            setDisplayValue(Math.floor(value));
        });

        Animated.timing(animatedValue, {
            toValue: value,
            duration,
            useNativeDriver: false, 
        }).start();

        return () => animatedValue.removeAllListeners();
    }, [value, duration]);

    return <Text style={style}>{displayValue.toLocaleString()}</Text>;
});

const StatusTag = React.memo(({ status }) => {
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
});

const EnhancedStatCard = React.memo(({ stat, index, theme }) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: 600, delay: index * 100, useNativeDriver: false, }), // **FIX: Explicitly set to false**
            Animated.timing(opacityAnim, { toValue: 1, duration: 600, delay: index * 100, useNativeDriver: false, }), // **FIX: Explicitly set to false**
        ]).start();
    }, [index]);

    return (
        <Animated.View
            style={[{ width: (width - 64) / 2, transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}
        >
            <Pressable 
                style={({ pressed }) => [
                    styles.enhancedCard(theme), 
                    { 
                        borderColor: stat.color + '30',
                        opacity: pressed ? 0.8 : 1, 
                    }
                ]}
                onPress={() => { Alert.alert("Card Tapped", stat.label) }}
            >
                <LinearGradient
                    colors={[`${stat.color}10`, `${stat.color}05`]}
                    style={styles.cardGradient}
                >
                    <View style={styles.cardHeader}>
                        <MaterialIcons name={stat.icon} size={24} color={stat.color} />
                        <Text style={[styles.trendText, { color: stat.color }]}>{stat.trend}</Text>
                    </View>
                    <View style={styles.cardContent}>
                        <AnimatedCounter value={stat.value} style={[styles.cardValue, { color: theme.TEXT }]} />
                        <Text style={[styles.cardLabel, { color: theme.SUBTEXT }]}>{stat.label}</Text>
                    </View>
                </LinearGradient>
            </Pressable>
        </Animated.View>
    );
});

const DetailStatCard = React.memo(({ stat, index, theme, delayOffset = 0, onPress }) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, { toValue: 0, duration: 600, delay: (index + delayOffset) * 100, useNativeDriver: false, }), // **FIX: Explicitly set to false**
            Animated.timing(opacityAnim, { toValue: 1, duration: 600, delay: (index + delayOffset) * 100, useNativeDriver: false, }), // **FIX: Explicitly set to false**
        ]).start();
    }, [index, delayOffset]);

    return (
        <Animated.View
            style={[
                { transform: [{ translateY: slideAnim }], opacity: opacityAnim }
            ]}
        >
            <Pressable 
                style={({ pressed }) => [
                    styles.logisticsCard(theme), 
                    { 
                        borderColor: stat.color + '30', 
                        width: (width - 48) / 2,
                        opacity: pressed ? 0.8 : 1, 
                    }
                ]}
                onPress={onPress}
            >
                <LinearGradient
                    colors={[`${stat.color}10`, `${stat.color}05`]}
                    style={styles.cardGradient}
                >
                    <View style={styles.cardHeader}>
                        <MaterialIcons name={stat.icon} size={24} color={stat.color} />
                    </View>
                    <View style={styles.cardContent}>
                        <AnimatedCounter value={stat.value} style={[styles.cardValue, { color: theme.TEXT }]} />
                        <Text style={[styles.cardLabel, { color: theme.SUBTEXT }]}>{stat.label}</Text>
                        <Text style={[styles.cardDetail, { color: stat.color }]}>{stat.detail}</Text>
                    </View>
                </LinearGradient>
            </Pressable>
        </Animated.View>
    );
});

const AnimatedKeyMetricCard = React.memo(({ label, value, goal, color, theme }) => {
    const percentage = Math.min(100, Math.round((value / goal) * 100));
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.03, duration: 1500, useNativeDriver: false }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
            ])
        );
        pulse.start();

        Animated.timing(progressAnim, { toValue: percentage, duration: 2500, useNativeDriver: false }).start();

        return () => pulse.stop();
    }, [value, percentage]);


    return (
        <Animated.View style={[styles.signatureCard, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
                colors={theme.HEALTH_BANNER_GRADIENT}
                style={styles.gradientBackground}
            >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View>
                        <Text style={[styles.signatureLabel, { color: theme.SUBTEXT }]}>{label}</Text>
                        <AnimatedCounter value={value} style={[styles.signatureValue, { color: theme.TEXT }]} />
                    </View>
                    <View style={styles.progressCircleWrapper}>
                        <View style={[styles.progressCircleBackground, { backgroundColor: `${color}20` }]}>
                            <AnimatedCounter value={percentage} style={[styles.progressText, { color }]} />
                            <Text style={[styles.progressText, { color, fontSize: 12 }]}>%</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.progressDetail}>
                    <Text style={[styles.progressGoalText, { color: theme.SUBTEXT }]}>
                        Goal: {goal.toLocaleString()}
                    </Text>
                    <View style={[styles.progressBar, { backgroundColor: theme.BORDER }]}>
                        <Animated.View 
                            style={[
                                styles.progressBarFill, 
                                { 
                                    width: progressAnim.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ['0%', '100%'],
                                        extrapolate: 'clamp',
                                    }),
                                    backgroundColor: color 
                                }
                            ]} 
                        />
                    </View>
                </View>
                <View style={[styles.cardGlow, { backgroundColor: `${color}15` }]} />
            </LinearGradient>
        </Animated.View>
    );
});

const SystemHealthBanner = React.memo(({ health, theme }) => {
    const apiColor = health.apiStatus ? SUCCESS_COLOR : DANGER_COLOR;
    const apiText = health.apiStatus ? "Connected - ✅✅ MongoDB connected" : "Disconnected - ❌ MongoDB connection failed";
    
    return (
        <LinearGradient
            colors={theme.HEALTH_BANNER_GRADIENT}
            style={styles.healthBannerContainer(theme)}
        >
            <View style={styles.healthItem}>
                <Ionicons 
                    name={health.apiStatus ? "globe-outline" : "alert-circle-outline"} 
                    size={16} 
                    color={apiColor} 
                />
                <Text style={[styles.healthText, { color: apiColor }]}>
                    API {apiText}
                </Text>
            </View>

            <View style={styles.healthItem}>
                <MaterialCommunityIcons name="pipe-valve" size={16} color={PRIMARY_COLOR} />
                <Text style={[styles.healthText, { color: theme.TEXT }]}>
                    <Text style={{ fontWeight: '700' }}>{health.suppliersActive}</Text> Suppliers Active
                </Text>
            </View>
        </LinearGradient>
    );
});

const RealTimeMetricsChart = React.memo(({ users, driversCount, orders, revenue, theme }) => {
    const chartData = {
        labels: ["Users", "Drivers", "Orders", "Revenue"],
        datasets: [{
            data: [users.length, driversCount, orders.length, revenue]
        }]
    };

    const chartConfig = {
        backgroundColor: theme.CARD_BG,
        backgroundGradientFrom: theme.CARD_BG,
        backgroundGradientTo: theme.CARD_BG,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        labelColor: (opacity = 1) => theme.SUBTEXT,
        style: { borderRadius: 16 },
    };

    return (
        <View style={styles.chartContainer(theme)}>
            <Text style={styles.sectionHeader(theme, true)}>Real-Time Metrics</Text>
            <BarChart
                data={chartData}
                width={width - 32 - 32}
                height={220}
                yAxisLabel=""
                chartConfig={chartConfig}
                style={{ marginVertical: 8, borderRadius: 16 }}
                fromZero
                withInnerLines={false}
            />
        </View>
    );
});

const DailySalesChart = React.memo(({ salesVolume, theme }) => {
    // Generate labels for last 7 days
    const labels = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    const chartData = {
        labels: labels,
        datasets: [{ data: salesVolume }]
    };

    const chartConfig = {
        backgroundColor: theme.CARD_BG,
        backgroundGradientFrom: theme.CARD_BG,
        backgroundGradientTo: theme.CARD_BG,
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        labelColor: (opacity = 1) => theme.SUBTEXT,
        style: { borderRadius: 16 },
    };

    return (
        <View style={styles.chartContainer(theme)}>
            <Text style={styles.sectionHeader(theme, true)}>Daily Sales Volume (m³)</Text>
            <BarChart
                data={chartData}
                width={width - 32 - 32}
                height={220}
                yAxisLabel=""
                chartConfig={chartConfig}
                style={{ marginVertical: 8, borderRadius: 16 }}
                fromZero
                withInnerLines={false}
            />
        </View>
    );
});

const QuickActionButton = React.memo(({ item, theme, navigation }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const onPress = () => {
        Vibration.vibrate(10);
        if (item.screen && navigation) {
            if (typeof navigation.navigate === 'function') {
                navigation.navigate(item.screen);
            } else {
                Alert.alert("Navigation Error", `Navigation for ${item.name} is not set up.`);
            }
        } else if (item.action) {
            item.action();
        }
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }], width: (width - 48) / 2, marginBottom: 16 }}>
            <Pressable
                style={[styles.quickActionButton(theme), { borderColor: item.color + '30' }]}
                onPress={onPress}
            >
                <MaterialCommunityIcons name={item.icon} size={30} color={item.color} />
                <Text style={[styles.quickActionText, { color: theme.TEXT }]}>{item.name}</Text>
            </Pressable>
        </Animated.View>
    );
});

const AnimatedLoadBar = React.memo(({ label, value, max, theme }) => {
    const widthAnim = useRef(new Animated.Value(0)).current;
    const loadPercent = Math.min(100, Math.round((value / max) * 100));

    let color = SUCCESS_COLOR;
    if (value > 80) color = DANGER_COLOR;
    else if (value > 50) color = SECONDARY_COLOR;
    

    useEffect(() => {
        Animated.timing(widthAnim, {
            toValue: loadPercent,
            duration: 1500,
            useNativeDriver: false,
            delay: 300,
        }).start();
    }, [value]);

    const barWidth = widthAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.loadBarContainer(theme)}>
            <Text style={[styles.loadBarLabel, { color: theme.SUBTEXT }]}>{label}</Text>
            <View style={styles.loadBarValueRow}>
                <Text style={[styles.loadBarValue, { color: theme.TEXT }]}>{value}%</Text>
                <Text style={[styles.loadBarStatus, { color: color }]}>
                    {value > 80 ? "CRITICAL" : (value > 50 ? "HIGH" : "NORMAL")}
                </Text>
            </View>
            <View style={styles.progressBarWrapper(theme)}>
                <Animated.View style={[styles.progressBarFillLoad, { width: barWidth, backgroundColor: color }]} />
            </View>
        </View>
    );
});

const ActivityStreamItem = React.memo(({ item, index, theme }) => {
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(10)).current;
    const backgroundColorAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: false, delay: index * 50 }), // **FIX: Explicitly set to false**
            Animated.timing(translateYAnim, { toValue: 0, duration: 400, useNativeDriver: false, delay: index * 50 }), // **FIX: Explicitly set to false**
        ]).start(() => {
            // Brief highlight on load
            Animated.sequence([
                Animated.timing(backgroundColorAnim, { toValue: 1, duration: 150, useNativeDriver: false }),
                Animated.timing(backgroundColorAnim, { toValue: 0, duration: 600, useNativeDriver: false }),
            ]).start();
        });
    }, [item, index]);

    const statusConfig = useMemo(() => {
        switch ((item.order_status || '').toLowerCase()) {
            case "delivered": return { icon: "check-circle", color: SUCCESS_COLOR, type: "Delivery" };
            case "pending": return { icon: "hourglass-empty", color: SECONDARY_COLOR, type: "Order" }; // **FIX: Corrected icon name**
            case "cancelled": return { icon: "cancel", color: DANGER_COLOR, type: "Alert" };
            default: return { icon: "info-outline", color: PRIMARY_COLOR, type: "Event" };
        }
    }, [item.order_status]);

    const interpolatedColor = backgroundColorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.CARD_BG, statusConfig.color + '20'],
    });

    const time = item.created_at ? new Date(item.created_at).toLocaleString() : "N/A";

    return (
        <Animated.View
            style={[
                styles.activityItemContainer(theme),
                {
                    opacity: opacityAnim,
                    transform: [{ translateY: translateYAnim }],
                    backgroundColor: interpolatedColor,
                }
            ]}
        >
            <MaterialIcons name={statusConfig.icon} size={18} color={statusConfig.color} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
                <Text style={[styles.activityText, { color: theme.TEXT, fontWeight: '600' }]}>
                    {statusConfig.type}: <Text style={{ color: PRIMARY_COLOR }}>{item._id}</Text>
                </Text>
                <Text style={[styles.activitySubText, { color: theme.SUBTEXT }]}>
                    {item.customer_name} - Driver {item.assigned_driver_id || 'N/A'}
                </Text>
            </View>
            <Text style={[styles.activityTime, { color: theme.SUBTEXT }]}>{time}</Text>
        </Animated.View>
    );
});



export default function DashboardScreen({ navigation }) {
    const [refreshing, setRefreshing] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [realOrders, setRealOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [ordersError, setOrdersError] = useState(null);
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [usersError, setUsersError] = useState(null);
    const [driversCount, setDriversCount] = useState(0);
    const [loadingDrivers, setLoadingDrivers] = useState(true);
    const [driversError, setDriversError] = useState(null);
    const [revenue, setRevenue] = useState(0);
    const [loadingRevenue, setLoadingRevenue] = useState(true);
    const [revenueError, setRevenueError] = useState(null);
    const [salesVolume, setSalesVolume] = useState([]);
    const [loadingSales, setLoadingSales] = useState(true);
    const [salesError, setSalesError] = useState(null);
    const [serverLoad, setServerLoad] = useState(10);

    const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

    const scrollY = useRef(new Animated.Value(0)).current;

    // Fetch orders from backend
    const fetchOrders = async () => {
        try {
            setLoadingOrders(true);
            setOrdersError(null);
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
            setRealOrders(data.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrdersError(error.message);
            Alert.alert('Error', 'Failed to fetch orders from backend. Using mock data.');
        } finally {
            setLoadingOrders(false);
        }
    };

    // Fetch users from backend
    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            setUsersError(null);
            const response = await fetch(API.ADMIN_USERS, {
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
            setUsers(data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsersError(error.message);
            Alert.alert('Error', 'Failed to fetch users from backend.');
        } finally {
            setLoadingUsers(false);
        }
    };

    // Fetch drivers count from backend
    const fetchDriversCount = async () => {
        try {
            setLoadingDrivers(true);
            setDriversError(null);
            const response = await fetch(API.ADMIN_DRIVERS_COUNT, {
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
            setDriversCount(data.total_drivers || 0);
        } catch (error) {
            console.error('Error fetching drivers count:', error);
            setDriversError(error.message);
            Alert.alert('Error', 'Failed to fetch drivers count from backend.');
        } finally {
            setLoadingDrivers(false);
        }
    };

    // Fetch revenue from backend
    const fetchRevenue = async () => {
        try {
            setLoadingRevenue(true);
            setRevenueError(null);
            const response = await fetch(API.ADMIN_ORDERS_REVENUE, {
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
            setRevenue(data.total_revenue || 0);
        } catch (error) {
            console.error('Error fetching revenue:', error);
            setRevenueError(error.message);
            Alert.alert('Error', 'Failed to fetch revenue from backend.');
        } finally {
            setLoadingRevenue(false);
        }
    };

    // Fetch sales volume from backend
    const fetchSalesVolume = async () => {
        try {
            setLoadingSales(true);
            setSalesError(null);
            const response = await fetch(API.ADMIN_SALES_VOLUME, {
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
            setSalesVolume(data.sales_volume || []);
        } catch (error) {
            console.error('Error fetching sales volume:', error);
            setSalesError(error.message);
            Alert.alert('Error', 'Failed to fetch sales volume from backend.');
        } finally {
            setLoadingSales(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchUsers();
        fetchDriversCount();
        fetchRevenue();
        fetchSalesVolume();

        // Real-time updates
        const revenueInterval = setInterval(() => {
            fetchRevenue();
        }, 30000); // Update revenue every 30 seconds

        const generalInterval = setInterval(() => {
            fetchOrders();
            fetchUsers();
            fetchDriversCount();
            fetchSalesVolume();
        }, 60000); // Update others every 60 seconds

        // Update server load randomly between 10 and 57 every 5 seconds
        const serverLoadInterval = setInterval(() => {
            const randomLoad = Math.floor(Math.random() * (57 - 10 + 1)) + 10;
            setServerLoad(randomLoad);
        }, 5000);

        return () => {
            clearInterval(revenueInterval);
            clearInterval(generalInterval);
            clearInterval(serverLoadInterval);
        };
    }, []);

    const recentOrders = useMemo(() => {
        return [...realOrders]
            .slice(0, 5);
    }, [realOrders]);

    const userStats = useMemo(() => {
        const totalUsers = users.length;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsers30d = users.filter(user => {
            const createdAt = new Date(user.created_at);
            return createdAt >= thirtyDaysAgo;
        }).length;
        return [
            { label: "Total Users", value: totalUsers, icon: "people", color: PRIMARY_COLOR, detail: "Registered" },
            { label: "New Users (30d)", value: newUsers30d, icon: "person-add", color: SUCCESS_COLOR, detail: "This Month" },
        ];
    }, [users]);

    const deliveryStats = useMemo(() => {
        const totalOrders = realOrders.length;
        const deliveredOrders = realOrders.filter(order => order.order_status === 'delivered').length;
        const pendingOrders = realOrders.filter(order => order.order_status === 'pending').length;
        return [
            { label: "Total Orders", value: totalOrders, icon: "receipt", color: PRIMARY_COLOR, trend: "+12%" },
            { label: "Delivered", value: deliveredOrders, icon: "check-circle", color: SUCCESS_COLOR, trend: "+8%" },
            { label: "Pending", value: pendingOrders, icon: "hourglass-empty", color: SECONDARY_COLOR, trend: "-5%" },
        ];
    }, [realOrders]);

    const logisticsStats = useMemo(() => {
        return [
            { label: "Active Drivers", value: driversCount, icon: "local-shipping", color: PRIMARY_COLOR, detail: "On Duty" },
            { label: "Total Revenue", value: revenue, icon: "attach-money", color: SUCCESS_COLOR, detail: "Real-time" },
        ];
    }, [driversCount, revenue]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders().finally(() => {
            setRefreshing(false);
            Vibration.vibrate(50);
        });
    };
    
    // Mock navigation handler
    const handleDetailCardPress = (label) => {
        if (navigation && typeof navigation.navigate === 'function') {
            switch (label) {
                case "Total Users":
                case "New Users (30d)":
                    navigation.navigate("UserManagement");
                    break;
                case "Total Orders":
                    navigation.navigate("OrderHistory");
                    break;
                case "Total Delivery Trucks":
                case "Active Drivers":
                    // navigation.navigate("FleetManagement");
                    Alert.alert("Details", `Navigating to FleetManagement for ${label}`);
                    break;
                case "Filling Stations":
                case "Total Cylinders":
                case "Empty Inventory":
                case "Refill Capacity (m³)":
                    // navigation.navigate("LogisticsManagement");
                    Alert.alert("Details", `Navigating to Logistics for ${label}`);
                    break;
                default:
                    Alert.alert("Details", `Viewing details for ${label}`);
            }
        } else {
            Alert.alert("Details", `Viewing details for ${label}`);
        }
    };

    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, 100], outputRange: [0, -50], extrapolate: 'clamp',
    });
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 50], outputRange: [1, 0], extrapolate: 'clamp',
    });

    return (
        <SafeAreaView style={styles.safeArea(theme)}>
            {/* --- TOP SYSTEM STATUS BAR --- */}
            <SystemHealthBanner health={MOCK_SYSTEM_HEALTH} theme={theme} />
            
            <View style={{ marginHorizontal: 16, marginTop: 10 }}>
                <AnimatedLoadBar
                    label="Primary Server Load"
                    value={serverLoad}
                    max={100}
                    theme={theme}
                />
            </View>

            {/* 🚀 SCROLLABLE CONTENT: This Animated.ScrollView wraps EVERYTHING else. */}
            <Animated.ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContentContainer}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh} 
                        tintColor={PRIMARY_COLOR} 
                        progressBackgroundColor={theme.CARD_BG}
                    />
                }
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false } 
                )}
                scrollEventThrottle={16}
            >
                {/* Dashboard Header - Animated to hide on scroll */}
                <Animated.View 
                    style={[
                        styles.headerContainer,
                        { transform: [{ translateY: headerTranslateY }], opacity: headerOpacity }
                    ]}
                >
                    <LinearGradient
                        colors={theme.HEADER_GRADIENT}
                        style={styles.headerGradient}
                    >
                        <Text style={[styles.header, { color: theme.TEXT }]}>Operational Command Center</Text>
                        <Text style={[styles.subheader, { color: theme.SUBTEXT }]}>Real-time delivery logistics and inventory.</Text>
                    </LinearGradient>
                </Animated.View>

                {/* TOGGLE & KEY METRIC */}
                <View style={styles.topSection}>
                    {/* Dark Mode Toggle - Kept TouchableOpacity for simplicity and single use */}
                    <TouchableOpacity 
                        style={styles.modeToggle(theme)} 
                        onPress={() => setIsDarkMode(!isDarkMode)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name={isDarkMode ? "sunny-outline" : "moon-outline"} size={20} color={isDarkMode ? SECONDARY_COLOR : PRIMARY_COLOR} />
                        <Text style={[styles.modeToggleText, { color: isDarkMode ? SECONDARY_COLOR : PRIMARY_COLOR }]}>
                            {isDarkMode ? "Light Mode" : "Dark Mode"}
                        </Text>
                    </TouchableOpacity>
                    {/* SIGNATURE METRIC CARD */}
                    <View style={styles.signatureCardOuter}>
                        <AnimatedKeyMetricCard
                            label="Total Orders Handled"
                            value={realOrders.length}
                            goal={1000}
                            color={SECONDARY_COLOR}
                            theme={theme}
                        />
                    </View>
                </View>
                
                {/* QUICK ACTION GRID */}
                <Text style={styles.sectionHeader(theme)}>Quick Admin Actions</Text>
                <View style={styles.statsContainer}> 
                    {MOCK_QUICK_ACTIONS.map((action, idx) => (
                        <QuickActionButton 
                            key={idx} 
                            item={action} 
                            theme={theme} 
                            navigation={navigation}
                        />
                    ))}
                </View>

                {/* USER OVERVIEW */}
                <Text style={styles.sectionHeader(theme)}>User Overview</Text>
                <View style={styles.statsContainer}>
                    {userStats.map((stat, idx) => (
                        <DetailStatCard
                            key={idx}
                            stat={stat}
                            index={idx}
                            theme={theme}
                            delayOffset={0}
                            onPress={() => handleDetailCardPress(stat.label)}
                        />
                    ))}
                </View>

                {/* DELIVERY OPERATIONS SUMMARY */}
                <Text style={styles.sectionHeader(theme)}>Delivery Operations Summary</Text>
                <View style={styles.statsContainer}>
                    {deliveryStats.map((stat, idx) => (
                        <EnhancedStatCard key={idx} stat={stat} index={idx} theme={theme} />
                    ))}
                </View>

                {/* GAS LOGISTICS ASSET OVERVIEW */}
                <Text style={styles.sectionHeader(theme)}>Logistics & Asset Overview</Text>
                <View style={styles.statsContainer}>
                    {logisticsStats.map((stat, idx) => (
                        <DetailStatCard
                            key={idx}
                            stat={stat}
                            index={idx}
                            theme={theme}
                            delayOffset={4}
                            onPress={() => handleDetailCardPress(stat.label)}
                        />
                    ))}
                </View>

                {/* GRAPHS */}
                <RealTimeMetricsChart users={users} driversCount={driversCount} orders={realOrders} revenue={revenue} theme={theme} />
                <DailySalesChart salesVolume={salesVolume} theme={theme} />
                
                {/* LIVE ACTIVITY LOG */}
                <Text style={styles.sectionHeader(theme)}>Live Activity Log</Text>
                <View style={[styles.chartContainer(theme), { padding: 0, marginBottom: 20 }]}>
                    {loadingOrders && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={PRIMARY_COLOR} />
                            <Text style={[styles.loadingText, { color: theme.SUBTEXT }]}>Loading orders...</Text>
                        </View>
                    )}
                    {ordersError && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle-outline" size={24} color={DANGER_COLOR} />
                            <Text style={[styles.errorText, { color: DANGER_COLOR }]}>Error: {ordersError}</Text>
                        </View>
                    )}
                    {!loadingOrders && !ordersError && recentOrders.map((item, index) => (
                        <ActivityStreamItem key={item._id || index} item={item} index={index} theme={theme} />
                    ))}
                </View>
            </Animated.ScrollView>
        </SafeAreaView>
    );
}

// --- ⚙️ &&& COMPLETE STYLESHEET ---
const styles = StyleSheet.create({
    safeArea: (theme) => ({
        flex: 1,
        backgroundColor: theme.BG,
    }),
    
    scrollView: {
        flex: 1, 
    },
    
    scrollContentContainer: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 50, 
    },
    
    // --- Header Styles  ---
    headerContainer: {
        paddingHorizontal: 0,
        marginBottom: 10,
    },
    headerGradient: {
        paddingVertical: 10,
        paddingHorizontal: 16, 
        borderRadius: 12,
    },
    header: {
        fontSize: 28,
        fontWeight: '900',
        marginLeft: 0,
        marginBottom: 4,
    },
    subheader: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 0,
    },

    // --- System Health Banner ---
    healthBannerContainer: (theme) => ({
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.BORDER,
    }),
    healthItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    healthText: {
        marginLeft: 4,
        fontSize: 12,
        fontWeight: '500',
    },
    loadBarContainer: (theme) => ({
        paddingVertical: 10,
        marginBottom: 10,
    }),
    loadBarLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    loadBarValueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    loadBarValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    loadBarStatus: {
        fontSize: 12,
        fontWeight: '800',
    },
    progressBarWrapper: (theme) => ({
        height: 6,
        backgroundColor: theme.BORDER,
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 4,
    }),
    progressBarFillLoad: {
        height: '100%',
        borderRadius: 3,
    },

    // --- Layout & Section Headers ---
    topSection: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    modeToggle: (theme) => ({
        flexDirection: 'row',
        alignSelf: 'flex-end',
        alignItems: 'center',
        padding: 8,
        borderRadius: 20,
        backgroundColor: theme.CARD_BG,
        borderColor: theme.BORDER,
        borderWidth: 1,
        marginBottom: 10,
    }),
    modeToggleText: {
        marginLeft: 6,
        fontSize: 12,
        fontWeight: '700',
    },
    sectionHeader: (theme) => ({
        fontSize: 18,
        fontWeight: '800',
        color: theme.TEXT,
        marginTop: 15,
        marginBottom: 10,
    }),
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 10,
    },

    // --- Enhanced Stat Card ---
    enhancedCard: (theme) => ({
        backgroundColor: theme.CARD_BG,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
        marginRight: 16, 
        overflow: 'hidden',
       
        ...Platform.select({
            ios: {
                shadowColor: theme.TEXT,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
            web: {
              
                boxShadow: `0px 2px 4px ${theme.TEXT}0D`,
            },
        }),
    }),
    cardGradient: {
        padding: 12,
        borderRadius: 12,
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardContent: {
        marginTop: 10,
    },
    cardValue: {
        fontSize: 24,
        fontWeight: '900',
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    trendText: {
        fontSize: 14,
        fontWeight: '700',
    },

    // --- Detail Stat Card ---
    logisticsCard: (theme) => ({
        backgroundColor: theme.CARD_BG,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
        overflow: 'hidden',
       
        ...Platform.select({
            ios: {
                shadowColor: theme.TEXT,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
            web: {
                
                boxShadow: `0px 2px 4px ${theme.TEXT}0D`,
            },
        }),
    }),
    cardDetail: {
        fontSize: 10,
        fontWeight: '700',
        marginTop: 4,
    },

    // --- Key Metric ( i like to call this------Signature Card) ---
    signatureCardOuter: {
        width: '100%',
        marginBottom: 20,
    },
    signatureCard: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: SECONDARY_COLOR + '40',
        position: 'relative',
        transformOrigin: 'center',
    },
    gradientBackground: {
        padding: 16,
    },
    signatureLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    signatureValue: {
        fontSize: 36,
        fontWeight: '900',
    },
    progressCircleWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressCircleBackground: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    progressText: {
        fontSize: 20,
        fontWeight: '900',
    },
    progressDetail: {
        marginTop: 15,
    },
    progressGoalText: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
    },
    cardGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        zIndex: -1,
        opacity: 0.5,
    },

    // --- Charts ---
    chartContainer: (theme) => ({
        backgroundColor: theme.CARD_BG,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: theme.BORDER,
    
        ...Platform.select({
            ios: {
                shadowColor: theme.TEXT,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
            web: {
        
                boxShadow: `0px 4px 8px ${theme.TEXT}0D`,
            },
        }),
    }),
    criticalWarning: {
        color: DANGER_COLOR,
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 10,
        padding: 8,
        backgroundColor: DANGER_COLOR + '10',
        borderRadius: 8,
        textAlign: 'center',
    },

    // --- Quick Actions ---
    quickActionButton: (theme) => ({
        backgroundColor: theme.CARD_BG,
        borderRadius: 12,
        borderWidth: 1,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
        shadowColor: theme.TEXT,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    }),
    quickActionText: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
    },

    // --- Activity Stream ---
    activityItemContainer: (theme) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.BORDER,
    }),
    activityText: {
        fontSize: 14,
    },
    activitySubText: {
        fontSize: 11,
        marginTop: 2,
    },
    activityTime: {
        fontSize: 12,
        fontWeight: '500',
    },
    statusTag: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    statusTagText: {
        fontSize: 10,
        fontWeight: '700',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
    },
    errorContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        marginTop: 10,
        fontSize: 14,
        textAlign: 'center',
    }
});

// --- MOCK DATA: Only keeping used ones ---
const MOCK_SYSTEM_HEALTH = { apiStatus: true, suppliersActive: 0 };
const MOCK_QUICK_ACTIONS = [
    { name: "View Orders", icon: "clipboard-list", color: PRIMARY_COLOR, screen: "OrderHistory" },
    { name: "Global Price Update", icon: "currency-usd", color: SECONDARY_COLOR, screen: "GlobalPriceUpdate" },
];
