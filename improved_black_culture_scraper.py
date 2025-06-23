import requests
from bs4 import BeautifulSoup
import csv
import time
import os
from datetime import datetime
import re

class ImprovedBlackCultureScraper:
    """
    An improved web scraper that targets specific, relevant topics in Black culture,
    history, and the African diaspora with precise search terms.
    """
    
    def __init__(self):
        # COMPREHENSIVE list of specific topics - exactly what you asked for
        self.search_terms = [
           # Term to look for 
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
        
            # Historical Figures and Leaders
            "Nelson Mandela",
            "Martin Luther King Jr",
            "Malcolm X",
            "Marcus Garvey",
            "Harriet Tubman",
            "Frederick Douglass",
            "Sojourner Truth",
            "W.E.B. Du Bois",
            "Booker T. Washington",
            "Rosa Parks",
            "George Floyd protests",
            
            # Music and Musicians
            "Bob Marley reggae",
            "Akon musician",
            "Hip hop history",
            "Rap music origins",
            "Jazz history African American",
            "Blues music origins",
            "Motown Records",
            "Tupac Shakur",
            "Notorious B.I.G.",
            "Kendrick Lamar",
            "Beyoncé",
            "Michael Jackson",
            "Aretha Franklin",
            "Louis Armstrong",
            "Duke Ellington",
            
            # African History and Culture
            "Ancient Egypt African civilization",
            "Kingdom of Kush",
            "Ethiopian Empire",
            "Great Zimbabwe",
            "Benin Empire",
            "Mali Empire",
            "Songhai Empire",
            "Nigerian history",
            "Ghana Empire",
            "Nubian civilization",
            
            # Caribbean History and Culture
            "Haitian Revolution",
            "Haitian independence 1804",
            "Toussaint Louverture",
            "Jean-Jacques Dessalines",
            "Jamaica history",
            "Caribbean slavery abolition",
            "Rastafari movement",
            "Trinidad and Tobago culture",
            "Barbados history",
            "Dominican Republic African heritage",
            "Puerto Rico African influence",
            "Cuban African culture",
            
            # Civil Rights and Social Movements
            "Civil Rights Movement",
            "Black Lives Matter",
            "Pan-Africanism movement",
            "Black Power movement",
            "Harlem Renaissance",
            "NAACP history",
            "Selma to Montgomery marches",
            "Montgomery Bus Boycott",
            "Little Rock Nine",
            "Freedom Riders",
            
            # Contemporary Culture
            "Black Twitter",
            "Afrofuturism movement",
            "Black Panther cultural impact",
            "African American literature",
            "Black cinema history",
            "African diaspora art",
            "Black fashion influence",
            "African American cuisine",
            "Black church tradition",
            
            # African Diaspora Communities
            "African Americans history",
            "Afro-Brazilians",
            "Afro-Cubans",
            "Afro-Caribbeans",
            "Black British history",
            "African Canadians",
            "Afro-Latinos",
            "African diaspora Europe",
            
            # Historical Events
            "Atlantic slave trade",
            "Middle Passage",
            "Underground Railroad",
            "Emancipation Proclamation",
            "Reconstruction era",
            "Jim Crow laws",
            "Tulsa Race Massacre",
            "Red Summer 1919",
            
            # Cultural Concepts
            "African retention practices",
            "Black identity formation",
            "Code-switching African American",
            "AAVE African American Vernacular English",
            "Black hair culture",
            "Soul food history",
            "Call and response tradition"

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
            'User-Agent': 'Educational Black Culture Research Bot 1.0'
        }
        
        self.collected_data = []
        self.output_dir = r"C:\Users\Administrator\myAPP\blackwiki\docs"
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Track what we've already scraped to avoid duplicates
        self.scraped_urls = set()
    
    def search_wikipedia(self, term):
        """
        Search Wikipedia with improved, specific queries
        """
        search_url = "https://en.wikipedia.org/w/api.php"
        
        params = {
            'action': 'query',
            'format': 'json',
            'list': 'search',
            'srsearch': term,
            'srlimit': 5,  # Fewer but more relevant results
            'srprop': 'snippet|titlesnippet|size|wordcount'
        }
        
        try:
            response = requests.get(search_url, params=params, headers=self.headers)
            data = response.json()
            
            if 'query' in data and 'search' in data['query']:
                results = data['query']['search']
                
                # Only process if we have results
                if results:
                    print(f"\n[{term}] Found {len(results)} articles")
                    
                    for result in results:
                        article_title = result['title']
                        # Skip if we've already scraped this article
                        if article_title not in self.scraped_urls:
                            self.scrape_wikipedia_article(article_title, term)
                            self.scraped_urls.add(article_title)
                else:
                    print(f"\n[{term}] No results found - trying alternative search")
                    # Try a broader search if the specific one fails
                    self.search_alternative_terms(term)
                    
        except Exception as e:
            print(f"Error searching for '{term}': {str(e)}")
    
    def search_alternative_terms(self, original_term):
        """
        Try alternative search strategies for better results
        """
        # Extract key words and try searching for them
        key_words = original_term.split()
        if len(key_words) > 1:
            # Try searching for the most important word
            main_word = max(key_words, key=len)
            if len(main_word) > 4:  # Skip short words
                self.search_wikipedia(main_word)
    
    def scrape_wikipedia_article(self, title, search_term):
        """
        Enhanced article scraping with better content extraction
        """
        url = f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}"
        
        # Skip if URL already processed
        if url in self.scraped_urls:
            return
            
        try:
            response = requests.get(url, headers=self.headers)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Get the main content
            content_div = soup.find('div', {'id': 'mw-content-text'})
            
            if content_div:
                # Extract infobox data if available
                infobox_data = self.extract_infobox(soup)
                
                # Get first 5 paragraphs for more context
                paragraphs = content_div.find_all('p')
                summary = ' '.join([p.get_text().strip() for p in paragraphs if p.get_text().strip()])
                
                # Clean the text
                summary = re.sub(r'\[\d+\]', '', summary)
                summary = re.sub(r'\s+', ' ', summary).strip()
                
                # Extract key dates
                dates = re.findall(r'\b(1[0-9]{3}|20[0-2][0-9])\b', summary)
                
                # Get categories
                categories = []
                cat_div = soup.find('div', {'id': 'mw-normal-catlinks'})
                if cat_div:
                    cat_links = cat_div.find_all('a')
                    categories = [link.get_text() for link in cat_links[1:]]
                
                # Extract section headers for topic overview
                section_headers = [h.get_text().strip() for h in content_div.find_all(['h2', 'h3'])[:10]]
                
                # Only save if content is substantial and relevant
                if summary and len(summary) > 200:
                    self.collected_data.append({
                        'source': 'Wikipedia',
                        'url': url,
                        'title': title,
                        'search_term': search_term,
                        'content': summary,  # no slice
                        'categories': ', '.join(categories[:10]),
                        'key_dates': ', '.join(dates[:5]) if dates else '',
                        'sections': ', '.join(section_headers[:5]),
                        'infobox': infobox_data,
                        'date_scraped': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    })
                    
                    print(f"  ✓ Scraped: {title}")
                    self.scraped_urls.add(url)
                    
        except Exception as e:
            print(f"  ✗ Error scraping '{title}': {str(e)}")
        
        time.sleep(1)
    
    def extract_infobox(self, soup):
        """
        Extract key facts from Wikipedia infoboxes
        """
        infobox = soup.find('table', {'class': 'infobox'})
        if not infobox:
            return ""
            
        facts = []
        rows = infobox.find_all('tr')
        
        for row in rows[:10]:  # First 10 facts
            header = row.find('th')
            data = row.find('td')
            
            if header and data:
                header_text = header.get_text().strip()
                data_text = data.get_text().strip()
                if header_text and data_text:
                    facts.append(f"{header_text}: {data_text}")
        
        return " | ".join(facts)
    
    def save_to_csv(self):
        """
        Save with additional fields for better data
        """
        filepath = os.path.join(self.output_dir, 'blackinfo2.csv')
        
        fieldnames = ['source', 'url', 'title', 'search_term', 'content', 
                     'categories', 'key_dates', 'sections', 'infobox', 'date_scraped']
        
        with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for row in self.collected_data:
                writer.writerow(row)
        
        print(f"\n✓ Data saved to: {filepath}")
        print(f"Total RELEVANT articles collected: {len(self.collected_data)}")
    
    def run(self):
        """
        Enhanced execution with progress tracking
        """
        print("=" * 70)
        print("IMPROVED BLACK CULTURE WEB SCRAPER")
        print("=" * 70)
        print(f"Searching for {len(self.search_terms)} specific topics...")
        print("This will capture the REAL content you're looking for!")
        print("=" * 70)
        
        # Process searches in batches with progress
        total_terms = len(self.search_terms)
        
        for i, term in enumerate(self.search_terms, 1):
            print(f"\n[{i}/{total_terms}] Searching: {term}")
            self.search_wikipedia(term)
            
            # Show progress every 10 searches
            if i % 10 == 0:
                print(f"\n--- Progress: {i}/{total_terms} searches completed ---")
                print(f"--- Articles collected so far: {len(self.collected_data)} ---")
            
            time.sleep(1.5)  # Respectful delay
        
        # Save results
        if self.collected_data:
            self.save_to_csv()
            self.generate_detailed_summary()
        else:
            print("\nNo data collected. Please check your internet connection.")
    
    def generate_detailed_summary(self):
        """
        Create a detailed summary of what was actually collected
        """
        print("\n" + "=" * 70)
        print("DETAILED COLLECTION SUMMARY")
        print("=" * 70)
        
        # Group by category
        categories = {}
        for item in self.collected_data:
            term = item['search_term']
            
            # Categorize based on search term
            if any(name in term for name in ['Mandela', 'King', 'Malcolm', 'Parks', 'Floyd']):
                cat = "Historical Figures & Activists"
            elif any(music in term for music in ['Bob Marley', 'Jazz', 'Hip hop', 'Rap', 'Blues', 'Akon']):
                cat = "Music & Musicians"
            elif any(place in term for place in ['Haiti', 'Jamaica', 'Caribbean', 'Nigeria', 'Egypt']):
                cat = "Countries & Regions"
            elif any(movement in term for movement in ['Civil Rights', 'Black Lives', 'Pan-African']):
                cat = "Social Movements"
            else:
                cat = "Culture & History"
            
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(item['title'])
        
        # Print categorized results
        for cat, titles in categories.items():
            print(f"\n{cat} ({len(titles)} articles):")
            for title in titles[:5]:  # Show first 5
                print(f"  • {title}")
            if len(titles) > 5:
                print(f"  ... and {len(titles) - 5} more")

# Additional scraper for non-Wikipedia sources
class MultiSourceBlackCultureScraper(ImprovedBlackCultureScraper):
    """
    Extended scraper that can handle multiple sources beyond Wikipedia
    """
    
    def __init__(self):
        super().__init__()
        
        # Add specific educational and cultural websites
        self.additional_sources = [
            {
                'name': 'BlackPast',
                'base_url': 'https://www.blackpast.org',
                'description': 'African American History'
            },
            {
                'name': 'JSTOR Daily',
                'search_url': 'https://daily.jstor.org/?s=',
                'topics': ['Black history', 'African diaspora']
            }
            # Add more sources as needed
        ]

if __name__ == "__main__":
    print("Starting Improved Black Culture Scraper...")
    print("This will collect information about the topics you specifically requested!")
    
    scraper = ImprovedBlackCultureScraper()
    scraper.run()
