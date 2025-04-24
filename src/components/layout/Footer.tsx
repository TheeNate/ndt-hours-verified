
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">NDT Hours Verified</h3>
            <p className="text-gray-600 mb-4">
              Track, manage, and verify your NDT certification hours with our secure platform.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-ndt-600">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-ndt-600">
                  About
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-600 hover:text-ndt-600">
                  Log in
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-ndt-600">
                  Sign up
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-600">
                Email: support@ndthoursverified.com
              </li>
              <li className="text-gray-600">
                Phone: (555) 123-4567
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} NDT Hours Verified. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
