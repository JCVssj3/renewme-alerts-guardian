
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export class CameraService {
  static async requestPermissions() {
    try {
      console.log('Requesting camera permissions...');
      const permissions = await Camera.requestPermissions();
      console.log('Camera permissions result:', permissions);
      return permissions.camera === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  }

  static async takePicture(): Promise<File | null> {
    try {
      console.log('Starting camera capture...');
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Camera permission denied');
      }

      console.log('Camera permission granted, opening camera...');
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      console.log('Camera photo result:', { 
        hasDataUrl: !!image.dataUrl, 
        format: image.format,
        width: image.width,
        height: image.height 
      });

      if (image.dataUrl) {
        // Convert data URL to File
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `document_${Date.now()}.jpg`, { type: 'image/jpeg' });
        console.log('Successfully created file from camera:', file.name, file.size, 'bytes');
        return file;
      }

      console.warn('No data URL received from camera');
      return null;
    } catch (error) {
      console.error('Error taking picture:', error);
      throw error;
    }
  }

  static async selectFromGallery(): Promise<File | null> {
    try {
      console.log('Starting gallery selection...');
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Camera permission denied');
      }

      console.log('Camera permission granted, opening gallery...');
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      console.log('Gallery photo result:', { 
        hasDataUrl: !!image.dataUrl, 
        format: image.format,
        width: image.width,
        height: image.height 
      });

      if (image.dataUrl) {
        // Convert data URL to File
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `document_${Date.now()}.jpg`, { type: 'image/jpeg' });
        console.log('Successfully created file from gallery:', file.name, file.size, 'bytes');
        return file;
      }

      console.warn('No data URL received from gallery');
      return null;
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      throw error;
    }
  }
}
