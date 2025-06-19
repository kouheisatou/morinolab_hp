import fs from 'node:fs';
import path from 'node:path';
import { BrowserWindow } from 'electron';
import { ImageProcessingOptions, ImageProcessingResult } from '@/types/common';

export class ImageService {
  async processImage(
    inputPath: string,
    outputPath: string,
    options: ImageProcessingOptions = {},
  ): Promise<void> {
    const { maxWidth = 1600, quality = 0.8 } = options;

    try {
      const stats = fs.statSync(inputPath);

      // Check if file size is reasonable (less than 50MB for original)
      if (stats.size > 50 * 1024 * 1024) {
        console.warn('File too large, copying without processing:', inputPath);
        fs.copyFileSync(inputPath, outputPath);
        return;
      }

      // Use the main window to process the image in renderer context
      const mainWindow = BrowserWindow.getAllWindows()[0];
      if (!mainWindow) {
        throw new Error('No window available for image processing');
      }

      // Send image processing request to renderer
      const result = await this.executeImageProcessing(
        mainWindow,
        inputPath,
        outputPath,
        maxWidth,
        quality,
      );

      if (result.success && result.data) {
        // Write the processed image data
        const buffer = Buffer.from(result.data);
        fs.writeFileSync(outputPath, buffer);
        console.log(
          `Image processed: ${inputPath} -> ${outputPath} (${result.dimensions?.original.width}x${result.dimensions?.original.height} -> ${result.dimensions?.new.width}x${result.dimensions?.new.height})`,
        );
      } else {
        throw new Error(result.error || 'Image processing failed');
      }
    } catch (error) {
      console.error('Failed to process image, falling back to copy:', error);
      // Fallback to copy
      fs.copyFileSync(inputPath, outputPath);
    }
  }

  private async executeImageProcessing(
    mainWindow: BrowserWindow,
    inputPath: string,
    outputPath: string,
    maxWidth: number,
    quality: number,
  ): Promise<ImageProcessingResult> {
    return await mainWindow.webContents.executeJavaScript(`
      (async () => {
        try {
          // Create image element
          const img = new Image();
          
          // Convert file path to data URL
          const response = await fetch('file://${inputPath.replace(/\\/g, '/')}');
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          
          return new Promise((resolve, reject) => {
            img.onload = async () => {
              try {
                // Calculate new dimensions
                let newWidth = img.width;
                let newHeight = img.height;
                
                if (img.width > ${maxWidth}) {
                  newWidth = ${maxWidth};
                  newHeight = (img.height * ${maxWidth}) / img.width;
                }
                
                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = newWidth;
                canvas.height = newHeight;
                const ctx = canvas.getContext('2d');
                
                // Draw resized image
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                
                // Convert to blob with compression
                const quality = ${quality};
                const ext = '${path.extname(outputPath).toLowerCase()}';
                
                // Force JPEG format for better compression unless original is PNG and small
                let mimeType = 'image/jpeg';
                let compressionQuality = quality;
                
                // Only keep PNG if it's likely to be smaller (icons, etc.) or transparency is needed
                if (ext === '.png') {
                  // Convert PNG to JPEG for better compression unless image is small
                  if (newWidth < 400 && newHeight < 400) {
                    mimeType = 'image/png';
                    compressionQuality = undefined; // PNG doesn't use quality param
                  }
                }
                
                canvas.toBlob((blob) => {
                  if (blob) {
                    // Convert blob to array buffer
                    const reader = new FileReader();
                    reader.onload = () => {
                      const arrayBuffer = reader.result;
                      const uint8Array = new Uint8Array(arrayBuffer);
                      resolve({
                        success: true,
                        data: Array.from(uint8Array),
                        dimensions: { 
                          original: { width: img.width, height: img.height },
                          new: { width: newWidth, height: newHeight }
                        }
                      });
                    };
                    reader.readAsArrayBuffer(blob);
                  } else {
                    reject(new Error('Failed to create blob'));
                  }
                }, mimeType, compressionQuality);
                
                URL.revokeObjectURL(imageUrl);
              } catch (error) {
                reject(error);
              }
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = imageUrl;
          });
        } catch (error) {
          return { success: false, error: error.message };
        }
      })()
    `);
  }

  copyImage(sourcePath: string, destinationPath: string): void {
    fs.copyFileSync(sourcePath, destinationPath);
  }

  async saveImage(
    type: string,
    id: string,
    sourcePath: string,
    fileName: string,
    contentRoot: string,
  ): Promise<string | null> {
    try {
      const mediaDir = path.join(contentRoot, type, id, 'media');
      if (!fs.existsSync(mediaDir)) {
        fs.mkdirSync(mediaDir, { recursive: true });
      }

      const destinationPath = path.join(mediaDir, fileName);
      await this.processImage(sourcePath, destinationPath);

      return path.relative(path.join(contentRoot, type, id), destinationPath);
    } catch (error) {
      console.error('Failed to save image:', error);
      return null;
    }
  }
}
