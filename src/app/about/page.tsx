export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">About AfroWiki</h1>
      
      <div className="prose prose-invert max-w-none">
        <p className="text-lg mb-6">
          AfroWiki is a collaborative knowledge platform dedicated to documenting, preserving, and celebrating 
          Black history, culture, and achievements from around the world.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
        <p>
          Our mission is to create a comprehensive, accessible, and reliable resource that highlights the 
          rich tapestry of Black experiences, contributions, and perspectives throughout history and across the globe.
          We aim to address gaps in traditional knowledge sources by centering Black voices and narratives.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Vision</h2>
        <p>
          We envision a world where Black history and culture are recognized, respected, and integrated into 
          our collective understanding of human history. AfroWiki strives to be the premier destination for 
          accurate, well-researched information about the African diaspora and its global impact.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Values</h2>
        <ul className="list-disc pl-6 mt-2 mb-4">
          <li><strong>Accuracy:</strong> We are committed to factual, well-sourced information.</li>
          <li><strong>Inclusivity:</strong> We embrace the diversity of Black experiences across regions, time periods, and perspectives.</li>
          <li><strong>Accessibility:</strong> We strive to make knowledge accessible to all, regardless of background or expertise.</li>
          <li><strong>Community:</strong> We believe in the power of collaborative knowledge creation and sharing.</li>
          <li><strong>Empowerment:</strong> We aim to educate, inspire, and empower through knowledge.</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">How AfroWiki Works</h2>
        <p>
          AfroWiki operates on a collaborative model where registered users can contribute articles, 
          edit existing content, and participate in discussions. All contributions are reviewed to ensure 
          they meet our standards for accuracy, relevance, and quality.
        </p>
        <p>
          Our content covers a wide range of topics, including:
        </p>
        <ul className="list-disc pl-6 mt-2 mb-4">
          <li>Historical events and figures</li>
          <li>Cultural traditions and practices</li>
          <li>Art, music, literature, and other creative expressions</li>
          <li>Scientific and technological innovations</li>
          <li>Social movements and political developments</li>
          <li>Contemporary issues and achievements</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Join Our Community</h2>
        <p>
          AfroWiki is more than just a website—it&apos;s a community of contributors, researchers, educators, 
          and knowledge seekers. We welcome anyone who shares our commitment to documenting and celebrating 
          Black history and culture.
        </p>
        <p>
          You can contribute by:
        </p>
        <ul className="list-disc pl-6 mt-2 mb-4">
          <li>Creating an account and writing articles</li>
          <li>Editing and improving existing content</li>
          <li>Adding references and citations</li>
          <li>Suggesting topics for new articles</li>
          <li>Sharing AfroWiki content with others</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
        <p>
          Have questions, suggestions, or feedback? We&apos;d love to hear from you! 
          Contact us at info@afrowiki.org.
        </p>
      </div>
    </div>
  );
}
