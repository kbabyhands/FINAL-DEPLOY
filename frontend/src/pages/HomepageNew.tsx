import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Camera, 
  Smartphone, 
  Zap, 
  RefreshCw,
  Scan,
  CheckCircle,
  Monitor,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Upload,
  MousePointer
} from "lucide-react";

const Homepage = () => {
  const [currentDemoIndex, setCurrentDemoIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Demo menu items carousel
  const demoItems = [
    {
      id: 1,
      name: "Cheeseburger",
      image: "🍔",
      description: "Classic beef burger with cheese"
    },
    {
      id: 2,
      name: "Caesar Salad", 
      image: "🥗",
      description: "Fresh romaine with parmesan"
    },
    {
      id: 3,
      name: "Chocolate Donut",
      image: "🍩", 
      description: "Glazed chocolate donut"
    }
  ];

  // Auto-rotate demo carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemoIndex((prev) => (prev + 1) % demoItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const nextDemo = () => {
    setCurrentDemoIndex((prev) => (prev + 1) % demoItems.length);
  };

  const prevDemo = () => {
    setCurrentDemoIndex((prev) => (prev - 1 + demoItems.length) % demoItems.length);
  };

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
                onClick={() => window.location.href = "/admin"}
              >
                Restaurant Login
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Request a Demo
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
            See Your Menu in 3D
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Engage your customers and enhance their ordering experience<br />
            with interactive 3D models of your dishes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-xl rounded-xl"
              onClick={() => window.location.href = "/menu"}
            >
              View Menu Sample
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 px-10 py-4 text-xl rounded-xl"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Contact Us
            </Button>
          </div>

          {/* Hero Image - Professional Spaghetti */}
          <div className="relative max-w-3xl mx-auto">
            <div className="w-full h-96 bg-gradient-to-br from-gray-800 to-black rounded-3xl flex items-center justify-center border border-gray-700 shadow-2xl overflow-hidden">
              <div className="relative w-80 h-80 bg-gradient-to-br from-orange-600 via-red-600 to-orange-800 rounded-full flex items-center justify-center shadow-inner">
                {/* Plate */}
                <div className="absolute inset-4 bg-gradient-to-br from-gray-100 to-gray-300 rounded-full shadow-lg">
                  {/* Spaghetti */}
                  <div className="absolute inset-8 flex items-center justify-center">
                    <div className="text-8xl transform rotate-12">🍝</div>
                  </div>
                </div>
                {/* Plate rim highlight */}
                <div className="absolute inset-4 rounded-full border-4 border-white/20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Icons Section */}
      <section className="py-12 bg-gray-800/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-blue-400">Real Food Scans</h3>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-green-400">No App Needed</h3>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-purple-400">Fast & Light</h3>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <RefreshCw className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-orange-400">Live Updates</h3>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl">
                <Scan className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-6">We Scan Your Food</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Our professional team captures high-quality 3D scans of your dishes using advanced photogrammetry technology.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center shadow-xl">
                <Upload className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-6">Upload to Platform</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                We process and optimize your 3D models, then seamlessly integrate them into your digital menu system.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl">
                <MousePointer className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-6">Customers Interactively Browse</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Diners can rotate, zoom, and explore your dishes in stunning 3D detail before making their selection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Demos Section */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-16">Menu Demos</h2>
          
          <div className="relative max-w-5xl mx-auto">
            <div className="flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white mr-8"
                onClick={prevDemo}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
                {demoItems.map((item, index) => (
                  <Card 
                    key={item.id} 
                    className={`bg-gray-800 border-2 transition-all duration-500 rounded-xl overflow-hidden ${
                      index === currentDemoIndex 
                        ? 'border-blue-500 scale-105 shadow-xl shadow-blue-500/20' 
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <CardContent className="p-8 text-center">
                      <div className="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl mb-6 flex items-center justify-center shadow-inner">
                        <span className="text-8xl">{item.image}</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-white">{item.name}</h3>
                      <p className="text-gray-400">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white ml-8"
                onClick={nextDemo}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            </div>
            
            {/* Carousel indicators */}
            <div className="flex justify-center mt-8 space-x-3">
              {demoItems.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentDemoIndex ? 'bg-blue-500 scale-125' : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  onClick={() => setCurrentDemoIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-5xl font-bold text-center mb-16">Testimonial</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">JD</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">Jane Doe</h4>
                    <p className="text-gray-400">Restaurant Manager</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed">
                  "Our customers love the 3D menu—it sets us apart from the competition and has increased our orders significantly."
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">MS</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">Mike Smith</h4>
                    <p className="text-gray-400">Head Chef</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed">
                  "TAST3D has been a game changer for our business. Customers can see exactly what they're ordering."
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">AL</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">Alex Lee</h4>
                    <p className="text-gray-400">Owner</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed">
                  "The interactive 3D models have revolutionized how our customers experience our menu. Highly recommended!"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-8">Ready to Get Started?</h2>
            <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your restaurant's menu with interactive 3D visualization and give your customers an unforgettable dining experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-xl rounded-xl"
                onClick={() => window.location.href = "/menu"}
              >
                View Sample Menu
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 px-10 py-4 text-xl rounded-xl"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
                TAST3D
              </div>
              <p className="text-gray-400 leading-relaxed">
                Bringing restaurant menus to life with interactive 3D technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-6 text-lg">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-6 text-lg">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-6 text-lg">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li>hello@tast3d.com</li>
                <li>+1 (555) 123-4567</li>
                <li>San Francisco, CA</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TAST3D. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;