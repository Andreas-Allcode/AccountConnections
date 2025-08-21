#!/bin/bash

# Install required Python packages
pip3 install flask flask-cors requests beautifulsoup4

# Start the LinkedIn scraper API
echo "Starting LinkedIn Scraper API..."
python3 linkedin_scraper_api.py