import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  FaBed, 
  FaWifi, 
  FaShieldAlt, 
  FaUtensils, 
  FaCheckCircle,
  FaClock,
  FaBook,
  FaMedkit,
  FaSpinner
} from 'react-icons/fa';
import emailjs from '@emailjs/browser';

const Landing = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init("YKdnkTnKCyDCqTqxn");
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      await emailjs.sendForm(
        'service_uximqnk',
        'template_qun2y3b',
        e.target,
        'YKdnkTnKCyDCqTqxn'
      );
      
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Clear success message after 5 seconds
      setTimeout(() => setStatus(''), 5000);
    } catch (error) {
      console.error('EmailJS Error:', error);
      setStatus('error');
      
      // Clear error message after 5 seconds
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      {/* Hero Section with Background Image */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("/images/SHMS.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          
        >
          {/* Dark Overlay - no blue */}
          <div className="absolute inset-0 bg-black/40 dark:bg-black/60"></div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              Smart Hostel Management System
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto drop-shadow-md">
              Experience comfortable living with modern amenities and seamless management. 
              Your home away from home.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/apply" 
                className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Apply Now
              </Link>
              <Link 
                to="/login" 
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-all transform hover:scale-105"
              >
                Login
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 dark:from-dark-bg to-transparent z-10"></div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-dark-text mb-4 transition-colors duration-300">Why Choose Smart Hostel?</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
              We provide the best living experience for students with modern facilities and 24/7 support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400" 
                alt="High-Speed WiFi" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <FaWifi className="text-primary-600 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-2 transition-colors duration-300">High-Speed WiFi</h3>
                <p className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">24/7 high-speed internet access for all your study needs.</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400" 
                alt="24/7 Security" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <FaShieldAlt className="text-primary-600 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-2 transition-colors duration-300">24/7 Security</h3>
                <p className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">Round-the-clock security with CCTV surveillance.</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400" 
                alt="Mess Facility" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <FaUtensils className="text-primary-600 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-2 transition-colors duration-300">Mess Facility</h3>
                <p className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">Nutritious meals with vegetarian and non-vegetarian options.</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400" 
                alt="Study Rooms" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <FaBook className="text-primary-600 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-2 transition-colors duration-300">Study Rooms</h3>
                <p className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">Dedicated quiet study spaces for focused learning.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hostel Rules Section */}
      <section id="about" className="py-16 bg-white dark:bg-dark-surface transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-dark-text mb-4 transition-colors duration-300">Hostel Rules & Regulations</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
              To ensure a safe and comfortable environment for all residents.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaCheckCircle className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-dark-text transition-colors duration-300">Gate Closing Time</h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Main gate closes at 10:00 PM. Late entry requires prior permission.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaCheckCircle className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-dark-text transition-colors duration-300">Visitor Policy</h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Visitors allowed only in common areas during visiting hours (4 PM - 8 PM).</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaCheckCircle className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-dark-text transition-colors duration-300">No Smoking/Alcohol</h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Strictly prohibited within hostel premises. Violation leads to immediate termination.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaCheckCircle className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-dark-text transition-colors duration-300">Room Maintenance</h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Keep your room clean. Weekly inspections are conducted.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaCheckCircle className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-dark-text transition-colors duration-300">Electrical Appliances</h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Only allowed appliances: laptop, mobile charger, and electric kettle.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaCheckCircle className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-dark-text transition-colors duration-300">Noise Levels</h3>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Maintain silence during study hours (9 PM - 6 AM).</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Room Facilities Section */}
      <section id="rooms" className="py-16 bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-dark-text mb-4 transition-colors duration-300">Room Facilities</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto transition-colors duration-300">
              Comfortable rooms equipped with all essential amenities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-dark-surface rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
              <div className="overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500" 
                  alt="2 Seater Hostel Room" 
                  className="w-full h-56 object-cover rounded-t-xl hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-2 transition-colors duration-300">2-Seater Room</h3>
                <p className="text-gray-600 dark:text-dark-text-secondary mb-4 transition-colors duration-300">Perfect for students who prefer more privacy.</p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />2 Single Beds</li>
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />2 Study Tables</li>
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />2 Wardrobes</li>
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />Attached Bathroom</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white dark:bg-dark-surface rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
              <div className="overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500" 
                  alt="3 Seater Hostel Room" 
                  className="w-full h-56 object-cover rounded-t-xl hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-2 transition-colors duration-300">3-Seater Room</h3>
                <p className="text-gray-600 dark:text-dark-text-secondary mb-4 transition-colors duration-300">Balanced option for comfort and affordability.</p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />3 Single Beds</li>
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />3 Study Tables</li>
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />3 Wardrobes</li>
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />Attached Bathroom</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white dark:bg-dark-surface rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
              <div className="overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=500" 
                  alt="4 Seater Hostel Room" 
                  className="w-full h-56 object-cover rounded-t-xl hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-2 transition-colors duration-300">4-Seater Room</h3>
                <p className="text-gray-600 dark:text-dark-text-secondary mb-4 transition-colors duration-300">Economical choice with shared facilities.</p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />4 Single Beds</li>
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />4 Study Tables</li>
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />4 Wardrobes</li>
                  <li className="flex items-center"><FaCheckCircle className="text-green-500 mr-2" />Shared Bathroom</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-16 bg-white dark:bg-dark-surface transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-dark-text mb-4 transition-colors duration-300">Contact Us</h2>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Have questions? Get in touch with us.
              </p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {status === 'success' && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg transition-colors duration-300">
                  Message sent successfully! ✅
                </div>
              )}
              
              {status === 'error' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg transition-colors duration-300">
                  Failed to send. Please try again. ❌
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300"
                  placeholder="Message subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300"
                  placeholder="Your message"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-6 py-3 font-semibold rounded-lg transition-all duration-300 flex items-center justify-center ${
                  loading 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : status === 'success'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : status === 'error'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Sending...
                  </>
                ) : status === 'success' ? (
                  'Message Sent! ✅'
                ) : status === 'error' ? (
                  'Send Again ❌'
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-gray-900 text-white py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <FaBed className="text-white text-xl" />
                </div>
                <span className="text-xl font-bold">Smart Hostel</span>
              </div>
              <p className="text-gray-400 text-sm">
                Providing comfortable and secure accommodation for students.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/#about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/#rooms" className="hover:text-white transition-colors">Rooms</Link></li>
                <li><Link to="/apply" className="hover:text-white transition-colors">Apply Now</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Facilities</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center"><FaWifi className="mr-2" /> WiFi</li>
                <li className="flex items-center"><FaMedkit className="mr-2" /> Medical</li>
                <li className="flex items-center"><FaClock className="mr-2" /> 24/7 Security</li>
                <li className="flex items-center"><FaUtensils className="mr-2" /> Mess</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>123 University Road</li>
                <li>City, State 12345</li>
                <li>Phone: +1 (123) 456-7890</li>
                <li>Email: info@smarthostel.com</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Smart Hostel Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;