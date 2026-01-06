import React, { useState, useEffect  } from 'react';
import { addActivity } from '../Api/activitymanger';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getLocationAndSave } from '../Api/location';
import { showImagePicker, uploadImageToFirebase } from '../Api/mediaPicker';
import { addReport, subscribeToReports } from '../Api/reportService';
import { shareReportToWhatsApp } from '../Api/shareUtils';


export default function Report({ navigation }: any) {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [postcode, setPostcode] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedReportId, setExpandedReportId] = useState<number | null>(null);
  const [reports, setReports] = useState<any[]>([]);  

  const categories = [
    { id: 'personal', label: 'Personal', icon: 'account' },
    { id: 'community', label: 'Community', icon: 'town-hall' },
    { id: 'urgent', label: 'Urgent', icon: 'alert' },
  ];

  const handleImagePick = async () => {
    const uri = await showImagePicker();
    if (uri) {
      setImage(uri);
    }
  };

  const handleLocationPick = async () => {
    const location = await getLocationAndSave();
    
    if (location) {
      if (location.postcode) {
        setPostcode(location.postcode);
      } else {
        setPostcode(`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
      }
    }
  };

  const handleSubmit = async () => {
  if (!category || !title || !description) {
    Alert.alert('Error', 'Please fill all required fields');
    return;
  }

  setLoading(true);
  
  try {
    // Upload image if exists
    let imageUrl = null;
    if (image) {
      imageUrl = await uploadImageToFirebase(image, 'reports');
    }

    // Save to Firestore
    const reportId = await addReport({
      userId: 'USER_123', // TODO: Get from auth
      category,
      title,
      description,
      postcode,
      imageUrl,
      status: 'Pending',
      progress: 0,
    }as any);

    // Share to WhatsApp
    await shareReportToWhatsApp(
      title,
      description,
      getCategoryLabel(category),
      postcode,
      '+91XXXXXXXXXX' // Council WhatsApp
    );

    // Reset form
    setCategory('');
    setTitle('');
    setDescription('');
    setPostcode('');
    setImage(null);

    Alert.alert('Success', 'Report submitted and shared!');
    
  } catch (error) {
    Alert.alert('Error', 'Failed to submit report');
  } finally {
    setLoading(false);
  }
};
  
  

  useEffect(() => {
  // Subscribe to real-time updates
  const unsubscribe = subscribeToReports('USER_123', (updatedReports) => {
    setReports(updatedReports);
  });

  return () => unsubscribe();
}, []);

  const toggleExpand = (reportId: number) => {
    setExpandedReportId(expandedReportId === reportId ? null : reportId);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Resolved':
        return styles.statusResolved;
      case 'In Progress':
        return styles.statusInProgress;
      case 'Pending':
        return styles.statusPending;
      default:
        return {};
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return '#4CAF50';
      case 'In Progress':
        return '#252d6e';
      case 'Pending':
        return '#FFA726';
      default:
        return '#252d6e';
    }
  };

  const getCategoryLabel = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.label : categoryId;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a2456" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report an Issue</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    category === cat.id && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={24}
                    color={category === cat.id ? '#fff' : '#252d6e'}
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      category === cat.id && styles.categoryLabelActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief title of your issue"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your issue in detail"
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Photo Upload */}
          <View style={styles.section}>
            <Text style={styles.label}>Upload Photo (Optional)</Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleImagePick}
            >
              <MaterialCommunityIcons name="camera" size={32} color="#252d6e" />
              <Text style={styles.uploadText}>
                {image ? 'Photo Selected' : 'Take or Upload Photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.locationContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter postcode"
                placeholderTextColor="#999"
                value={postcode}
                onChangeText={setPostcode}
              />
              <TouchableOpacity
                style={styles.mapButton}
                onPress={handleLocationPick}
              >
                <MaterialCommunityIcons name="map-marker" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Report</Text>
            <MaterialCommunityIcons name="send" size={20} color="#fff" />
          </TouchableOpacity>

          {/* My Reports Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Reports</Text>
            
            {reports.map((report) => {
              const isExpanded = expandedReportId === report.id;
              
              return (
                <TouchableOpacity 
                  key={report.id} 
                  style={styles.reportCard}
                  onPress={() => toggleExpand(report.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.reportHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.reportTitle}>{report.title}</Text>
                      <View style={styles.reportMeta}>
                        <MaterialCommunityIcons name="tag" size={14} color="#666" />
                        <Text style={styles.reportMetaText}>{getCategoryLabel(report.category)}</Text>
                        <MaterialCommunityIcons name="map-marker" size={14} color="#666" style={{ marginLeft: 10 }} />
                        <Text style={styles.reportMetaText}>{report.postcode}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, getStatusStyle(report.status)]}>
                      <Text style={styles.statusText}>{report.status}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.reportDate}>Submitted on: {report.date}</Text>
                  
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${report.progress}%`, 
                          backgroundColor: getProgressColor(report.status) 
                        }
                      ]} 
                    />
                  </View>

                  {/* Expandable Description */}
                  {isExpanded && (
                    <View style={styles.descriptionContainer}>
                      <Text style={styles.descriptionLabel}>Description:</Text>
                      <Text style={styles.descriptionText}>{report.description}</Text>
                    </View>
                  )}

                  {/* Expand/Collapse Indicator */}
                  <View style={styles.expandIndicator}>
                    <MaterialCommunityIcons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#252d6e" 
                    />
                    <Text style={styles.expandText}>
                      {isExpanded ? "Show less" : "Show more"}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
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
  paddingHorizontal: 16,
  paddingTop: 48,      // Add this - pushes down from status bar
  paddingBottom: 16,   // Add this - replaces paddingVertical
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a2456',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2456',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  categoryButtonActive: {
    backgroundColor: '#252d6e',
    borderColor: '#252d6e',
  },
  categoryLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#252d6e',
  },
  categoryLabelActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#1a2456',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  uploadButton: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
    color: '#252d6e',
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  mapButton: {
    backgroundColor: '#252d6e',
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2456',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  reportMetaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  descriptionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  descriptionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#252d6e',
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  expandIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  expandText: {
    fontSize: 13,
    color: '#252d6e',
    marginLeft: 4,
    fontWeight: '500',
  },
  statusInProgress: {
    backgroundColor: '#252d6e',
  },
  statusPending: {
    backgroundColor: '#FFA726',
  },
  statusResolved: {
    backgroundColor: '#4CAF50',
  },
  
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  reportDate: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9800',
  },
  submitButton: {
    backgroundColor: '#FFD700',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonText: {
    color: '#1a2456',
    fontSize: 18,
    fontWeight: 'bold',
  },
 
});