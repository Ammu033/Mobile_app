import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { pickDocument, uploadDocumentToFirebase } from '../Api/mediaPicker';
import { submitApplication, getUserApplications } from '../Api/applicationService';
import { getCurrentUser } from '../Api/userService';
import { addActivity } from '../Api/activitymanger';
import { checkProfileCompletion} from '../Api/Profilecheck';


interface Service {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export default function Form({ navigation }: any) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    aadhar: '',
    phone: '',
    address: '',
    pincode: '',
    email: '',
  });
  const [uploadedDocs, setUploadedDocs] = useState<{name: string, url: string}[]>([]);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await checkProfileCompletion(navigation);
      if (!hasAccess) {
        navigation.goBack();
      } else {
        loadApplications();
      }
    };
    checkAccess();
  }, []);

  // Only real Punjab Government services
  const services: Service[] = [
    {
      id: '1',
      name: 'Old Age Pension',
      icon: 'account-clock',
      category: 'Social Welfare',
    },
    {
      id: '2',
      name: 'Widow Pension',
      icon: 'account-heart',
      category: 'Social Welfare',
    },
    {
      id: '3',
      name: 'Disability Pension',
      icon: 'wheelchair-accessibility',
      category: 'Social Welfare',
    },
    {
      id: '4',
      name: 'Atta Dal Scheme',
      icon: 'food',
      category: 'Food Security',
    },
    {
      id: '5',
      name: 'Birth Certificate',
      icon: 'certificate',
      category: 'Civil Registration',
    },
    {
      id: '6',
      name: 'Death Certificate',
      icon: 'file-document',
      category: 'Civil Registration',
    },
    {
      id: '7',
      name: 'Income Certificate',
      icon: 'cash',
      category: 'Revenue Services',
    },
    {
      id: '8',
      name: 'Caste Certificate',
      icon: 'card-account-details',
      category: 'Revenue Services',
    },
    {
      id: '9',
      name: 'Residence Certificate',
      icon: 'home-city',
      category: 'Revenue Services',
    },
    {
      id: '10',
      name: 'Property Mutation',
      icon: 'home-edit',
      category: 'Revenue Services',
    },
  ];

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const user = await getCurrentUser();
      const userId = user?.id || 'USER_123';
      const apps = await getUserApplications(userId);
      setMyApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };
  const handleDeleteApplication = async (appId: string, appName: string) => {
  Alert.alert(
    '🗑️ Delete Application',
    `Are you sure you want to delete the application for "${appName}"?\n\nThis action cannot be undone.`,
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
            // Import deleteApplication function
            const { deleteApplication } = require('../Api/applicationService');
            
            await deleteApplication(appId);
            
            // Update UI
            setMyApplications((prevApps) => 
              prevApps.filter((app) => app.id !== appId)
            );
            
            Alert.alert('✅ Deleted', 'Application has been deleted successfully');
          } catch (error) {
            console.error('Delete error:', error);
            Alert.alert('Error', 'Failed to delete application. Please try again.');
          }
        },
      },
    ]
  );
};

  const handleDocumentUpload = async () => {
    const doc = await pickDocument();
    if (doc) {
      Alert.alert('Uploading...', 'Please wait');
      const url = await uploadDocumentToFirebase(doc.uri, doc.name, 'applications');
      if (url) {
        setUploadedDocs([...uploadedDocs, { name: doc.name, url }]);
        Alert.alert('✅ Success', 'Document uploaded successfully!');
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    const { fullName, aadhar, phone, address, pincode } = formData;

    if (!selectedService) {
      Alert.alert('Error', 'Please select a service');
      return;
    }

    if (!fullName || !aadhar || !phone || !address || !pincode) {
      Alert.alert('Required Fields', 'Please fill all required fields marked with *');
      return;
    }

    if (uploadedDocs.length === 0) {
      Alert.alert(
        'Documents Required',
        'Please upload the required form and documents before submitting.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const user = await getCurrentUser();
      const userId = user?.id || 'USER_123';

      await submitApplication({
        userId,
        serviceName: selectedService.name,
        serviceCategory: selectedService.category,
        fullName,
        aadhar,
        phone,
        email: formData.email,
        address,
        pincode,
        documents: uploadedDocs.map((d) => d.url),
        status: 'Submitted',
      });

      await addActivity(
        'application',
        selectedService.name,
        `Application submitted for ${selectedService.category}`,
        'Submitted',
        { serviceName: selectedService.name }
      );

      // Reset form
      setFormData({
        fullName: '',
        aadhar: '',
        phone: '',
        address: '',
        pincode: '',
        email: '',
      });
      setUploadedDocs([]);

      Alert.alert(
        '✅ Success!', 
        'Your application has been submitted successfully. You will be notified about the status.',
        [{ 
          text: 'OK', 
          onPress: () => {
            setSelectedService(null);
            loadApplications();
          }
        }]
      );
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return '#4CAF50';
      case 'Reviewing': return '#FF9800';
      case 'Rejected': return '#F44336';
      default: return '#2196F3';
    }
  };

  // Service Selection Screen
  if (!selectedService) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a2456" />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Government Services</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Instructions Card */}
            <TouchableOpacity
              style={styles.instructionCard}
              onPress={() => {
                Alert.alert(
                  '📋 How to Apply',
                  '1. Download the required form from:\n   punjab.gov.in/forms/\n\n' +
                  '2. Fill the form completely\n\n' +
                  '3. Select a service below\n\n' +
                  '4. Upload filled form & documents\n\n' +
                  '5. Submit your application',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Open Website',
                      onPress: () => Linking.openURL('https://punjab.gov.in/forms/')
                    }
                  ]
                );
              }}
            >
              <View style={styles.instructionIconContainer}>
                <MaterialCommunityIcons name="information" size={32} color="#2196F3" />
              </View>
              <View style={styles.instructionContent}>
                <Text style={styles.instructionTitle}>Download Forms First</Text>
                <Text style={styles.instructionText}>
                  Visit punjab.gov.in/forms/ to download required forms
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#2196F3" />
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Select Service</Text>

            {/* Services Grid */}
            <View style={styles.servicesGrid}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceCard}
                  onPress={() => setSelectedService(service)}
                >
                  <View style={styles.serviceIconContainer}>
                    <MaterialCommunityIcons
                      name={service.icon as any}
                      size={32}
                      color="#252d6e"
                    />
                  </View>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceCategory}>{service.category}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* My Applications */}
            <View style={styles.section}>
  <Text style={styles.sectionTitle}>My Applications</Text>

  {myApplications.length === 0 ? (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="clipboard-text-outline" size={60} color="#ccc" />
      <Text style={styles.emptyStateText}>No applications yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Select a service above to submit your first application
      </Text>
    </View>
  ) : (
    myApplications.map((app) => (
      <View key={app.id} style={styles.applicationCard}>
        <View style={styles.applicationHeader}>
          <View style={[styles.applicationIconBg, { backgroundColor: getStatusColor(app.status) }]}>
            <MaterialCommunityIcons
              name={services.find(s => s.name === app.serviceName)?.icon as any || 'file-document'}
              size={24}
              color="#fff"
            />
          </View>
          <View style={styles.applicationInfo}>
            <Text style={styles.applicationName}>{app.serviceName}</Text>
            <Text style={styles.applicationDate}>
              Applied: {formatDate(app.createdAt)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(app.status) }]}>
            <Text style={styles.statusText}>{app.status}</Text>
          </View>
        </View>

        {/* Application Details */}
        <View style={styles.applicationDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="account" size={16} color="#666" />
            <Text style={styles.detailText}>{app.fullName}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="phone" size={16} color="#666" />
            <Text style={styles.detailText}>{app.phone}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="folder" size={16} color="#666" />
            <Text style={styles.detailText}>{app.serviceCategory}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.applicationActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                'Application Details',
                `Service: ${app.serviceName}\n` +
                `Category: ${app.serviceCategory}\n` +
                `Name: ${app.fullName}\n` +
                `Aadhaar: ${app.aadhar}\n` +
                `Phone: ${app.phone}\n` +
                `Address: ${app.address}\n` +
                `Pincode: ${app.pincode}\n` +
                `Status: ${app.status}\n` +
                `Applied: ${formatDate(app.createdAt)}`,
                [{ text: 'OK' }]
              );
            }}
          >
            <MaterialCommunityIcons name="eye" size={18} color="#252d6e" />
            <Text style={styles.actionButtonText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteApplication(app.id, app.serviceName)}
          >
            <MaterialCommunityIcons name="delete-outline" size={18} color="#F44336" />
            <Text style={[styles.actionButtonText, { color: '#F44336' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    ))
  )}
</View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Application Form Screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a2456" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedService(null)}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedService.name}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Service Info with Form Download */}
          <View style={styles.serviceInfoCard}>
            <MaterialCommunityIcons
              name={selectedService.icon as any}
              size={48}
              color="#252d6e"
            />
            <Text style={styles.serviceInfoTitle}>{selectedService.name}</Text>
            <Text style={styles.serviceInfoCategory}>{selectedService.category}</Text>
            
            <TouchableOpacity
              style={styles.downloadFormButton}
              onPress={() => {
                Alert.alert(
                  '📥 Download Form',
                  `To apply for ${selectedService.name}:\n\n` +
                  `1. Visit: punjab.gov.in/forms/\n` +
                  `2. Search for "${selectedService.name}"\n` +
                  `3. Download the form\n` +
                  `4. Fill it completely\n` +
                  `5. Upload here along with documents`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Open Website',
                      onPress: () => Linking.openURL('https://punjab.gov.in/forms/')
                    }
                  ]
                );
              }}
            >
              <MaterialCommunityIcons name="download" size={20} color="#2196F3" />
              <Text style={styles.downloadFormText}>Get Form from punjab.gov.in</Text>
            </TouchableOpacity>
          </View>

          {/* Application Form */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Application Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                value={formData.fullName}
                onChangeText={(value) => handleInputChange('fullName', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Aadhaar Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="XXXX XXXX XXXX"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={12}
                value={formData.aadhar}
                onChangeText={(value) => handleInputChange('aadhar', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 XXXXX XXXXX"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                maxLength={10}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Complete Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="House No., Street, Village"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pincode *</Text>
              <TextInput
                style={styles.input}
                placeholder="XXXXXX"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={6}
                value={formData.pincode}
                onChangeText={(value) => handleInputChange('pincode', value)}
              />
            </View>

            {/* Document Upload */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Upload Filled Form & Documents *</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={handleDocumentUpload}>
                <MaterialCommunityIcons name="paperclip" size={24} color="#252d6e" />
                <Text style={styles.uploadText}>Attach Documents</Text>
              </TouchableOpacity>
              
              {uploadedDocs.length > 0 && (
                <View style={styles.uploadedList}>
                  {uploadedDocs.map((doc, index) => (
                    <View key={index} style={styles.uploadedItem}>
                      <MaterialCommunityIcons name="file-document" size={20} color="#4CAF50" />
                      <Text style={styles.uploadedName} numberOfLines={1}>
                        {doc.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setUploadedDocs(uploadedDocs.filter((_, i) => i !== index))}
                      >
                        <MaterialCommunityIcons name="close-circle" size={20} color="#F44336" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Terms */}
            <View style={styles.termsContainer}>
              <MaterialCommunityIcons name="shield-check" size={20} color="#4CAF50" />
              <Text style={styles.termsText}>
                By submitting, you confirm that all information provided is accurate and complete.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit Application</Text>
              <MaterialCommunityIcons name="send" size={20} color="#1a2456" />
            </TouchableOpacity>
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
  instructionCard: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
  },
  instructionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 13,
    color: '#1976D2',
  },
   applicationDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  applicationActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a2456',
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  serviceIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f0ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a2456',
    textAlign: 'center',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
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
    paddingHorizontal: 20,
  },
  applicationCard: {
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
  applicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  applicationIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  applicationInfo: {
    flex: 1,
  },
  applicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a2456',
    marginBottom: 4,
  },
  applicationDate: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  serviceInfoCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
  },
  serviceInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a2456',
    marginTop: 12,
    marginBottom: 4,
  },
  serviceInfoCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  downloadFormButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  downloadFormText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a2456',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a2456',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    color: '#1a2456',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 80,
    paddingTop: 14,
  },
  uploadButton: {
    backgroundColor: '#f0f0ff',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#252d6e',
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: 14,
    color: '#252d6e',
    fontWeight: '600',
  },
  uploadedList: {
    marginTop: 12,
    gap: 8,
  },
  uploadedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  uploadedName: {
    flex: 1,
    fontSize: 14,
    color: '#1a2456',
  },
  termsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#2E7D32',
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: '#FFD700',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#1a2456',
    fontSize: 18,
    fontWeight: 'bold',
  },
});