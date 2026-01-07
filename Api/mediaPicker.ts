import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

// Request camera permissions
export const requestCameraPermission = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Denied', 'Camera access is required to take photos.');
    return false;
  }
  return true;
};

// Request media library permissions
export const requestMediaLibraryPermission = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Denied', 'Gallery access is required to select photos.');
    return false;
  }
  return true;
};

// Take photo with camera
export const takePhoto = async () => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
  return null;
};

// Pick image from gallery
export const pickImage = async () => {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.7,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
  return null;
};

// Show picker dialog
export const showImagePicker = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    Alert.alert(
      'Upload Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const uri = await takePhoto();
            resolve(uri);
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const uri = await pickImage();
            resolve(uri);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ]
    );
  });
};

// Local "upload" - just returns the URI (no actual upload)
export const uploadImageToFirebase = async (
  uri: string,
  folder: string = 'images'
): Promise<string | null> => {
  console.log('📸 Image saved locally:', uri);
  return uri; // Return local URI
};

// Pick document (PDF, etc.)
export const pickDocument = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return null;
    }

    return {
      uri: result.assets[0].uri,
      name: result.assets[0].name,
      size: result.assets[0].size,
      mimeType: result.assets[0].mimeType,
    };
  } catch (error) {
    console.error('Error picking document:', error);
    Alert.alert('Error', 'Failed to pick document. Please try again.');
    return null;
  }
};

// Local "upload" for documents
export const uploadDocumentToFirebase = async (
  uri: string,
  filename: string,
  folder: string = 'documents'
): Promise<string | null> => {
  console.log('📄 Document saved locally:', uri);
  return uri; // Return local URI
};