
import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6">Terms of Service</h1>
        <div className="prose prose-green max-w-none text-gray-600 space-y-4">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Farmers Market website operated by us.</p>
            
            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">1. Agreement to Terms</h3>
            <p>By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.</p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Purchases</h3>
            <p>If you wish to purchase any product or service made available through the Service ("Purchase"), you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number, the expiration date of your credit card, your billing address, and your shipping information.</p>
            <p>You represent and warrant that: (i) you have the legal right to use any credit card(s) or other payment method(s) in connection with any Purchase; and that (ii) the information you supply to us is true, correct and complete.</p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Accounts</h3>
            <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
            
            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Content</h3>
            <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.</p>

            <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">5. Termination</h3>
            <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
            
             <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">6. Governing Law</h3>
            <p>These Terms shall be governed and construed in accordance with the laws of Nigeria, without regard to its conflict of law provisions.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
