import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

export default function Report() {
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
        <Text style={styles.headerTitle}>Reports</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <MaterialCommunityIcons name="file-chart" size={48} color="#3d46b4" />
          <Text style={styles.cardTitle}>Your Reports</Text>
          <Text style={styles.cardText}>View detailed reports and analytics</Text>
        </View>

        <View style={styles.reportList}>
          {[
            { title: 'Monthly Report', date: 'Jan 2024', icon: 'file-pdf-box' },
            { title: 'Quarterly Report', date: 'Q1 2024', icon: 'chart-box' },
            { title: 'Annual Report', date: '2023', icon: 'file-document' },
          ].map((report, index) => (
            <TouchableOpacity key={index} style={styles.reportItem}>
              <View style={styles.reportIcon}>
                <MaterialCommunityIcons name={report.icon as any} size={32} color="#fff" />
              </View>
              <View style={styles.reportDetails}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportDate}>{report.date}</Text>
              </View>
              <MaterialCommunityIcons name="download" size={20} color="#3d46b4" />
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
  reportList: {
    gap: 12,
  },
  reportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252d6e',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  reportIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#3d46b4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reportDetails: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  reportDate: {
    fontSize: 12,
    color: '#b0b3d9',
    marginTop: 4,
  },
});