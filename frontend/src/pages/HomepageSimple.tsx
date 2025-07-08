import React from 'react';
import { 
  Camera, 
  Smartphone, 
  Zap, 
  RefreshCw,
  Scan,
  CheckCircle,
  Monitor
} from 'lucide-react';

const HomePage = () => {
  return (
    <div className="bg-black text-white min-h-screen font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-6 border-b border-gray-800">
        <h1 className="text-3xl font-bold tracking-tight">TAST3D</h1>
        <div className="flex items-center space-x-4">
          <button 
            className="bg-transparent border border-gray-600 text-gray-300 px-6 py-2.5 rounded-lg hover:bg-gray-800 hover:border-gray-500 transition-all duration-200"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Request a Demo
          </button>
          <button 
            className="bg-white text-black px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
            onClick={() => window.location.href = "/admin"}
          >
            Restaurant Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center px-6 py-20">
        <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Bring Your Menu to Life in 3D
        </h2>
        <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
          Interactive 3D visualizations help customers see what they're ordering
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button 
            className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-lg"
            onClick={() => window.location.href = "/menu"}
          >
            View Sample Menu
          </button>
          <button 
            className="bg-transparent border border-gray-600 text-gray-300 px-8 py-4 rounded-lg hover:bg-gray-800 hover:border-gray-500 transition-all duration-200 font-medium text-lg"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Contact Us
          </button>
        </div>
        
        {/* Hero Visual */}
        <div className="max-w-md mx-auto">
          <div className="w-64 h-64 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center border border-gray-700 shadow-2xl">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">3D</span>
              </div>
              <p className="text-gray-400 text-sm">Interactive Food Model</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Real Food Scans</h3>
              <p className="text-sm text-gray-400">Professional 3D scanning</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">No App Needed</h3>
              <p className="text-sm text-gray-400">Works in any browser</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Fast & Light</h3>
              <p className="text-sm text-gray-400">Optimized performance</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Live Updates</h3>
              <p className="text-sm text-gray-400">Real-time changes</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="text-center py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-4xl font-bold mb-16">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-xl">
                <Scan className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-2xl font-semibold mb-4">Scan</h4>
              <p className="text-gray-400 leading-relaxed">
                We professionally scan your dishes using advanced 3D technology
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-xl">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-2xl font-semibold mb-4">Approve</h4>
              <p className="text-gray-400 leading-relaxed">
                Review and approve your 3D models before they go live
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-xl">
                <Monitor className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-2xl font-semibold mb-4">Display</h4>
              <p className="text-gray-400 leading-relaxed">
                Customers interact with your 3D menu on any device
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Demos */}
      <section className="text-center py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-4xl font-bold mb-16">Live 3D Menu Demo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Cheeseburger", category: "Main Course" },
              { name: "Salad", category: "Appetizer" },
              { name: "Doughnut", category: "Dessert" }
            ].map((item, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700 hover:border-gray-600 transition-all duration-200">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center border border-gray-600">
                  <span className="text-white font-bold text-lg">3D</span>
                </div>
                <h4 className="text-xl font-semibold mb-2">{item.name}</h4>
                <p className="text-gray-400 text-sm">{item.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="text-center py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-4xl font-bold mb-16">What Restaurants Say</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Our customers love the 3D menu — it sets us apart!",
                author: "Sarah Johnson",
                title: "Restaurant Manager"
              },
              {
                quote: "TAST3D has been a game changer for our business.",
                author: "Mike Chen",
                title: "Head Chef"
              },
              {
                quote: "The future of restaurant menus is here — and it's 3D!",
                author: "Alex Rodriguez",
                title: "Restaurant Owner"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
                <p className="text-lg italic mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-gray-400 text-sm">{testimonial.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="text-center py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-4xl font-bold mb-6">Ready to Get Started?</h3>
          <p className="text-xl text-gray-400 mb-12 leading-relaxed">
            Transform your restaurant's menu with interactive 3D visualization
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-lg"
              onClick={() => window.location.href = "/menu"}
            >
              View Sample Menu
            </button>
            <button className="bg-transparent border border-gray-600 text-gray-300 px-8 py-4 rounded-lg hover:bg-gray-800 hover:border-gray-500 transition-all duration-200 font-medium text-lg">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-12 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-gray-500">
            © {new Date().getFullYear()} TAST3D. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;