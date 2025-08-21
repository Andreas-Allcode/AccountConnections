#!/usr/bin/env python3
"""
LinkedIn Scraping API Server
Provides HTTP API for the LinkedIn Company Connection Scraper
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from scraping import LinkedInCompanyConnectionScraper
import json

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from your frontend

@app.route('/api/scrape-company', methods=['POST'])
def scrape_company():
    """API endpoint for scraping company employees."""
    try:
        data = request.get_json()
        
        # Extract parameters
        cookies = data.get('cookies', {})
        company_name = data.get('company_name')
        limit = data.get('limit', 50)
        
        if not company_name:
            return jsonify({
                'error': 'company_name is required'
            }), 400
        
        if not cookies:
            return jsonify({
                'error': 'LinkedIn cookies are required'
            }), 400
        
        # Initialize scraper with cookies
        scraper = LinkedInCompanyConnectionScraper(cookies)
        
        # Perform scraping
        results = scraper.search_company_employees(company_name, limit)
        
        if 'error' in results:
            return jsonify({
                'error': results['error'],
                'company': company_name,
                'total_found': 0,
                'employees': []
            }), 500
        
        # Return results
        return jsonify({
            'success': True,
            'company': results['company'],
            'total_found': results['total_found'],
            'employees': results['employees'],
            'capabilities': results['capabilities']
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'company': data.get('company_name', 'Unknown'),
            'total_found': 0,
            'employees': []
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'LinkedIn Scraping API',
        'version': '1.0.0'
    })

@app.route('/api/test-scraper', methods=['POST'])
def test_scraper():
    """Test endpoint with mock data."""
    try:
        data = request.get_json()
        company_name = data.get('company_name', 'Test Company')
        
        # Return mock data for testing
        mock_employees = [
            {
                'name': 'John Smith',
                'title_company': f'Senior Developer at {company_name}',
                'location': 'San Francisco, CA',
                'profile_url': 'https://linkedin.com/in/john-smith',
                'mutual_connections': 12,
                'connection_degree': '2nd',
                'connection_strength': 110,
                'can_message': True,
                'can_connect': True,
                'is_verified_account_manager': True
            },
            {
                'name': 'Sarah Johnson',
                'title_company': f'Product Manager at {company_name}',
                'location': 'New York, NY',
                'profile_url': 'https://linkedin.com/in/sarah-johnson',
                'mutual_connections': 8,
                'connection_degree': '2nd',
                'connection_strength': 90,
                'can_message': True,
                'can_connect': True,
                'is_verified_account_manager': False
            }
        ]
        
        return jsonify({
            'success': True,
            'company': company_name,
            'total_found': len(mock_employees),
            'employees': mock_employees,
            'test_mode': True
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'test_mode': True
        }), 500

if __name__ == '__main__':
    print("🚀 Starting LinkedIn Scraping API Server...")
    print("📡 Endpoints:")
    print("   POST /api/scrape-company - Real LinkedIn scraping")
    print("   POST /api/test-scraper - Test with mock data")
    print("   GET  /api/health - Health check")
    print("🌐 Server running on http://localhost:5000")
    
    app.run(debug=True, port=5000, host='0.0.0.0')