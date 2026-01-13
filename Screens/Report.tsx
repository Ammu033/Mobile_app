import React, { useState, useEffect } from 'react';
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
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getLocationAndSave } from '../Api/location';
import { showImagePicker, uploadImageToFirebase } from '../Api/mediaPicker';
import { addReport, subscribeToReports } from '../Api/reportService';
import { shareReportToWhatsApp } from '../Api/shareUtils';
import { getCurrentUser } from '../Api/userService';
import { updateActivityStatus } from '../Api/activitymanger';
import { deleteReport } from '../Api/reportService';
import { updateReportStatus, getUserReports } from '../Api/reportService';
import { checkProfileCompletion } from '../Api/Profilecheck';

export default function Report({ navigation }: any) {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [postcode, setPostcode] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await checkProfileCompletion(navigation);
      if (!hasAccess) {
        navigation.goBack();
      }
    };
    checkAccess();
  }, []);

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
        console.log('📸 Uploading image...');
        imageUrl = await uploadImageToFirebase(image, 'reports');
        console.log('✅ Image uploaded:', imageUrl);
      }

      // Get current user
      const user = await getCurrentUser();
      const userId = user?.id || 'USER_123';

      // Save report
      const reportId = await addReport({
        userId,
        category,
        title,
        description,
        postcode,
        imageUrl,
        status: 'Pending',
        progress: 0,
      } as any);

      console.log('✅ Report saved with ID:', reportId);

      // Add activity
      await addActivity(
        'report',
        title,
        `${getCategoryLabel(category)} - ${postcode}`,
        'Pending',
        { reportId, category, imageUrl }
      );

      // Reset form
      setCategory('');
      setTitle('');
      setDescription('');
      setPostcode('');
      setImage(null);

      Alert.alert('Success', 'Your report has been submitted successfully!');
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  

  
  useEffect(() => {
  const loadReports = async () => {
    const user = await getCurrentUser();
    const userId = user?.id || 'USER_123';

    // Load reports initially
    const initialReports = await getUserReports(userId);
    setReports(initialReports);

    // Auto-update pending reports to reviewing after 30 seconds
    initialReports.forEach((report) => {
      if (report.status === 'Pending' && report.id) {
        const createdAt = new Date(report.createdAt).getTime();
        const now = Date.now();
        const timeDiff = now - createdAt;
        
        if (timeDiff >= 30000) {
          // Already past 30 seconds, update immediately
          updateReportStatus(report.id, 'Reviewing').then(() => {
            // Reload reports after update
            getUserReports(userId).then(setReports);
          });
        } else {
          // Schedule update after remaining time
          const remainingTime = 30000 - timeDiff;
          setTimeout(async () => {
            await updateReportStatus(report.id!, 'Reviewing');
            // Reload reports after update
            const updated = await getUserReports(userId);
            setReports(updated);
          }, remainingTime);
        }
      }
    });
  };

  loadReports();
}, []);

  const toggleExpand = (reportId: string) => {
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
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.label : categoryId;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };
  const handleDeleteReport = async (reportId: string, reportTitle: string) => {
  Alert.alert(
    '🗑️ Delete Report',
    `Are you sure you want to delete "${reportTitle}"?\n\nThis action cannot be undone.`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // Delete the report
            await deleteReport(reportId);
            
            // Update activity if exists
            await updateActivityStatus(reportId, 'Deleted');
            
            // Update UI - remove from list
            setReports((prevReports) => 
              prevReports.filter((r) => r.id !== reportId)
            );
            
            // Collapse if this was expanded
            if (expandedReportId === reportId) {
              setExpandedReportId(null);
            }
            
            Alert.alert('✅ Deleted', 'Report has been deleted successfully');
          } catch (error) {
            console.error('Delete error:', error);
            Alert.alert('Error', 'Failed to delete report. Please try again.');
          }
        },
      },
    ]
  );
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
            <TouchableOpacity style={styles.uploadButton} onPress={handleImagePick}>
              {image ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                  <View style={styles.imagePreviewOverlay}>
                    <MaterialCommunityIcons name="check-circle" size={32} color="#4CAF50" />
                    <Text style={styles.imagePreviewText}>Photo Selected</Text>
                  </View>
                </View>
              ) : (
                <>
                  <MaterialCommunityIcons name="camera" size={32} color="#252d6e" />
                  <Text style={styles.uploadText}>Take or Upload Photo</Text>
                </>
              )}
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
              <TouchableOpacity style={styles.mapButton} onPress={handleLocationPick}>
                <MaterialCommunityIcons name="map-marker" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Text style={styles.submitButtonText}>Submitting...</Text>
              </>
            ) : (
              <>
                <Text style={styles.submitButtonText}>Submit Report</Text>
                <MaterialCommunityIcons name="send" size={20} color="#1a2456" />
              </>
            )}
          </TouchableOpacity>

          {/* My Reports Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Reports</Text>

            {reports.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={60} color="#ccc" />
                <Text style={styles.emptyStateText}>No reports yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Submit your first report using the form above
                </Text>
              </View>
            ) : (
              reports.map((report) => {
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
                          <Text style={styles.reportMetaText}>
                            {getCategoryLabel(report.category)}
                          </Text>
                          <MaterialCommunityIcons
                            name="map-marker"
                            size={14}
                            color="#666"
                            style={{ marginLeft: 10 }}
                          />
                          <Text style={styles.reportMetaText}>{report.postcode}</Text>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, getStatusStyle(report.status)]}>
                        <Text style={styles.statusText}>{report.status}</Text>
                      </View>
                    </View>

                    <Text style={styles.reportDate}>
                      Submitted on: {formatDate(report.createdAt)}
                    </Text>

                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${report.progress}%`,
                            backgroundColor: getProgressColor(report.status),
                          },
                        ]}
                      />
                    </View>

                    {/* Expandable Content */}
                    {isExpanded && (
                      <View style={styles.descriptionContainer}>
                        {/* Image Preview */}
                        {report.imageUrl && (
                          <TouchableOpacity
                            style={styles.imageContainer}
                            onPress={() => {
                              Alert.alert('Image', 'Full screen viewer coming soon!');
                            }}
                          >
                            <Image
                              source={{ uri: report.imageUrl }}
                              style={styles.reportImage}
                              resizeMode="cover"
                            />
                            <View style={styles.imageOverlay}>
                              <MaterialCommunityIcons name="eye" size={20} color="#fff" />
                              <Text style={styles.imageOverlayText}>Tap to view full image</Text>
                            </View>
                          </TouchableOpacity>
                        )}

                        {/* Description */}
                        <Text style={styles.descriptionLabel}>Description:</Text>
                        <Text style={styles.descriptionText}>{report.description}</Text>

                        {/* Location Info */}
                        {report.postcode && (
                          <TouchableOpacity
                            style={styles.locationInfo}
                            onPress={() => {
                              const coords = report.postcode.split(',');
                              if (coords.length === 2) {
                                const mapsUrl = `https://maps.google.com/?q=${coords[0].trim()},${coords[1].trim()}`;
                                Linking.openURL(mapsUrl);
                              } else {
                                Alert.alert('Location', report.postcode);
                              }
                            }}
                          >
                            <MaterialCommunityIcons name="map-marker" size={16} color="#252d6e" />
                            <Text style={styles.locationText}>Location: {report.postcode}</Text>
                            <MaterialCommunityIcons name="open-in-new" size={14} color="#252d6e" />
                          </TouchableOpacity>
                        )}

                        {/* Report Actions */}
                        <View style={styles.reportActions}>
                          <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                              shareReportToWhatsApp(
                                report.title,
                                report.description,
                                getCategoryLabel(report.category),
                                report.postcode
                              );
                            }}
                          >
                            <MaterialCommunityIcons name="share-variant" size={18} color="#252d6e" />
                            <Text style={styles.actionButtonText}>Share</Text>
                          </TouchableOpacity>

                                                <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDeleteReport(report.id, report.title)}
                        >
                          <MaterialCommunityIcons name="delete-outline" size={18} color="#F44336" />
                          <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Delete</Text>
                        </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* Expand/Collapse Indicator */}
                    <View style={styles.expandIndicator}>
                      <MaterialCommunityIcons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#252d6e"
                      />
                      <Text style={styles.expandText}>{isExpanded ? 'Show less' : 'Show more'}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
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
    paddingTop: 48,
    paddingBottom: 16,
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
    minHeight: 120,
    justifyContent: 'center',
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
    color: '#252d6e',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePreviewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  imagePreviewText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
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
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#1a2456',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
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
  descriptionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  reportImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#f0f0f0',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  imageOverlayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
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
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    backgroundColor: '#f0f0ff',
    borderRadius: 8,
    gap: 6,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: '#252d6e',
    fontWeight: '500',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    gap: 6,
    elevation: 1,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#252d6e',
    fontWeight: '500',
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
});