export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-invert max-w-none">
        <p className="text-lg mb-6">
          At AfroWiki, we are committed to protecting your privacy and ensuring the security of your personal information.
          This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
        <p>We collect the following types of information:</p>
        <ul className="list-disc pl-6 mt-2 mb-4">
          <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, and password.</li>
          <li><strong>Profile Information:</strong> Any additional information you choose to add to your profile, such as biography, profile picture, or social media links.</li>
          <li><strong>Content Contributions:</strong> Articles, edits, comments, and other content you contribute to the platform.</li>
          <li><strong>Usage Data:</strong> Information about how you use the platform, including pages visited, time spent, and interactions.</li>
          <li><strong>Technical Data:</strong> IP address, browser type, device information, and cookies.</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
        <p>We use your information for the following purposes:</p>
        <ul className="list-disc pl-6 mt-2 mb-4">
          <li>To provide and maintain our services</li>
          <li>To authenticate users and secure accounts</li>
          <li>To attribute content contributions to their authors</li>
          <li>To improve our platform and user experience</li>
          <li>To communicate with you about your account or our services</li>
          <li>To comply with legal obligations</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, 
          alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, 
          and we cannot guarantee absolute security.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Sharing and Disclosure</h2>
        <p>We may share your information in the following circumstances:</p>
        <ul className="list-disc pl-6 mt-2 mb-4">
          <li>With service providers who help us operate our platform</li>
          <li>When required by law or to protect our rights</li>
          <li>In connection with a merger, acquisition, or sale of assets</li>
          <li>With your consent or at your direction</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Rights</h2>
        <p>Depending on your location, you may have the following rights regarding your personal information:</p>
        <ul className="list-disc pl-6 mt-2 mb-4">
          <li>Access and receive a copy of your data</li>
          <li>Rectify inaccurate or incomplete information</li>
          <li>Request deletion of your personal data</li>
          <li>Restrict or object to certain processing of your data</li>
          <li>Data portability</li>
          <li>Withdraw consent</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Cookies and Tracking</h2>
        <p>
          We use cookies and similar tracking technologies to enhance your experience on our platform. 
          You can control cookies through your browser settings, but disabling cookies may limit your ability to use certain features of our platform.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page 
          and updating the effective date. We encourage you to review this Privacy Policy periodically.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at privacy@afrowiki.org.
        </p>
      </div>
    </div>
  );
}
