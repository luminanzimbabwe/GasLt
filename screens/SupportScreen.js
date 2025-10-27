// screens/HelpSupportScreen.js

import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Linking,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HelpSupportScreen = () => {
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Handle phone call
  const handlePhoneCall = (phoneNumber) => {
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device');
        }
      })
      .catch((error) => {
        console.error('Phone call error:', error);
        Alert.alert('Error', 'Unable to make phone call');
      });
  };

  // Handle email
  const handleEmail = (email) => {
    const emailUrl = `mailto:${email}?subject=ThisGas Support Request`;
    Linking.canOpenURL(emailUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(emailUrl);
        } else {
          Alert.alert('Error', 'Email is not supported on this device');
        }
      })
      .catch((error) => {
        console.error('Email error:', error);
        Alert.alert('Error', 'Unable to open email client');
      });
  };

  // Handle website link
  const handleWebsite = (url) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Unable to open website');
        }
      })
      .catch((error) => {
        console.error('Website error:', error);
        Alert.alert('Error', 'Unable to open website');
      });
  };

  // Animated contact item component
  const AnimatedContactItem = ({ icon, title, subtitle, onPress, delay = 0 }) => {
    const itemFadeAnim = useRef(new Animated.Value(0)).current;
    const itemSlideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(itemFadeAnim, {
          toValue: 1,
          duration: 600,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(itemSlideAnim, {
          toValue: 0,
          duration: 600,
          delay: delay,
          useNativeDriver: true,
        })
      ]).start();
    }, [delay]);

    return (
      <Animated.View 
        style={[
          styles.contactItem,
          {
            opacity: itemFadeAnim,
            transform: [{ translateY: itemSlideAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View style={styles.contactIconContainer}>
            <Ionicons name={icon} size={24} color="#007AFF" />
          </View>
          <View style={styles.contactTextContainer}>
            <Text style={styles.contactTitle}>{title}</Text>
            <Text style={styles.contactSubtitle}>{subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#999" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View 
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.header}>Help and Support</Text>
          <Text style={styles.subtitle}>
            We're here to help you with any questions or issues
          </Text>
        </Animated.View>

        {/* Contact Information Section */}
        <Animated.View 
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          {/* Phone Numbers */}
          <AnimatedContactItem
            icon="call-outline"
            title="Primary Support Line"
            subtitle="0787592481"
            onPress={() => handlePhoneCall('0787592481')}
            delay={200}
          />
          
          <AnimatedContactItem
            icon="call-outline"
            title="Alternative Support Line"
            subtitle="0712098719"
            onPress={() => handlePhoneCall('0712098719')}
            delay={300}
          />

          {/* Email */}
          <AnimatedContactItem
            icon="mail-outline"
            title="Email Support"
            subtitle="support@luminantechnologies.com"
            onPress={() => handleEmail('support@luminantechnologies.com')}
            delay={400}
          />

          {/* Website */}
          <AnimatedContactItem
            icon="globe-outline"
            title="Visit Our Website"
            subtitle="www.luminantechnologies.com"
            onPress={() => handleWebsite('https://www.luminantechnologies.com')}
            delay={500}
          />
        </Animated.View>

        {/* Quick Actions Section */}
        <Animated.View 
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <AnimatedContactItem
            icon="chatbubble-outline"
            title="Report an Issue"
            subtitle="Let us know about any problems"
            onPress={() => handleEmail('support@luminantechnologies.com?subject=Issue Report')}
            delay={600}
          />
          
          <AnimatedContactItem
            icon="help-circle-outline"
            title="Frequently Asked Questions"
            subtitle="Find answers to common questions"
            onPress={() => Alert.alert('FAQ', 'FAQ section coming soon!')}
            delay={700}
          />
          
          <AnimatedContactItem
            icon="document-text-outline"
            title="User Manual"
            subtitle="Download the complete user guide"
            onPress={() => Alert.alert('User Manual', 'User manual download coming soon!')}
            delay={800}
          />
        </Animated.View>

        {/* Business Hours Section */}
        <Animated.View 
          style={[
            styles.businessHoursContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.businessHoursHeader}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.businessHoursTitle}>Business Hours</Text>
          </View>
          <Text style={styles.businessHoursText}>
            Monday - Friday: 8:00 AM - 6:00 PM{'\n'}
            Saturday: 9:00 AM - 4:00 PM{'\n'}
            Sunday: Closed
          </Text>
          <Text style={styles.businessHoursNote}>
            Emergency support available 24/7 for critical issues
          </Text>
        </Animated.View>

        {/* Company Information */}
        <Animated.View 
          style={[
            styles.companyInfoContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.companyName}>Luminan Technologies</Text>
          <Text style={styles.companyDescription}>
            Providing innovative fuel delivery solutions across Nigeria. 
            Our dedicated support team is committed to ensuring your 
            experience with ThisGas is smooth and efficient.
          </Text>
        </Animated.View>

        {/* Emergency Contact Note */}
        <Animated.View 
          style={[
            styles.emergencyContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Ionicons name="warning-outline" size={16} color="#FF9500" />
          <Text style={styles.emergencyText}>
            For emergency fuel delivery issues, please call our primary support line immediately.
          </Text>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  
  // Header Styles
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Section Styles
  sectionContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  
  // Contact Item Styles
  contactItem: {
    marginBottom: 12,
  },
  contactButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  
  // Business Hours Styles
  businessHoursContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  businessHoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  businessHoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  businessHoursText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  businessHoursNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  
  // Company Info Styles
  companyInfoContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  companyDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
  
  // Emergency Note Styles
  emergencyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  emergencyText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});

export default HelpSupportScreen;