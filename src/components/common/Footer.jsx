export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Canteen Management System</h3>
            <p className="text-gray-400 mr-25">
              Your one-stop solution for ordering delicious food from our canteen.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-white transition">Home</a></li>
              <li><a href="/menu" className="hover:text-white transition">Menu</a></li>
              <li><a href="/about" className="hover:text-white transition">About</a></li>
              <li><a href="/contact" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <p className="text-gray-400">
              Email: niteshshah011@gmail.com<br />
              Phone: +91 92348 92360<br />
              Address: 337/1A, Vengal Village
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; 2026 Canteen Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

