import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

export default function News() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>News</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <MaterialCommunityIcons name="newspaper" size={48} color="#3d46b4" />
          <Text style={styles.cardTitle}>Latest News</Text>
          <Text style={styles.cardText}>Stay updated with recent news and updates</Text>
        </View>

        <View style={styles.newsList}>
          {[
            { title: 'New Feature Released', date: 'Today', category: 'Updates' },
            { title: 'System Maintenance', date: 'Yesterday', category: 'Alert' },
            { title: 'Important Announcement', date: '2 days ago', category: 'News' },
          ].map((news, index) => (
            <TouchableOpacity key={index} style={styles.newsItem}>
              <View style={styles.newsLeft}>
                <View style={styles.newsIcon}>
                  <MaterialCommunityIcons name="newspaper-variant" size={24} color="#fff" />
                </View>
                <View style={styles.newsText}>
                  <Text style={styles.newsTitle}>{news.title}</Text>
                  <Text style={styles.newsDate}>{news.date}</Text>
                </View>
              </View>
              <View style={[styles.newsCategory, { backgroundColor: news.category === 'Alert' ? '#d32f2f' : '#3d46b4' }]}>
                <Text style={styles.categoryText}>{news.category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1f4e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#252d6e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#252d6e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
  },
  cardText: {
    fontSize: 13,
    color: '#b0b3d9',
    marginTop: 8,
    textAlign: 'center',
  },
  newsList: {
    gap: 12,
  },
  newsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#252d6e',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  newsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  newsIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#3d46b4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  newsText: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  newsDate: {
    fontSize: 12,
    color: '#b0b3d9',
    marginTop: 4,
  },
  newsCategory: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  categoryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});