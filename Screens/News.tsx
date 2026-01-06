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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { shareEvent } from '../Api/shareUtils';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: 'event' | 'notice' | 'announcement';
  image?: any;
}

export default function News({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'events' | 'notices'>('events');

  const events: Event[] = [
    {
      id: '1',
      title: 'Dussehra Fair 2026',
      date: 'October 10, 2026',
      time: '10:00 AM - 8:00 PM',
      location: 'Village Ground',
      description:
        'Annual Dussehra fair with cultural programs, food stalls, and traditional games. All villagers are invited to participate.',
      category: 'event',
      image: require('../assets/1.png'),
    },
    {
      id: '2',
      title: 'Community Health Camp',
      date: 'January 15, 2026',
      time: '9:00 AM - 4:00 PM',
      location: 'Panchayat Bhawan',
      description:
        'Free health checkup camp organized by Punjab Health Department. Blood pressure, diabetes screening, and general consultation available.',
      category: 'event',
      image: require('../assets/1.png'),
    },
    {
      id: '3',
      title: 'Gram Sabha Meeting',
      date: 'January 20, 2026',
      time: '5:00 PM - 7:00 PM',
      location: 'Village Hall',
      description:
        'Quarterly gram sabha meeting to discuss village development plans, budget allocation, and community concerns.',
      category: 'event',
      image: require('../assets/1.png'),
    },
  ];

  const notices: Event[] = [
    {
      id: '1',
      title: 'Street Light Installation Update',
      date: 'January 2, 2026',
      time: '',
      location: '',
      description:
        'Government grant for street light installation has been received. Work will commence from January 10, 2026 in Phase 1 areas (Main Road, School Street).',
      category: 'notice',
    },
    {
      id: '2',
      title: 'Water Supply Maintenance',
      date: 'January 4, 2026',
      time: '',
      location: '',
      description:
        'Water supply will be temporarily disrupted on January 8, 2026 from 10 AM to 4 PM due to pipeline maintenance in Sectors A & B.',
      category: 'notice',
    },
    {
      id: '3',
      title: 'Pension Disbursement Schedule',
      date: 'December 28, 2025',
      time: '',
      location: '',
      description:
        'Pension for Q4 2025 will be disbursed from January 5-10, 2026. Beneficiaries can collect from Panchayat office during working hours.',
      category: 'notice',
    },
    {
      id: '4',
      title: 'New Road Construction',
      date: 'December 20, 2025',
      time: '',
      location: '',
      description:
        'Tender awarded for construction of new road connecting East Village to Main Highway. Expected completion: March 2026.',
      category: 'announcement',
    },
  ];

  const displayData = activeTab === 'events' ? events : notices;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a2456" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>News & Updates</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="bell-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.tabActive]}
          onPress={() => setActiveTab('events')}
        >
          <MaterialCommunityIcons
            name="calendar-star"
            size={22}
            color={activeTab === 'events' ? '#252d6e' : '#666'}
          />
          <Text
            style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}
          >
            Events
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'notices' && styles.tabActive]}
          onPress={() => setActiveTab('notices')}
        >
          <MaterialCommunityIcons
            name="bullhorn"
            size={22}
            color={activeTab === 'notices' ? '#252d6e' : '#666'}
          />
          <Text
            style={[styles.tabText, activeTab === 'notices' && styles.tabTextActive]}
          >
            Notices
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {displayData.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.card}
              onPress={() => navigation.navigate('EventDetail', { event: item })}  // ADD THIS
            >

              {/* Card Content */}
              <View style={styles.cardContent}>
                {/* Category Badge */}
                <View
                  style={[
                    styles.categoryBadge,
                    item.category === 'event' && styles.eventBadge,
                    item.category === 'notice' && styles.noticeBadge,
                    item.category === 'announcement' && styles.announcementBadge,
                  ]}
                >
                  <Text style={styles.categoryText}>
                    {item.category.toUpperCase()}
                  </Text>
                </View>

                {/* Title */}
                <Text style={styles.cardTitle}>{item.title}</Text>

                {/* Date and Time */}
                {item.date && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={18}
                      color="#666"
                    />
                    <Text style={styles.infoText}>{item.date}</Text>
                  </View>
                )}

                {item.time && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={18}
                      color="#666"
                    />
                    <Text style={styles.infoText}>{item.time}</Text>
                  </View>
                )}

                {item.location && (
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={18}
                      color="#666"
                    />
                    <Text style={styles.infoText}>{item.location}</Text>
                  </View>
                )}

                {/* Description */}
                <Text style={styles.description} numberOfLines={3}>
                  {item.description}
                </Text>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  {item.category === 'event' && (
                    <TouchableOpacity style={styles.actionButton}>
                      <MaterialCommunityIcons
                        name="calendar-plus"
                        size={18}
                        color="#252d6e"
                      />
                      <Text style={styles.actionButtonText}>Add to Calendar</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => shareEvent(
                      item.title,
                      item.date,
                      item.time,
                      item.location,
                      item.description
                    )}
                  >
  <MaterialCommunityIcons name="share-variant" size={18} color="#252d6e" />
  <Text style={styles.actionButtonText}>Share</Text>
</TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Footer */}
          <View style={styles.footer}>
            <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.footerText}>You're all caught up!</Text>
          </View>
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
    header: {
      backgroundColor: '#1a2456',
      paddingTop: 48,  // Add this line
      paddingHorizontal: 20,
      paddingBottom: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#f0f0ff',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#252d6e',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  eventImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  eventBadge: {
    backgroundColor: '#E3F2FD',
  },
  noticeBadge: {
    backgroundColor: '#FFF3E0',
  },
  announcementBadge: {
    backgroundColor: '#F3E5F5',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#252d6e',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a2456',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0ff',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#252d6e',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
});