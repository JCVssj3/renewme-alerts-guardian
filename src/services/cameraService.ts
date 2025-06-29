
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export class CameraService {
  static async requestPermissions() {
    try {
      const permissions = await Camera.requestPermissions();
      return permissions.camera === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  static async takePicture(): Promise<File | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Camera permission denied');
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        // Convert data URL to File
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `document_${Date.now()}.jpg`, { type: 'image/jpeg' });
        return file;
      }

      return null;
    } catch (error) {
      console.error('Error taking picture:', error);
      throw error;
    }
  }

  static async selectFromGallery(): Promise<File | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Camera permission denied');
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (image.dataUrl) {
        // Convert data URL to File
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `document_${Date.now()}.jpg`, { type: 'image/jpeg' });
        return file;
      }

      return null;
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      throw error;
    }
  }
}
