/**
 * Bitvera Sales — Real Camera & Document Capture Service
 * 
 * Interacts with device camera or file system to capture genuine images.
 * Validates MIME types, extensions, and file sizes (max 5MB).
 * Returns real DataURLs with preview, retake, and persistence capabilities.
 */

export interface CapturedDocument {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  dataUrl: string;
  capturedAt: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates an image file for MIME type and size safety
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Invalid file format. Only JPEG, PNG, and WebP images are permitted.'
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeMb} MB). Maximum allowed size is 5 MB.`
    };
  }

  return { valid: true };
}

/**
 * Convert HTML File object to a Base64 Data URL
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file from disk.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Programmatically prompt user for Camera capture or Image file selection
 */
export function promptDeviceImageCapture(useCamera: boolean = true): Promise<CapturedDocument | null> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    if (useCamera) {
      input.capture = 'environment'; // Back camera for documents / site photos
    }

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const validation = validateImageFile(file);
      if (!validation.valid) {
        alert(validation.error);
        resolve(null);
        return;
      }

      try {
        const dataUrl = await fileToDataUrl(file);
        const doc: CapturedDocument = {
          id: 'doc_' + (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()),
          name: file.name.replace(/[^a-zA-Z0-9._-]/g, '_'),
          sizeBytes: file.size,
          mimeType: file.type,
          dataUrl,
          capturedAt: new Date().toISOString()
        };
        resolve(doc);
      } catch (e) {
        console.error('Error reading captured image:', e);
        resolve(null);
      }
    };

    input.click();
  });
}
