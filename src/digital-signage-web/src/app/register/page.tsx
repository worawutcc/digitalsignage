'use client'

import Link from 'next/link'
import { ShieldX, ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link 
            href="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>

          <div className="mx-auto h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-6">
            <ShieldX className="h-8 w-8 text-amber-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Admin-Only System
          </h1>

          <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
            <p className="text-gray-600 text-lg mb-4">
              This Digital Signage system is designed for administrators only.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Public user registration is not available. If you need admin access, please contact your system administrator.
            </p>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">
                Android TV Device Registration
              </h3>
              <p className="text-xs text-blue-700">
                Android TV devices can self-register using the PIN-based approval workflow directly from the device interface.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              href="/login"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Go to Admin Login
            </Link>
            <Link
              href="/"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
