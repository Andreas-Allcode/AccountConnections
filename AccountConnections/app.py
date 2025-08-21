#!/usr/bin/env python3
"""
AccountConnections Web App
Handles LinkedIn OAuth and triggers company connection scraping
"""

from flask import Flask, render_template, request, redirect, session, jsonify
import requests
from scraping import LinkedInCompanyConnectionScraper
import os

app = Flask(__name__)
app.secret_key = os.urandom(24)

@app.route('/')
def home():
    """Home page with LinkedIn login."""
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    """Handle LinkedIn login and trigger scraping."""
    email = request.form.get('email')
    password = request.form.get('password')
    
    # Simulate LinkedIn login and get session cookies
    # In production, you'd use LinkedIn OAuth API
    linkedin_cookies = simulate_linkedin_login(email, password)
    
    if linkedin_cookies:
        # Store cookies in session
        session['linkedin_cookies'] = linkedin_cookies
        session['user_email'] = email
        
        # Trigger scraping flow
        return redirect('/dashboard')
    else:
        return render_template('login.html', error="Invalid LinkedIn credentials")

@app.route('/dashboard')
def dashboard():
    """Dashboard showing company search and results."""
    if 'linkedin_cookies' not in session:
        return redirect('/')
    
    # Initialize scraper with user's LinkedIn cookies
    scraper = LinkedInCompanyConnectionScraper(session['linkedin_cookies'])
    
    # Get user's company
    user_company = scraper.get_user_company()
    
    return render_template('dashboard.html', 
                         user_company=user_company,
                         user_email=session.get('user_email'))

@app.route('/search', methods=['POST'])
def search_company():
    """Search for employees at a company."""
    if 'linkedin_cookies' not in session:
        return jsonify({'error': 'Not authenticated'})
    
    company_name = request.json.get('company_name')
    limit = request.json.get('limit', 50)
    
    # Initialize scraper
    scraper = LinkedInCompanyConnectionScraper(session['linkedin_cookies'])
    
    # Search for employees
    results = scraper.search_company_employees(company_name, limit)
    
    # Generate UI mockup for both states
    logged_out_ui = scraper.generate_ui_mockup(results, user_logged_in=False)
    logged_in_ui = scraper.generate_ui_mockup(results, user_logged_in=True)
    
    return jsonify({
        'results': results,
        'logged_out_ui': logged_out_ui,
        'logged_in_ui': logged_in_ui
    })

@app.route('/logout')
def logout():
    """Logout and clear session."""
    session.clear()
    return redirect('/')

def simulate_linkedin_login(email, password):
    """
    Simulate LinkedIn login and return session cookies.
    In production, replace with actual LinkedIn OAuth flow.
    """
    # This is a placeholder - in production you'd:
    # 1. Use LinkedIn OAuth API
    # 2. Handle the OAuth callback
    # 3. Extract session cookies from the authenticated session
    
    # For demo purposes, return mock cookies
    # Replace with real LinkedIn authentication
    if email and password:
        return {
            'li_at': 'mock_linkedin_session_cookie',
            'JSESSIONID': 'mock_session_id'
        }
    return None

if __name__ == '__main__':
    app.run(debug=True, port=5000)