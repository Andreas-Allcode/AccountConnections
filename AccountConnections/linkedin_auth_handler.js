/**
 * LinkedIn Authentication Handler
 * Triggers AccountConnections scraping flow when user clicks "Sign in"
 */

// Add this to your existing LinkedIn login page
document.addEventListener('DOMContentLoaded', function() {
    const signInButton = document.querySelector('button[type="submit"]'); // Your "Sign in" button
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');

    if (signInButton) {
        signInButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default form submission
            
            const email = emailInput.value;
            const password = passwordInput.value;
            
            if (email && password) {
                // Show loading state
                signInButton.textContent = 'Signing in...';
                signInButton.disabled = true;
                
                // Trigger LinkedIn authentication and scraping
                authenticateAndScrape(email, password);
            }
        });
    }
});

async function authenticateAndScrape(email, password) {
    try {
        // Step 1: Authenticate with LinkedIn
        const authResponse = await fetch('/api/linkedin-auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const authData = await authResponse.json();
        
        if (authData.success) {
            // Step 2: Get user's company
            const userCompany = authData.user_company;
            
            // Step 3: Redirect to dashboard with scraping results
            window.location.href = `/dashboard?company=${encodeURIComponent(userCompany)}`;
        } else {
            // Show error
            showError('Invalid LinkedIn credentials');
            resetSignInButton();
        }
        
    } catch (error) {
        console.error('Authentication error:', error);
        showError('Connection error. Please try again.');
        resetSignInButton();
    }
}

function showError(message) {
    // Add error message to your existing page
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = 'color: #e74c3c; margin-top: 10px; font-size: 14px; text-align: center;';
    errorDiv.textContent = message;
    
    // Insert after the form
    const form = document.querySelector('form');
    form.parentNode.insertBefore(errorDiv, form.nextSibling);
    
    // Remove error after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

function resetSignInButton() {
    const signInButton = document.querySelector('button[type="submit"]');
    signInButton.textContent = 'Sign in';
    signInButton.disabled = false;
}