/**
 * Footer Component
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">HabitaPlot™</h3>
            <p className="text-sm leading-relaxed">
              Your trusted platform for buying, selling, and renting properties. Connecting buyers and sellers with ease.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/search" className="hover:text-white">Browse Properties</Link></li>
              <li><a href="#footer" className="hover:text-white">Sell Your Property</a></li>
              <li><a href="#footer" className="hover:text-white">Pricing</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#footer" className="hover:text-white">Help Center</a></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><a href="#footer" className="hover:text-white">FAQ</a></li>
              <li><a href="#footer" className="hover:text-white">Blog</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#footer" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#footer" className="hover:text-white">Terms of Service</a></li>
              <li><a href="#footer" className="hover:text-white">Cookie Policy</a></li>
              <li><a href="#footer" className="hover:text-white">Compliance</a></li>
            </ul>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex justify-between items-center">
            <p className="text-sm">
              © {currentYear} HabitaPlot™. All rights reserved.
            </p>
            <div className="flex gap-4 text-xl">
              <a href="#facebook" className="hover:text-white">
                <FaFacebook />
              </a>
              <a href="#twitter" className="hover:text-white">
                <FaTwitter />
              </a>
              <a href="#linkedin" className="hover:text-white">
                <FaLinkedin />
              </a>
              <a href="#instagram" className="hover:text-white">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
