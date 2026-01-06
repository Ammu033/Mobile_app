import React, { useState } from 'react';
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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { pickDocument, uploadDocumentToFirebase } from '../Api/mediaPicker';
import { submitApplication } from '../Api/applicationService';

interface Service {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export default function Form({ navigation }: any) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    aadhar: '',
    phone: '',
    address: '',
    pincode: '',
    email: '',
  });
  const [documents, setDocuments] = useState<string[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<{name: string, url: string}[]>([]);

  const handleDocumentUpload = async () => {
  const doc = await pickDocument();
  if (doc) {
    Alert.alert('Uploading...', 'Please wait');
    const url = await uploadDocumentToFirebase(doc.uri, doc.name, 'applications');
    if (url) {
      setUploadedDocs([...uploadedDocs, { name: doc.name, url }]);
      Alert.alert('Success', 'Document uploaded!');
    }
  }
};

  const services: Service[] = [
    {
      id: '1',
      name: 'Pension Scheme',
      icon: 'wallet',
      category: 'Financial Aid',
    },
    {
      id: '2',
      name: 'Blue Card (Aata Dal Scheme)',
      icon: 'card-account-details',
      category: 'Food Security',
    },
    {
      id: '3',
      name: 'Birth Certificate',
      icon: 'certificate',
      category: 'Documentation',
    },
    {
      id: '4',
      name: 'Death Certificate',
      icon: 'file-document',
      category: 'Documentation',
    },
    {
      id: '5',
      name: 'Property Tax',
      icon: 'home-city',
      category: 'Tax & Revenue',
    },
    {
      id: '6',
      name: 'Business License',
      icon: 'store',
      category: 'License',
    },
    {
      id: '7',
      name: 'Water Connection',
      icon: 'water',
      category: 'Utilities',
    },
    {
      id: '8',
      name: 'Street Light Installation',
      icon: 'lightbulb',
      category: 'Infrastructure',
    },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
  const { fullName, aadhar, phone, address, pincode } = formData;
  
  // Add this check at the top
  if (!selectedService) {
    Alert.alert('Error', 'Please select a service');
    return;
  }
  
  if (!fullName || !aadhar || !phone || !address || !pincode) {
    Alert.alert('Error', 'Please fill all required fields');
    return;
  }

  try {
    await submitApplication({
      userId: 'USER_123',
      serviceName: selectedService.name,  // ✅ Now safe!
      serviceCategory: selectedService.category,  // ✅ Now safe!
      fullName,
      aadhar,
      phone,
      email: formData.email,
      address,
      pincode,
      documents: uploadedDocs.map(d => d.url),
      status: 'Submitted',
    });

    Alert.alert('Success', 'Application submitted successfully!');
    navigation.goBack();
  } catch (error) {
    Alert.alert('Error', 'Failed to submit application');
  }
};

  if (!selectedService) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a2456" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Apply for Services</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.subtitle}>Select a service to apply</Text>

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
                      size={36}
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
              
              <TouchableOpacity style={styles.applicationCard}>
                <View style={styles.applicationHeader}>
                  <View style={styles.applicationIconBg}>
                    <MaterialCommunityIcons name="wallet" size={24} color="#fff" />
                  </View>
                  <View style={styles.applicationInfo}>
                    <Text style={styles.applicationName}>Pension Scheme</Text>
                    <Text style={styles.applicationDate}>Applied: 20 Dec 2024</Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Approved</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.applicationCard}>
                <View style={styles.applicationHeader}>
                  <View style={styles.applicationIconBg}>
                    <MaterialCommunityIcons name="certificate" size={24} color="#fff" />
                  </View>
                  <View style={styles.applicationInfo}>
                    <Text style={styles.applicationName}>Birth Certificate</Text>
                    <Text style={styles.applicationDate}>Applied: 28 Dec 2024</Text>
                  </View>
                  <View style={[styles.statusBadge, styles.statusPending]}>
                    <Text style={styles.statusText}>Reviewing</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a2456" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedService(null)}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedService.name}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Service Info */}
          <View style={styles.serviceInfoCard}>
            <MaterialCommunityIcons
              name={selectedService.icon as any}
              size={48}
              color="#252d6e"
            />
            <Text style={styles.serviceInfoTitle}>{selectedService.name}</Text>
            <Text style={styles.serviceInfoCategory}>{selectedService.category}</Text>
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
            <TouchableOpacity style={styles.uploadButton}  onPress={handleDocumentUpload} >
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
              <MaterialCommunityIcons name="information" size={20} color="#666" />
              <Text style={styles.termsText}>
                By submitting, you agree that all information provided is accurate and complete.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit Application</Text>
              <MaterialCommunityIcons name="send" size={20} color="#fff" />
            </TouchableOpacity>
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
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
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
    padding: 20,
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
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f0ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a2456',
    textAlign: 'center',
    marginBottom: 6,
  },
  serviceCategory: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
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
    backgroundColor: '#252d6e',
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
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#FF9800',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
  termsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
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
});