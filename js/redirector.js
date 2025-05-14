/**
 * URL Redirector for EnhancedVine App
 * * This script handles:
 * 1. Extracting the target_url parameter
 * 2. Preprocessing the target_url to replace '#' with a placeholder
 * 3. Redirecting to the EnhancedVine app using custom URL scheme
 * 4. Providing a fallback mechanism if the app doesn't open
 * 5. Error handling for missing parameters
 */

// DOM elements
const message = document.getElementById('message');
const details = document.getElementById('details');
const actionButton = document.getElementById('action-button');
const loader = document.getElementById('loader');

// Configuration
const APP_SCHEME = 'enhancedvine://'; // Your app's custom scheme
const HASH_PLACEHOLDER = '__HASH_SEPARATOR__'; // Must match the placeholder in your app's _layout.tsx
const TIMEOUT_DURATION = 3000; // 3 seconds

/**
 * Initialize the redirector functionality
 */
function init() {
  try {
    // Extract target_url from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    let targetUrl = urlParams.get('target_url');

    if (!targetUrl) {
      showError('No target URL provided', 'Please ensure the link is correct.');
      return;
    }

    // Log the original extracted URL (for debugging)
    console.log('Original Target URL from query param:', targetUrl);

    // Preprocess the targetUrl: Replace '#' with the placeholder
    // This is crucial for URLs that use a hash for client-side routing or parameters
    // that need to be preserved when passed to the native app.
    const processedTargetUrl = targetUrl.replace(/#/g, HASH_PLACEHOLDER);
    console.log('Processed Target URL (hash replaced with placeholder):', processedTargetUrl);

    // Encode the processed URL for use in the app scheme
    const encodedProcessedTargetUrl = encodeURIComponent(processedTargetUrl);
    
    // Construct the custom scheme URL
    // The app's _layout.tsx will expect 'url' query param and will replace HASH_PLACEHOLDER back to '#'
    const appUrl = `${APP_SCHEME}open?url=${encodedProcessedTargetUrl}`;
    console.log('Constructed App Scheme URL:', appUrl);

    // Set up the fallback link (using the original, unprocessed targetUrl)
    actionButton.href = targetUrl; 
    
    // Attempt to redirect to the app
    redirectToApp(appUrl, targetUrl); // Pass original targetUrl for fallback display
  } catch (error) {
    showError('An error occurred', error.message);
    console.error('Redirection error:', error);
  }
}

/**
 * Redirect to the EnhancedVine app and handle fallback
 * @param {string} appUrl - The custom scheme URL (with processed and encoded target)
 * @param {string} originalUrlForFallback - The original target URL for fallback display/action
 */
function redirectToApp(appUrl, originalUrlForFallback) {
  // Set a timeout for fallback
  const fallbackTimer = setTimeout(() => {
    showFallback(originalUrlForFallback);
  }, TIMEOUT_DURATION);

  // Attempt to redirect to the app
  try {
    window.location.href = appUrl;
  } catch (error) {
    clearTimeout(fallbackTimer); // Clear timer if redirect itself throws an error
    showFallback(originalUrlForFallback);
    console.error('App redirect error:', error);
  }

  // Listen for visibility change. If the user comes back to this page,
  // it likely means the app didn't open or they switched back.
  // This is a more reliable way than just blur/focus for some cases.
  document.addEventListener('visibilitychange', function onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      clearTimeout(fallbackTimer); // Clear the timeout as we got an event
      showFallback(originalUrlForFallback);
      document.removeEventListener('visibilitychange', onVisibilityChange); // Clean up listener
    }
  });

  // Some browsers might fire 'pagehide' or 'blur' when navigating away via scheme.
  // This is less reliable across all browsers/OS for scheme redirects.
  window.addEventListener('pagehide', () => {
    clearTimeout(fallbackTimer);
    // Potentially show fallback here too, but visibilitychange is often better
  });
}

/**
 * Show fallback UI when app doesn't open
 * @param {string} originalUrl - The original target URL
 */
function showFallback(originalUrl) {
  // Ensure this only runs once if called multiple times
  if (loader.style.display === 'none' && message.textContent !== 'Attempting to open in EnhancedVine...') {
    return;
  }

  // Hide the loader
  loader.style.display = 'none';
  
  // Update the message
  message.textContent = 'It seems EnhancedVine didn\'t open';
  details.textContent = 'Make sure the app is installed on your device. You can also continue to the original page:';
  
  // Update and show the action button
  actionButton.href = originalUrl; // Ensure fallback href is the original URL
  actionButton.textContent = 'Continue to Amazon'; // Or more specific text
  actionButton.classList.remove('hidden');
  setTimeout(() => {
    actionButton.classList.add('visible');
  }, 10); // Small delay for CSS transition
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

  // Optionally hide the action button or change its purpose
  actionButton.classList.add('hidden');
}

// Initialize the redirector when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
