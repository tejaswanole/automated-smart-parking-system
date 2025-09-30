import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import ParkingMap from '../components/map/ParkingMap';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleParkingSelect = (parking: any) => {
    navigate(`/parkings/${parking._id}`);
  };

  if (!user) {
    const backgroundPatternStyle = {
      backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%239C92AC' fill-opacity='0.05'%3e%3ccircle cx='30' cy='30' r='2'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
    };

    return (
      <Layout showNavigation={false}>
        {/* Hero Section */}
        <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-40" style={backgroundPatternStyle}></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
            {/* Main Hero Content */}
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                  Smart Parking
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    Made Simple
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    with 
                  </span>
                  ParkSmart
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
                  Find available parking spots instantly, earn rewards for your visits, and contribute to smarter urban mobility with our AI-powered parking system.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <button
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:bg-gray-50"
                >
                  Learn More
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
                  <div className="text-gray-600">Parking Spots</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">50K+</div>
                  <div className="text-gray-600">Happy Users</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">99%</div>
                  <div className="text-gray-600">Accuracy Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="relative z-10 bg-white py-20">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Why Choose Our Smart Parking System?
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Experience the future of parking with cutting-edge technology and user-friendly features designed to make your parking experience seamless.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Location Tracking</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Find parking spots near you instantly with our GPS-powered location services and real-time availability updates.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Detection</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Advanced computer vision technology provides accurate vehicle counting and parking availability with 99% precision.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-8 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Reward System</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Earn coins for parking visits and approved requests. Build your wallet while contributing to the community.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-2xl border border-orange-100 hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Instant Updates</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Get real-time notifications about parking availability, request status, and reward updates via WebSocket technology.
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-2xl border border-pink-100 hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-pink-100 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Driven</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Submit parking requests, help improve the system, and be part of a community working towards smarter urban mobility.
                  </p>
                </div>

                {/* Feature 6 */}
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-2xl border border-teal-100 hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Multi-Role Support</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Designed for everyone: drivers, parking owners, staff, and administrators, with tailored dashboards and features for each role.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6 lg:p-8 bg-white">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Welcome back, <span className="text-white">{user.name}!</span>
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Find and manage parking spots from the map below.
          </p>
        </div>
        <div className="h-[65vh] md:h-[70vh] w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200">
          <ParkingMap onParkingSelect={handleParkingSelect} />
        </div>
      </div>
      <div className="relative z-10 bg-white py-20">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Why Choose Our Smart Parking System?
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Experience the future of parking with cutting-edge technology and user-friendly features designed to make your parking experience seamless.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Location Tracking</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Find parking spots near you instantly with our GPS-powered location services and real-time availability updates.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Detection</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Advanced computer vision technology provides accurate vehicle counting and parking availability with 99% precision.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-8 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Reward System</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Earn coins for parking visits and approved requests. Build your wallet while contributing to the community.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-2xl border border-orange-100 hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Instant Updates</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Get real-time notifications about parking availability, request status, and reward updates via WebSocket technology.
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-2xl border border-pink-100 hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-pink-100 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Driven</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Submit parking requests, help improve the system, and be part of a community working towards smarter urban mobility.
                  </p>
                </div>

                {/* Feature 6 */}
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-2xl border border-teal-100 hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Multi-Role Support</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Designed for everyone: drivers, parking owners, staff, and administrators, with tailored dashboards and features for each role.
                  </p>
                </div>
              </div>
            </div>
          </div>
    </Layout>
  );
}

