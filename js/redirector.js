/**
 * URL Redirector for EnhancedVine App
 * 
 * This script handles:
 * 1. Extracting the target_url parameter
 * 2. Redirecting to the EnhancedVine app using custom URL scheme
 * 3. Providing a fallback mechanism if the app doesn't open
 * 4. Error handling for missing parameters
 */

// DOM elements
const message = document.getElementById('message');
const details = document.getElementById('details');
const actionButton = document.getElementById('action-button');
const loader = document.getElementById('loader');

// Configuration
const APP_SCHEME = 'enhancedvine://';
const TIMEOUT_DURATION = 3000; // 3 seconds

/**
 * Initialize the redirector functionality
 */
function init() {
  try {
    // Extract target_url from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const targetUrl = urlParams.get('target_url');

    if (!targetUrl) {
      showError('No target URL provided', 'Please ensure the link is correct.');
      return;
    }

    // Log the extracted URL (for debugging)
    console.log('Target URL:', targetUrl);

    // Construct the custom scheme URL
    const encodedTargetUrl = encodeURIComponent(targetUrl);
    const appUrl = `${APP_SCHEME}open?url=${encodedTargetUrl}`;

    // Set up the fallback link
    actionButton.href = targetUrl;
    
    // Attempt to redirect to the app
    redirectToApp(appUrl, targetUrl);
  } catch (error) {
    showError('An error occurred', error.message);
    console.error('Redirection error:', error);
  }
}

/**
 * Redirect to the EnhancedVine app and handle fallback
 * @param {string} appUrl - The custom scheme URL
 * @param {string} originalUrl - The original target URL
 */
function redirectToApp(appUrl, originalUrl) {
  // Set a timeout for fallback
  const fallbackTimer = setTimeout(() => {
    showFallback(originalUrl);
  }, TIMEOUT_DURATION);

  // Attempt to redirect to the app
  try {
    window.location.href = appUrl;
  } catch (error) {
    clearTimeout(fallbackTimer);
    showFallback(originalUrl);
    console.error('App redirect error:', error);
  }
}

/**
 * Show fallback UI when app doesn't open
 * @param {string} originalUrl - The original target URL
 */
function showFallback(originalUrl) {
  // Hide the loader
  loader.style.display = 'none';
  
  // Update the message
  message.textContent = 'It seems EnhancedVine didn\'t open';
  details.textContent = 'Make sure the app is installed on your device';
  
  // Show the action button with animation
  actionButton.classList.remove('hidden');
  setTimeout(() => {
    actionButton.classList.add('visible');
  }, 10);
}

/**
 * Show error UI when something goes wrong
 * @param {string} errorTitle - The error title
 * @param {string} errorDetails - The error details
 */
function showError(errorTitle, errorDetails) {
  // Hide the loader
  loader.style.display = 'none';
  
  // Update the message with error
  message.textContent = `Error: ${errorTitle}`;
  message.classList.add('error-message');
  
  // Show error details
  details.textContent = errorDetails;
  details.classList.add('error-message');
}

// Initialize the redirector when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

// Add visibility change detection to handle when user returns to the page
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // If the user returns to this page after the timeout, show the fallback UI
    const urlParams = new URLSearchParams(window.location.search);
    const targetUrl = urlParams.get('target_url');
    
    if (targetUrl) {
      showFallback(targetUrl);
    }
  }
});