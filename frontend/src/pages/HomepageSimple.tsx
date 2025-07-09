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
  Monitor
} from 'lucide-react';

const HomePage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [heroImage, setHeroImage] = useState(null);
  const [demoImages, setDemoImages] = useState([null, null, null]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Check if user is admin (you can implement proper auth check here)
    const checkAdminStatus = () => {
      // For now, checking if they came from admin route or have admin session
      const isAdminUser = localStorage.getItem('isAdmin') === 'true' || 
                         window.location.search.includes('admin=true');
      setIsAdmin(isAdminUser);
    };
    
    checkAdminStatus();
    loadSavedImages();
  }, []);

  const loadSavedImages = () => {
    // Load saved images from localStorage (in production, this would be from your API)
    const savedHeroImage = localStorage.getItem('heroImage');
    const savedDemoImages = JSON.parse(localStorage.getItem('demoImages') || '[null, null, null]');
    
    if (savedHeroImage) setHeroImage(savedHeroImage);
    setDemoImages(savedDemoImages);
  };

  const handleHeroImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // Convert to base64 for storage (in production, upload to your server)
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setHeroImage(base64);
        localStorage.setItem('heroImage', base64);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
    }
  };

  const handleDemoImageUpload = async (event, index) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        const newDemoImages = [...demoImages];
        newDemoImages[index] = base64;
        setDemoImages(newDemoImages);
        localStorage.setItem('demoImages', JSON.stringify(newDemoImages));
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
    }
  };

  const removeHeroImage = () => {
    setHeroImage(null);
    localStorage.removeItem('heroImage');
  };

  const removeDemoImage = (index) => {
    const newDemoImages = [...demoImages];
    newDemoImages[index] = null;
    setDemoImages(newDemoImages);
    localStorage.setItem('demoImages', JSON.stringify(newDemoImages));
  };

  return (
    <div className="bg-white text-gray-900 min-h-screen font-sans">
      {/* Header - Exact Figma Layout */}
      <header className="flex justify-between items-center px-8 py-6 bg-white">
        <h1 className="text-3xl font-bold text-gray-900">TAST3D</h1>
        <div className="flex items-center space-x-4">
          <button 
            className="border border-gray-400 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Request Demo
          </button>
          <button 
            className="border border-gray-400 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            onClick={() => {
              localStorage.setItem('isAdmin', 'true');
              window.location.href = "/admin";
            }}
          >
            Restaurant Login
          </button>
        </div>
      </header>

      {/* Hero Section - Exact Figma Layout */}
      <section className="text-center px-8 py-16 bg-gray-100 min-h-[80vh] flex flex-col justify-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
            Bring Your Menu to Life in 3D
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Let customers explore your dishes with immersive, real food scans.
          </p>
          
          <div className="flex justify-center gap-6 mb-16">
            <button 
              className="border border-gray-400 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              onClick={() => window.location.href = "/menu"}
            >
              View Sample Menu
            </button>
            <button 
              className="border border-gray-400 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Contact Us
            </button>
          </div>

          {/* Hero Image Upload Area - Exact Figma Layout */}
          <div className="max-w-2xl mx-auto mb-16">
            {heroImage ? (
              <div className="relative">
                <img 
                  src={heroImage} 
                  alt="Hero Food" 
                  className="w-full h-80 object-cover rounded-2xl border-2 border-gray-300"
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
              <div className="w-full h-80 border-2 border-gray-300 border-dashed rounded-2xl flex items-center justify-center bg-gray-50">
                {isAdmin ? (
                  <label className="cursor-pointer flex flex-col items-center">
                    <input
                      type="file"
                      accept=".splat,image/*"
                      onChange={handleHeroImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="text-6xl text-gray-400 mb-4">✕</div>
                    <p className="text-gray-500">
                      {uploading ? 'Uploading...' : 'Click to upload splat file or image'}
                    </p>
                  </label>
                ) : (
                  <div className="text-center">
                    <div className="text-6xl text-gray-400 mb-4">✕</div>
                    <p className="text-gray-500">3D Food Model Preview</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section - Exact Figma Layout */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-4 gap-8 text-center">
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center border border-gray-300">
                <Camera className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Real Food Scans</h3>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center border border-gray-300">
                <Smartphone className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900">No App Needed</h3>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center border border-gray-300">
                <Zap className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Fast & Lightweight</h3>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center border border-gray-300">
                <Menu className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Live Menu Updates</h3>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Exact Figma Layout */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-16 text-gray-900">How It Works</h2>
          
          <div className="flex justify-center items-center space-x-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center border border-gray-300 shadow-sm">
                <Scan className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Scan</h3>
            </div>
            
            <div className="text-gray-400 text-2xl">→</div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center border border-gray-300 shadow-sm">
                <CheckCircle className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Approve</h3>
            </div>
            
            <div className="text-gray-400 text-2xl">→</div>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center border border-gray-300 shadow-sm">
                <Monitor className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Display</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Live 3D Menu Demo - Exact Figma Layout with Upload */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-16 text-gray-900">Live 3D Menu Demo</h2>
          
          <div className="grid grid-cols-3 gap-8">
            {['Cheeseburger', 'Salad', 'Doughnut'].map((item, index) => (
              <div key={index} className="text-center">
                {demoImages[index] ? (
                  <div className="relative">
                    <img 
                      src={demoImages[index]} 
                      alt={item}
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-300 mb-4"
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
                  <div className="w-full h-48 border-2 border-gray-300 border-dashed rounded-lg flex items-center justify-center bg-gray-50 mb-4">
                    {isAdmin ? (
                      <label className="cursor-pointer flex flex-col items-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleDemoImageUpload(e, index)}
                          className="hidden"
                          disabled={uploading}
                        />
                        <div className="text-4xl text-gray-400 mb-2">✕</div>
                        <p className="text-gray-500 text-sm">
                          {uploading ? 'Uploading...' : 'Upload image'}
                        </p>
                      </label>
                    ) : (
                      <div className="text-center">
                        <div className="text-4xl text-gray-400 mb-2">✕</div>
                        <p className="text-gray-500 text-sm">Menu Item Preview</p>
                      </div>
                    )}
                  </div>
                )}
                <h3 className="font-semibold text-gray-900">{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Exact Figma Layout */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold mb-16 text-gray-900">Testimonials</h2>
          
          <div className="grid grid-cols-3 gap-8">
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-white p-8 rounded-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                  <div className="text-left">
                    <div className="h-4 bg-gray-300 rounded mb-2 w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Editor Notice */}
      {isAdmin && (
        <div className="fixed bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm font-medium">Admin Only: Homepage Editor Active</p>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} TAST3D. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;