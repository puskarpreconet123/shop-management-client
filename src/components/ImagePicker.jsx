import { useState, useRef } from 'react';
import { Upload, Camera, X, RefreshCw } from 'lucide-react';
import './ImagePicker.css';

/**
 * Props:
 *   onChange(payload) — called with { file, base64 } on new selection, or null on clear
 *   currentImageUrl   — full Cloudinary URL of the existing image (for edit mode preview)
 */
export default function ImagePicker({ onChange, currentImageUrl }) {
  const fileRef  = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();
  const [mode, setMode]       = useState(null);   // null | 'camera'
  const [stream, setStream]   = useState(null);
  const [preview, setPreview] = useState(null);   // local blob/base64 preview

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      onChange({ file, base64: null });
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(s);
      setMode('camera');
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = s;
      }, 100);
    } catch {
      alert('Camera access denied or not available.');
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setMode(null);
  };

  const capturePhoto = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    setPreview(base64);
    onChange({ file: null, base64 });
    stopCamera();
  };

  const clearImage = () => {
    setPreview(null);
    onChange(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  // Show: local preview first, else existing Cloudinary URL
  const displaySrc = preview || currentImageUrl || null;

  return (
    <div className="image-picker">
      {mode === 'camera' ? (
        <div className="camera-view">
          <video ref={videoRef} autoPlay playsInline className="camera-feed" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="camera-controls">
            <button type="button" className="btn btn-danger btn-sm" onClick={stopCamera}>
              <X size={14} /> Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={capturePhoto}>
              <Camera size={16} /> Capture
            </button>
          </div>
        </div>
      ) : displaySrc ? (
        <div className="image-preview">
          <img src={displaySrc} alt="Product" />
          <div className="preview-actions">
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => fileRef.current.click()}>
              <RefreshCw size={13} /> Change
            </button>
            <button type="button" className="btn btn-sm btn-danger" onClick={clearImage}>
              <X size={13} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="image-drop-area">
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="drop-icon">📷</div>
          <p className="drop-text">Upload or capture a photo</p>
          <div className="drop-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current.click()}>
              <Upload size={14} /> Upload
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={startCamera}>
              <Camera size={14} /> Camera
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  );
}
