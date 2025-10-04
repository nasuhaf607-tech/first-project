import React, { useState, useRef, useEffect } from "react";

const DriverRegistration = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    icNumber: "",
    licenseNumber: "",
    vehicleType: "",
    vehicleNumber: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    experience: "",
    languages: [],
    availability: "",
    icPhoto: null,
    selfiePhoto: null,
    licensePhoto: null,
    vehiclePhoto: null
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraType, setCameraType] = useState("");
  const [currentFacingMode, setCurrentFacingMode] = useState('user'); // 'user' for front, 'environment' for back
  const [videoVisible, setVideoVisible] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log("DriverRegistration modal opened");
    return () => {
      console.log("DriverRegistration modal closed");
    };
  }, []);

  // Track camera modal state and update video visibility
  React.useEffect(() => {
    console.log("useEffect triggered - isCapturing:", isCapturing, "cameraType:", cameraType);
    
    if (isCapturing) {
      console.log("Camera modal should be visible now");
      console.log("isCapturing:", isCapturing);
      console.log("cameraType:", cameraType);
      
      // Set video visible state
      setVideoVisible(true);
      console.log("Video visibility state set to true");
      
      // Force a re-render to ensure video element is created
      setTimeout(() => {
        console.log("Checking camera video ref after modal render...");
        console.log("cameraVideoRef.current:", cameraVideoRef.current);
        if (cameraVideoRef.current) {
          console.log("Camera video element found!");
        } else {
          console.log("Camera video element still null!");
          // Force a state update to trigger re-render
          setCameraType(prev => prev);
        }
      }, 100);
    } else {
      // Hide video when not capturing
      setVideoVisible(false);
      console.log("Video visibility state set to false");
    }
  }, [isCapturing, cameraType]);
  
  const videoRef = useRef(null);
  const cameraVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        languages: checked 
          ? [...prev.languages, value]
          : prev.languages.filter(lang => lang !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const startCamera = async (type) => {
    try {
      setCameraType(type);
      setIsCapturing(true);
      setError(""); // Clear any previous errors
      
      console.log(`Starting camera for ${type}`);
      console.log('isCapturing set to true, modal should render...');
      
      // Wait for the modal to render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }
      
      // Determine initial camera facing mode
      let facingMode = 'user'; // Default to front camera
      if (type === 'ic' || type === 'license' || type === 'vehicle') {
        facingMode = 'environment'; // Back camera for documents
      }
      setCurrentFacingMode(facingMode);
      
      // Try to get camera with specific constraints first
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } 
        });
      } catch (facingModeError) {
        console.log('Facing mode failed, trying without constraints:', facingModeError);
        // Fallback: try without facing mode constraint
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
      }
      
      streamRef.current = stream;
      
      // Wait a bit more for the video element to be available
      let attempts = 0;
      while (!cameraVideoRef.current && attempts < 10) {
        console.log(`Waiting for camera video element... attempt ${attempts + 1}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        console.log('Camera stream started successfully');
        console.log('Camera video element:', cameraVideoRef.current);
        console.log('Stream tracks:', stream.getTracks());
        
        // Add event listeners to track stream state
        stream.getTracks().forEach(track => {
          track.addEventListener('ended', () => {
            console.log('Camera track ended unexpectedly');
            stopCamera();
          });
          track.addEventListener('mute', () => {
            console.log('Camera track muted');
          });
          track.addEventListener('unmute', () => {
            console.log('Camera track unmuted');
          });
        });
      } else {
        console.error('Camera video ref is still null after waiting!');
        console.log('isCapturing:', isCapturing);
        console.log('cameraType:', cameraType);
        setError('Camera modal failed to load. Please try again.');
        setIsCapturing(false);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      let errorMessage = 'Unable to access camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported on this device.';
      } else {
        errorMessage += 'Please check permissions and try again.';
      }
      
      setError(errorMessage);
      setIsCapturing(false);
    }
  };

  const switchCamera = async () => {
    try {
      // Stop current stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Switch facing mode
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
      setCurrentFacingMode(newFacingMode);
      
      // Start new stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: newFacingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error switching camera:', err);
      setError('Unable to switch camera. Please try again.');
    }
  };

  const stopCamera = () => {
    console.log("stopCamera() called - stack trace:");
    console.trace();
    
    if (isStopping) {
      console.log("stopCamera() already in progress, ignoring");
      return;
    }
    
    setIsStopping(true);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
    setCameraType("");
    setVideoVisible(false);
    console.log("Camera stopped, video hidden");
    
    // Reset stopping flag after a delay
    setTimeout(() => {
      setIsStopping(false);
    }, 1000);
  };

  const capturePhoto = () => {
    if (cameraVideoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = cameraVideoRef.current;
      const context = canvas.getContext('2d');
      
      console.log('Capturing photo...');
      console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `${cameraType}_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setFormData(prev => ({
            ...prev,
            [cameraType + 'Photo']: file
          }));
          stopCamera();
          setSuccess(`${cameraType.charAt(0).toUpperCase() + cameraType.slice(1)} photo captured successfully!`);
          console.log('Photo captured and saved:', file.name);
        } else {
          console.error('Failed to create blob from canvas');
          setError('Failed to capture photo. Please try again.');
        }
      }, 'image/jpeg', 0.8);
    } else {
      console.error('Camera video or canvas not available');
      setError('Camera not ready. Please try again.');
    }
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [type]: file
      }));
    }
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (step === 1) {
      const step1Fields = ['name', 'email', 'phone', 'password', 'icNumber'];
      const missingFields = step1Fields.filter(field => !formData[field] || formData[field].trim() === '');
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }
    } else if (step === 2) {
      const step2Fields = ['licenseNumber', 'vehicleType', 'vehicleNumber', 'experience'];
      const missingFields = step2Fields.filter(field => !formData[field] || formData[field].trim() === '');
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }
    } else if (step === 3) {
      const step3Fields = ['address', 'emergencyContact', 'emergencyPhone', 'availability'];
      const missingFields = step3Fields.filter(field => !formData[field] || formData[field].trim() === '');
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }
    }
    
    setError(""); // Clear any previous errors
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'password', 'icNumber', 'licenseNumber', 'vehicleType', 'vehicleNumber', 'address', 'emergencyContact', 'emergencyPhone', 'experience', 'availability'];
    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate required photos
    const requiredPhotos = ['icPhoto', 'selfiePhoto', 'licensePhoto', 'vehiclePhoto'];
    const missingPhotos = requiredPhotos.filter(photo => !formData[photo]);
    
    if (missingPhotos.length > 0) {
      setError(`Please upload all required photos: ${missingPhotos.join(', ')}`);
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== "") {
          if (Array.isArray(formData[key])) {
            formDataToSend.append(key, JSON.stringify(formData[key]));
          } else if (formData[key] instanceof File) {
            formDataToSend.append(key, formData[key]);
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });
      formDataToSend.append('userType', 'Driver');
      formDataToSend.append('status', 'pending'); // Default status for JKM approval

      console.log("Submitting driver registration...");
      console.log("Form data keys:", Object.keys(formData));
      
      const response = await fetch("http://localhost/first-project/backend/register.php", {
        method: "POST",
        body: formDataToSend,
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (data.status !== "success") {
        setError(data.message);
        return;
      }

      setSuccess("Registration submitted successfully! You will receive an email notification once JKM approves your application.");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);

    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isCapturing) {
        stopCamera();
      }
    };

    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      stopCamera();
    };
  }, [isCapturing]);

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
      
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Full Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Phone Number *</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Password *</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">IC Number *</label>
        <input
          type="text"
          name="icNumber"
          value={formData.icNumber}
          onChange={handleInputChange}
          required
          placeholder="e.g., 901234-12-1234"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver & Vehicle Information</h3>
      
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Driving License Number *</label>
        <input
          type="text"
          name="licenseNumber"
          value={formData.licenseNumber}
          onChange={handleInputChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Vehicle Type *</label>
        <select
          name="vehicleType"
          value={formData.vehicleType}
          onChange={handleInputChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select Vehicle Type</option>
          <option value="sedan">Sedan</option>
          <option value="suv">SUV</option>
          <option value="van">Van</option>
          <option value="wheelchair_accessible">Wheelchair Accessible Vehicle</option>
        </select>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Vehicle Registration Number *</label>
        <input
          type="text"
          name="vehicleNumber"
          value={formData.vehicleNumber}
          onChange={handleInputChange}
          required
          placeholder="e.g., ABC1234"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Years of Driving Experience *</label>
        <select
          name="experience"
          value={formData.experience}
          onChange={handleInputChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select Experience</option>
          <option value="0-1">0-1 years</option>
          <option value="2-5">2-5 years</option>
          <option value="6-10">6-10 years</option>
          <option value="10+">10+ years</option>
        </select>
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Languages Spoken</label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['Bahasa Malaysia', 'English', 'Mandarin', 'Tamil', 'Cantonese', 'Others'].map(lang => (
            <label key={lang} className="flex items-center">
              <input
                type="checkbox"
                value={lang}
                checked={formData.languages.includes(lang)}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm">{lang}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
      
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Address *</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          required
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Emergency Contact Name *</label>
        <input
          type="text"
          name="emergencyContact"
          value={formData.emergencyContact}
          onChange={handleInputChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Emergency Contact Phone *</label>
        <input
          type="tel"
          name="emergencyPhone"
          value={formData.emergencyPhone}
          onChange={handleInputChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Availability *</label>
        <select
          name="availability"
          value={formData.availability}
          onChange={handleInputChange}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select Availability</option>
          <option value="full-time">Full Time</option>
          <option value="part-time">Part Time</option>
          <option value="weekends">Weekends Only</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Document & Photo Upload</h3>
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-blue-800">
          <strong>Important:</strong> Please ensure all photos are clear and well-lit. 
          Documents should be fully visible and readable. This information will be reviewed by JKM officers.
        </p>
      </div>
      
      {/* IC Photo */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <h4 className="font-medium text-gray-900 mb-2">IC Photo *</h4>
        <p className="text-sm text-gray-500 mb-4">Take a clear photo of your IC</p>
        {formData.icPhoto ? (
          <div className="space-y-2">
            <img src={URL.createObjectURL(formData.icPhoto)} alt="IC" className="mx-auto max-w-xs rounded-lg" />
            <p className="text-sm text-green-600">IC photo uploaded successfully</p>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                // Simple camera test
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                  navigator.mediaDevices.getUserMedia({ video: true })
                    .then(stream => {
                      stream.getTracks().forEach(track => track.stop());
                      setSuccess('Camera access working! Opening camera...');
                      setTimeout(() => {
                        console.log('Starting camera after timeout...');
                        startCamera('ic');
                      }, 1500);
                    })
                    .catch(err => {
                      console.error('Camera error:', err);
                      setError('Camera access failed: ' + err.message);
                    });
                } else {
                  setError('Camera not supported on this device');
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              📷 Take IC Photo
            </button>
            <p className="text-sm text-gray-500">or</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'icPhoto')}
              className="hidden"
              id="ic-upload"
            />
            <label htmlFor="ic-upload" className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 cursor-pointer">
              📁 Upload IC Photo
            </label>
          </div>
        )}
      </div>

      {/* Selfie Photo */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <h4 className="font-medium text-gray-900 mb-2">Selfie Photo *</h4>
        <p className="text-sm text-gray-500 mb-4">Take a clear selfie for verification</p>
        {formData.selfiePhoto ? (
          <div className="space-y-2">
            <img src={URL.createObjectURL(formData.selfiePhoto)} alt="Selfie" className="mx-auto max-w-xs rounded-lg" />
            <p className="text-sm text-green-600">Selfie photo uploaded successfully</p>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                  navigator.mediaDevices.getUserMedia({ video: true })
                    .then(stream => {
                      stream.getTracks().forEach(track => track.stop());
                      setSuccess('Camera access working! Opening camera...');
                      setTimeout(() => {
                        console.log('Starting camera after timeout...');
                        startCamera('selfie');
                      }, 1500);
                    })
                    .catch(err => {
                      setError('Camera access failed: ' + err.message);
                    });
                } else {
                  setError('Camera not supported on this device');
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              🤳 Take Selfie
            </button>
            <p className="text-sm text-gray-500">or</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'selfiePhoto')}
              className="hidden"
              id="selfie-upload"
            />
            <label htmlFor="selfie-upload" className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 cursor-pointer">
              📁 Upload Selfie
            </label>
          </div>
        )}
      </div>

      {/* License Photo */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <h4 className="font-medium text-gray-900 mb-2">Driving License Photo *</h4>
        <p className="text-sm text-gray-500 mb-4">Take a clear photo of your driving license</p>
        {formData.licensePhoto ? (
          <div className="space-y-2">
            <img src={URL.createObjectURL(formData.licensePhoto)} alt="License" className="mx-auto max-w-xs rounded-lg" />
            <p className="text-sm text-green-600">License photo uploaded successfully</p>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => startCamera('license')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              📷 Take License Photo
            </button>
            <p className="text-sm text-gray-500">or</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'licensePhoto')}
              className="hidden"
              id="license-upload"
            />
            <label htmlFor="license-upload" className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 cursor-pointer">
              📁 Upload License Photo
            </label>
          </div>
        )}
      </div>

      {/* Vehicle Photo */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <h4 className="font-medium text-gray-900 mb-2">Vehicle Photo *</h4>
        <p className="text-sm text-gray-500 mb-4">Take a clear photo of your vehicle</p>
        {formData.vehiclePhoto ? (
          <div className="space-y-2">
            <img src={URL.createObjectURL(formData.vehiclePhoto)} alt="Vehicle" className="mx-auto max-w-xs rounded-lg" />
            <p className="text-sm text-green-600">Vehicle photo uploaded successfully</p>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => startCamera('vehicle')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              📷 Take Vehicle Photo
            </button>
            <p className="text-sm text-gray-500">or</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'vehiclePhoto')}
              className="hidden"
              id="vehicle-upload"
            />
            <label htmlFor="vehicle-upload" className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 cursor-pointer">
              📁 Upload Vehicle Photo
            </label>
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Additional Notes</h4>
        <p className="text-sm text-gray-600 mb-2">
          After submitting your registration, JKM officers will review your application within 3-5 business days.
        </p>
        <p className="text-sm text-gray-600 mb-2">
          You will receive an email notification once your application is approved or if additional information is required.
        </p>
        <p className="text-sm text-gray-600">
          For any questions, please contact JKM at: jkm-terengganu@example.com
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Hidden video element for ref */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        autoPlay
        playsInline
        muted
      />
      {/* Camera video element - always rendered but hidden when not capturing */}
      <video
        ref={cameraVideoRef}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          backgroundColor: 'black',
          zIndex: videoVisible ? 10000 : -1,
          visibility: videoVisible ? 'visible' : 'hidden',
          opacity: videoVisible ? 1 : 0
        }}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={() => {
          console.log('Camera video metadata loaded');
          setSuccess('Camera ready!');
        }}
        onCanPlay={() => console.log('Camera video can play')}
        onError={(e) => {
          console.error('Camera video error:', e);
          setError('Camera error: ' + e.message);
        }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" style={{ overflow: 'auto' }}>
        <div className="min-h-full bg-white" style={{ 
          minHeight: '100vh',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Driver Registration</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {step} of 4</span>
              <span>{Math.round((step / 4) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="mb-6">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </form>

          {/* Navigation */}
          <div className="flex justify-between bg-white border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className={`px-6 py-3 rounded-lg text-base ${
                step === 1 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              Previous
            </button>
            
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-base"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 text-base"
              >
                Submit Registration
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Camera Overlay Controls */}
      {isCapturing && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10001,
            pointerEvents: 'none'
          }}
        >
          {/* Header */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'auto'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
              Take {cameraType.charAt(0).toUpperCase() + cameraType.slice(1)} Photo
            </h3>
            <button
              onClick={stopCamera}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>
          
          {/* Debug: Check if video element exists */}
          <div style={{
            position: 'absolute',
            bottom: '80px',
            left: '20px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '5px',
            fontSize: '12px',
            pointerEvents: 'auto'
          }}>
            Camera Video: {cameraVideoRef.current ? 'EXISTS' : 'NULL'}
          </div>
          
          {/* Simple Controls */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
            pointerEvents: 'auto'
          }}>
            <button
              onClick={capturePhoto}
              style={{
                backgroundColor: 'white',
                color: 'black',
                border: 'none',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                fontSize: '24px',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
              title="Capture Photo"
            >
              📸
            </button>
            
            <button
              onClick={() => {
                document.getElementById(`${cameraType}-upload`).click();
                stopCamera();
              }}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                fontSize: '20px',
                cursor: 'pointer'
              }}
              title="Upload from Gallery"
            >
              📁
            </button>
          </div>
          
          {/* Status */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '5px',
            fontSize: '12px',
            pointerEvents: 'auto'
          }}>
            Camera: {cameraType} | Mode: {currentFacingMode}
          </div>
          
          {/* Debug indicator */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: 'red',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '5px',
            fontSize: '12px',
            fontWeight: 'bold',
            pointerEvents: 'auto'
          }}>
            MODAL ACTIVE
          </div>
        </div>
      )}
    </>
  );
};

export default DriverRegistration;
