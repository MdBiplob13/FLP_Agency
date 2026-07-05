import { toast } from 'react-hot-toast';

const hostPhoto = async (photo) => {
  if (!photo) return '';

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary is not configured.');
  }

  const photoData = new FormData();
  photoData.append('file', photo);
  photoData.append('upload_preset', uploadPreset);
  photoData.append('cloud_name', cloudName);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: photoData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || 'Image upload failed.');
    }

    return data?.secure_url || data?.url || '';
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
};

export default hostPhoto;
