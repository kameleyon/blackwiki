import requests
from bs4 import BeautifulSoup
import csv
import time
import os
from datetime import datetime
import re
import sys

# Fix encoding issues for Windows
if sys.platform == 'win32':
    import locale
    locale.setlocale(locale.LC_ALL, '')

class WindowsCompatibleBlackCultureScraper:
    """
    Windows-compatible scraper for Black culture, history, and African diaspora content.
    Handles encoding issues and captures all the specific topics requested.
    """
    
    def __init__(self):
        # Set up proper encoding for Windows
        self.encoding = 'utf-8'
        
        # Comprehensive list targeting ALL the topics you mentioned
        self.search_terms = [
            # People you specifically asked about
            "Nelson Mandela",
            "George Floyd",
            "Bob Marley",
            "Akon singer",
            
            # Music genres you wanted
            "Rap music history",
            "Hip hop culture origins",
            "Reggae music Jamaica",
            "Jazz African American origins",
            "Blues music history",
            "Soul music origins",
            "Funk music history",
            "R&B rhythm and blues",
            
            # Haiti - comprehensive coverage
            "Haitian Revolution 1791",
            "Haiti independence 1804",
            "Toussaint Louverture",
            "Jean-Jacques Dessalines",
            "Henri Christophe Haiti",
            "Haitian Vodou culture",
            "Haiti earthquake 2010",
            "Haitian art movement",
            "Haitian Creole language",
            
            # Caribbean you asked about
            "Jamaica history culture",
            "Caribbean slavery history",
            "Trinidad Tobago culture",
            "Barbados history",
            "Rastafari movement",
            "Marcus Garvey Jamaica",
            "Caribbean carnival culture",
            "Calypso music Caribbean",
            "Dancehall music Jamaica",
            
            # Egypt and ancient Africa
            "Ancient Egypt civilization",
            "Egyptian pharaohs Africa",
            "Nubian kingdoms Sudan",
            "Kingdom of Kush",
            "Ethiopian Empire history",
            "Axum ancient kingdom",
            
            # Nigeria and West Africa
            "Nigeria history culture",
            "Yoruba people culture",
            "Igbo people history",
            "Hausa Fulani history",
            "Benin Empire bronzes",
            "Lagos Nigeria history",
            "Nigerian civil war Biafra",
            "Fela Kuti Afrobeat",
            "Chinua Achebe writer",
            
            # More musicians and artists
            "Tupac Shakur",
            "Notorious BIG Biggie",
            "Jay-Z rapper",
            "Kendrick Lamar",
            "Drake musician",
            "Beyonce singer",
            "Michael Jackson",
            "Prince musician",
            "Stevie Wonder",
            "Marvin Gaye",
            "Nina Simone",
            "Billie Holiday",
            "John Coltrane jazz",
            "Miles Davis jazz",
            "James Brown funk",
            "Aretha Franklin",
            "Whitney Houston",
            "Diana Ross Supremes",
            
            # Civil Rights figures
            "Martin Luther King Jr",
            "Malcolm X",
            "Rosa Parks",
            "Harriet Tubman",
            "Frederick Douglass",
            "Sojourner Truth",
            "W.E.B. Du Bois",
            "Booker T. Washington",
            "Thurgood Marshall",
            "Medgar Evers",
            "Emmett Till",
            
            # Modern movements and events
            "Black Lives Matter movement",
            "George Floyd protests 2020",
            "Ferguson protests 2014",
            "Rodney King riots 1992",
            "Black Panther Party",
            "Civil Rights Movement 1960s",
            
            # African leaders and independence
            "Kwame Nkrumah Ghana",
            "Jomo Kenyatta Kenya",
            "Julius Nyerere Tanzania",
            "Patrice Lumumba Congo",
            "Thomas Sankara Burkina Faso",
            "Steve Biko South Africa",
            "Winnie Mandela",
            
            # Cultural movements
            "Harlem Renaissance 1920s",
            "Negritude movement",
            "Pan-Africanism history",
            "Afrofuturism movement",
            "Black Arts Movement",
            "Hip hop culture elements",
            
            # Historical events
            "Atlantic slave trade",
            "Middle Passage slavery",
            "Underground Railroad",
            "Haitian Revolution details",
            "Zulu Kingdom history",
            "Mau Mau uprising Kenya",
            "Soweto uprising 1976",
            "Rwanda genocide 1994",
            
            # Contemporary culture
            "Black Twitter culture",
            "African American cuisine soul food",
            "Black church tradition",
            "HBCU historically black colleges",
            "Black Greek letter organizations",
            "Juneteenth celebration",
            "Kwanzaa holiday",
            "Black History Month"
        ]
        
        self.headers = {
            'User-Agent': 'Educational Research Bot - Black Culture Project'
        }
        
        self.collected_data = []
        self.output_dir = r"C:\Users\Administrator\myAPP\blackwiki\docs"
        os.makedirs(self.output_dir, exist_ok=True)
        
        self.scraped_urls = set()
        self.failed_searches = []
    
    def safe_print(self, message):
        """
        Print messages safely on Windows by handling encoding
        """
        try:
            print(message)
        except UnicodeEncodeError:
            # Replace problematic characters for Windows console
            safe_message = message.encode('ascii', 'replace').decode('ascii')
            print(safe_message)
    
    def search_wikipedia(self, term):
        """
        Search Wikipedia with proper error handling
        """
        search_url = "https://en.wikipedia.org/w/api.php"
        
        params = {
            'action': 'query',
            'format': 'json',
            'list': 'search',
            'srsearch': term,
            'srlimit': 5,
            'srprop': 'snippet|titlesnippet|size'
        }
        
        try:
            response = requests.get(search_url, params=params, headers=self.headers)
            response.encoding = 'utf-8'  # Force UTF-8 encoding
            data = response.json()
            
            if 'query' in data and 'search' in data['query']:
                results = data['query']['search']
                
                if results:
                    self.safe_print(f"\n[{term}] Found {len(results)} articles")
                    
                    for i, result in enumerate(results):
                        article_title = result['title']
                        if article_title not in self.scraped_urls:
                            success = self.scrape_wikipedia_article(article_title, term)
                            if success:
                                self.scraped_urls.add(article_title)
                else:
                    self.safe_print(f"\n[{term}] No direct results - trying broader search")
                    # Try without qualifiers
                    main_term = term.split()[0]
                    if main_term != term and len(main_term) > 3:
                        self.search_wikipedia(main_term)
                    
        except Exception as e:
            self.safe_print(f"Search error for '{term}': {str(e)}")
            self.failed_searches.append(term)
    
    def scrape_wikipedia_article(self, title, search_term):
        """
        Scrape article content with better error handling
        """
        url = f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}"
        
        if url in self.scraped_urls:
            return False
            
        try:
            response = requests.get(url, headers=self.headers)
            response.encoding = 'utf-8'
            soup = BeautifulSoup(response.content, 'html.parser')
            
            content_div = soup.find('div', {'id': 'mw-content-text'})
            
            if content_div:
                # Get article lead section (before first heading)
                lead_section = []
                for element in content_div.find_all(['p', 'h2'], recursive=False):
                    if element.name == 'h2':
                        break
                    if element.name == 'p' and element.get_text().strip():
                        lead_section.append(element.get_text().strip())
                
                # Get additional paragraphs if lead is short
                if len(lead_section) < 3:
                    all_paragraphs = content_div.find_all('p', limit=5)
                    for p in all_paragraphs:
                        text = p.get_text().strip()
                        if text and text not in lead_section:
                            lead_section.append(text)
                
                summary = ' '.join(lead_section[:5])
                
                # Clean text
                summary = re.sub(r'\[\d+\]', '', summary)
                summary = re.sub(r'\s+', ' ', summary).strip()
                
                # Extract dates and numbers
                dates = re.findall(r'\b(1[0-9]{3}|20[0-2][0-9])\b', summary)
                
                # Get infobox data
                infobox_data = ""
                infobox = soup.find('table', {'class': 'infobox'})
                if infobox:
                    facts = []
                    rows = infobox.find_all('tr')[:8]
                    for row in rows:
                        th = row.find('th')
                        td = row.find('td')
                        if th and td:
                            label = th.get_text().strip()
                            value = td.get_text().strip()
                            if label and value:
                                facts.append(f"{label}: {value}")
                    infobox_data = " | ".join(facts)
                
                # Get categories
                categories = []
                cat_div = soup.find('div', {'id': 'mw-normal-catlinks'})
                if cat_div:
                    cat_links = cat_div.find_all('a')[1:]  # Skip first
                    categories = [link.get_text() for link in cat_links[:8]]
                
                # Get section headings to understand article structure
                headings = []
                for h in content_div.find_all(['h2', 'h3'])[:8]:
                    heading_text = h.get_text().strip()
                    if heading_text and not heading_text.startswith('['):
                        headings.append(heading_text)
                
                # Store if we have substantial content
                if summary and len(summary) > 150:
                    self.collected_data.append({
                        'source': 'Wikipedia',
                        'url': url,
                        'title': title,
                        'search_term': search_term,
                        'content': summary[:2500],  # Generous content length
                        'categories': ' | '.join(categories),
                        'key_dates': ', '.join(set(dates[:10])) if dates else '',
                        'sections': ' | '.join(headings),
                        'infobox': infobox_data[:500],
                        'content_length': len(summary),
                        'date_scraped': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    })
                    
                    self.safe_print(f"  [OK] Scraped: {title[:50]}...")
                    return True
                else:
                    self.safe_print(f"  [--] Skipped (too short): {title}")
                    return False
                    
        except Exception as e:
            self.safe_print(f"  [!!] Error on '{title}': {type(e).__name__}")
            return False
        finally:
            time.sleep(0.5)  # Be respectful to Wikipedia
    
    def save_to_csv(self):
        """
        Save all collected data to CSV with proper encoding
        """
        filepath = os.path.join(self.output_dir, 'complete_blackinfo.csv')
        
        fieldnames = ['source', 'url', 'title', 'search_term', 'content', 
                     'categories', 'key_dates', 'sections', 'infobox', 
                     'content_length', 'date_scraped']
        
        # Use utf-8-sig for Excel compatibility
        with open(filepath, 'w', newline='', encoding='utf-8-sig') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            # Sort by search term for better organization
            sorted_data = sorted(self.collected_data, key=lambda x: x['search_term'])
            
            for row in sorted_data:
                writer.writerow(row)
        
        self.safe_print(f"\n[SUCCESS] Data saved to: {filepath}")
        self.safe_print(f"Total articles collected: {len(self.collected_data)}")
        
        # Also create a summary file
        summary_path = os.path.join(self.output_dir, 'scraping_summary.txt')
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write(f"Black Culture Web Scraping Summary\n")
            f.write(f"{'='*50}\n")
            f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Total searches: {len(self.search_terms)}\n")
            f.write(f"Successful articles: {len(self.collected_data)}\n")
            f.write(f"Failed searches: {len(self.failed_searches)}\n\n")
            
            if self.failed_searches:
                f.write("Failed searches (may need manual checking):\n")
                for term in self.failed_searches:
                    f.write(f"  - {term}\n")
    
    def run(self):
        """
        Execute the scraping process
        """
        self.safe_print("="*70)
        self.safe_print("BLACK CULTURE COMPREHENSIVE WEB SCRAPER")
        self.safe_print("="*70)
        self.safe_print(f"Topics to search: {len(self.search_terms)}")
        self.safe_print("This includes all the specific topics you requested:")
        self.safe_print("- Egypt, Mandela, Akon, Bob Marley")
        self.safe_print("- Rap music, Haiti, Nigeria, Jamaica")
        self.safe_print("- George Floyd, Caribbean culture, and much more!")
        self.safe_print("="*70)
        
        start_time = time.time()
        
        for i, term in enumerate(self.search_terms, 1):
            self.safe_print(f"\n[{i}/{len(self.search_terms)}] Searching: {term}")
            self.search_wikipedia(term)
            
            # Progress update
            if i % 20 == 0:
                elapsed = time.time() - start_time
                rate = i / elapsed
                remaining = (len(self.search_terms) - i) / rate
                self.safe_print(f"\n--- Progress: {i}/{len(self.search_terms)} ---")
                self.safe_print(f"--- Articles collected: {len(self.collected_data)} ---")
                self.safe_print(f"--- Est. time remaining: {int(remaining/60)} minutes ---")
            
            # Small delay between searches
            time.sleep(0.5)
        
        # Final summary and save
        self.safe_print("\n" + "="*70)
        self.safe_print("SCRAPING COMPLETE!")
        self.safe_print("="*70)
        
        if self.collected_data:
            self.save_to_csv()
            self.generate_topic_summary()
        else:
            self.safe_print("No data collected. Check internet connection.")
    
    def generate_topic_summary(self):
        """
        Generate a detailed summary of what was collected
        """
        self.safe_print("\nCOLLECTION SUMMARY BY TOPIC:")
        self.safe_print("-"*50)
        
        # Categorize collected articles
        topics = {
            'Haiti & Haitian History': [],
            'Jamaica & Caribbean': [],
            'African History & Egypt': [],
            'Nigeria & West Africa': [],
            'Music & Musicians': [],
            'Civil Rights & Activists': [],
            'Modern Movements': [],
            'Cultural Topics': []
        }
        
        for item in self.collected_data:
            title = item['title']
            term = item['search_term'].lower()
            
            categorized = False
            
            if 'haiti' in term or 'haitian' in term:
                topics['Haiti & Haitian History'].append(title)
                categorized = True
            elif any(x in term for x in ['jamaica', 'caribbean', 'trinidad', 'barbados']):
                topics['Jamaica & Caribbean'].append(title)
                categorized = True
            elif any(x in term for x in ['egypt', 'nubia', 'kush', 'ethiopia', 'africa ancient']):
                topics['African History & Egypt'].append(title)
                categorized = True
            elif any(x in term for x in ['nigeria', 'yoruba', 'igbo', 'lagos', 'benin empire']):
                topics['Nigeria & West Africa'].append(title)
                categorized = True
            elif any(x in term for x in ['music', 'rap', 'jazz', 'reggae', 'marley', 'akon']):
                topics['Music & Musicians'].append(title)
                categorized = True
            elif any(x in term for x in ['mandela', 'king', 'malcolm', 'parks', 'tubman']):
                topics['Civil Rights & Activists'].append(title)
                categorized = True
            elif any(x in term for x in ['floyd', 'black lives', 'ferguson', 'protests']):
                topics['Modern Movements'].append(title)
                categorized = True
            
            if not categorized:
                topics['Cultural Topics'].append(title)
        
        # Print summary
        for category, articles in topics.items():
            if articles:
                self.safe_print(f"\n{category}: {len(articles)} articles")
                # Show first 3 examples
                for article in articles[:3]:
                    self.safe_print(f"  - {article}")
                if len(articles) > 3:
                    self.safe_print(f"  ... and {len(articles)-3} more")

if __name__ == "__main__":
    scraper = WindowsCompatibleBlackCultureScraper()
    scraper.run()
