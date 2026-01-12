import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert, Linking, Platform
} from 'react-native';
import {handleAddCalendar} from '../Api/AddCalender'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { shareEvent } from '../Api/shareUtils';

export default function EventDetail({ route, navigation }: any) {
  const { event } = route.params;
  const [isAttending, setIsAttending] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(42); // Mock count

  

  const handleShare = async () => {
    await shareEvent(
      event.title,
      event.date,
      event.time,
      event.location,
      event.description
    );
  };
 

 
  const handleAddToCalendar = () => {
    Alert.alert(
      'Add to Calendar',
      'This will add the event to your device calendar.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async () => {
            await handleAddCalendar(
              event.title,
              event.date,
              event.time,
              event.location,
              event.description
            );
            
          },
        },
      ]
    );
  };

  const handleGetDirections = () => {
  Alert.alert(
    'Get Directions',
    `Open maps to navigate to: ${event.location}?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Maps',
        onPress: () => {
          const address = encodeURIComponent(event.location);
          
          // Different URLs for iOS and Android
          const url = Platform.select({
            ios: `maps://app?daddr=${address}`,
            android: `google.navigation:q=${address}`,
          });
          
          // Fallback to browser-based Google Maps
          const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${address}`;
          
          Linking.canOpenURL(url!)
            .then((supported) => {
              if (supported) {
                return Linking.openURL(url!);
              } else {
                // Use web-based Google Maps as fallback
                return Linking.openURL(fallbackUrl);
              }
            })
            .catch((err) => {
              console.error('Error opening maps:', err);
              Alert.alert('Error', 'Could not open maps');
            });
        },
      },
    ]
  );
};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a2456" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Event Image */}
        {event.image && (
          <View style={styles.imageContainer}>
            <Image source={event.image} style={styles.eventImage} />
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <MaterialCommunityIcons name="share-variant" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.content}>
          {/* Event Header */}
          <View style={styles.headerSection}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category.toUpperCase()}</Text>
            </View>
            <Text style={styles.title}>{event.title}</Text>
          </View>

          {/* Event Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="calendar" size={24} color="#252d6e" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>{event.date}</Text>
              </View>
            </View>

            {event.time && (
              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={24}
                    color="#252d6e"
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>{event.time}</Text>
                </View>
              </View>
            )}

            {event.location && (
              <TouchableOpacity
                style={styles.detailRow}
                onPress={handleGetDirections}
              >
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="map-marker" size={24} color="#252d6e" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{event.location}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          {/* Action Buttons */}
          {event.category === 'event' && (
            <View style={styles.actionSection}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleAddToCalendar}
              >
                <MaterialCommunityIcons
                  name="calendar-plus"
                  size={20}
                  color="#252d6e"
                />
                <Text style={styles.secondaryButtonText}>Add to Calendar</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
          

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    position: 'absolute',
    top: 48,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#252d6e',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a2456',
    marginBottom: 16,
  },
  attendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
    position: 'relative',
    width: 60,
    height: 30,
    marginRight: 12,
  },
  miniAvatar: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#252d6e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  attendeesText: {
    fontSize: 14,
    color: '#666',
  },
  detailsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#1a2456',
    fontWeight: '500',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a2456',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 24,
  },
  actionSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#252d6e',
    elevation: 2,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#252d6e',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#252d6e',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 4,
  },
  primaryButtonActive: {
    backgroundColor: '#4CAF50',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  organizerSection: {
    marginBottom: 20,
  },
  organizerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  organizerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2456',
    marginBottom: 4,
  },
  organizerRole: {
    fontSize: 14,
    color: '#666',
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
