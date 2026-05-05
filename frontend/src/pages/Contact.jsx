import { useState, useEffect } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaSpinner } from 'react-icons/fa';
import emailjs from '@emailjs/browser';

const Contact = () => {
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
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Get in touch with us for any questions or assistance
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left Column - Contact Information */}
            <div className="space-y-8">
              {/* Contact Details */}
              <div className="bg-white dark:bg-dark-surface p-8 rounded-xl shadow-lg transition-colors duration-300">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-6 transition-colors duration-300">Get in Touch</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaEnvelope className="text-primary-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text transition-colors duration-300">Email</h3>
                      <p className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">
                        info@smarthostel.com
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        We respond within 24 hours
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaPhone className="text-primary-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text transition-colors duration-300">Phone</h3>
                      <p className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">
                        +91 98765 43210
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                        Mon-Fri: 9AM-6PM
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaMapMarkerAlt className="text-primary-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text transition-colors duration-300">Address</h3>
                      <p className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">
                        123 Hostel Street, Campus Area
                      </p>
                      <p className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">
                        University City, State 123456
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaClock className="text-primary-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text transition-colors duration-300">Office Hours</h3>
                      <p className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">
                        Monday - Friday: 9:00 AM - 6:00 PM
                      </p>
                      <p className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">
                        Saturday: 10:00 AM - 4:00 PM
                      </p>
                      <p className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Google Maps */}
              <div className="bg-white dark:bg-dark-surface p-8 rounded-xl shadow-lg overflow-hidden transition-colors duration-300">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-6 transition-colors duration-300">Find Us</h2>
                <div className="relative h-64 rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3333.89762695!2d77.2090212!3d38.907192!2m3!1f0x0:0x0xffffffff!2m3!1m3!2m2!1senIN!5e0!3m2!1senIN!4v1714758649!5m2!1senIN"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    className="rounded-lg"
                    title="Smart Hostel Location"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div>
              <div className="bg-white dark:bg-dark-surface p-8 rounded-xl shadow-lg transition-colors duration-300">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-6 transition-colors duration-300">Send us a Message</h2>
                
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-secondary text-gray-900 dark:text-dark-text rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300"
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
                      className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-secondary text-gray-900 dark:text-dark-text rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-secondary text-gray-900 dark:text-dark-text rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300"
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
                      rows="5"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-secondary text-gray-900 dark:text-dark-text rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-300"
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
