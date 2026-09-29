import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import jsQR from 'jsqr';
import { useI18n } from '../../i18n';
import { useApp } from '../../store/AppContext';
import { parseUPILink } from '../../core/qr';
import { defaultHaptics } from '../../adapters';
import {
  ImageIcon,
  ClipboardIcon,
  ScanIcon,
  CameraIcon,
  ShieldIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ChevronRightIcon,
} from '../Icons';
import './Scan.css';

export const ScanScreen: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setScannedData, showToast } = useApp();

  const [upiInput, setUpiInput] = useState('');
  const [showManual, setShowManual] = useState(searchParams.get('mode') === 'upi');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scanningImage, setScanningImage] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stop camera stream & scan loop
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraLoading(false);
  }, []);

  // Process decoded raw string (UPI link or VPA)
  const handleParsed = useCallback(
    (input: string) => {
      const trimmed = input.trim();
      if (!trimmed) {
        showToast('Empty QR code or input', 'error');
        return;
      }

      const result = parseUPILink(trimmed);
      if (result.success) {
        if (!result.data.pa) {
          defaultHaptics.warning();
          showToast('Invalid QR code: Missing payee VPA', 'error');
          return;
        }
        defaultHaptics.success();
        setScannedData(result.data, result.classification);
        if (result.warnings.length > 0) {
          showToast(result.warnings[0], 'info');
        }
        stopCamera();
        navigate('/app/pay');
      } else {
        defaultHaptics.warning();
        showToast(result.error || 'Invalid UPI QR code. No payee address found.', 'error');
      }
    },
    [setScannedData, navigate, showToast, stopCamera]
  );

  // Start continuous QR scanner using jsQR
  const startScanLoop = useCallback(() => {
    const scan = () => {
      if (!videoRef.current || !streamRef.current) return;
      const video = videoRef.current;

      if (video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0 && video.videoHeight > 0) {
        if (!canvasRef.current) {
          canvasRef.current = document.createElement('canvas');
        }
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleParsed(code.data);
            return;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scan);
    };

    animationFrameRef.current = requestAnimationFrame(scan);
  }, [handleParsed]);

  // Request camera permission and start video stream prioritizing rear camera
  const startCamera = useCallback(
    async (targetFacing: 'environment' | 'user' = facingMode) => {
      stopCamera();
      setCameraLoading(true);
      setCameraError(null);

      try {
        let stream: MediaStream | null = null;

        // Attempt 1: High quality with desired facing mode
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: targetFacing },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch (e1) {
          console.warn('Attempt 1 failed, trying simple facingMode:', e1);
          // Attempt 2: Simple facing mode
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: targetFacing },
              audio: false,
            });
          } catch (e2) {
            console.warn('Attempt 2 failed, falling back to any video camera:', e2);
            // Attempt 3: Generic video device fallback
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
          }
        }

        if (!stream) {
          throw new Error('Could not acquire video stream.');
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.muted = true;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn('Video play interrupted or queued:', playErr);
          }
        }

        setCameraActive(true);
        setCameraLoading(false);
        setCameraError(null);
        startScanLoop();
      } catch (err: any) {
        console.error('Camera access error:', err);
        stopCamera();
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError('Camera permission denied. Please allow camera permissions in browser settings to scan QR codes.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('No camera found on this device. You can paste a UPI ID or import an image.');
        } else {
          setCameraError(err.message || 'Unable to access camera.');
        }
      }
    },
    [facingMode, stopCamera, startScanLoop]
  );

  // Flip between rear and front camera
  const toggleCameraFlip = useCallback(() => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  }, [facingMode, startCamera]);

  // Auto-start camera on screen mount if not manual mode
  useEffect(() => {
    if (!showManual) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [showManual]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle image import from gallery/files
  const handleFileImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setScanningImage(true);

      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) {
              showToast('Failed to process image', 'error');
              setScanningImage(false);
              return;
            }

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth',
            });

            if (code && code.data) {
              handleParsed(code.data);
            } else {
              showToast('No UPI QR code found in the image. Try another photo or enter manually.', 'error');
            }
          } catch (err) {
            console.error('Error decoding image:', err);
            showToast('Unable to read QR code from image.', 'error');
          } finally {
            setScanningImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }
        };
        img.onerror = () => {
          showToast('Failed to load image file', 'error');
          setScanningImage(false);
        };
        img.src = reader.result as string;
      };
      reader.onerror = () => {
        showToast('Error reading file', 'error');
        setScanningImage(false);
      };
      reader.readAsDataURL(file);
    },
    [handleParsed, showToast]
  );

  // Handle clipboard paste
  const handlePaste = useCallback(async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        try {
          const items = await navigator.clipboard.read();
          for (const item of items) {
            for (const type of item.types) {
              if (type.startsWith('image/')) {
                const blob = await item.getType(type);
                const reader = new FileReader();
                reader.onload = () => {
                  const img = new Image();
                  img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.drawImage(img, 0, 0);
                      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                      const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: 'attemptBoth',
                      });
                      if (code && code.data) {
                        handleParsed(code.data);
                        return;
                      }
                    }
                    showToast('No QR code detected in pasted image', 'error');
                  };
                  img.src = reader.result as string;
                };
                reader.readAsDataURL(blob);
                return;
              }
            }
          }
        } catch {
          /* continue to text */
        }
      }

      const text = await navigator.clipboard.readText();
      if (text) {
        setUpiInput(text);
        handleParsed(text);
      } else {
        showToast('Clipboard is empty', 'info');
      }
    } catch {
      showToast('Clipboard access unavailable. Please paste manually.', 'info');
      setShowManual(true);
    }
  }, [handleParsed, showToast]);

  const handleSubmit = useCallback(() => {
    if (upiInput.trim()) {
      handleParsed(upiInput.trim());
    }
  }, [upiInput, handleParsed]);

  return (
    <div className="scan" id="scan-screen">
      {/* Header */}
      <div className="scan__header">
        <h1 className="scan__title">{t.scan.title}</h1>
        <p style={{ fontSize: '13px', color: 'var(--color-ink-secondary)', marginTop: '4px' }}>
          Point camera at merchant UPI QR to decode and route offline
        </p>
      </div>

      {/* Main Scanner Section */}
      {!showManual && (
        <div className="scan__camera-section stagger-item">
          <div className="scan__camera-frame" id="camera-frame">
            {/* Always rendered video element for seamless ref binding */}
            <video
              ref={videoRef}
              className={`scan__video ${cameraActive ? 'scan__video--active' : 'scan__video--hidden'}`}
              playsInline
              muted
              autoPlay
            />

            {/* Active Viewfinder Overlays */}
            {cameraActive && (
              <>
                <div className="scan__overlay">
                  <div className="scan__corner scan__corner--tl" />
                  <div className="scan__corner scan__corner--tr" />
                  <div className="scan__corner scan__corner--bl" />
                  <div className="scan__corner scan__corner--br" />
                  <div className="scan__laser-line" />
                </div>

                <div className="scan__active-badge">
                  <span className="scan__active-dot" />
                  <span>{facingMode === 'environment' ? 'Rear Camera Active' : 'Front Camera Active'}</span>
                </div>

                {/* Flip camera control button */}
                <button
                  className="scan__flip-btn"
                  onClick={toggleCameraFlip}
                  title="Flip camera (Rear / Front)"
                  type="button"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 2.21 0.895 4.21 2.343 5.657L4 18h6v-6l-2.343 2.343C6.627 13.314 6 11.731 6 10c0-3.314 2.686-6 6-6s6 2.686 6 6c0 1.731-0.627 3.314-1.657 4.343L14 12v6h6l-2.343-2.343C19.105 14.21 20 12.21 20 10z"/>
                  </svg>
                </button>
              </>
            )}

            {/* Loading Spinner State */}
            {cameraLoading && !cameraActive && (
              <div className="scan__permission-card">
                <div className="scan__loading-spinner" />
                <h3 className="scan__permission-title" style={{ marginTop: '12px' }}>Starting Camera Preview...</h3>
                <p className="scan__permission-desc">Requesting device video stream</p>
              </div>
            )}

            {/* Inactive / Error Permission Card */}
            {!cameraActive && !cameraLoading && (
              <div className="scan__permission-card">
                <div className="scan__permission-icon-wrap">
                  <CameraIcon size={36} color="var(--color-ink)" />
                </div>
                <h3 className="scan__permission-title">Camera Preview Inactive</h3>
                <p className="scan__permission-desc">
                  To scan merchant UPI QR codes without internet, NoNetPay decodes frames locally in browser memory.
                  All images remain on this phone.
                </p>

                {cameraError && (
                  <div className="scan__camera-error-banner">
                    <AlertCircleIcon size={16} />
                    <span>{cameraError}</span>
                  </div>
                )}

                <button
                  className="btn btn--primary scan__permission-btn"
                  onClick={() => startCamera()}
                  id="start-camera-btn"
                >
                  <CameraIcon size={18} />
                  <span>Start Camera Preview</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons: Gallery & Paste */}
          <div className="scan__actions">
            <button
              className="btn btn--secondary scan__action-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={scanningImage}
              id="import-image-btn"
            >
              <ImageIcon size={18} />
              <span>{scanningImage ? 'Analyzing...' : 'Scan from Gallery'}</span>
            </button>
            <button
              className="btn btn--secondary scan__action-btn"
              onClick={handlePaste}
              id="paste-link-btn"
            >
              <ClipboardIcon size={18} />
              <span>Paste UPI / Link</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileImport}
          />
        </div>
      )}

      {/* Manual Input Toggle / Form */}
      <div className="scan__manual stagger-item">
        {!showManual ? (
          <button
            className="scan__toggle-manual-btn"
            onClick={() => {
              setShowManual(true);
              stopCamera();
            }}
            id="toggle-manual-entry-btn"
          >
            <span>Can't scan QR? Enter UPI ID or Number</span>
            <ChevronRightIcon size={16} />
          </button>
        ) : (
          <div className="scan__manual-form card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h2 className="scan__manual-title">Enter Payee UPI ID</h2>
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  setShowManual(false);
                  startCamera();
                }}
                style={{ fontSize: '12px' }}
              >
                ← Back to Camera
              </button>
            </div>
            <p className="scan__manual-hint">
              Enter a UPI VPA (e.g. <code>store@okhdfcbank</code>) or paste any raw <code>upi://pay?...</code> URI.
            </p>

            <div className="input-group" style={{ marginTop: '12px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. merchant@icici or 9876543210@upi"
                value={upiInput}
                onChange={(e) => setUpiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                id="upi-input"
                autoComplete="off"
                autoFocus
              />
            </div>

            <div className="scan__manual-actions" style={{ marginTop: '16px' }}>
              <button className="btn btn--secondary" onClick={handlePaste} id="paste-manual-btn">
                <ClipboardIcon size={16} />
                <span>Paste from Clipboard</span>
              </button>
              <button
                className="btn btn--primary"
                onClick={handleSubmit}
                disabled={!upiInput.trim()}
                id="continue-manual-btn"
              >
                <span>Continue to Pay →</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sovereign Security Guarantee */}
      <div className="scan__security-card card">
        <div className="scan__security-icon">
          <ShieldIcon size={20} color="var(--color-success)" />
        </div>
        <div className="scan__security-text">
          <strong>100% Offline Client-Side Decoding</strong>
          <p>
            Video frames are decoded entirely in local memory via WebAssembly / JavaScript. No video or biometric data is ever recorded or uploaded.
          </p>
        </div>
      </div>
    </div>
  );
};
