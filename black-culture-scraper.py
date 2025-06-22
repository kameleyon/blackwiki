import requests
from bs4 import BeautifulSoup
import csv
import time
import os
from datetime import datetime
import re
from urllib.parse import urljoin, urlparse

class BlackCultureScraper:
    """
    A web scraper designed to collect information about Black culture, history, 
    and related topics from various sources while respecting website policies.
    """
    
    def __init__(self):
        # Define our search terms - these capture the breadth of topics we're interested in
        self.search_terms = [
            "Black culture",
            "African diaspora",
            "Caribbean people",
            "Black history",
            "Afro-futurism",
            "African American",
            "Black literature",
            "African heritage",
            "Black art movement",
            "Caribbean culture",
            "Pan-Africanism",
            "Black music history",
            "African traditions",
            "Black empowerment",
            "Diaspora studies"
        ]
        
        # Set up headers to identify our scraper properly
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Storage for our collected data
        self.collected_data = []
        
        # Create output directory if it doesn't exist
        self.output_dir = r"C:\Users\Administrator\myAPP\blackwiki\docs"
        os.makedirs(self.output_dir, exist_ok=True)
    
    def search_wikipedia(self, term):
        """
        Search Wikipedia for articles related to our topic.
        Wikipedia is a great starting point for educational content.
        """
        # Wikipedia's search API endpoint
        search_url = f"https://en.wikipedia.org/w/api.php"
        
        params = {
            'action': 'query',
            'format': 'json',
            'list': 'search',
            'srsearch': term,
            'srlimit': 10  # Get top 10 results for each search
        }
        
        try:
            response = requests.get(search_url, params=params, headers=self.headers)
            data = response.json()
            
            # Extract article titles from search results
            if 'query' in data and 'search' in data['query']:
                for result in data['query']['search']:
                    article_title = result['title']
                    # Fetch the full article content
                    self.scrape_wikipedia_article(article_title, term)
                    
        except Exception as e:
            print(f"Error searching Wikipedia for '{term}': {str(e)}")
    
    def scrape_wikipedia_article(self, title, search_term):
        """
        Scrape content from a specific Wikipedia article.
        We extract the summary and key information.
        """
        # Construct the article URL
        url = f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}"
        
        try:
            response = requests.get(url, headers=self.headers)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find the main content area
            content_div = soup.find('div', {'id': 'mw-content-text'})
            
            if content_div:
                # Extract the first few paragraphs (article summary)
                paragraphs = content_div.find_all('p', limit=3)
                summary = ' '.join([p.get_text().strip() for p in paragraphs])
                
                # Clean the text by removing citation markers
                summary = re.sub(r'\[\d+\]', '', summary)
                summary = re.sub(r'\s+', ' ', summary).strip()
                
                # Extract categories for additional context
                categories = []
                cat_div = soup.find('div', {'id': 'mw-normal-catlinks'})
                if cat_div:
                    cat_links = cat_div.find_all('a')
                    categories = [link.get_text() for link in cat_links[1:]]  # Skip first link
                
                # Store the collected information
                if summary and len(summary) > 100:  # Only keep substantial content
                    self.collected_data.append({
                        'source': 'Wikipedia',
                        'url': url,
                        'title': title,
                        'search_term': search_term,
                        'content': summary[:1000],  # Limit content length
                        'categories': ', '.join(categories[:5]),  # Top 5 categories
                        'date_scraped': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    })
                    
                    print(f"✓ Scraped: {title}")
                    
        except Exception as e:
            print(f"Error scraping article '{title}': {str(e)}")
        
        # Be respectful - wait between requests
        time.sleep(1)
    
    def search_cultural_websites(self):
        """
        Search specific cultural and educational websites for content.
        These are examples - you can expand this list.
        """
        cultural_sites = [
            {
                'name': 'Smithsonian NMAAHC',
                'base_url': 'https://nmaahc.si.edu',
                'search_path': '/explore/stories',
                'description': 'National Museum of African American History and Culture'
            },
            # Add more cultural websites here as needed
        ]
        
        # Note: For many modern websites, you might need Selenium or Playwright
        # for JavaScript-rendered content. This is a simplified example.
        
    def scrape_news_articles(self, term):
        """
        Search for recent news articles about our topics.
        This helps capture contemporary discussions and events.
        """
        # Example using a news aggregator API or RSS feeds
        # You would need to implement based on available news sources
        pass
    
    def save_to_csv(self):
        """
        Save all collected data to a CSV file with proper formatting.
        This creates a structured dataset for analysis.
        """
        filepath = os.path.join(self.output_dir, 'blackinfo.csv')
        
        # Define CSV columns
        fieldnames = ['source', 'url', 'title', 'search_term', 'content', 
                     'categories', 'date_scraped']
        
        # Write data to CSV file
        with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            # Write header row
            writer.writeheader()
            
            # Write all collected data
            for row in self.collected_data:
                writer.writerow(row)
        
        print(f"\n✓ Data saved to: {filepath}")
        print(f"Total articles collected: {len(self.collected_data)}")
    
    def run(self):
        """
        Main execution method that orchestrates the scraping process.
        """
        print("Starting Black Culture Web Scraper...")
        print("=" * 50)
        
        # Search Wikipedia for each term
        for term in self.search_terms:
            print(f"\nSearching for: {term}")
            self.search_wikipedia(term)
            
            # Add a respectful delay between search terms
            time.sleep(2)
        
        # Save all collected data
        if self.collected_data:
            self.save_to_csv()
            self.generate_summary()
        else:
            print("\nNo data collected. Please check your internet connection.")
    
    def generate_summary(self):
        """
        Generate a summary report of what was collected.
        This helps you understand the scope of your dataset.
        """
        print("\n" + "=" * 50)
        print("SCRAPING SUMMARY")
        print("=" * 50)
        
        # Count articles by search term
        term_counts = {}
        for item in self.collected_data:
            term = item['search_term']
            term_counts[term] = term_counts.get(term, 0) + 1
        
        print("\nArticles collected by search term:")
        for term, count in sorted(term_counts.items(), key=lambda x: x[1], reverse=True):
            print(f"  • {term}: {count} articles")
        
        # Show sample titles
        print("\nSample article titles:")
        for item in self.collected_data[:5]:
            print(f"  • {item['title']}")

# Advanced scraping class for more complex websites
class AdvancedBlackCultureScraper(BlackCultureScraper):
    """
    Extended scraper with additional capabilities for modern websites.
    This uses Selenium for JavaScript-heavy sites.
    """
    
    def __init__(self):
        super().__init__()
        # Note: You'll need to install selenium and download appropriate driver
        self.use_selenium = False
        
    def setup_selenium(self):
        """
        Set up Selenium WebDriver for JavaScript-rendered content.
        Uncomment and modify based on your browser choice.
        """
        # from selenium import webdriver
        # from selenium.webdriver.common.by import By
        # from selenium.webdriver.support.ui import WebDriverWait
        # from selenium.webdriver.support import expected_conditions as EC
        
        # # Chrome example
        # options = webdriver.ChromeOptions()
        # options.add_argument('--headless')  # Run in background
        # self.driver = webdriver.Chrome(options=options)
        # self.use_selenium = True
        pass
    
    def scrape_with_pagination(self, base_url, params):
        """
        Handle websites with pagination to get more comprehensive results.
        """
        page = 1
        max_pages = 5  # Limit to avoid excessive requests
        
        while page <= max_pages:
            # Add page parameter
            params['page'] = page
            
            # Make request and process
            # ... scraping logic here ...
            
            page += 1
            time.sleep(2)  # Respectful delay

# Main execution
if __name__ == "__main__":
    # Create scraper instance
    scraper = BlackCultureScraper()
    
    # Run the scraping process
    scraper.run()
    
    # Optional: Use advanced scraper for more complex sites
    # advanced_scraper = AdvancedBlackCultureScraper()
    # advanced_scraper.setup_selenium()
    # advanced_scraper.run()
