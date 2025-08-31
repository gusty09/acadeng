import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert } from 'react-native';

interface UseImagePickerReturn {
  pickImage: () => Promise<string | null>;
  takePhoto: () => Promise<string | null>;
  loading: boolean;
}

export function useImagePicker(): UseImagePickerReturn {
  const [loading, setLoading] = useState(false);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const pickImage = async (): Promise<string | null> => {
    try {
      setLoading(true);

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        showAlert('إذن مطلوب', 'نحتاج إذن للوصول إلى معرض الصور');
        return null;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      showAlert('خطأ', 'فشل في تحديد الصورة');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async (): Promise<string | null> => {
    try {
      setLoading(true);

      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        showAlert('إذن مطلوب', 'نحتاج إذن للوصول إلى الكاميرا');
        return null;
      }

      // Take photo
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      showAlert('خطأ', 'فشل في التقاط الصورة');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    pickImage,
    takePhoto,
    loading,
  };
}