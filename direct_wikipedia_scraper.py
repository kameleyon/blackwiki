import requests
from bs4 import BeautifulSoup
import csv
import time
import os
from datetime import datetime

def get_wikipedia_content(article_title):
    """
    Directly fetch a specific Wikipedia article by its exact title.
    This ensures we get exactly what we want, not search results.
    """
    # Convert title to Wikipedia URL format
    url_title = article_title.replace(' ', '_')
    url = f"https://en.wikipedia.org/wiki/{url_title}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find the main content
            content_div = soup.find('div', {'id': 'mw-content-text'})
            if not content_div:
                return None
            
            # Extract the first 5 paragraphs
            paragraphs = []
            for p in content_div.find_all('p', limit=5):
                text = p.get_text().strip()
                if text and len(text) > 50:  # Skip very short paragraphs
                    # Remove citation markers [1], [2], etc.
                    text = ''.join(char for char in text if not (char == '[' or char == ']' or char.isdigit()))
                    paragraphs.append(text)
            
            content = ' '.join(paragraphs)
            
            # Get categories
            categories = []
            cat_section = soup.find('div', {'id': 'mw-normal-catlinks'})
            if cat_section:
                for link in cat_section.find_all('a')[1:6]:  # Skip first, get 5
                    categories.append(link.get_text())
            
            return {
                'url': url,
                'content': content[:2000],  # Limit to 2000 chars
                'categories': ' | '.join(categories)
            }
    except:
        pass
    
    return None

# Create comprehensive list of EXACT Wikipedia article titles
# These are the actual articles about the topics you want
wikipedia_articles = [
    # People you specifically mentioned
    "Nelson_Mandela",
    "George_Floyd",
    "Bob_Marley", 
    "Akon",
    
    # Egyptian and Ancient African Civilizations
    "Ancient_Egypt",
    "Kingdom_of_Kush",
    "Nubia",
    "African_empires",
    "Great_Zimbabwe",
    "Kingdom_of_Aksum",
    
    # Haitian History - Comprehensive
    "Haitian_Revolution",
    "Haiti",
    "Toussaint_Louverture",
    "Jean-Jacques_Dessalines",
    "History_of_Haiti",
    "Haitian_independence",
    "Slavery_in_Haiti",
    
    # Caribbean
    "Jamaica",
    "History_of_Jamaica",
    "Caribbean",
    "Reggae",
    "Rastafari",
    "Marcus_Garvey",
    "Trinidad_and_Tobago",
    "Barbados",
    "Music_of_Jamaica",
    
    # Nigeria
    "Nigeria",
    "History_of_Nigeria",
    "Yoruba_people",
    "Igbo_people",
    "Lagos",
    "Nigerian_Civil_War",
    
    # Music - Rap and Hip Hop
    "Hip_hop_music",
    "Rapping",
    "History_of_hip_hop_music",
    "Tupac_Shakur",
    "The_Notorious_B.I.G.",
    "Jay-Z",
    "Eminem",
    "Kendrick_Lamar",
    "Drake_(musician)",
    
    # Jazz and Blues
    "Jazz",
    "Blues",
    "Louis_Armstrong",
    "Duke_Ellington",
    "Miles_Davis",
    "John_Coltrane",
    "Billie_Holiday",
    "Nina_Simone",
    
    # Soul and R&B
    "Soul_music",
    "Rhythm_and_blues",
    "Aretha_Franklin",
    "James_Brown",
    "Stevie_Wonder",
    "Marvin_Gaye",
    "Michael_Jackson",
    "Prince_(musician)",
    "Whitney_Houston",
    "Beyoncé",
    
    # Civil Rights Movement
    "Martin_Luther_King_Jr.",
    "Malcolm_X",
    "Rosa_Parks",
    "Civil_rights_movement",
    "March_on_Washington",
    "Selma_to_Montgomery_marches",
    "Little_Rock_Nine",
    
    # Historical Figures
    "Harriet_Tubman",
    "Frederick_Douglass",
    "Sojourner_Truth",
    "W._E._B._Du_Bois",
    "Booker_T._Washington",
    "Marcus_Garvey",
    "Thurgood_Marshall",
    
    # Modern Movements
    "Black_Lives_Matter",
    "George_Floyd_protests",
    "Ferguson_unrest",
    "Killing_of_Trayvon_Martin",
    "1992_Los_Angeles_riots",
    
    # African Leaders
    "Kwame_Nkrumah",
    "Jomo_Kenyatta", 
    "Julius_Nyerere",
    "Thomas_Sankara",
    "Patrice_Lumumba",
    "Haile_Selassie",
    "Desmond_Tutu",
    
    # Cultural Topics
    "African-American_culture",
    "Harlem_Renaissance",
    "Black_Panther_Party",
    "Nation_of_Islam",
    "Afrofuturism",
    "African-American_Vernacular_English",
    "Soul_food",
    "Black_church",
    "Kwanzaa",
    "Juneteenth",
    
    # African Diaspora
    "African_diaspora",
    "Atlantic_slave_trade",
    "Middle_Passage",
    "Slavery_in_the_United_States",
    "Underground_Railroad",
    "Great_Migration_(African_American)",
    
    # More Musicians
    "Diana_Ross",
    "Tina_Turner",
    "Donna_Summer",
    "Lauryn_Hill",
    "Alicia_Keys",
    "Usher_(musician)",
    "Chris_Brown",
    "Rihanna",
    
    # Historical Events
    "Tulsa_race_massacre",
    "Tuskegee_Airmen",
    "Scottsboro_Boys",
    "Emmett_Till",
    "16th_Street_Baptist_Church_bombing",
    "Assassination_of_Martin_Luther_King_Jr.",
    
    # African History
    "Zulu_Kingdom",
    "Shaka",
    "Mansa_Musa",
    "Benin_Empire",
    "Ashanti_Empire",
    "Ethiopian_Empire",
    "Songhai_Empire",
    "Mali_Empire"
]

def scrape_all_articles():
    """
    Main function to scrape all the articles we need
    """
    print("="*70)
    print("TARGETED BLACK CULTURE WIKIPEDIA SCRAPER")
    print("="*70)
    print(f"Articles to scrape: {len(wikipedia_articles)}")
    print("This will get EXACTLY the topics you asked for:")
    print("- Egypt, Mandela, Akon, Bob Marley, George Floyd")
    print("- Rap music, Haiti, Nigeria, Caribbean, Jamaica")
    print("- And much more!")
    print("="*70)
    
    # Prepare data storage
    output_dir = r"C:\Users\Administrator\myAPP\blackwiki\docs"
    os.makedirs(output_dir, exist_ok=True)
    
    collected_data = []
    failed_articles = []
    
    # Process each article
    for i, article in enumerate(wikipedia_articles, 1):
        print(f"\n[{i}/{len(wikipedia_articles)}] Fetching: {article.replace('_', ' ')}")
        
        # Get the content
        result = get_wikipedia_content(article)
        
        if result:
            collected_data.append({
                'title': article.replace('_', ' '),
                'url': result['url'],
                'content': result['content'],
                'categories': result['categories'],
                'date_scraped': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })
            print(f"  SUCCESS - Got {len(result['content'])} characters")
        else:
            failed_articles.append(article)
            print(f"  FAILED - Could not fetch this article")
        
        # Progress update every 20 articles
        if i % 20 == 0:
            print(f"\n--- Progress: {i}/{len(wikipedia_articles)} articles ---")
            print(f"--- Successfully collected: {len(collected_data)} ---")
        
        # Be nice to Wikipedia's servers
        time.sleep(0.5)
    
    # Save to CSV
    print("\n" + "="*70)
    print("SAVING RESULTS...")
    
    csv_path = os.path.join(output_dir, 'complete_black_culture_data.csv')
    
    with open(csv_path, 'w', newline='', encoding='utf-8-sig') as f:
        fieldnames = ['title', 'url', 'content', 'categories', 'date_scraped']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        
        writer.writeheader()
        for row in collected_data:
            writer.writerow(row)
    
    print(f"\nSUCCESS! Data saved to: {csv_path}")
    print(f"Total articles collected: {len(collected_data)}")
    print(f"Failed articles: {len(failed_articles)}")
    
    # Create a summary file
    summary_path = os.path.join(output_dir, 'scraping_summary.txt')
    with open(summary_path, 'w', encoding='utf-8') as f:
        f.write("Black Culture Wikipedia Scraping Summary\n")
        f.write("="*50 + "\n")
        f.write(f"Date: {datetime.now()}\n")
        f.write(f"Total articles attempted: {len(wikipedia_articles)}\n")
        f.write(f"Successfully collected: {len(collected_data)}\n")
        f.write(f"Failed: {len(failed_articles)}\n\n")
        
        # List what we got
        f.write("Successfully collected articles:\n")
        for article in collected_data:
            f.write(f"- {article['title']}\n")
        
        if failed_articles:
            f.write("\nFailed articles (may need manual checking):\n")
            for article in failed_articles:
                f.write(f"- {article}\n")
    
    # Show topic breakdown
    print("\n" + "="*70)
    print("TOPICS COLLECTED:")
    
    topics = {
        'Haiti & Haitian History': 0,
        'Egypt & Ancient Africa': 0,
        'Nigeria & West Africa': 0,
        'Jamaica & Caribbean': 0,
        'Music & Musicians': 0,
        'Civil Rights & Activists': 0,
        'Other Topics': 0
    }
    
    for article in collected_data:
        title = article['title'].lower()
        if 'haiti' in title:
            topics['Haiti & Haitian History'] += 1
        elif any(x in title for x in ['egypt', 'kush', 'nubia']):
            topics['Egypt & Ancient Africa'] += 1
        elif 'nigeria' in title or 'yoruba' in title or 'igbo' in title:
            topics['Nigeria & West Africa'] += 1
        elif any(x in title for x in ['jamaica', 'caribbean', 'reggae']):
            topics['Jamaica & Caribbean'] += 1
        elif any(x in title for x in ['music', 'jazz', 'blues', 'hip hop', 'marley', 'akon']):
            topics['Music & Musicians'] += 1
        elif any(x in title for x in ['mandela', 'king', 'malcolm', 'floyd']):
            topics['Civil Rights & Activists'] += 1
        else:
            topics['Other Topics'] += 1
    
    for topic, count in topics.items():
        if count > 0:
            print(f"{topic}: {count} articles")
    
    print("\nScraping complete! Check your docs folder for the CSV file.")

if __name__ == "__main__":
    scrape_all_articles()
