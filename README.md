# Black Culture Wikipedia Scraper v2.0

A comprehensive web scraper designed to collect, analyze, and organize information about Black culture, African history, and the African diaspora from Wikipedia.

## 🎯 Features

### Core Functionality
- **Comprehensive Coverage**: Searches 200+ specific topics including:
  - All 54 African countries
  - Caribbean nations and culture  
  - Historical figures and movements
  - Music genres and artists
  - Conflicts and social issues
  - Religious/spiritual practices

### Advanced Capabilities
- **Intelligent Content Processing**
  - NLP-based entity extraction using spaCy
  - Relevance scoring to filter unrelated content
  - Duplicate detection with fuzzy matching
  - Content categorization and theme classification

- **Media Extraction**
  - Images with captions and metadata
  - Audio files (speeches, music samples)
  - Video content
  - Gallery images

- **AI-Powered Features**
  - Article summarization using Claude (via OpenRouter)
  - Content accuracy validation
  - Auto-categorization

### Technical Improvements (v2.0)
- **Parallel Processing**: Process multiple searches simultaneously
- **Progress Tracking**: Resume capability if interrupted
- **Rate Limiting**: Respectful Wikipedia API usage
- **Configuration Support**: Customizable settings via JSON
- **Better Error Handling**: Exponential backoff and retry logic

## 📋 Requirements

```bash
pip install requests beautifulsoup4 spacy nltk
python -m spacy download en_core_web_sm
```

### Optional (for AI features)
- OpenRouter API key (set as environment variable `OPENROUTER_API_KEY`)

## 🚀 Usage

### Basic Usage
```bash
python scraper_improved.py
```

### With Configuration
1. Edit `config.json` to customize settings
2. Run the scraper

### Resume Previous Run
The scraper automatically saves progress and can resume if interrupted.

## 📁 Output Structure

```
C:\Users\Administrator\myAPP\blackwiki\
├── docs/
│   ├── blackinfo2.csv          # Main data file
│   ├── progress.json           # Progress tracking
│   ├── failed_terms.json       # Failed searches for retry
│   ├── collection_summary.json # Summary statistics
│   └── logs/                   # Detailed logs
├── media/                      # Downloaded media (if enabled)
├── config.json                 # Configuration file
└── scraper_improved.py         # Main script
```

## 📊 Data Fields

Each scraped article includes:
- **Basic Info**: URL, title, search term
- **Content**: Summary, relevant content excerpts
- **Metadata**: Categories, key dates, sections
- **Entities**: People, places, organizations, events
- **Media**: Images, audio, video counts and metadata
- **Analysis**: Relevance score, themes, auto-categories

## ⚙️ Configuration Options

### Key Settings in config.json:
- `parallel_workers`: Number of concurrent searches (default: 3)
- `rate_limit_delay`: Delay between requests in seconds (default: 1.5)
- `min_relevance_score`: Minimum score to include article (default: 0.3)
- `batch_size`: Articles to process per batch (default: 10)

## 🔧 Troubleshooting

### Common Issues:
1. **Rate Limiting**: Increase `rate_limit_delay` if getting blocked
2. **Memory Usage**: Reduce `parallel_workers` for lower memory systems
3. **Failed Terms**: Run again to automatically retry failed searches

### Performance Tips:
- Use parallel processing for faster scraping
- Adjust batch_size based on your system
- Enable progress tracking to monitor long runs

## 📈 Statistics

The scraper provides detailed statistics including:
- Total articles collected
- Articles per category
- Failed searches
- Execution time
- Media counts

## 🤝 Contributing

Improvements welcome! Key areas:
- Additional search terms
- Better relevance scoring
- More media extraction
- Additional data sources

## ⚠️ Ethical Usage

This scraper is designed for educational and research purposes. Please:
- Respect Wikipedia's terms of service
- Use appropriate rate limiting
- Credit sources appropriately
- Consider donating to Wikipedia

## 📝 License

This project is for educational purposes. Respect all applicable licenses and copyrights.

---

**Note**: The scraper handles sensitive historical topics. All content is sourced from Wikipedia and presented for educational purposes.
