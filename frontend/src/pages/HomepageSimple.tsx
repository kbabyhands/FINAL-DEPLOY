import React from 'react';
import { 
  Camera, 
  Smartphone, 
  Zap, 
  RefreshCw,
  Scan,
  CheckCircle,
  Monitor,
  ArrowRight,
  Star,
  Play,
  Globe
} from 'lucide-react';

const HomePage = () => {
  return (
    <div className="bg-white text-gray-900 min-h-screen font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-6 lg:px-12 py-6 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-gray-900">TAST3D</h1>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Contact Sales
          </button>
          <button 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
            onClick={() => window.location.href = "/admin"}
          >
            Restaurant Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center px-6 py-20 lg:py-32 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-sm font-medium text-blue-600 mb-4 uppercase tracking-wider">
            3D Menu Visualization
          </div>
          <h1 className="text-6xl lg:text-8xl font-bold mb-8 leading-tight">
            <span className="text-gray-900">tast</span><span className="text-blue-600">3d</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            Transform your restaurant experience with interactive 3D menu visualization. 
            Help customers see what they're ordering — effortlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-lg flex items-center justify-center"
              onClick={() => window.location.href = "/menu"}
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button 
              className="bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-gray-400 transition-all duration-200 font-medium text-lg flex items-center justify-center"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Play className="mr-2 w-5 h-5" />
              Schedule a Demo
            </button>
          </div>

          <div className="text-sm text-gray-500 mb-8">
            Over 500+ Five Star Reviews
          </div>
          
          {/* Hero Visual */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 shadow-lg border border-gray-200">
              <div className="grid grid-cols-3 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-xl flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-lg">3D</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Burger</h3>
                  <p className="text-sm text-gray-500">Interactive Model</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-green-600 font-bold text-lg">3D</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Salad</h3>
                  <p className="text-sm text-gray-500">Interactive Model</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-lg">3D</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Dessert</h3>
                  <p className="text-sm text-gray-500">Interactive Model</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-sm font-medium text-blue-600 mb-4 uppercase tracking-wider">
              About Us
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Building Success</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Together, we're creating a seamless experience that puts your customers in control of their dining choices.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Camera className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Real Food Scans</h3>
              <p className="text-sm text-gray-600">Professional 3D scanning</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-2xl flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">No App Needed</h3>
              <p className="text-sm text-gray-600">Works in any browser</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Fast & Light</h3>
              <p className="text-sm text-gray-600">Optimized performance</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-2xl flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Live Updates</h3>
              <p className="text-sm text-gray-600">Real-time changes</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg border border-gray-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">At TAST3D, we believe that showcasing your menu should be simple and stunning.</h3>
              <button 
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center mx-auto"
                onClick={() => window.location.href = "/menu"}
              >
                View Demo
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">How It Works</h2>
          </div>

          <div className="space-y-24">
            {/* Step 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <div className="text-sm font-medium text-blue-600 mb-4 uppercase tracking-wider">
                  STEP 01
                </div>
                <h3 className="text-3xl font-bold mb-6">Sign Up & Connect</h3>
                <h4 className="text-xl font-semibold text-blue-600 mb-4">Connect Your Restaurant</h4>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Create your account and set up your restaurant profile. We'll help you get started with our professional 3D scanning service to capture your dishes.
                </p>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 lg:p-12">
                  <div className="w-24 h-24 mx-auto bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                    <Scan className="w-12 h-12 text-white" />
                  </div>
                  <h4 className="text-center text-xl font-semibold">Professional Scanning</h4>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
              <div className="lg:w-1/2">
                <div className="text-sm font-medium text-green-600 mb-4 uppercase tracking-wider">
                  STEP 02
                </div>
                <h3 className="text-3xl font-bold mb-6">Review & Approve</h3>
                <h4 className="text-xl font-semibold text-green-600 mb-4">Quality Control</h4>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Review your 3D models and approve them before they go live. Our team ensures every model meets our quality standards for the best customer experience.
                </p>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 lg:p-12">
                  <div className="w-24 h-24 mx-auto bg-green-600 rounded-2xl flex items-center justify-center mb-6">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  <h4 className="text-center text-xl font-semibold">Quality Assurance</h4>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <div className="text-sm font-medium text-purple-600 mb-4 uppercase tracking-wider">
                  STEP 03
                </div>
                <h3 className="text-3xl font-bold mb-6">Launch & Engage</h3>
                <h4 className="text-xl font-semibold text-purple-600 mb-4">Customer Experience</h4>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Your interactive 3D menu goes live! Customers can now rotate, zoom, and explore your dishes in stunning detail before making their selection.
                </p>
              </div>
              <div className="lg:w-1/2">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 lg:p-12">
                  <div className="w-24 h-24 mx-auto bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
                    <Monitor className="w-12 h-12 text-white" />
                  </div>
                  <h4 className="text-center text-xl font-semibold">Interactive Experience</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Restaurants Using TAST3D</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-green-600 mb-2">4.9</div>
              <div className="text-gray-600">Average Customer Rating</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-purple-600 mb-2">92%</div>
              <div className="text-gray-600">Customer Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-sm font-medium text-blue-600 mb-4 uppercase tracking-wider">
              Testimonials
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Customer Experiences</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how restaurants are transforming their customer experience with our 3D menu solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                "TAST3D has transformed how our customers interact with our menu. The 3D models help them understand exactly what they're ordering."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">SJ</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Johnson</div>
                  <div className="text-gray-600 text-sm">Restaurant Manager</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                "The interactive 3D menu has increased our average order value by 23%. Customers are more confident in their choices."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">MC</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Mike Chen</div>
                  <div className="text-gray-600 text-sm">Head Chef</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                "Implementation was seamless, and our customers love the modern dining experience. Highly recommend TAST3D!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">AR</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Alex Rodriguez</div>
                  <div className="text-gray-600 text-sm">Restaurant Owner</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Menu?
          </h2>
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Join hundreds of restaurants already using TAST3D to create engaging dining experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-lg flex items-center justify-center"
              onClick={() => window.location.href = "/menu"}
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-200 font-medium text-lg">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">TAST3D</h3>
              <p className="text-gray-400 leading-relaxed">
                Transforming restaurant experiences with interactive 3D menu visualization.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-6">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li>hello@tast3d.com</li>
                <li>+1 (555) 123-4567</li>
                <li>San Francisco, CA</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} TAST3D. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;