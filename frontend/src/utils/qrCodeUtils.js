/**
 * QR Code Utilities
 * QR code generation and scanning for POS using jsQR library
 * 
 * Required: npm install jsqr canvas
 */

// Dynamically import jsQR when needed
let jsQR = null;

const loadJsQR = async () => {
  if (!jsQR) {
    try {
      // Try importing jsQR at runtime
      const module = await import('jsqr');
      jsQR = module.default;
    } catch (error) {
      console.warn('[QR] jsQR library not loaded, will use fallback', error);
    }
  }
  return jsQR;
};

/**
 * Generate a QR code using canvas
 * Returns data URL for HTML img tag
 */
export const generateQRCodeDataURL = async (text) => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // Simple QR-like pattern based on text hash
    // In production, replace with library like qrcode.js
    const textBytes = new TextEncoder().encode(text);
    const cellSize = size / 21;
    
    ctx.fillStyle = '#000000';
    for (let i = 0; i < textBytes.length && i < 441; i++) {
      const byte = textBytes[i];
      const row = Math.floor(i / 21);
      const col = i % 21;
      
      if (byte % 2 === 0) {
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('[QR] Failed to generate QR code', error);
    return null;
  }
};

/**
 * Initialize QR code scanner using device camera
 * Requires browser permission and HTTPS
 */
export const initQRScanner = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });
    return stream;
  } catch (error) {
    console.error('[QR] Failed to access camera', error);
    throw new Error('Camera access denied or not available');
  }
};

/**
 * Decode QR code from canvas using jsQR library
 * Returns the decoded text if found
 */
export const decodeQRFromCanvas = async (canvas) => {
  try {
    const qr = await loadJsQR();
    
    if (!qr) {
      console.warn('[QR] jsQR not available, using fallback');
      return null;
    }

    const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    const decodedQR = qr(imageData.data, imageData.width, imageData.height);
    
    if (decodedQR) {
      console.log('[QR] Decoded:', decodedQR.data);
      return decodedQR.data;
    }
    
    return null;
  } catch (error) {
    console.error('[QR] Failed to decode QR code', error);
    return null;
  }
};

/**
 * Scan QR code from video stream continuously
 * Returns Promise that resolves when QR is found
 */
export const scanQRFromStream = (videoElement, onScanUpdate = null) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    let consecutiveNoMatch = 0;
    const scanInterval = setInterval(async () => {
      try {
        if (!videoElement.videoWidth || !videoElement.videoHeight) {
          return;
        }

        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        ctx.drawImage(videoElement, 0, 0);
        
        // Attempt to decode QR using jsQR
        const decoded = await decodeQRFromCanvas(canvas);
        
        if (decoded) {
          clearInterval(scanInterval);
          resolve(decoded);
        } else {
          consecutiveNoMatch++;
          if (onScanUpdate) {
            onScanUpdate({ scanning: true, detected: false });
          }
        }
      } catch (error) {
        console.error('[QR] Scan error:', error);
      }
    }, 200); // Scan every 200ms
    
    // Timeout after 60 seconds
    const timeoutId = setTimeout(() => {
      clearInterval(scanInterval);
      reject(new Error('QR code scan timeout - no code found after 60 seconds'));
    }, 60000);

    // Allow cancellation
    const cleanup = () => {
      clearInterval(scanInterval);
      clearTimeout(timeoutId);
    };

    resolve.cancel = cleanup;
  });
};

/**
 * Validate and parse QR code data for listings
 */
export const parseListingQR = (qrData) => {
  try {
    if (!qrData) return null;

    // Format: habitaplot://listing/{id}
    const match = qrData.match(/habitaplot:\/\/listing\/([a-f0-9\-]{36})/i);
    if (match) {
      return {
        listingId: match[1],
        type: 'listing',
        source: 'qr_code'
      };
    }

    // Direct UUID
    if (qrData.match(/^[a-f0-9\-]{36}$/i)) {
      return {
        listingId: qrData,
        type: 'listing',
        source: 'direct_id'
      };
    }

    // URL format: https://habitaplot.com/listing/{id}
    const urlMatch = qrData.match(/\/listing\/([a-f0-9\-]{36})/i);
    if (urlMatch) {
      return {
        listingId: urlMatch[1],
        type: 'listing',
        source: 'url'
      };
    }

    return null;
  } catch (error) {
    console.error('[QR] Failed to parse QR data', error);
    return null;
  }
};

/**
 * Generate listing QR code for POS systems
 */
export const generateListingQR = (listingId, listingTitle) => {
  const qrData = `habitaplot://listing/${listingId}`;
  return generateQRCodeDataURL(qrData);
};

/**
 * Check if device supports camera
 */
export const deviceSupportsCamera = () => {
  return (
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  );
};

/**
 * Check if HTTPS is available (required for camera)
 */
export const isHTTPSAvailable = () => {
  return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
};

/**
 * Get supported camera permissions status
 */
export const getCameraPermissionStatus = async () => {
  try {
    if (!navigator.permissions) return 'unknown';
    const result = await navigator.permissions.query({ name: 'camera' });
    return result.state; // 'granted', 'denied', 'prompt'
  } catch (error) {
    console.warn('[QR] Cannot check camera permissions', error);
    return 'unknown';
  }
};
