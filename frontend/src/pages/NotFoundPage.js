/**
 * 404 Not Found Page
 */

import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold mb-4">404</h1>
        <h2 className="text-4xl font-bold mb-4">Page Not Found</h2>
        <p className="text-xl mb-8 opacity-90">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-flex px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
