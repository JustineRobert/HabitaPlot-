/**
 * Contact Page
 */

import React from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const ContactPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 text-white px-8 py-12 sm:px-16 sm:py-16">
          <h1 className="text-4xl font-bold mb-4">Contact HabitaPlot™</h1>
          <p className="text-lg text-blue-100 max-w-2xl">
            For support, partnership inquiries, or product questions, get in touch with us using the details below.
          </p>
        </div>

        <div className="px-8 py-10 sm:px-16 sm:py-16 grid gap-10 lg:grid-cols-3">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FaEnvelope className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Email</h2>
              <a href="mailto:titechaafrica@gmail.com" className="text-gray-700 hover:text-blue-600">
                titechaafrica@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FaPhone className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Phone</h2>
              <a href="tel:+256782397907" className="text-gray-700 hover:text-blue-600">
                +256 782 397 907
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FaMapMarkerAlt className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Office</h2>
              <p className="text-gray-700">Serving buyers and sellers across Kampala and Uganda.</p>
            </div>
          </div>
        </div>

        <div className="px-8 pb-12 sm:px-16">
          <h3 className="text-2xl font-semibold mb-4">How we can help</h3>
          <ul className="space-y-3 text-gray-700">
            <li>• Questions about listing a property or promoting a premium listing.</li>
            <li>• Support with MTN MoMo or Airtel Money payment flows.</li>
            <li>• Partnerships with agents, developers, and local property businesses.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
