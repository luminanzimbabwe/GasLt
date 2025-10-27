import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    SafeAreaView,
    Animated,
    LayoutAnimation,
    Platform,
    UIManager,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API } from '../api';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');


const processFinanceData = (orders, revenue, salesVolume, driversCount, users) => {
  
    if (!Array.isArray(orders)) {
        console.error("Orders data is not an array:", orders);
        orders = [];
    }

   
    if (!Array.isArray(users)) {
        console.error("Users data is not an array:", users);
        users = [];
    }

   
    const totalRevenue = revenue.total_revenue || 0;

    
    const operationalCost = revenue.operational_costs || 0;

    
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - operationalCost) / totalRevenue) * 100 : 0;

   
    const dailyRevenue = totalRevenue / 7;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const dailySalesHistory = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const isDay1 = i === 0;
        const isToday = i === 6;

        dailySalesHistory.push({
            day: days[date.getDay()],
            sales: dailyRevenue,
            isDay1: isDay1,
            isToday: isToday
        });
    }

    const dayOneSales = dailyRevenue;
    const currentDaySales = dailyRevenue;
    const totalSinceDay1 = totalRevenue;
    const weeklyGrowth = 0; 

   
    const cashInflow = dailySalesHistory.map(day => day.sales);
    const cashOutflow = cashInflow.map(inflow => inflow * 0.6); 

   
    const salesBreakdown = [];

    
    const driverPerformance = driversCount.drivers?.map((driver, index) => ({
        id: driver.id,
        name: `${driver.name} (${driver.truck_id || 'T' + (index + 1)})`,
        income: driver.daily_income || Math.random() * 5000 + 2000,
        deliveries: driver.deliveries_today || Math.floor(Math.random() * 10) + 1,
        efficiency: driver.efficiency || Math.floor(Math.random() * 20) + 80
    })) || [];

    
    const driverTarget = 10000;

    return {
        totalRevenue,
        operationalCost,
        profitMargin,
        driverTarget,
        dailySalesData: {
            dayOneSales,
            currentDaySales,
            totalSinceDay1,
            dailySalesHistory,
            weeklyGrowth
        },
        cashInflow,
        cashOutflow,
        salesBreakdown,
        driverPerformance,
        orders,
        totalUsers: users.length || 0,
        totalDrivers: driversCount.total || 0
    };
};


const DailySalesMetricsCard = ({ dailySalesData, delay }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                delay: delay,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                delay: delay,
                useNativeDriver: true,
            })
        ]).start();
    }, [delay]);

    const { dayOneSales, currentDaySales, totalSinceDay1, weeklyGrowth } = dailySalesData;

    return (
        <Animated.View 
            style={[
                styles.salesMetricsCard, 
                { 
                    opacity: fadeAnim, 
                    transform: [{ translateY: slideAnim }] 
                }
            ]}
        >
            <View style={styles.metricsHeader}>
                <Ionicons name="analytics-outline" size={24} color="#007AFF" />
                <Text style={styles.metricsTitle}>📊 Revenue Performance Tracker</Text>
            </View>

            <View style={styles.metricsGrid}>
                {/* Day One Revenue */}
                <View style={[styles.metricItem, styles.dayOneMetric]}>
                    <Text style={styles.metricLabel}>Day 1 Baseline</Text>
                    <Text style={styles.metricValue}>${dayOneSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                    <Text style={styles.metricSubtext}>Starting point</Text>
                </View>

                {/* Current Day Revenue */}
                <View style={[styles.metricItem, styles.currentDayMetric]}>
                    <Text style={styles.metricLabel}>Today's Revenue</Text>
                    <Text style={[styles.metricValue, { color: '#34C759' }]}>${currentDaySales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                    <Text style={styles.metricSubtext}>Current performance</Text>
                </View>

                {/* Total Revenue Since Day 1 */}
                <View style={[styles.metricItem, styles.totalMetric]}>
                    <Text style={styles.metricLabel}>Total Revenue Since Day 1</Text>
                    <Text style={[styles.metricValue, { color: '#007AFF' }]}>${totalSinceDay1.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                    <Text style={styles.metricSubtext}>Cumulative earnings</Text>
                </View>

                {/* Weekly Growth */}
                <View style={[styles.metricItem, styles.growthMetric]}>
                    <Text style={styles.metricLabel}>Weekly Growth</Text>
                    <Text style={[styles.metricValue, { color: weeklyGrowth > 0 ? '#34C759' : '#FF3B30' }]}>
                        {weeklyGrowth > 0 ? '+' : ''}{weeklyGrowth.toFixed(1)}%
                    </Text>
                    <Text style={styles.metricSubtext}>vs. Day 1</Text>
                </View>
            </View>
        </Animated.View>
    );
};


const DailySalesChart = ({ dailySalesHistory, delay }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const maxSales = Math.max(...dailySalesHistory.map(d => d.sales));

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            delay: delay,
            useNativeDriver: true,
        }).start();
    }, [delay]);

    return (
        <Animated.View style={[styles.chartCard, { opacity: fadeAnim }]}>
            <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>📈 Daily Sales Breakdown (Last 7 Days)</Text>
                <Text style={styles.chartSubtitle}>Track daily performance and trends</Text>
            </View>
            
            <View style={styles.dailySalesChart}>
                {dailySalesHistory.map((dayData, index) => (
                    <DailySalesBar 
                        key={index} 
                        dayData={dayData} 
                        maxSales={maxSales} 
                        index={index}
                    />
                ))}
            </View>
            
            <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
                    <Text style={styles.legendText}>Day 1 Baseline</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#34C759' }]} />
                    <Text style={styles.legendText}>Today's Sales</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
                    <Text style={styles.legendText}>Other Days</Text>
                </View>
            </View>
        </Animated.View>
    );
};


const DailySalesBar = ({ dayData, maxSales, index }) => {
    const heightAnim = useRef(new Animated.Value(0)).current;
    const isToday = index === 6; 
    const isDay1 = dayData.isDay1;
    
    const barColor = isDay1 ? '#FF9500' : isToday ? '#34C759' : '#007AFF';
    const barHeight = (dayData.sales / maxSales) * 120; 

    useEffect(() => {
        Animated.timing(heightAnim, {
            toValue: barHeight,
            duration: 600,
            delay: 100 * index,
            useNativeDriver: false,
        }).start();
    }, [barHeight, index]);

    return (
        <View style={styles.dailyBarContainer}>
            <Text style={styles.dailyBarValue}>
                ${dayData.sales.toLocaleString()}
            </Text>
            <Animated.View
                style={[
                    styles.dailyBar,
                    {
                        height: heightAnim,
                        backgroundColor: barColor,
                        borderWidth: isToday || isDay1 ? 2 : 0,
                        borderColor: isToday || isDay1 ? '#FFF' : 'transparent',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 5,
                    }
                ]}
            />
            <Text style={[
                styles.dailyBarLabel,
                { fontWeight: isToday || isDay1 ? 'bold' : 'normal' }
            ]}>
                {dayData.day}
                {isDay1 && '\n(Day 1)'}
                {isToday && '\n(Today)'}
            </Text>
        </View>
    );
};


const AnimatedSalesCircular = ({ percentage, value, label, currentSales }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    const rotation = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: ['-135deg', '225deg'],
    });

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: percentage,
            duration: 1200,
            useNativeDriver: true,
        }).start();
    }, [percentage]);

    const indicatorColor = percentage >= 75 ? '#34C759' : percentage >= 50 ? '#FF9500' : '#FF3B30';

    return (
        <View style={styles.circularContainer}>
            <View style={styles.circularRingBackground} />

            <Animated.View style={[
                styles.circularRing,
                {
                    borderColor: indicatorColor,
                    transform: [{ rotate: rotation }]
                }
            ]}>
                <Text style={[styles.circularPercentage, { color: indicatorColor }]}>{percentage}%</Text>
                <Text style={styles.circularLabel}>{label}</Text>
            </Animated.View>

            <Text style={styles.circularValue}>📋 Total Revenue: ${currentSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
        </View>
    );
};


const KPICard = ({ title, value, color, icon, isCurrency = true, delay }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: delay,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                delay: delay,
                useNativeDriver: true,
            })
        ]).start();
    }, [delay]);

    return (
        <Animated.View 
            style={[
                styles.kpiCard, 
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
            ]}
        >
            <Ionicons name={icon} size={28} color={color} />
            <Text style={styles.kpiValue} numberOfLines={1}>
                {isCurrency ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `${value.toFixed(1)}%`}
            </Text>
            <Text style={styles.kpiTitle}>{title}</Text>
        </Animated.View>
    );
};



// --- Main Screen Component ---
const FinanceScreen = () => {
    const [financeData, setFinanceData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const containerFadeAnim = useRef(new Animated.Value(0)).current;

    const fetchFinanceData = useCallback(async () => {
        setIsLoading(true);
        try {
            
            const headers = {
                'X-Admin-Pin': '26344',
            };

            const [ordersResponse, revenueResponse, salesVolumeResponse, driversCountResponse, usersResponse] = await Promise.all([
                fetch(API.ADMIN_ORDERS, { headers }),
                fetch(API.ADMIN_ORDERS_REVENUE, { headers }),
                fetch(API.ADMIN_SALES_VOLUME, { headers }),
                fetch(API.ADMIN_DRIVERS_COUNT, { headers }),
                fetch(API.ADMIN_USERS, { headers })
            ]);

            const ordersData = await ordersResponse.json();
            const orders = ordersData.orders || [];
            const revenue = await revenueResponse.json();
            const salesVolumeData = await salesVolumeResponse.json();
            const salesVolume = salesVolumeData.sales_volume || [];
            const driversCount = await driversCountResponse.json();
            const usersData = await usersResponse.json();
            const users = usersData.users || [];

            
            const processedData = processFinanceData(orders, revenue, salesVolume, driversCount, users);

            setFinanceData(processedData);

            Animated.timing(containerFadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();

        } catch (error) {
            console.error("API Hook: Failed to fetch finance data:", error);
            Alert.alert("Error", "Failed to load finance data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFinanceData();
    }, [fetchFinanceData]);

    if (isLoading || !financeData) {
        return (
            <View style={styles.centerContent}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={{ marginTop: 10, color: '#666' }}>📊 Crunching the numbers...</Text>
            </View>
        );
    }

    const {
        totalRevenue,
        operationalCost,
        profitMargin,
        driverTarget,
        dailySalesData,
        cashInflow,
        cashOutflow,
        salesBreakdown,
        driverPerformance,
        orders
    } = financeData;

    const revenueTarget = 10000;

    return (
        <SafeAreaView style={styles.safeArea}>
            <Animated.ScrollView 
                style={[styles.container, { opacity: containerFadeAnim }]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.screenHeader}>💰 Financial Analytics Dashboard</Text>

                {/* --- Section 1: Enhanced Daily Revenue Metrics --- */}
                <Text style={styles.sectionTitle}>🎯 Key Revenue Metrics</Text>
                <DailySalesMetricsCard dailySalesData={dailySalesData} delay={100} />

                {/* --- Section 2: Daily Sales History Chart --- */}
                <Text style={styles.sectionTitle}>📊 Daily Sales Tracking</Text>
                <DailySalesChart dailySalesHistory={dailySalesData.dailySalesHistory} delay={200} />

                {/* --- Section 3: Revenue Target (Animated Circular) --- */}
                <Text style={styles.sectionTitle}>🚛 Revenue Target Completion</Text>
                <View style={styles.driverSection}>
                    <AnimatedSalesCircular
                        percentage={(totalRevenue / revenueTarget) * 100}
                        value={revenueTarget}
                        label="Total Revenue Target"
                        currentSales={totalRevenue}
                    />
                </View>
                
                {/* --- Section 4: Top-Level KPIs (Animated Scale) --- */}
                <Text style={styles.sectionTitle}>📈 Overall Performance Indicators</Text>
                <View style={styles.kpiGrid}>
                    <KPICard title="💵 Total Revenue" value={totalRevenue} color="#34C759" icon="trending-up-outline" delay={300} />
                    <KPICard title="💸 Operational Costs" value={operationalCost} color="#FF3B30" icon="trending-down-outline" delay={400} />
                    <KPICard title="📊 Net Profit Margin" value={profitMargin} color="#007AFF" icon="calculator-outline" isCurrency={false} delay={500} />
                    <KPICard title="📅 YTD Sales Growth" value={12.5} color="#FF9500" icon="stats-chart-outline" isCurrency={false} delay={600} />
                </View>

                {/* --- Section 5: Cash Flow Analytics (Graphs) --- */}
                <Text style={styles.sectionTitle}>💹 Cash Flow & Economic Trends</Text>
                <MockLineChart title="💰 Cash Inflow (Sales Revenue)" data={cashInflow} color="#34C759" />
                <MockLineChart title="💸 Cash Outflow (Operating Expenses)" data={cashOutflow} color="#FF3B30" />
                

                

                
                <View style={{ height: 50 }} />
            </Animated.ScrollView>
        </SafeAreaView>
    );
};


const MockLineChart = ({ title, data, color }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const maxValue = Math.max(...data);
    const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            delay: 500,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={[styles.chartCard, { opacity: fadeAnim }]}>
            <Text style={styles.chartTitle}>{title}</Text>
            <View style={[styles.chartArea, { backgroundColor: `${color}15` }]}>
                <View style={styles.barChart}>
                    {data.map((value, index) => (
                        <CashFlowBar
                            key={index}
                            value={value}
                            maxValue={maxValue}
                            color={color}
                            label={days[index]}
                            index={index}
                        />
                    ))}
                </View>
            </View>
            <Text style={styles.chartFooter}>📅 Data for the last 7 days (in USD).</Text>
        </Animated.View>
    );
};

// 5. Individual Cash Flow Bar Component
const CashFlowBar = ({ value, maxValue, color, label, index }) => {
    const heightAnim = useRef(new Animated.Value(0)).current;
    const barHeight = maxValue > 0 ? (value / maxValue) * 100 : 0; // Max height 100

    useEffect(() => {
        Animated.timing(heightAnim, {
            toValue: barHeight,
            duration: 600,
            delay: 100 * index,
            useNativeDriver: false,
        }).start();
    }, [barHeight, index]);

    return (
        <View style={styles.barContainer}>
            <Text style={styles.barValue}>${value.toFixed(2)}</Text>
            <Animated.View
                style={[
                    styles.bar,
                    {
                        height: heightAnim,
                        backgroundColor: color,
                    }
                ]}
            />
            <Text style={styles.barLabel}>{label}</Text>
        </View>
    );
};

const OrderRow = ({ order }) => (
    <View style={styles.driverRow}>
        <Text style={[styles.driverCell, { flex: 1, fontWeight: '600' }]} numberOfLines={1}>{order.id}</Text>
        <Text style={[styles.driverCell, { flex: 2, color: '#34C759' }]}>${(order.total_amount || order.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
        <Text style={[styles.driverCell, { flex: 2 }]} numberOfLines={1}>{order.driver_name || 'N/A'}</Text>
        <Text style={[styles.driverCell, { flex: 1, textAlign: 'right', color: order.status === 'completed' ? '#34C759' : order.status === 'pending' ? '#FF9500' : '#FF3B30' }]}>{order.status || 'Unknown'}</Text>
    </View>
);

const DriverRow = ({ driver }) => (
    <View style={styles.driverRow}>
        <Text style={[styles.driverCell, { flex: 2, fontWeight: '600' }]} numberOfLines={1}>{driver.name}</Text>
        <Text style={[styles.driverCell, { flex: 2, color: '#34C759' }]}>${driver.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
        <Text style={[styles.driverCell, { flex: 1, textAlign: 'center' }]}>{driver.deliveries}</Text>
        <Text style={[styles.driverCell, { flex: 1, textAlign: 'right', color: driver.efficiency > 90 ? '#007AFF' : '#FF9500' }]}>{driver.efficiency}%</Text>
    </View>
);

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
    container: { flex: 1, paddingHorizontal: 15, paddingTop: 10 },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
    screenHeader: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 20 },
    sectionTitle: {
        fontSize: 16, fontWeight: '700', color: '#6A6A6A', 
        marginTop: 15, marginBottom: 10,
    },

    // 🌟 Enhanced Sales Metrics Card Styles
    salesMetricsCard: {
        backgroundColor: 'white', 
        borderRadius: 15, 
        padding: 20, 
        marginBottom: 15,
        elevation: 3, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.15, 
        shadowRadius: 4,
    },
    metricsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    metricsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    metricItem: {
        width: (width - 70) / 2,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        borderLeftWidth: 4,
    },
    dayOneMetric: { borderLeftColor: '#FF9500' },
    currentDayMetric: { borderLeftColor: '#34C759' },
    
    totalMetric: { borderLeftColor: '#007AFF' },
    growthMetric: { borderLeftColor: '#8E44AD' },
    metricLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
        marginBottom: 5,
    },
    metricValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 3,
    },
    metricSubtext: {
        fontSize: 10,
        color: '#999',
        fontStyle: 'italic',
    },

    // 🌟 Daily Sales Chart Styles
    chartHeader: {
        marginBottom: 15,
    },
    chartSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    dailySalesChart: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 160,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    dailyBarContainer: {
        alignItems: 'center',
        flex: 1,
    },
    dailyBarValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    dailyBar: {
        width: 25,
        borderRadius: 4,
        marginBottom: 8,
    },
    dailyBarLabel: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
        lineHeight: 14,
    },
    chartLegend: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 5,
    },
    legendText: {
        fontSize: 11,
        color: '#666',
    },

    // 🌟 Enhanced Table Styles
    tableTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    breakdownHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 15,
    },

   
    
    // 1. Circular Progress Styles
    driverSection: { alignItems: 'center', paddingVertical: 10, backgroundColor: 'white', borderRadius: 10, marginBottom: 15 },
    circularContainer: { alignItems: 'center', justifyContent: 'center', padding: 20 },
    circularRingBackground: {
        position: 'absolute',
        width: 150, height: 150, borderRadius: 75, 
        borderWidth: 8, borderColor: '#EAEAEA',
    },
    circularRing: {
        width: 150, height: 150, borderRadius: 75, borderWidth: 8, 
        borderStyle: 'dashed',
        justifyContent: 'center', alignItems: 'center',
    },
    circularPercentage: { fontSize: 36, fontWeight: 'bold' },
    circularLabel: { fontSize: 14, color: '#666', marginTop: 5 },
    circularValue: { fontSize: 16, fontWeight: '500', marginTop: 15, color: '#333' },

    // 2. KPI Grid Styles
    kpiGrid: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    },
    kpiCard: {
        width: (width - 45) / 2, 
        backgroundColor: 'white', padding: 15, borderRadius: 10,
        marginBottom: 15, elevation: 2, shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
    },
    kpiValue: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 5 },
    kpiTitle: { fontSize: 14, color: '#666', marginTop: 2 },

    // 3. Chart Styles
    chartCard: {
        backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, 
        shadowOpacity: 0.1, shadowRadius: 2,
    },
    chartTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 10 },
    chartArea: {
        height: 150, justifyContent: 'center', alignItems: 'center', 
        borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0',
    },
    
    chartFooter: { fontSize: 12, color: '#999', marginTop: 10 },

    // 6. Bar Chart Styles
    barChart: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 120,
        paddingHorizontal: 10,
    },
    barContainer: {
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 8,
    },
    bar: {
        width: 15,
        borderRadius: 6,
        marginBottom: 8,
    },
    barValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    barLabel: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },


    
    // 5. Driver Table Styles
    driverTableCard: {
        backgroundColor: 'white', borderRadius: 10, 
        marginBottom: 15, elevation: 2, shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
    },
    driverRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    driverHeader: {
        backgroundColor: '#F5F5F5',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#E0E0E0',
    },
    driverCell: {
        fontSize: 14,
        color: '#333',
    },
    viewAllButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
    },
    viewAllText: {
        color: '#007AFF',
        fontWeight: '600',
        marginRight: 5,
    }
});

export default FinanceScreen;