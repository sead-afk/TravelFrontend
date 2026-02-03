

/*function sejo(event) {
    event.preventDefault();
    console.log(event);
    console.log($(event));*/
    //document.addEventListener("DOMContentLoaded", () => {
console.log("login.js loaded!");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

if (!loginForm) {
    console.error("Element with id 'loginForm' not found!");
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent form from submitting traditionally
    alert("Form submitted!"); // Debugging

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    console.log(`Email: ${email}, Password: ${password}`); // Debugging
    console.log("Payload sent to backend:", JSON.stringify({ email, password }));

    const loginUrl = `${window.API_BASE_URL}/api/auth/login`;

    try {
        const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        console.log(`Response status: ${response.status}`); // Debugging

        if (!response.ok) {
            if (response.status === 401) {
                if (loginError) loginError.textContent = "Invalid email or password.";
            } else {
                if (loginError) loginError.textContent = "An unexpected error occurred. Please try again.";
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response data:", data); // Debugging

        if (data.jwt) {
            console.log("Login successful, redirecting...");
            saveAuthData(data.jwt); // ← Use helper function

            renderAuthLinks();
            location.hash = "#flights";
        } else {
            console.error("Login response missing JWT:", data);
            if (loginError) loginError.textContent = "Login failed. No token received.";
        }
    } catch (error) {
        console.error("Error during login:", error);
        if (loginError) loginError.textContent = "Unable to connect to the server. Please try again later.";
    }
});

// OAuth2 Login Handlers
// OAuth2 Login Handlers
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

    /*if (facebookLoginBtn) {
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
    }*/
}

// Initialize on first load
setTimeout(initOAuth2Buttons, 200);


// });
//}


