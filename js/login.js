

/*function sejo(event) {
    event.preventDefault();
    console.log(event);
    console.log($(event));*/
    //document.addEventListener("DOMContentLoaded", () => {


/*function initLoginPage() {
    console.log('Initializing login page...');

    // Use event delegation
    $(document).off('submit', '#loginForm');  // Remove old listeners
    $(document).on('submit', '#loginForm', async function(e) {
        e.preventDefault();

        const email = $('#email').val();
        const password = $('#password').val();

        console.log('Login attempt:', email);

        try {
            const response = await fetch(`${window.API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                saveAuthData(data.token);
                window.location.hash = '#home';
            } else {
                alert('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login.');
        }
    });

    console.log('Login form listener attached');
}

// Make available globally
window.initLoginPage = initLoginPage;*/

console.log('login.js loaded');


async function performLogin(email, password) {
    const loginUrl = `${window.API_BASE_URL}/api/auth/login`;

    console.log("Payload sent to backend:", JSON.stringify({ email, password }));

    try {
        const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        console.log(`Response status: ${response.status}`);

        if (!response.ok) {
            if (response.status === 401) {
                return { success: false, error: "Invalid email or password." };
            } else {
                return { success: false, error: "An unexpected error occurred. Please try again." };
            }
        }

        const data = await response.json();
        console.log("Response data:", data);

        if (data.jwt) {
            return { success: true, token: data.jwt };
        } else {
            console.error("Login response missing JWT:", data);
            return { success: false, error: "Login failed. No token received." };
        }
    } catch (error) {
        console.error("Error during login:", error);
        return { success: false, error: "Unable to connect to the server. Please try again later." };
    }
}

function initOAuth2Buttons() {
    console.log('Initializing OAuth2 buttons...');

    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const facebookLoginBtn = document.getElementById('facebookLoginBtn');

    console.log('Google button found:', !!googleLoginBtn);
    console.log('Facebook button found:', !!facebookLoginBtn);

    if (googleLoginBtn) {
        // Clone to remove old event listeners
        const newGoogleBtn = googleLoginBtn.cloneNode(true);
        googleLoginBtn.parentNode.replaceChild(newGoogleBtn, googleLoginBtn);

        newGoogleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Google button clicked!');
            const url = `${window.API_BASE_URL}/oauth2/authorization/google`;
            console.log('Redirecting to:', url);
            window.location.href = url;
        });
    }

    if (facebookLoginBtn) {
        // Clone to remove old event listeners
        const newFacebookBtn = facebookLoginBtn.cloneNode(true);
        facebookLoginBtn.parentNode.replaceChild(newFacebookBtn, facebookLoginBtn);

        newFacebookBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Facebook button clicked!');
            const url = `${window.API_BASE_URL}/oauth2/authorization/facebook`;
            console.log('Redirecting to:', url);
            window.location.href = url;
        });
    }
}

// ============================================
// INITIALIZATION FUNCTION (Called by SPApp)
// ============================================

function initLoginPage() {
    console.log('Initializing login page...');

    // Get form elements (NOW they exist because page is loaded)
    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");

    if (!loginForm) {
        console.error("Element with id 'loginForm' not found!");
        return;  // Exit gracefully
    }

    console.log('Login form found, attaching listener...');

    // Attach form submit handler
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        console.log("Form submitted!");

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        console.log(`Email: ${email}, Password: ${password}`);

        // Clear previous errors
        if (loginError) {
            loginError.textContent = "";
        }

        // Perform login (calls helper function)
        const result = await performLogin(email, password);

        if (result.success) {
            console.log("Login successful, redirecting...");
            saveAuthData(result.token); // Save JWT token

            // Update navbar
            if (typeof renderAuthLinks === 'function') {
                renderAuthLinks();
            }

            // Redirect to home/flights
            window.location.hash = "#hotels";
        } else {
            // Show error
            console.error("Login failed:", result.error);
            if (loginError) {
                loginError.textContent = result.error;
            }
        }
    });

    // Initialize OAuth2 buttons after a short delay
    setTimeout(initOAuth2Buttons, 100);

    console.log('Login page initialized');
}

// Make available globally
window.initLoginPage = initLoginPage;
window.initOAuth2Buttons = initOAuth2Buttons;  // Also expose this


