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

  // Professional demo menu items with realistic placeholders
  const demoItems = [
    {
      id: 1,
      name: "Gourmet Burger",
      category: "Main Course",
      description: "Premium beef patty with artisanal toppings"
    },
    {
      id: 2,
      name: "Caesar Salad", 
      category: "Appetizer",
      description: "Fresh romaine with house-made dressing"
    },
    {
      id: 3,
      name: "Chocolate Soufflé",
      category: "Dessert", 
      description: "Rich dark chocolate with vanilla cream"
    }
  ];

  // Auto-rotate demo carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemoIndex((prev) => (prev + 1) % demoItems.length);
    }, 5000);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              TAST3D
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white text-sm sm:text-base px-2 sm:px-4 py-1 sm:py-2"
                onClick={() => window.location.href = "/admin"}
              >
                Restaurant Login
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base px-3 sm:px-4 py-1 sm:py-2"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Request Demo
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
            See Your Menu in 3D
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
            Engage your customers and enhance their ordering experience<br className="hidden sm:block" />
            with interactive 3D models of your dishes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16 px-4">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 sm:px-10 py-3 sm:py-4 text-lg sm:text-xl rounded-xl w-full sm:w-auto"
              onClick={() => window.location.href = "/menu"}
            >
              View Menu Sample
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 px-8 sm:px-10 py-3 sm:py-4 text-lg sm:text-xl rounded-xl w-full sm:w-auto"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Contact Us
            </Button>
          </div>

          {/* Professional Hero Image */}
          <div className="relative max-w-2xl sm:max-w-3xl mx-auto px-4">
            <div className="w-full h-64 sm:h-80 md:h-96 bg-gradient-to-br from-gray-800 to-black rounded-2xl sm:rounded-3xl flex items-center justify-center border border-gray-700 shadow-2xl overflow-hidden">
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center shadow-inner border border-gray-600">
                {/* Professional 3D Model Placeholder */}
                <div className="absolute inset-8 bg-gradient-to-br from-gray-100 to-gray-300 rounded-full shadow-lg flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-md flex items-center justify-center">
                    <div className="text-white font-bold text-lg sm:text-xl md:text-2xl">3D</div>
                  </div>
                </div>
                {/* Subtle ring highlight */}
                <div className="absolute inset-6 rounded-full border-2 border-white/10"></div>
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <p className="text-gray-400 text-sm sm:text-base">Interactive 3D Food Model</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Icons Section */}
      <section className="py-8 sm:py-12 bg-gray-800/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 text-blue-400">Real Food Scans</h3>
              <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Professional 3D scanning</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 text-green-400">No App Needed</h3>
              <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Works in any browser</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 text-purple-400">Fast & Light</h3>
              <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Optimized performance</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-orange-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 text-orange-400">Live Updates</h3>
              <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Real-time changes</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-16">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                <Scan className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">We Scan Your Food</h3>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                Our professional team captures high-quality 3D scans of your dishes using advanced photogrammetry technology.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-green-500 to-green-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Upload to Platform</h3>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                We process and optimize your 3D models, then seamlessly integrate them into your digital menu system.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                <MousePointer className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Customers Browse Interactively</h3>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
                Diners can rotate, zoom, and explore your dishes in stunning 3D detail before making their selection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Menu Demos Section */}
      <section className="py-12 sm:py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-16">Menu Demos</h2>
          
          <div className="relative max-w-5xl mx-auto">
            {/* Mobile: Stack vertically, Desktop: Grid */}
            <div className="block md:hidden">
              <Card className="bg-gray-800 border-2 border-blue-500 rounded-xl overflow-hidden shadow-xl">
                <CardContent className="p-6">
                  <div className="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl mb-6 flex items-center justify-center shadow-inner relative overflow-hidden">
                    {/* Professional placeholder with category color */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
                    <div className="relative z-10 text-center">
                      <div className="w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center mb-2">
                        <span className="text-2xl font-bold text-white">3D</span>
                      </div>
                      <span className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded">
                        {demoItems[currentDemoIndex].category}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{demoItems[currentDemoIndex].name}</h3>
                  <p className="text-gray-400">{demoItems[currentDemoIndex].description}</p>
                </CardContent>
              </Card>
              
              {/* Mobile navigation */}
              <div className="flex justify-center items-center mt-6 space-x-4">
                <Button variant="ghost" size="icon" onClick={prevDemo}>
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <div className="flex space-x-2">
                  {demoItems.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentDemoIndex ? 'bg-blue-500 scale-125' : 'bg-gray-600'
                      }`}
                      onClick={() => setCurrentDemoIndex(index)}
                    />
                  ))}
                </div>
                <Button variant="ghost" size="icon" onClick={nextDemo}>
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Desktop: Full carousel */}
            <div className="hidden md:flex items-center justify-center">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white mr-8" onClick={prevDemo}>
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
                      <div className="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl mb-6 flex items-center justify-center shadow-inner relative overflow-hidden">
                        {/* Professional placeholder with category-based styling */}
                        <div className={`absolute inset-0 ${
                          item.category === 'Main Course' ? 'bg-gradient-to-br from-orange-600/20 to-red-600/20' :
                          item.category === 'Appetizer' ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/20' :
                          'bg-gradient-to-br from-purple-600/20 to-pink-600/20'
                        }`}></div>
                        <div className="relative z-10 text-center">
                          <div className="w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center mb-3 mx-auto">
                            <span className="text-2xl font-bold text-white">3D</span>
                          </div>
                          <span className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-white">{item.name}</h3>
                      <p className="text-gray-400">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white ml-8" onClick={nextDemo}>
                <ChevronRight className="w-8 h-8" />
              </Button>
            </div>
            
            {/* Desktop indicators */}
            <div className="hidden md:flex justify-center mt-8 space-x-3">
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
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-16">Testimonials</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            <Card className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-sm sm:text-lg">JD</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-base sm:text-lg">Jane Doe</h4>
                    <p className="text-gray-400 text-sm">Restaurant Manager</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  "Our customers love the 3D menu—it sets us apart from the competition and has increased our orders significantly."
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-sm sm:text-lg">MS</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-base sm:text-lg">Mike Smith</h4>
                    <p className="text-gray-400 text-sm">Head Chef</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  "TAST3D has been a game changer for our business. Customers can see exactly what they're ordering."
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden lg:col-span-1">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-sm sm:text-lg">AL</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-base sm:text-lg">Alex Lee</h4>
                    <p className="text-gray-400 text-sm">Owner</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  "The interactive 3D models have revolutionized how our customers experience our menu. Highly recommended!"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8">Ready to Get Started?</h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your restaurant's menu with interactive 3D visualization and give your customers an unforgettable dining experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 sm:px-10 py-3 sm:py-4 text-lg sm:text-xl rounded-xl w-full sm:w-auto"
                onClick={() => window.location.href = "/menu"}
              >
                View Sample Menu
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-3" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 px-8 sm:px-10 py-3 sm:py-4 text-lg sm:text-xl rounded-xl w-full sm:w-auto"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 sm:mb-6">
                TAST3D
              </div>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                Bringing restaurant menus to life with interactive 3D technology.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 sm:mb-6 text-base sm:text-lg">Product</h4>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 sm:mb-6 text-base sm:text-lg">Company</h4>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 sm:mb-6 text-base sm:text-lg">Contact</h4>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li>hello@tast3d.com</li>
                <li>+1 (555) 123-4567</li>
                <li>San Francisco, CA</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>&copy; 2025 TAST3D. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;