#!/usr/bin/env python3
"""
LinkedIn Company Connection Scraper

After LinkedIn authentication, this module:
1. Captures the logged-in user's company
2. Searches for employees at any target company
3. Finds mutual connections and prioritizes results
4. Provides connection capabilities analysis
"""

import requests
import re
import time
import random
from typing import Dict, Any, List, Optional
from bs4 import BeautifulSoup
from urllib.parse import quote

class LinkedInCompanyConnectionScraper:
    """Scrape LinkedIn for company connections after authentication."""
    
    def __init__(self, session_cookies: Dict[str, str]):
        """Initialize with LinkedIn session cookies after auth."""
        self.session = requests.Session()
        self.session.cookies.update(session_cookies)
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive'
        })
    
    def get_user_company(self) -> str:
        """Extract the logged-in user's current company."""
        try:
            response = self.session.get('https://www.linkedin.com/in/me/')
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            current_position = self._extract_current_position(soup)
            
            return current_position.get('company', 'Unknown Company')
            
        except Exception as e:
            return 'Unknown Company'
    
    def search_company_employees(self, company_name: str, limit: int = 150) -> Dict[str, Any]:
        """Search for employees at a company with mutual connections."""
        try:
            search_url = "https://www.linkedin.com/search/results/people/"
            params = {
                'currentCompany': f'["{company_name}"]',
                'origin': 'FACETED_SEARCH',
                'start': 0
            }
            
            all_employees = []
            page = 0
            
            while len(all_employees) < limit and page < 15:
                params['start'] = page * 10
                
                response = self.session.get(search_url, params=params)
                if response.status_code != 200:
                    break
                    
                employees = self._parse_search_results(response.text)
                if not employees:
                    break
                    
                all_employees.extend(employees)
                page += 1
                time.sleep(random.uniform(1, 3))
            
            prioritized = self._prioritize_results(all_employees[:limit])
            
            return {
                'company': company_name,
                'total_found': len(prioritized),
                'employees': prioritized,
                'capabilities': self._get_capabilities()
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'company': company_name,
                'total_found': 0,
                'employees': [],
                'capabilities': self._get_capabilities()
            }
    
    def _parse_search_results(self, html: str) -> List[Dict[str, Any]]:
        """Parse LinkedIn people search results."""
        employees = []
        
        try:
            soup = BeautifulSoup(html, 'html.parser')
            result_items = soup.find_all('li', class_='reusable-search__result-container')
            
            for item in result_items:
                employee = self._extract_employee_data(item)
                if employee:
                    employees.append(employee)
                    
        except Exception:
            pass
            
        return employees
    
    def _extract_employee_data(self, item_soup) -> Optional[Dict[str, Any]]:
        """Extract employee data from search result."""
        try:
            # Name
            name_elem = item_soup.select_one('.entity-result__title-text a span[aria-hidden="true"]')
            name = name_elem.get_text().strip() if name_elem else "Unknown"
            
            # Profile URL
            profile_link = item_soup.select_one('.entity-result__title-text a')
            profile_url = profile_link.get('href') if profile_link else None
            
            # Title and Company
            subtitle_elem = item_soup.select_one('.entity-result__primary-subtitle')
            title_company = subtitle_elem.get_text().strip() if subtitle_elem else ""
            
            # Location
            location_elem = item_soup.select_one('.entity-result__secondary-subtitle')
            location = location_elem.get_text().strip() if location_elem else ""
            
            # Mutual connections
            mutual_connections = self._extract_mutual_connections(item_soup)
            
            # Connection degree
            connection_degree = self._extract_connection_degree(item_soup)
            
            return {
                'name': name,
                'title_company': title_company,
                'location': location,
                'profile_url': profile_url,
                'mutual_connections': mutual_connections,
                'connection_degree': connection_degree,
                'connection_strength': self._calculate_strength(mutual_connections, connection_degree),
                'can_message': connection_degree in ['1st', '2nd'],
                'can_connect': connection_degree in ['2nd', '3rd']
            }
            
        except Exception:
            return None
    
    def _extract_mutual_connections(self, item_soup) -> int:
        """Extract number of mutual connections."""
        try:
            mutual_elem = item_soup.select_one('.entity-result__insight')
            if mutual_elem:
                text = mutual_elem.get_text().strip()
                match = re.search(r'(\d+)\s+mutual\s+connection', text, re.IGNORECASE)
                if match:
                    return int(match.group(1))
            return 0
        except:
            return 0
    
    def _extract_connection_degree(self, item_soup) -> str:
        """Extract connection degree (1st, 2nd, 3rd)."""
        try:
            degree_elem = item_soup.select_one('.dist-value')
            if degree_elem:
                return degree_elem.get_text().strip()
            
            badge_elem = item_soup.select_one('.entity-result__badge-text')
            if badge_elem:
                text = badge_elem.get_text().strip()
                if any(deg in text for deg in ['1st', '2nd', '3rd']):
                    return text
                    
            return '3rd+'
        except:
            return '3rd+'
    
    def _calculate_strength(self, mutual_connections: int, degree: str) -> int:
        """Calculate connection strength for prioritization."""
        score = 0
        
        if degree == '1st':
            score += 100
        elif degree == '2nd':
            score += 50
        elif degree == '3rd':
            score += 10
        
        score += mutual_connections * 5
        return score
    
    def _prioritize_results(self, employees: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Sort employees by connection strength."""
        return sorted(employees, key=lambda x: x.get('connection_strength', 0), reverse=True)
    
    def _extract_current_position(self, soup: BeautifulSoup) -> Dict[str, Any]:
        """Extract current job position."""
        try:
            experience_section = soup.find('section', {'data-section': 'experience'}) or soup.find('div', id='experience')
            if not experience_section:
                return {}
            
            first_job = experience_section.find('li', class_='artdeco-list__item')
            if not first_job:
                return {}
            
            title_elem = first_job.select_one('.mr1.t-bold span[aria-hidden="true"]')
            company_elem = first_job.select_one('.t-14.t-normal span[aria-hidden="true"]')
            
            return {
                'title': title_elem.get_text().strip() if title_elem else None,
                'company': company_elem.get_text().strip() if company_elem else None
            }
        except:
            return {}
    
    def _get_capabilities(self) -> Dict[str, Any]:
        """Return scraping capabilities and limitations."""
        return {
            'can_search_company_employees': True,
            'can_find_mutual_connections': True,
            'can_get_connection_degrees': True,
            'can_prioritize_by_strength': True,
            'can_identify_messaging_capability': True,
            'can_identify_connection_capability': True,
            'limitations': [
                'LinkedIn actively blocks automated scraping',
                'Rate limiting prevents large-scale operations',
                'Full profile access requires being connected',
                'Cannot actually send messages/connections via scraping',
                'May violate LinkedIn Terms of Service',
                'Session cookies expire regularly'
            ],
            'recommendations': [
                'Use for discovery and prioritization only',
                'Redirect users to LinkedIn for actual connections',
                'Implement proper rate limiting',
                'Consider LinkedIn official APIs for production'
            ]
        } scraping',
                'Rate limiting prevents large-scale operations',
                'Full profile access requires being connected',
                'Cannot actually send messages/connections via scraping',
                'May violate LinkedIn Terms of Service',
                'Session cookies expire regularly'
            ],
            'recommendations': [
                'Use for discovery and prioritization only',
                'Redirect users to LinkedIn for actual connections',
                'Implement proper rate limiting',
                'Consider LinkedIn official APIs for production'
            ]
        }

    def generate_ui_mockup(self, search_results: Dict[str, Any], user_logged_in: bool = False) -> str:
        """Generate UI mockup showing logged-in vs logged-out experience."""
        
        mockup = []
        mockup.append("=" * 80)
        mockup.append("LINKEDIN COMPANY CONNECTION SEARCH RESULTS")
        mockup.append("=" * 80)
        mockup.append(f"Search: Employees at {search_results['company']}")
        mockup.append(f"Results: {search_results['total_found']} matches found")
        mockup.append("")
        
        if user_logged_in:
            mockup.append("🔓 LOGGED IN STATE")
            mockup.append("-" * 50)
            
            for employee in search_results['employees'][:3]:
                mockup.append(f"👤 {employee['name']} (showing)")
                mockup.append(f"   {employee['title_company']}")
                mockup.append(f"   📍 {employee['location']}")
                mockup.append(f"   🤝 {employee['mutual_connections']} connections at {search_results['company']}")
                
                # Show verified badge if applicable
                if employee.get('is_verified_account_manager'):
                    mockup.append(f"   ✅ Account Connections Verified Manager")
                
                # Active buttons
                connect_btn = "[Connect]" if employee['can_connect'] else "[Connected]"
                message_btn = "[Message]" if employee['can_message'] else "[Message*]"
                mockup.append(f"   {connect_btn} {message_btn} *active")
                mockup.append("")
        else:
            mockup.append("🔒 LOGGED OUT STATE")
            mockup.append("-" * 50)
            
            for employee in search_results['employees'][:3]:
                # Hide username when logged out
                name = employee['name']
                hidden_name = name[0] + "*" * (len(name) - 2) + name[-1] if len(name) > 2 else "***"
                
                mockup.append(f"👤 {hidden_name} (hidden)")
                mockup.append(f"   {employee['title_company']}")
                mockup.append(f"   📍 {employee['location']}")
                mockup.append(f"   🤝 {employee['mutual_connections']} connections at {search_results['company']}")
                
                # Show verified badge if applicable
                if employee.get('is_verified_account_manager'):
                    mockup.append(f"   ✅ Account Connections Verified Manager")
                
                # Buttons prompt login when logged out
                mockup.append(f"   [Connect] [Message] *prompted to login")
                mockup.append("")
        
        mockup.append("=" * 80)
        mockup.append("FEATURES:")
        mockup.append("• Logged out: Names hidden, buttons prompt login")
        mockup.append("• Logged in: Full names shown, active buttons")
        mockup.append("• Verified Account Managers show special badge")
        mockup.append("• Results prioritized by mutual connections")
        mockup.append("• Connection/Message availability based on degree")
        mockup.append("=" * 80)
        
        return "\n".join(mockup)

# Real usage example
if __name__ == "__main__":
    # Example with real LinkedIn session cookies
    # cookies = {'li_at': 'your_linkedin_cookie_here'}
    # scraper = LinkedInCompanyConnectionScraper(cookies)
    
    # Get user's company
    # user_company = scraper.get_user_company()
    # print(f"User works at: {user_company}")
    
    # Search for employees at a target company
    # results = scraper.search_company_employees('AllCode', limit=50)
    
    # Display results with UI mockup
    # print(scraper.generate_ui_mockup(results, user_logged_in=True))
    
    print("LinkedIn Company Connection Scraper")
    print("Ready to use with real LinkedIn session cookies")
    print("Uncomment the code above and add your LinkedIn cookies to test")