export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Terms of Use</h1>
      
      <div className="prose prose-invert max-w-none">
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing and using AfroWiki, you accept and agree to be bound by the terms and provisions of this agreement.
          If you do not agree to abide by the above, please do not use this service.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Content Contribution</h2>
        <p>
          When you contribute content to AfroWiki, you agree to:
        </p>
        <ul className="list-disc pl-6 mt-2 mb-4">
          <li>Provide accurate and verifiable information</li>
          <li>Respect copyright and intellectual property rights</li>
          <li>Not post content that is harmful, offensive, or inappropriate</li>
          <li>Accept that your contributions may be edited, modified, or removed by other contributors</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Content Licensing</h2>
        <p>
          All contributions to AfroWiki are considered to be released under a Creative Commons Attribution-ShareAlike license.
          This means others are free to share and adapt the work, as long as they give appropriate credit and distribute their contributions under the same license.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Accounts</h2>
        <p>
          You are responsible for safeguarding your account and for all activities that occur under your account.
          You must immediately notify AfroWiki of any unauthorized use of your account.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Modifications to Terms</h2>
        <p>
          AfroWiki reserves the right to modify these terms at any time. We will provide notice of significant changes to these terms by posting the new terms on the site.
          Your continued use of the site after such modifications will constitute your acknowledgment of the modified terms.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Limitation of Liability</h2>
        <p>
          AfroWiki and its contributors are not responsible for any damages resulting from the use or inability to use our services.
          The content on AfroWiki is provided &quot;as is&quot; without warranty of any kind.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact Information</h2>
        <p>
          If you have any questions about these Terms, please contact us at support@afrowiki.org.
        </p>
      </div>
    </div>
  );
}
