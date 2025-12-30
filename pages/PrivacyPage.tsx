
import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <div className="prose prose-green max-w-none text-gray-600 space-y-4">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>At Farmers Market, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website.</p>
            
            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Information We Collect</h3>
            <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.</li>
                <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Use of Your Information</h3>
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
            <ul className="list-disc pl-5 space-y-2">
                <li>Create and manage your account.</li>
                <li>Process your orders and deliver products.</li>
                <li>Email you regarding your account or order.</li>
                <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
                <li>Request feedback and contact you about your use of the Site.</li>
            </ul>
            
            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">Contact Us</h3>
            <p>If you have questions or comments about this Privacy Policy, please contact us at support@farmersmarket.com.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
