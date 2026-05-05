import { FaBed, FaUsers, FaAward, FaMapMarkerAlt } from 'react-icons/fa';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Smart Hostel</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Providing comfortable and secure accommodation for students since 2015
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left Column - Mission & History */}
            <div className="space-y-8">
              {/* Mission */}
              <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-dark-text mb-6 transition-colors duration-300">Our Mission</h2>
                <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed transition-colors duration-300">
                  At Smart Hostel, we are committed to providing a safe, comfortable, and conducive living environment 
                  for students to pursue their academic goals. We strive to create a home away from home where students 
                  can focus on their studies while enjoying modern amenities and a supportive community.
                </p>
              </div>

              {/* History */}
              <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-dark-text mb-6 transition-colors duration-300">Our History</h2>
                <p className="text-gray-600 dark:text-dark-text-secondary leading-relaxed mb-6 transition-colors duration-300">
                  Established in 2015, Smart Hostel has been serving students for over 8 years. What started 
                  as a small facility with 20 rooms has grown into a comprehensive hostel management system 
                  with over 200 beds, modern amenities, and a reputation for excellence.
                </p>
                <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-lg transition-colors duration-300">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-4 transition-colors duration-300">Key Milestones</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-bold">2015</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-dark-text transition-colors duration-300">Founded</p>
                        <p className="text-sm text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">Started with 20 rooms</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-bold">2018</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-dark-text transition-colors duration-300">Expansion</p>
                        <p className="text-sm text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">Added 50 more rooms</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-bold">2022</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-dark-text transition-colors duration-300">Digital Transformation</p>
                        <p className="text-sm text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">Online management system</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stats & Photo */}
            <div className="space-y-8">
              {/* Photo */}
              <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg overflow-hidden transition-colors duration-300">
                <img 
                  src="https://images.unsplash.com/photo-1566076392558-2a6b4b4e2d2?w=600" 
                  alt="Smart Hostel Building" 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-2 transition-colors duration-300">Modern Facilities</h3>
                  <p className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">
                    Our state-of-the-art facility provides everything students need for comfortable living and focused studying.
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-white dark:bg-dark-surface p-6 rounded-xl shadow-lg transition-colors duration-300">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-6 transition-colors duration-300">Our Impact</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FaBed className="text-primary-600 text-2xl" />
                    </div>
                    <div className="text-3xl font-bold text-gray-800 dark:text-dark-text transition-colors duration-300">200+</div>
                    <div className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">Total Rooms</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FaUsers className="text-primary-600 text-2xl" />
                    </div>
                    <div className="text-3xl font-bold text-gray-800 dark:text-dark-text transition-colors duration-300">500+</div>
                    <div className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FaAward className="text-primary-600 text-2xl" />
                    </div>
                    <div className="text-3xl font-bold text-gray-800 dark:text-dark-text transition-colors duration-300">8+</div>
                    <div className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">Years</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FaMapMarkerAlt className="text-primary-600 text-2xl" />
                    </div>
                    <div className="text-3xl font-bold text-gray-800 dark:text-dark-text transition-colors duration-300">Prime</div>
                    <div className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">Location</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
