'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, Eye, Lock } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/register"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registration
          </Link>
          
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mr-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Privacy Policy
              </h1>
              <p className="text-gray-600">
                Last updated: October 3, 2025
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 prose prose-gray max-w-none">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
          </p>
          
          <h3>Personal Information</h3>
          <ul>
            <li>Name and contact information</li>
            <li>Account credentials</li>
            <li>Profile information</li>
            <li>Communication preferences</li>
          </ul>

          <h3>Usage Information</h3>
          <ul>
            <li>Device information and identifiers</li>
            <li>Log data and analytics</li>
            <li>Content and media uploaded to the platform</li>
            <li>Device performance and status data</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send administrative information and updates</li>
            <li>Respond to your comments and questions</li>
            <li>Monitor and analyze usage patterns</li>
            <li>Detect and prevent fraud and abuse</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
          </p>

          <h3>We may share information:</h3>
          <ul>
            <li>With service providers who assist in our operations</li>
            <li>To comply with legal obligations or protect our rights</li>
            <li>In connection with a business transaction or reorganization</li>
            <li>With your consent or at your direction</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
            <div className="flex">
              <Lock className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
              <div>
                <h4 className="text-blue-800 font-semibold">Security Measures</h4>
                <p className="text-blue-700 text-sm mt-1">
                  We use encryption, secure servers, and regular security audits to protect your data.
                </p>
              </div>
            </div>
          </div>

          <h2>5. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide our services and fulfill the purposes described in this policy, unless a longer retention period is required by law.
          </p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access and update your personal information</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of certain communications</li>
            <li>Request a copy of your data</li>
            <li>Object to certain processing activities</li>
          </ul>

          <h2>7. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie settings through your browser.
          </p>

          <h2>8. Third-Party Services</h2>
          <p>
            Our service may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these third parties.
          </p>

          <h2>9. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
          </p>

          <h2>10. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
          </p>

          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any material changes via email or through our service.
          </p>

          <h2>12. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            Email: privacy@digitalsignage.com<br />
            Address: 123 Tech Street, Innovation City, IC 12345<br />
            Data Protection Officer: dpo@digitalsignage.com
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/register"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Registration
          </Link>
        </div>
      </div>
    </div>
  )
}