import { Link } from 'react-router-dom';
import { FaBed, FaUsers, FaWifi, FaShieldAlt, FaUtensils, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

const Rooms = () => {
  const roomTypes = [
    {
      id: '2-seater',
      title: '2-Seater Room',
      description: 'Perfect for students who prefer more privacy and focused study environment.',
      price: 'PKR 8,000/month',
      features: ['2 Single Beds', '2 Study Tables', '2 Wardrobes', 'Attached Bathroom', 'AC', 'WiFi'],
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600'
    },
    {
      id: '3-seater',
      title: '3-Seater Room',
      description: 'Balanced option for comfort and affordability with shared living space.',
      price: 'PKR 12,000/month',
      features: ['3 Single Beds', '3 Study Tables', '3 Wardrobes', 'Attached Bathroom', 'AC', 'WiFi'],
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600'
    },
    {
      id: '4-seater',
      title: '4-Seater Room',
      description: 'Economical choice with shared facilities and vibrant community living.',
      price: 'PKR 16,000/month',
      features: ['4 Single Beds', '4 Study Tables', '4 Wardrobes', 'Shared Bathroom', 'AC', 'WiFi'],
      image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Rooms</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Choose from our range of comfortable and affordable accommodation options
            </p>
          </div>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {roomTypes.map((room) => (
              <div key={room.id} className="bg-white dark:bg-dark-surface rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Room Image */}
                <div className="relative">
                  <img 
                    src={room.image} 
                    alt={room.title} 
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {room.price}
                  </div>
                </div>

                {/* Room Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-3 transition-colors duration-300">
                    {room.title}
                  </h3>
                  <p className="text-gray-600 dark:text-dark-text-secondary mb-6 transition-colors duration-300">
                    {room.description}
                  </p>

                  {/* Features List */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-4 transition-colors duration-300">Room Features</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {room.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <FaCheckCircle className="text-green-500 text-sm" />
                          <span className="text-gray-600 dark:text-dark-text-secondary text-sm transition-colors duration-300">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <Link
                    to="/apply"
                    className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-300 group"
                  >
                    Apply Now
                    <FaArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="py-16 bg-white dark:bg-dark-surface transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBed className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-2 transition-colors duration-300">Comfortable Living</h3>
              <p className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">
                All rooms are designed for maximum comfort with quality furniture and modern amenities.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaWifi className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-2 transition-colors duration-300">Modern Facilities</h3>
              <p className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">
                High-speed WiFi, air conditioning, and 24/7 security in all rooms.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShieldAlt className="text-primary-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-2 transition-colors duration-300">Safe Environment</h3>
              <p className="text-gray-600 dark:text-dark-text-secondary transition-colors duration-300">
                Secure campus with CCTV surveillance and controlled access for student safety.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Rooms;
