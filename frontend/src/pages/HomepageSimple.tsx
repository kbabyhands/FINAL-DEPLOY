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

const BACKEND_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;

const HomePage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [homepageContent, setHomepageContent] = useState(null);
  const [uploading, setUploading] = useState(false);
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

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${BACKEND_URL}/api/homepage/upload/hero`, {
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
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      {/* Header - Dark Theme */}
      <header className="flex justify-between items-center px-8 py-6 bg-gray-900 border-b border-gray-800">
        <h1 className="text-3xl font-bold text-white">TAST3D</h1>
        <div className="flex items-center space-x-4">
          <button 
            className="border border-gray-600 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Request Demo
          </button>
          <button 
            className="border border-gray-600 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            onClick={() => {
              localStorage.setItem('isAdmin', 'true');
              window.location.href = "/admin";
            }}
          >
            Restaurant Login
          </button>
        </div>
      </header>

      {/* Hero Section - Dark Theme */}
      <section className="text-center px-8 py-16 bg-gray-900 min-h-[80vh] flex flex-col justify-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white leading-tight">
            {homepageContent.hero.headline}
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            {homepageContent.hero.subheadline}
          </p>
          
          <div className="flex justify-center gap-6 mb-16">
            <button 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              onClick={() => window.location.href = homepageContent.hero.primary_cta_url}
            >
              {homepageContent.hero.primary_cta_text}
            </button>
            <button 
              className="border border-gray-600 text-gray-300 px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {homepageContent.hero.secondary_cta_text}
            </button>
          </div>

          {/* Hero Image Upload Area - Dark Theme */}
          <div className="max-w-2xl mx-auto mb-16">
            {homepageContent.hero.hero_image_base64 ? (
              <div className="relative">
                <img 
                  src={homepageContent.hero.hero_image_base64} 
                  alt="Hero Food" 
                  className="w-full h-80 object-cover rounded-2xl border-2 border-gray-700"
                />
                {isAdmin && (
                  <button
                    onClick={removeHeroImage}
                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="w-full h-80 border-2 border-gray-700 border-dashed rounded-2xl flex items-center justify-center bg-gray-800">
                {isAdmin ? (
                  <label className="cursor-pointer flex flex-col items-center">
                    <input
                      type="file"
                      accept=".splat,image/*"
                      onChange={handleHeroImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="text-6xl text-gray-500 mb-4">✕</div>
                    <p className="text-gray-400">
                      {uploading ? 'Uploading...' : 'Click to upload splat file or image'}
                    </p>
                  </label>
                ) : (
                  <div className="text-center">
                    <div className="text-6xl text-gray-500 mb-4">✕</div>
                    <p className="text-gray-400">3D Food Model Preview</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section - Dark Theme */}
      <section className="py-12 bg-gray-800">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            {homepageContent.features.map((feature, index) => (
              <div key={index}>
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center border border-gray-600">
                  {getFeatureIcon(feature.icon)}
                </div>
                <h3 className="font-semibold text-white">{feature.title}</h3>
                <p className="text-sm text-gray-300 mt-2">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Dark Theme */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-16 text-white">How It Works</h2>
          
          <div className="flex justify-center items-center space-x-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 shadow-sm">
                <Scan className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white">Scan</h3>
            </div>
            
            <div className="text-gray-500 text-2xl">→</div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 shadow-sm">
                <CheckCircle className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white">Approve</h3>
            </div>
            
            <div className="text-gray-500 text-2xl">→</div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 shadow-sm">
                <Monitor className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white">Display</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Live 3D Menu Demo - Carousel Dark Theme */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-16 text-white">Live 3D Menu Demo</h2>
          
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden rounded-lg">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {homepageContent.demo_items.map((item, index) => (
                  <div key={index} className="min-w-full flex justify-center">
                    <div className="max-w-md mx-auto text-center">
                      {item.image_base64 ? (
                        <div className="relative">
                          <img 
                            src={item.image_base64} 
                            alt={item.name}
                            className="w-full h-64 object-cover rounded-lg border-2 border-gray-600 mb-4"
                          />
                          {isAdmin && (
                            <button
                              onClick={() => removeDemoImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-64 border-2 border-gray-600 border-dashed rounded-lg flex items-center justify-center bg-gray-700 mb-4">
                          {isAdmin ? (
                            <label className="cursor-pointer flex flex-col items-center">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleDemoImageUpload(e, index)}
                                className="hidden"
                                disabled={uploading}
                              />
                              <div className="text-4xl text-gray-500 mb-2">✕</div>
                              <p className="text-gray-400 text-sm">
                                {uploading ? 'Uploading...' : 'Upload image'}
                              </p>
                            </label>
                          ) : (
                            <div className="text-center">
                              <div className="text-4xl text-gray-500 mb-2">✕</div>
                              <p className="text-gray-400 text-sm">Menu Item Preview</p>
                            </div>
                          )}
                        </div>
                      )}
                      <h3 className="text-xl font-semibold text-white mb-2">{item.name}</h3>
                      <p className="text-gray-300">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons - Dark Theme */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-700 shadow-lg rounded-full p-3 hover:bg-gray-600 transition-colors border border-gray-600"
              disabled={homepageContent?.demo_items?.length <= 1}
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 shadow-lg rounded-full p-3 hover:bg-gray-600 transition-colors border border-gray-600"
              disabled={homepageContent?.demo_items?.length <= 1}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Dots Indicator - Dark Theme */}
            <div className="flex justify-center mt-8 space-x-2">
              {homepageContent?.demo_items?.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Dark Theme */}
      <section className="py-16 bg-gray-900">
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
        <div className="fixed bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm font-medium">Admin Only: Homepage Editor Active</p>
        </div>
      )}

      {/* Footer - Dark Theme */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} TAST3D. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;