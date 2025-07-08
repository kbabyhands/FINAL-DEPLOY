import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Scan, 
  CheckCircle, 
  Monitor, 
  Camera, 
  Smartphone, 
  Zap, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Star,
  ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";

interface HomepageContent {
  hero: {
    headline: string;
    subheadline: string;
    hero_image_url?: string;
    primary_cta_text: string;
    primary_cta_url: string;
    secondary_cta_text: string;
    secondary_cta_url: string;
  };
  features: Array<{
    icon: string;
    title: string;
    description: string;
    color: string;
  }>;
  testimonials: Array<{
    name: string;
    title: string;
    avatar_url?: string;
    rating: number;
    quote: string;
  }>;
  demo_items: Array<{
    name: string;
    description: string;
    image_url?: string;
    emoji: string;
  }>;
}

/**
 * TAST3D Homepage Component
 * 
 * Professional landing page for the TAST3D platform with:
 * - Hero section with 3D food visualization
 * - Features showcase
 * - How it works process
 * - Live demo carousel
 * - Testimonials
 * - Contact information
 */
const Homepage = () => {
  const [currentDemoIndex, setCurrentDemoIndex] = useState(0);
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomepageContent();
  }, []);

  const loadHomepageContent = async () => {
    try {
      const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/homepage/content`);
      
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      }
    } catch (error) {
      console.error('Error loading homepage content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-rotate demo carousel
  useEffect(() => {
    if (content?.demo_items) {
      const interval = setInterval(() => {
        setCurrentDemoIndex((prev) => (prev + 1) % content.demo_items.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [content]);

  const nextDemo = () => {
    if (content?.demo_items) {
      setCurrentDemoIndex((prev) => (prev + 1) % content.demo_items.length);
    }
  };

  const prevDemo = () => {
    if (content?.demo_items) {
      setCurrentDemoIndex((prev) => (prev - 1 + content.demo_items.length) % content.demo_items.length);
    }
  };

  const handleViewSampleMenu = () => {
    if (content?.hero.primary_cta_url) {
      window.location.href = content.hero.primary_cta_url;
    } else {
      window.location.href = "/menu";
    }
  };

  const handleContactUs = () => {
    if (content?.hero.secondary_cta_url) {
      if (content.hero.secondary_cta_url.startsWith('#')) {
        document.getElementById(content.hero.secondary_cta_url.substring(1))?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = content.hero.secondary_cta_url;
      }
    } else {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRestaurantLogin = () => {
    window.location.href = "/admin";
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'camera': Camera,
      'smartphone': Smartphone,
      'zap': Zap,
      'refresh-cw': RefreshCw,
      'scan': Scan,
      'check-circle': CheckCircle,
      'monitor': Monitor,
    };
    return iconMap[iconName] || Camera;
  };

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'blue': 'bg-blue-600',
      'green': 'bg-green-600',
      'purple': 'bg-purple-600',
      'orange': 'bg-orange-600',
      'red': 'bg-red-600',
      'yellow': 'bg-yellow-600',
    };
    return colorMap[color] || 'bg-blue-600';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading TAST3D...</p>
        </div>
      </div>
    );
  }

  // Error state - show basic homepage if content loading fails
  if (!content) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                TAST3D
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  className="text-gray-300 hover:text-white"
                  onClick={handleRestaurantLogin}
                >
                  Restaurant Login
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => window.location.href = "/menu"}
                >
                  Request a Demo
                </Button>
              </div>
            </div>
          </div>
        </nav>
        
        <section className="pt-24 pb-16 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Bring Your Menu to Life in 3D
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Interactive 3D visualizations help customers see what they're ordering
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                onClick={() => window.location.href = "/menu"}
              >
                View Sample Menu
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 text-lg"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              TAST3D
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white"
                onClick={handleRestaurantLogin}
              >
                Restaurant Login
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleContactUs}
              >
                Request a Demo
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Bring Your Menu to Life in 3D
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Interactive 3D visualizations help customers see what they're ordering
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              onClick={handleViewSampleMenu}
            >
              View Sample Menu
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 text-lg"
              onClick={handleContactUs}
            >
              Contact Us
            </Button>
          </div>

          {/* Hero Image Placeholder */}
          <div className="relative max-w-2xl mx-auto">
            <div className="w-full h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center border border-gray-700">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-4xl">🍝</span>
                </div>
                <p className="text-gray-400">Interactive 3D Spaghetti Model</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real Food Scans</h3>
              <p className="text-gray-400">Authentic 3D models from real dishes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No App Needed</h3>
              <p className="text-gray-400">Works directly in web browsers</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fast & Light</h3>
              <p className="text-gray-400">Optimized for quick loading</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-600 rounded-full flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Live Updates</h3>
              <p className="text-gray-400">Real-time menu modifications</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Scan className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Scan</h3>
              <p className="text-gray-400">We professionally scan your dishes using advanced 3D technology</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Approve</h3>
              <p className="text-gray-400">Review and approve your 3D models before they go live</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <Monitor className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Display</h3>
              <p className="text-gray-400">Customers interact with your 3D menu on any device</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Carousel */}
      <section className="py-16 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Live 3D Menu Demo</h2>
          <div className="relative max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-8">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
                onClick={prevDemo}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                {demoItems.map((item, index) => (
                  <Card 
                    key={item.id} 
                    className={`bg-gray-800 border-gray-700 transition-all duration-300 ${
                      index === currentDemoIndex ? 'ring-2 ring-blue-500 scale-105' : ''
                    }`}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg mb-4 flex items-center justify-center">
                        <span className="text-6xl">
                          {item.name.includes('Burger') ? '🍔' : 
                           item.name.includes('Salad') ? '🥗' : '🍩'}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2 text-white">{item.name}</h3>
                      <p className="text-gray-400 text-sm">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
                onClick={nextDemo}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
            
            <div className="flex justify-center mt-6 space-x-2">
              {demoItems.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentDemoIndex ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                  onClick={() => setCurrentDemoIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">What Restaurants Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">JD</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Jane Doe</h4>
                    <p className="text-gray-400 text-sm">Restaurant Manager</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300">
                  "Our customers love the 3D menu—it sets us apart!"
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">MS</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Mike Smith</h4>
                    <p className="text-gray-400 text-sm">Head Chef</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300">
                  "TAST3D has been a game changer for our business."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-8">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Transform your restaurant's menu with interactive 3D visualization
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                onClick={handleViewSampleMenu}
              >
                View Sample Menu
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 text-lg"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                TAST3D
              </div>
              <p className="text-gray-400">
                Bringing restaurant menus to life with interactive 3D technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>hello@tast3d.com</li>
                <li>+1 (555) 123-4567</li>
                <li>San Francisco, CA</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TAST3D. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;