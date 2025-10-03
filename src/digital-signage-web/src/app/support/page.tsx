'use client'

import Link from 'next/link'
import { ArrowLeft, MessageCircle, Mail, Phone, HelpCircle, Book, Bug } from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
          
          <div className="text-center">
            <div className="flex justify-center">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="mt-6 text-4xl font-extrabold text-gray-900">
              Support Center
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              We're here to help you with Digital Signage Management Platform
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Contact Support */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Contact Support
            </h3>
            <p className="text-gray-600 mb-4">
              Get direct help from our support team for technical issues and account problems.
            </p>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              Start Live Chat
            </button>
          </div>

          {/* Email Support */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Email Support
            </h3>
            <p className="text-gray-600 mb-4">
              Send us an email and we'll get back to you within 24 hours.
            </p>
            <a 
              href="mailto:support@digitalsignage.com"
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors inline-block text-center"
            >
              Send Email
            </a>
          </div>

          {/* Phone Support */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <Phone className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Phone Support
            </h3>
            <p className="text-gray-600 mb-4">
              Call us directly for urgent issues and real-time assistance.
            </p>
            <a 
              href="tel:+1-800-SIGNAGE"
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors inline-block text-center"
            >
              +1-800-SIGNAGE
            </a>
          </div>

          {/* Documentation */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
              <Book className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Documentation
            </h3>
            <p className="text-gray-600 mb-4">
              Browse our comprehensive guides, tutorials, and API documentation.
            </p>
            <Link 
              href="/docs"
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors inline-block text-center"
            >
              View Docs
            </Link>
          </div>

          {/* Bug Report */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
              <Bug className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Report a Bug
            </h3>
            <p className="text-gray-600 mb-4">
              Found a bug? Help us improve by reporting issues you encounter.
            </p>
            <button className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors">
              Report Bug
            </button>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
              <HelpCircle className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              FAQ
            </h3>
            <p className="text-gray-600 mb-4">
              Find answers to commonly asked questions about the platform.
            </p>
            <Link 
              href="/faq"
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors inline-block text-center"
            >
              View FAQ
            </Link>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Contact Information
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Business Hours</h3>
              <p className="text-gray-600">
                Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                Saturday: 10:00 AM - 4:00 PM EST<br />
                Sunday: Closed
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">
                General: info@digitalsignage.com<br />
                Support: support@digitalsignage.com<br />
                Sales: sales@digitalsignage.com
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
              <p className="text-gray-600">
                Digital Signage Inc.<br />
                123 Tech Street<br />
                Innovation City, IC 12345
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}