import React from 'react';

const HomePage = () => {
  return (
    <div className="bg-black text-white min-h-screen font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold">TAST3D</h1>
        <div className="space-x-4">
          <button 
            className="bg-transparent border border-white px-4 py-2 rounded hover:bg-white hover:text-black transition"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Request a Demo
          </button>
          <button 
            className="bg-white text-black px-4 py-2 rounded hover:opacity-80 transition"
            onClick={() => window.location.href = "/admin"}
          >
            Restaurant Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center px-4 py-16">
        <h2 className="text-4xl font-bold mb-4">Bring Your Menu to Life in 3D</h2>
        <p className="text-lg text-gray-300 mb-8">Interactive 3D visualizations help customers see what they're ordering</p>
        <div className="space-x-4 mb-8">
          <button 
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
            onClick={() => window.location.href = "/menu"}
          >
            View Sample Menu
          </button>
          <button 
            className="bg-transparent border border-white px-6 py-3 rounded hover:bg-white hover:text-black transition"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Contact Us
          </button>
        </div>
        <img src="/spaghetti.png" alt="3D Spaghetti" className="mx-auto w-64 h-auto" />
      </section>

      {/* Features */}
      <section className="flex justify-center space-x-8 py-12 border-t border-b border-gray-800">
        {["Real Food Scans", "No App Needed", "Fast & Light", "Live Updates"].map((feature, i) => (
          <div key={i} className="text-center">
            <div className="text-2xl mb-2">🍽️</div>
            <p>{feature}</p>
          </div>
        ))}
      </section>

      {/* How It Works */}
      <section className="text-center py-16">
        <h3 className="text-3xl font-semibold mb-8">How It Works</h3>
        <div className="flex justify-center space-x-12">
          {["Scan", "Approve", "Display"].map((step, i) => (
            <div key={i}>
              <div className="text-2xl mb-2">🔄</div>
              <p className="text-lg">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Menu Demos */}
      <section className="text-center py-16 bg-gray-900">
        <h3 className="text-3xl font-semibold mb-8">Live 3D Menu Demo</h3>
        <div className="flex justify-center space-x-12">
          {["Cheeseburger", "Salad", "Doughnut"].map((item, i) => (
            <div key={i}>
              <img src={`/${item.toLowerCase()}.png`} alt={item} className="w-24 h-24 mx-auto mb-2" />
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="text-center py-16">
        <h3 className="text-3xl font-semibold mb-8">Testimonials</h3>
        <div className="flex justify-center space-x-12 max-w-4xl mx-auto">
          {[
            "Our customers love the 3D menu — it sets us apart!",
            "TAST3D has been a game changer for our business.",
            "The future of restaurant menus is here — and it's 3D!"
          ].map((quote, i) => (
            <div key={i} className="bg-gray-800 p-6 rounded shadow-md w-1/3">
              <p className="text-sm italic">"{quote}"</p>
              <div className="mt-4 flex items-center justify-center">
                <div className="w-8 h-8 bg-white rounded-full mr-2"></div>
                <span>Restaurant Owner</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="text-center py-16 bg-gray-900">
        <h3 className="text-3xl font-semibold mb-8">Ready to Get Started?</h3>
        <p className="text-lg text-gray-300 mb-8">Transform your restaurant's menu with interactive 3D visualization</p>
        <div className="space-x-4">
          <button 
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
            onClick={() => window.location.href = "/menu"}
          >
            View Sample Menu
          </button>
          <button className="bg-transparent border border-white px-6 py-3 rounded hover:bg-white hover:text-black transition">
            Contact Us
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-8 border-t border-gray-800">
        © {new Date().getFullYear()} TAST3D. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;