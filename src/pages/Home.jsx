import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { UtensilsCrossed, Clock, Star, ShieldCheck } from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to Canteen Management System
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Order delicious food from our canteen with real-time tracking and seamless experience
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/menu')}
              >
                Browse Menu
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-orange-600 hover:bg-gray-100"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 dark:bg-orange-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Wide Variety</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose from a diverse menu of delicious dishes
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track your order status in real-time
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Food</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Fresh ingredients and hygienic preparation
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Safe and secure payment options
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of satisfied customers and enjoy delicious food today!
          </p>
          <Button size="lg" onClick={() => navigate('/menu')}>
            Order Now
          </Button>
        </div>
      </section>
    </div>
  );
};

