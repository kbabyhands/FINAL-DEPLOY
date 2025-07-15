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
  ChevronRight,
  User
} from 'lucide-react';
import LazyPlayCanvas from '../components/LazyPlayCanvas';

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

  const [showUrlInput, setShowUrlInput] = useState(false);
  const [playcanvasUrl, setPlaycanvasUrl] = useState('');

  const handlePlayCanvasUrlSubmit = async () => {
    if (!playcanvasUrl.trim()) {
      alert('Please enter a PlayCanvas URL');
      return;
    }

    // Validate PlayCanvas URL format
    if (!playcanvasUrl.includes('playcanv.as')) {
      alert('Please enter a valid PlayCanvas URL (should contain "playcanv.as")');
      return;
    }

    setUploading(true);
    setUploadProgress(50);
    
    try {
      const updateData = {
        hero: {
          ...homepageContent.hero,
          hero_image_base64: playcanvasUrl.trim() // Store the URL directly
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
        await loadHomepageContent(); // Reload content
        setUploadProgress(100);
        setShowUrlInput(false);
        setPlaycanvasUrl('');
        alert('PlayCanvas experience updated successfully!');
        
        // Reset progress after a short delay
        setTimeout(() => {
          setUploadProgress(0);
        }, 2000);
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error('Error updating PlayCanvas URL:', error);
      alert('Error updating PlayCanvas experience. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeHeroExperience = async () => {
    if (!confirm('Are you sure you want to remove this experience?')) {
      return;
    }

    setUploading(true);
    
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
        alert('Experience removed successfully!');
      } else {
        throw new Error('Failed to remove');
      }
    } catch (error) {
      console.error('Error removing experience:', error);
      alert('Error removing experience. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getFeatureIcon = (iconName) => {
    const iconClass = "w-8 h-8";
    const iconColor = "var(--brand-primary)";
    const iconStyle = { color: iconColor };
    
    switch (iconName) {
      case 'camera':
        return <Camera className={iconClass} style={iconStyle} />;
      case 'smartphone':
        return <Smartphone className={iconClass} style={iconStyle} />;
      case 'zap':
        return <Zap className={iconClass} style={iconStyle} />;
      default:
        return <Camera className={iconClass} style={iconStyle} />;
    }
  };

  const uploadDemoImage = async (index, file) => {
    if (!file) return;
    
    setUploading(true);
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progressPercent = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(progressPercent);
      }
    });

    xhr.onload = async () => {
      if (xhr.status === 200) {
        await loadHomepageContent();
        setUploadProgress(100);
        alert('Demo image uploaded successfully!');
        setTimeout(() => {
          setUploadProgress(0);
        }, 2000);
      } else {
        alert('Error uploading image. Please try again.');
      }
      setUploading(false);
    };

    xhr.onerror = () => {
      alert('Error uploading image. Please try again.');
      setUploading(false);
    };

    const formData = new FormData();
    formData.append('file', file);

    xhr.open('POST', `${BACKEND_URL}/api/homepage/upload/demo/${index}`);
    xhr.send(formData);
  };

  const removeDemoImage = async (index) => {
    if (!confirm('Are you sure you want to remove this image?')) {
      return;
    }

    try {
      const updatedDemoItems = [...homepageContent.demo_items];
      updatedDemoItems[index] = {
        ...updatedDemoItems[index],
        image_base64: null
      };

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
      <div style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand-primary)' }}></div>
          <p style={{ color: 'var(--text-secondary)' }} className="body-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!homepageContent) {
    return (
      <div style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p style={{ color: 'var(--text-secondary)' }} className="body-medium">Error loading homepage content</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg-page)', color: 'var(--text-primary)' }} className="min-h-screen relative overflow-hidden">
      {/* Header - ScaleFast Design */}
      <header className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 sm:py-6 relative z-20" style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)' }}>
        <h1 className="heading-3 mb-4 sm:mb-0" style={{ color: 'var(--text-primary)' }}>TAST3D</h1>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <button 
            className="btn-secondary w-full sm:w-auto"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Request Demo
          </button>
          <button 
            className="btn-primary w-full sm:w-auto"
            onClick={() => {
              localStorage.setItem('isAdmin', 'true');
              window.location.href = "/admin";
            }}
          >
            Restaurant Login
          </button>
        </div>
      </header>

      {/* Hero Section - ScaleFast Gradient Background (only for hero) */}
      <section className="hero-section">
        <div className="container text-center">
          <h1 className="heading-1 mb-6">
            {homepageContent.hero.headline}
          </h1>
          <p className="body-large mb-12 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {homepageContent.hero.subheadline}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
            <button 
              className="btn-primary"
              onClick={() => window.location.href = homepageContent.hero.primary_cta_url}
            >
              {homepageContent.hero.primary_cta_text}
            </button>
            <button 
              className="btn-secondary"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {homepageContent.hero.secondary_cta_text}
            </button>
          </div>

          {/* Hero PlayCanvas Viewer Area */}
          <div className="max-w-2xl mx-auto mb-16">
            {homepageContent.hero.hero_image_base64 ? (
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-2xl flex items-center justify-center" style={{ height: typeof window !== 'undefined' ? Math.min(320, Math.max(200, (window.innerWidth - 32) * 0.5)) : 320 }}>
                  <div className="text-center">
                    <div className="text-6xl text-gray-600 mb-4">🎮</div>
                    <p className="text-gray-800 font-medium">3D Experience Active</p>
                    <p className="text-gray-600 text-sm mt-2">PlayCanvas URL loaded</p>
                    <p className="text-gray-500 text-xs mt-1 break-all max-w-md">
                      {homepageContent.hero.hero_image_base64}
                    </p>
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={removeHeroExperience}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="w-full bg-gray-100 rounded-2xl flex items-center justify-center" style={{ height: typeof window !== 'undefined' ? Math.min(320, Math.max(200, (window.innerWidth - 32) * 0.5)) : 320 }}>
                  <div className="text-center w-full max-w-md mx-auto px-6">
                        {showUrlInput ? (
                          <div className="space-y-4">
                            <div className="text-6xl text-gray-600 mb-4">🎮</div>
                            <p className="text-gray-800 text-center mb-4">
                              Enter PlayCanvas Experience URL
                            </p>
                            <input
                              type="url"
                              value={playcanvasUrl}
                              onChange={(e) => setPlaycanvasUrl(e.target.value)}
                              placeholder="https://playcanv.as/p/..."
                              className="w-full px-3 py-2 text-black rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              disabled={uploading}
                              style={{ borderRadius: '8px' }}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handlePlayCanvasUrlSubmit}
                                disabled={uploading || !playcanvasUrl.trim()}
                                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {uploading ? 'Updating...' : 'Add Experience'}
                              </button>
                              <button
                                onClick={() => {
                                  setShowUrlInput(false);
                                  setPlaycanvasUrl('');
                                }}
                                disabled={uploading}
                                className="btn-secondary disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                            {uploading && (
                              <div className="w-full bg-gray-300 rounded-full h-3 mb-2">
                                <div 
                                  className="rounded-full h-3 transition-all duration-300 ease-out"
                                  style={{ 
                                    width: `${uploadProgress}%`,
                                    background: 'var(--brand-primary)'
                                  }}
                                ></div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowUrlInput(true)}
                            disabled={uploading}
                            className="cursor-pointer flex flex-col items-center w-full hover:bg-gray-200 p-6 rounded-lg transition-colors"
                          >
                            <div className="text-6xl text-gray-600 mb-4">🎮</div>
                            <p className="text-gray-800 text-center font-medium">
                              Add 3D Experience
                            </p>
                            <p className="text-gray-600 text-sm mt-2">
                              Click to add a PlayCanvas experience URL
                            </p>
                            <p className="text-gray-500 text-xs mt-1">
                              e.g., https://playcanv.as/p/3585fc6e
                            </p>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section - Clean White Background */}
      <section className="py-16" style={{ background: 'var(--bg-card)' }}>
        <div className="container">
          <div className="scalefast-grid text-center">
            {homepageContent.features.map((feature, index) => (
              <div key={index} className="service-card text-center">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--bg-section)', borderRadius: '12px' }}>
                  {getFeatureIcon(feature.icon)}
                </div>
                <h3 className="heading-3 mb-4">{feature.title}</h3>
                <p className="body-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Clean White Background */}
      <section className="py-16" style={{ background: 'var(--bg-section)' }}>
        <div className="container text-center">
          <h2 className="heading-2 mb-16">How It Works</h2>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-8 sm:space-y-0 sm:space-x-12">
            <div className="text-center max-w-xs">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
                <Scan className="w-10 h-10" style={{ color: 'var(--brand-primary)' }} />
              </div>
              <h3 className="heading-3 mb-4">Scan</h3>
              <p className="body-medium">Capture your dishes with our advanced 3D scanning technology</p>
            </div>
            
            <div className="text-2xl hidden sm:block" style={{ color: 'var(--text-muted)' }}>→</div>
            <div className="text-2xl block sm:hidden" style={{ color: 'var(--text-muted)' }}>↓</div>
            
            <div className="text-center max-w-xs">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
                <CheckCircle className="w-10 h-10" style={{ color: 'var(--brand-primary)' }} />
              </div>
              <h3 className="heading-3 mb-4">Approve</h3>
              <p className="body-medium">Review and approve your 3D models before they go live</p>
            </div>
            
            <div className="text-2xl hidden sm:block" style={{ color: 'var(--text-muted)' }}>→</div>
            <div className="text-2xl block sm:hidden" style={{ color: 'var(--text-muted)' }}>↓</div>
            
            <div className="text-center max-w-xs">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
                <Monitor className="w-10 h-10" style={{ color: 'var(--brand-primary)' }} />
              </div>
              <h3 className="heading-3 mb-4">Display</h3>
              <p className="body-medium">Your 3D menu items are now live for customers to explore</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live 3D Menu Demo - Carousel Section */}
      <section className="py-16" style={{ background: 'var(--bg-card)' }}>
        <div className="container text-center">
          <h2 className="heading-2 mb-4">Live 3D Menu Demo</h2>
          <p className="body-large mb-16 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Click on any menu to explore our interactive 3D dining experience
          </p>
          
          <div className="relative max-w-2xl mx-auto">
            {/* Carousel Container */}
            <div className="overflow-hidden" style={{ borderRadius: '12px' }}>
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {homepageContent.demo_items.map((item, index) => (
                  <div key={index} className="min-w-full flex justify-center">
                    <div className="max-w-md mx-auto text-center">
                      {item.image_base64 ? (
                        <div className="relative group">
                          <a 
                            href={item.menu_link}
                            className="block relative overflow-hidden service-card transition-all duration-300 cursor-pointer"
                          >
                            <img 
                              src={item.image_base64} 
                              alt={item.name}
                              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                              style={{ borderRadius: '12px' }}
                            />
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center" style={{ borderRadius: '12px' }}>
                              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                                <div className="btn-primary">
                                  View Menu
                                </div>
                              </div>
                            </div>
                          </a>
                          {isAdmin && (
                            <button
                              onClick={() => removeDemoImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors z-10"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-64 border-2 border-dashed rounded-lg flex items-center justify-center mb-4" style={{ borderColor: 'var(--border-medium)', background: 'var(--bg-section)' }}>
                          {isAdmin ? (
                            <label className="cursor-pointer flex flex-col items-center">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => uploadDemoImage(index, e.target.files?.[0])}
                                className="hidden"
                                disabled={uploading}
                              />
                              <div className="text-4xl mb-2">📋</div>
                              <p className="body-medium text-center" style={{ color: 'var(--text-muted)' }}>
                                {uploading ? 'Uploading...' : 'Upload menu image'}
                              </p>
                              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                {item.name}
                              </p>
                            </label>
                          ) : (
                            <div className="flex flex-col items-center">
                              <div className="text-4xl mb-2">📋</div>
                              <p className="body-medium" style={{ color: 'var(--text-muted)' }}>
                                {item.name}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <h3 className="heading-3 mb-4">{item.name}</h3>
                      <p className="body-medium mb-6">{item.description}</p>
                      
                      <a 
                        href={item.menu_link}
                        className="btn-secondary"
                      >
                        View Full Menu
                      </a>
                      
                      {uploading && (
                        <div className="w-full mt-4 rounded-full h-3" style={{ background: 'var(--bg-section)' }}>
                          <div 
                            className="rounded-full h-3 transition-all duration-300 ease-out"
                            style={{ 
                              width: `${uploadProgress}%`,
                              background: 'var(--brand-primary)'
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Carousel Navigation */}
            {homepageContent.demo_items.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full transition-colors z-10"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)' }}
                >
                  <ChevronLeft className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full transition-colors z-10"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-medium)' }}
                >
                  <ChevronRight className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
                </button>
                
                {/* Dots indicator */}
                <div className="flex justify-center space-x-2 mt-8">
                  {homepageContent.demo_items.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className="w-3 h-3 rounded-full transition-colors"
                      style={{ 
                        background: currentSlide === index ? 'var(--brand-primary)' : 'var(--border-medium)'
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16" style={{ background: 'var(--bg-section)' }}>
        <div className="container text-center">
          <h2 className="heading-2 mb-16">What Our Customers Say</h2>
          
          <div className="scalefast-grid">
            {homepageContent.testimonials.map((testimonial, index) => (
              <div key={index} className="service-card text-left">
                <p className="body-medium mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ background: 'var(--bg-section)' }}>
                    <User className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
                  </div>
                  <div>
                    <div className="heading-3 text-sm">{testimonial.name}</div>
                    <div className="body-medium text-xs" style={{ color: 'var(--text-muted)' }}>{testimonial.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16" style={{ background: 'var(--bg-card)' }}>
        <div className="container text-center">
          <h2 className="heading-2 mb-6">Ready to Transform Your Menu?</h2>
          <p className="body-large mb-12 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Join thousands of restaurants already using TAST3D to enhance their customer experience
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button className="btn-primary">
              Get Started Today
            </button>
            <button className="btn-secondary">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ background: 'var(--text-primary)', color: 'var(--bg-page)' }}>
        <div className="container text-center">
          <h3 className="heading-3 mb-6" style={{ color: 'var(--bg-page)' }}>TAST3D</h3>
          <p className="body-medium" style={{ color: 'var(--bg-page)', opacity: 0.8 }}>
            Bringing menus to life with 3D technology
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;