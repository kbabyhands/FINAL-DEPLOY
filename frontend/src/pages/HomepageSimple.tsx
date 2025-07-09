import React, { useState, useEffect } from 'react';
import { 
  Upload,
  X,
  Camera,
  Smartphone,
  Zap,
  Menu,
  Scan,
  CheckCircle,
  Monitor,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import SplatViewer from '../components/SplatViewer';

const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;

const HomePage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [homepageContent, setHomepageContent] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Check if user is admin
    const checkAdminStatus = () => {
      const isAdminUser = localStorage.getItem('isAdmin') === 'true' || 
                         window.location.search.includes('admin=true');
      setIsAdmin(isAdminUser);
    };
    
    checkAdminStatus();
    loadHomepageContent();
  }, []);

  const loadHomepageContent = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/homepage/content`);
      if (response.ok) {
        const data = await response.json();
        setHomepageContent(data);
      }
    } catch (error) {
      console.error('Error loading homepage content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHeroImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size on frontend (200MB limit)
    const MAX_SIZE = 200 * 1024 * 1024; // 200MB
    const fileSizeMB = file.size / (1024 * 1024);
    
    if (file.size > MAX_SIZE) {
      alert(`File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum allowed size of 200MB. Please use a smaller file.`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Create XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
        }
      });

      // Handle completion
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (parseError) {
              reject(new Error('Invalid server response'));
            }
          } else {
            // Try to parse error response
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(new Error(errorResponse.detail || `Upload failed: ${xhr.statusText}`));
            } catch (parseError) {
              reject(new Error(`Upload failed: ${xhr.statusText} (${xhr.status})`));
            }
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error during upload'));
      });

      // Send request
      xhr.open('POST', `${BACKEND_URL}/api/homepage/upload/hero`);
      xhr.send(formData);

      const result = await uploadPromise;
      
      if (result) {
        await loadHomepageContent(); // Reload content
        setUploadProgress(100);
        
        // Show success message with file info
        if (result.file_size) {
          alert(`Upload successful! ${result.file_type} (${result.file_size}) uploaded.`);
        }
        
        // Reset progress after a short delay
        setTimeout(() => {
          setUploadProgress(0);
        }, 2000);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress(0);
      
      // Show error message to user
      alert(`Upload failed: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDemoImageUpload = async (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${BACKEND_URL}/api/homepage/upload/demo/${index}`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await loadHomepageContent(); // Reload content
      } else {
        console.error('Upload failed:', await response.text());
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeHeroImage = async () => {
    try {
      const updateData = {
        hero: {
          ...homepageContent.hero,
          hero_image_base64: null
        }
      };

      const response = await fetch(`${BACKEND_URL}/api/homepage/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        await loadHomepageContent();
      }
    } catch (error) {
      console.error('Error removing hero image:', error);
    }
  };

  const removeDemoImage = async (index) => {
    try {
      const updatedDemoItems = [...homepageContent.demo_items];
      updatedDemoItems[index].image_base64 = null;

      const updateData = {
        demo_items: updatedDemoItems
      };

      const response = await fetch(`${BACKEND_URL}/api/homepage/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        await loadHomepageContent();
      }
    } catch (error) {
      console.error('Error removing demo image:', error);
    }
  };

  const getFeatureIcon = (iconName) => {
    switch(iconName) {
      case 'camera': return <Camera className="w-8 h-8 text-white" />;
      case 'smartphone': return <Smartphone className="w-8 h-8 text-white" />;
      case 'refresh-cw': return <RefreshCw className="w-8 h-8 text-white" />;
      default: return <Camera className="w-8 h-8 text-white" />;
    }
  };

  const nextSlide = () => {
    if (homepageContent?.demo_items) {
      setCurrentSlide((prev) => (prev + 1) % homepageContent.demo_items.length);
    }
  };

  const prevSlide = () => {
    if (homepageContent?.demo_items) {
      setCurrentSlide((prev) => (prev - 1 + homepageContent.demo_items.length) % homepageContent.demo_items.length);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="bg-white text-gray-900 min-h-screen font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!homepageContent) {
    return (
      <div className="bg-white text-gray-900 min-h-screen font-sans flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Error loading homepage content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans relative overflow-hidden">
      {/* Tech Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        {/* Prominent Grid Pattern */}
        <div className="absolute inset-0 opacity-40">
          <div className="h-full w-full" style={{
            backgroundImage: `
              linear-gradient(rgba(59,130,246,0.6) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.6) 1px, transparent 1px)
            `,
            backgroundSize: '120px 120px'
          }}></div>
        </div>
        
        {/* More Prominent Floating Tech Particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-blue-400 rounded-full opacity-70 animate-pulse shadow-lg shadow-blue-400/50"
              style={{
                left: `${8 + i * 6}%`,
                top: `${8 + i * 5}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${1.5 + i * 0.2}s`
              }}
            ></div>
          ))}
        </div>
        
        {/* Large Prominent Geometric Shapes */}
        <div className="absolute top-24 right-24 w-48 h-48 border-3 border-blue-500 opacity-50 rotate-45 animate-spin shadow-lg shadow-blue-500/30" style={{ animationDuration: '30s' }}></div>
        <div className="absolute bottom-24 left-24 w-36 h-36 border-3 border-purple-500 opacity-45 rotate-12 animate-pulse shadow-lg shadow-purple-500/30"></div>
        <div className="absolute top-1/2 left-1/5 w-16 h-16 bg-cyan-500 opacity-40 rotate-45 animate-pulse shadow-lg shadow-cyan-500/40"></div>
        <div className="absolute bottom-1/4 right-1/5 w-20 h-20 border-3 border-cyan-400 opacity-50 rounded-full animate-ping shadow-lg shadow-cyan-400/40" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-1/4 right-1/3 w-12 h-12 bg-purple-400 opacity-45 animate-bounce shadow-lg shadow-purple-400/40"></div>
        
        {/* Prominent Tech Connection Lines */}
        <div className="absolute top-1/3 left-1/2 w-64 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-60 shadow-sm"></div>
        <div className="absolute bottom-1/4 right-1/2 w-0.5 h-40 bg-gradient-to-b from-transparent via-purple-400 to-transparent opacity-60 shadow-sm"></div>
        <div className="absolute top-2/3 left-1/4 w-32 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-55 rotate-45 shadow-sm"></div>
        <div className="absolute bottom-1/2 right-1/4 w-0.5 h-24 bg-gradient-to-b from-transparent via-blue-400 to-transparent opacity-50 rotate-12 shadow-sm"></div>
        
        {/* Large Hexagon Patterns */}
        <div className="absolute top-16 left-1/5 opacity-45">
          <svg width="100" height="100" viewBox="0 0 100 100" className="text-blue-400 animate-pulse drop-shadow-lg">
            <polygon points="50,8 80,28 80,72 50,92 20,72 20,28" fill="none" stroke="currentColor" strokeWidth="3"/>
          </svg>
        </div>
        <div className="absolute bottom-16 right-1/4 opacity-40">
          <svg width="80" height="80" viewBox="0 0 80 80" className="text-purple-400 animate-pulse drop-shadow-lg" style={{ animationDuration: '2.5s' }}>
            <polygon points="40,6 65,22 65,58 40,74 15,58 15,22" fill="none" stroke="currentColor" strokeWidth="3"/>
          </svg>
        </div>
        
        {/* Prominent Circuit Dots */}
        <div className="absolute top-1/4 left-1/2 w-3 h-3 bg-blue-400 rounded-full opacity-60 animate-ping shadow-lg shadow-blue-400/50"></div>
        <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-purple-400 rounded-full opacity-55 animate-ping shadow-lg shadow-purple-400/50" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 right-1/3 w-3 h-3 bg-cyan-400 rounded-full opacity-50 animate-ping shadow-lg shadow-cyan-400/50" style={{ animationDelay: '2s' }}></div>
        
        {/* Additional Tech Elements */}
        <div className="absolute top-1/2 right-1/6 w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 opacity-50 animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1 h-20 bg-gradient-to-b from-cyan-400 to-blue-400 opacity-45 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10">
      {/* Header - Mobile Responsive */}
      <header className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-4 sm:py-6 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 relative z-20">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-0">TAST3D</h1>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <button 
            className="w-full sm:w-auto border border-gray-600 text-gray-300 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm sm:text-base"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Request Demo
          </button>
          <button 
            className="w-full sm:w-auto border border-gray-600 text-gray-300 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm sm:text-base"
            onClick={() => {
              localStorage.setItem('isAdmin', 'true');
              window.location.href = "/admin";
            }}
          >
            Restaurant Login
          </button>
        </div>
      </header>

      {/* Hero Section - Mobile Responsive */}
      <section className="text-center px-4 sm:px-8 py-8 sm:py-16 bg-gray-900/80 backdrop-blur-sm min-h-[70vh] sm:min-h-[80vh] flex flex-col justify-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white leading-tight">
            {homepageContent.hero.headline}
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto px-4 sm:px-0">
            {homepageContent.hero.subheadline}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mb-8 sm:mb-16 px-4 sm:px-0">
            <button 
              className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-base sm:text-lg"
              onClick={() => window.location.href = homepageContent.hero.primary_cta_url}
            >
              {homepageContent.hero.primary_cta_text}
            </button>
            <button 
              className="border border-gray-600 text-gray-300 px-6 sm:px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium text-base sm:text-lg"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {homepageContent.hero.secondary_cta_text}
            </button>
          </div>

          {/* Hero 3D Splat Viewer Area - Mobile Responsive */}
          <div className="max-w-2xl mx-auto mb-8 sm:mb-16 px-4 sm:px-0">
            {homepageContent.hero.hero_image_base64 ? (
              <div className="relative">
                  {/* Check if it's a 3D file (file URL or base64) */}
                {homepageContent.hero.hero_image_base64 && 
                 (homepageContent.hero.hero_image_base64.includes('.ply') || 
                  homepageContent.hero.hero_image_base64.includes('.splat') ||
                  homepageContent.hero.hero_image_base64.includes('splat') || 
                  homepageContent.hero.hero_image_base64.includes('ply')) ? (
                  <SplatViewer 
                    splatUrl={homepageContent.hero.hero_image_base64}
                    width={Math.min(640, window.innerWidth - 32)}
                    height={Math.min(320, (window.innerWidth - 32) * 0.5)}
                    autoRotate={true}
                    enableControls={true}
                    className="mx-auto w-full max-w-full"
                  />
                ) : (
                  <SplatViewer 
                    width={Math.min(640, window.innerWidth - 32)}
                    height={Math.min(320, (window.innerWidth - 32) * 0.5)}
                    autoRotate={true}
                    enableControls={true}
                    className="mx-auto w-full max-w-full"
                  />
                )}
                {isAdmin && (
                  <button
                    onClick={removeHeroImage}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500 text-white p-1 sm:p-2 rounded-full hover:bg-red-600 transition-colors z-10"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                {isAdmin ? (
                  <div className="relative">
                    <SplatViewer 
                      width={Math.min(640, window.innerWidth - 32)}
                      height={Math.min(320, (window.innerWidth - 32) * 0.5)}
                      autoRotate={true}
                      enableControls={true}
                      className="mx-auto w-full max-w-full"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center">
                      <div className="text-center w-full max-w-md mx-auto px-4 sm:px-6">
                        {uploading ? (
                          <div className="space-y-4">
                            <div className="text-4xl sm:text-6xl text-white mb-4">📤</div>
                            <p className="text-white text-center mb-4 text-sm sm:text-base">
                              Uploading 3D Model...
                            </p>
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-700 rounded-full h-2 sm:h-3 mb-2">
                              <div 
                                className="bg-blue-500 h-2 sm:h-3 rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-gray-300 text-xs sm:text-sm">
                              {Math.round(uploadProgress)}% complete
                            </p>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center">
                            <input
                              type="file"
                              accept=".ply,.splat,image/*"
                              onChange={handleHeroImageUpload}
                              className="hidden"
                              disabled={uploading}
                            />
                            <div className="text-4xl sm:text-6xl text-white mb-4">🎯</div>
                            <p className="text-white text-center text-sm sm:text-base">
                              Click to upload .ply or .splat file
                            </p>
                            <p className="text-gray-300 text-xs sm:text-sm mt-2">
                              Upload 3D models (.ply, .splat) for interactive preview
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                              Maximum file size: 200MB
                            </p>
                          </label>
                        )}}
                      </div>
                    </div>
                  </div>
                ) : (
                  <SplatViewer 
                    width={Math.min(640, window.innerWidth - 32)}
                    height={Math.min(320, (window.innerWidth - 32) * 0.5)}
                    autoRotate={true}
                    className="mx-auto w-full max-w-full"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section - Mobile Responsive */}
      <section className="py-8 sm:py-12 bg-gray-800/85 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            {homepageContent.features.map((feature, index) => (
              <div key={index} className="mb-6 sm:mb-0">
                <div className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-700 rounded-full flex items-center justify-center border border-gray-600">
                  {getFeatureIcon(feature.icon)}
                </div>
                <h3 className="font-semibold text-white text-lg sm:text-xl mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-300 mt-2 px-4 sm:px-0">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Mobile Responsive */}
      <section className="py-12 sm:py-16 bg-gray-900/85 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-16 text-white">How It Works</h2>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-8 sm:space-y-0 sm:space-x-8 lg:space-x-12">
            <div className="text-center max-w-xs">
              <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 shadow-sm">
                <Scan className="w-8 sm:w-10 h-8 sm:h-10 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2 text-lg sm:text-xl">Scan</h3>
              <p className="text-sm sm:text-base text-gray-300 px-4 sm:px-0">Capture your dishes with our advanced 3D scanning technology</p>
            </div>
            
            <div className="text-gray-500 text-xl sm:text-2xl hidden sm:block">→</div>
            <div className="text-gray-500 text-xl sm:text-2xl block sm:hidden">↓</div>
            
            <div className="text-center max-w-xs">
              <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 shadow-sm">
                <CheckCircle className="w-8 sm:w-10 h-8 sm:h-10 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2 text-lg sm:text-xl">Approve</h3>
              <p className="text-sm sm:text-base text-gray-300 px-4 sm:px-0">Review and approve your 3D models before they go live</p>
            </div>
            
            <div className="text-gray-500 text-xl sm:text-2xl hidden sm:block">→</div>
            <div className="text-gray-500 text-xl sm:text-2xl block sm:hidden">↓</div>
            
            <div className="text-center max-w-xs">
              <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 shadow-sm">
                <Monitor className="w-8 sm:w-10 h-8 sm:h-10 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2 text-lg sm:text-xl">Display</h3>
              <p className="text-sm sm:text-base text-gray-300 px-4 sm:px-0">Your 3D menu items are now live for customers to explore</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live 3D Menu Demo - Mobile Responsive Carousel */}
      <section className="py-12 sm:py-16 bg-gray-800/85 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-white">Live 3D Menu Demo</h2>
          <p className="text-gray-300 mb-8 sm:mb-16 max-w-2xl mx-auto text-sm sm:text-base px-4 sm:px-0">
            Click on any menu to explore our interactive 3D dining experience
          </p>
          
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden rounded-lg">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {homepageContent.demo_items.map((item, index) => (
                  <div key={index} className="min-w-full flex justify-center">
                    <div className="max-w-sm sm:max-w-md mx-auto text-center px-4 sm:px-0">
                      {item.image_base64 ? (
                        <div className="relative group">
                          <a 
                            href={item.menu_link}
                            className="block relative overflow-hidden rounded-lg border-2 border-gray-600 hover:border-blue-500 transition-all duration-300 cursor-pointer"
                          >
                            <img 
                              src={item.image_base64} 
                              alt={item.name}
                              className="w-full h-48 sm:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                                <div className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base">
                                  View Menu
                                </div>
                              </div>
                            </div>
                          </a>
                          {isAdmin && (
                            <button
                              onClick={() => removeDemoImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors z-10"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-48 sm:h-64 border-2 border-gray-600 border-dashed rounded-lg flex items-center justify-center bg-gray-700 mb-4">
                          {isAdmin ? (
                            <label className="cursor-pointer flex flex-col items-center">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleDemoImageUpload(e, index)}
                                className="hidden"
                                disabled={uploading}
                              />
                              <div className="text-3xl sm:text-4xl text-gray-500 mb-2">📋</div>
                              <p className="text-gray-400 text-xs sm:text-sm text-center">
                                {uploading ? 'Uploading...' : 'Upload menu image'}
                              </p>
                              <p className="text-gray-500 text-xs mt-1">
                                {item.name}
                              </p>
                            </label>
                          ) : (
                            <div className="text-center">
                              <div className="text-3xl sm:text-4xl text-gray-500 mb-2">📋</div>
                              <p className="text-gray-400 text-xs sm:text-sm">{item.name}</p>
                              <p className="text-gray-500 text-xs mt-1">Menu Preview</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">{item.name}</h3>
                        <p className="text-gray-300 mb-4 text-sm sm:text-base px-2 sm:px-0">{item.description}</p>
                        
                        {item.image_base64 && (
                          <a 
                            href={item.menu_link}
                            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
                          >
                            <span>View Full Menu</span>
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons - Mobile Responsive */}
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-0 top-1/2 transform -translate-y-1/2 bg-gray-700 shadow-lg rounded-full p-2 sm:p-3 hover:bg-gray-600 transition-colors border border-gray-600"
              disabled={homepageContent?.demo_items?.length <= 1}
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 shadow-lg rounded-full p-2 sm:p-3 hover:bg-gray-600 transition-colors border border-gray-600"
              disabled={homepageContent?.demo_items?.length <= 1}
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>

            {/* Dots Indicator - Mobile Responsive */}
            <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
              {homepageContent?.demo_items?.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Dark Theme */}
      <section className="py-16 bg-gray-900/85 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-16 text-white">What Our Customers Say</h2>
          
          <div className="grid grid-cols-2 gap-8">
            {homepageContent.testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-800 p-8 rounded-lg border border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-600 rounded-full mr-4 flex items-center justify-center">
                    <span className="text-white font-semibold">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">{testimonial.title}</div>
                  </div>
                </div>
                <p className="text-gray-300 text-left">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Editor Notice - Dark Theme */}
      {isAdmin && (
        <div className="fixed bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-20">
          <p className="text-sm font-medium">Admin Only: Homepage Editor Active</p>
        </div>
      )}

      {/* Footer - Dark Theme */}
      <footer className="bg-black/90 backdrop-blur-sm text-white py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} TAST3D. All rights reserved.</p>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default HomePage;