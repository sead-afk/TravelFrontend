console.log('auth-utils.js loaded');

/**
 * Extracts username from JWT token and saves to localStorage
 * @param {string} token - The JWT token
 */
function saveAuthData(token) {
    // Save the token
    localStorage.setItem('jwt', token);

    // Extract and save username from token
    try {
        // JWT structure: header.payload.signature
        const payloadBase64 = token.split('.')[1];
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);

        // The 'sub' claim contains the username/email
        if (payload.sub) {
            localStorage.setItem('username', payload.sub);
            console.log('Auth data saved - Username:', payload.sub);
        } else {
            console.warn('No username (sub) found in JWT token');
        }
    } catch (e) {
        console.error('Failed to parse JWT token:', e);
    }
}

/**
 * Clears all authentication data from localStorage
 */
function clearAuthData() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('authToken'); // Legacy cleanup
    console.log('Auth data cleared');
}

/**
 * Checks if user is logged in
 * @returns {boolean}
 */
function isLoggedIn() {
    const token = localStorage.getItem('jwt');
    const username = localStorage.getItem('username');
    return !!(token && username);
}

// Make functions globally available
window.saveAuthData = saveAuthData;
window.clearAuthData = clearAuthData;
window.isLoggedIn = isLoggedIn;