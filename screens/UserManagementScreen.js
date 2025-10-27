import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    ActivityIndicator,
    Alert,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { API } from '../api';

// --- 🎨 BRAND PALETTE & THEME ---
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

const UserCard = React.memo(({ user, theme, onDelete }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getRoleColor = (role) => {
        switch (role.toLowerCase()) {
            case 'admin': return DANGER_COLOR;
            case 'driver': return SECONDARY_COLOR;
            case 'customer': return PRIMARY_COLOR;
            default: return theme.SUBTEXT;
        }
    };

    const getVerificationColor = (isVerified) => {
        return isVerified ? SUCCESS_COLOR : DANGER_COLOR;
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete User",
            `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => onDelete(user.id) }
            ]
        );
    };

    return (
        <View style={[styles.userCard(theme), { borderColor: getRoleColor(user.role) + '30' }]}>
            <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: theme.TEXT }]}>{user.username}</Text>
                    <Text style={[styles.userEmail, { color: theme.SUBTEXT }]}>{user.email}</Text>
                </View>
                <View style={styles.headerActions}>
                    <View style={[styles.verificationBadge, { backgroundColor: getVerificationColor(user.is_verified) + '20' }]}>
                        <Ionicons
                            name={user.is_verified ? "checkmark-circle" : "close-circle"}
                            size={16}
                            color={getVerificationColor(user.is_verified)}
                        />
                        <Text style={[styles.verificationText, { color: getVerificationColor(user.is_verified) }]}>
                            {user.is_verified ? "Verified" : "Unverified"}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.deleteButton, { backgroundColor: DANGER_COLOR + '20' }]}
                        onPress={handleDelete}
                    >
                        <MaterialIcons name="delete" size={20} color={DANGER_COLOR} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.userDetails}>
                <View style={styles.detailRow}>
                    <MaterialIcons name="phone" size={16} color={theme.SUBTEXT} />
                    <Text style={[styles.detailText, { color: theme.TEXT }]}>{user.phone_number || 'N/A'}</Text>
                </View>
                <View style={styles.detailRow}>
                    <MaterialIcons name="person" size={16} color={theme.SUBTEXT} />
                    <Text style={[styles.detailText, { color: getRoleColor(user.role) }]}>{user.role}</Text>
                </View>
                <View style={styles.detailRow}>
                    <MaterialIcons name="calendar-today" size={16} color={theme.SUBTEXT} />
                    <Text style={[styles.detailText, { color: theme.SUBTEXT }]}>
                        Created: {formatDate(user.created_at)}
                    </Text>
                </View>
                {user.last_login && (
                    <View style={styles.detailRow}>
                        <MaterialIcons name="access-time" size={16} color={theme.SUBTEXT} />
                        <Text style={[styles.detailText, { color: theme.SUBTEXT }]}>
                            Last Login: {formatDate(user.last_login)}
                        </Text>
                    </View>
                )}
                {user.failed_login_attempts > 0 && (
                    <View style={styles.detailRow}>
                        <MaterialIcons name="warning" size={16} color={DANGER_COLOR} />
                        <Text style={[styles.detailText, { color: DANGER_COLOR }]}>
                            Failed Attempts: {user.failed_login_attempts}
                        </Text>
                    </View>
                )}
                {user.lockout_time && (
                    <View style={styles.detailRow}>
                        <MaterialIcons name="lock" size={16} color={DANGER_COLOR} />
                        <Text style={[styles.detailText, { color: DANGER_COLOR }]}>
                            Locked until: {formatDate(user.lockout_time)}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
});

export default function UserManagementScreen() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(API.ADMIN_USERS_DETAILS, {
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
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.message);
            Alert.alert('Error', 'Failed to fetch user details from backend.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchUsers().finally(() => setRefreshing(false));
    };

    const handleDeleteUser = async (userId) => {
        try {
            const response = await fetch(API.ADMIN_DELETE_USER(userId), {
                method: 'DELETE',
                headers: {
                    'X-Admin-Pin': '26344',
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            Alert.alert('Success', data.message || 'User deleted successfully');
            // Refresh the users list
            fetchUsers();
        } catch (err) {
            console.error('Error deleting user:', err);
            Alert.alert('Error', 'Failed to delete user. Please try again.');
        }
    };

    const renderUser = ({ item }) => (
        <UserCard user={item} theme={theme} onDelete={handleDeleteUser} />
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={theme.SUBTEXT} />
            <Text style={[styles.emptyText, { color: theme.SUBTEXT }]}>No users found</Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.BG }]}>
            <View style={styles.header}>
                <Ionicons name="people-outline" size={32} color={PRIMARY_COLOR} />
                <Text style={[styles.headerTitle, { color: theme.TEXT }]}>User Management</Text>
                <TouchableOpacity
                    style={[styles.themeToggle, { backgroundColor: theme.CARD_BG }]}
                    onPress={() => setIsDarkMode(!isDarkMode)}
                >
                    <Ionicons
                        name={isDarkMode ? "sunny-outline" : "moon-outline"}
                        size={20}
                        color={isDarkMode ? SECONDARY_COLOR : PRIMARY_COLOR}
                    />
                </TouchableOpacity>
            </View>

            {loading && !refreshing && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                    <Text style={[styles.loadingText, { color: theme.SUBTEXT }]}>Loading users...</Text>
                </View>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={DANGER_COLOR} />
                    <Text style={[styles.errorText, { color: DANGER_COLOR }]}>Error: {error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!loading && !error && (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderUser}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={PRIMARY_COLOR}
                            progressBackgroundColor={theme.CARD_BG}
                        />
                    }
                    contentContainerStyle={users.length === 0 ? styles.emptyList : null}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        marginLeft: 10,
        flex: 1,
    },
    themeToggle: {
        padding: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    userCard: (theme) => ({
        backgroundColor: theme.CARD_BG,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.BORDER,
        shadowColor: theme.TEXT,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    }),
    userHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
    },
    verificationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    verificationText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    deleteButton: {
        padding: 8,
        borderRadius: 8,
    },
    userDetails: {
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        paddingTop: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: PRIMARY_COLOR,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        marginTop: 16,
    },
    emptyList: {
        flexGrow: 1,
        justifyContent: 'center',
    },
});
