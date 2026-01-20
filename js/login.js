const API_BASE_URL = window.API_BASE_URL;

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

    const loginUrl = "${API_BASE_URL}/api/auth/login";

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
            localStorage.setItem("jwt", data.jwt); // Save token to localStorage
            console.log("JWT saved to localStorage:", localStorage.getItem("jwt")); // Verify storage

            // Call renderAuthLinks to update navbar state
            renderAuthLinks(); // This updates the navbar

            location.hash = "#flights"; // Redirect to flights page
        } else {
            console.error("Login response missing JWT:", data);
            if (loginError) loginError.textContent = "Login failed. No token received.";
        }
    } catch (error) {
        console.error("Error during login:", error);
        if (loginError) loginError.textContent = "Unable to connect to the server. Please try again later.";
    }
});




// });
//}


