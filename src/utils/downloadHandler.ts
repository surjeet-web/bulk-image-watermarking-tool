import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ImageFile } from '../types/watermark';

export async function downloadWatermarkedImages(
  processedImages: string[],
  originalFiles: ImageFile[]
) {
  const zip = new JSZip();

  // Add each processed image to the zip
  processedImages.forEach((dataUrl, index) => {
    const originalName = originalFiles[index].file.name;
    const extension = originalName.split('.').pop();
    const baseName = originalName.replace(`.${extension}`, '');
    const newName = `watermarked_${baseName}.png`;

    // Convert base64 to blob
    const imageData = dataUrl.split(',')[1];
    zip.file(newName, imageData, { base64: true });
  });

  try {
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'watermarked_images.zip');
    return true;
  } catch (error) {
    console.error('Error creating zip file:', error);
    return false;
  }
}