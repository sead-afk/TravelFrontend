//document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const registerError = document.getElementById("registerError");

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent the form from submitting traditionally

        //const userType = document.getElementById("userType").value;
        const userType = "USER"
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const email = document.getElementById("email").value;
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // Validate passwords match
        if (password !== confirmPassword) {
            registerError.textContent = "Passwords do not match.";
            return;
        }

        const registerUrl = "http://localhost:8080/api/auth/register";

        try {
            const response = await fetch(registerUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userType, firstName, lastName, email, username, password }),
            });

            console.log(`Response status: ${response.status}`);

            if (!response.ok) {
                if (response.status === 409) {
                    const errorText = await response.text(); // Get error message from the backend
                    registerError.textContent = errorText; // Display the error
                } else {
                    registerError.textContent = "An unexpected error occurred. Please try again.";
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Response data:", data);

            alert("Registration successful! Redirecting to home...");
            location.hash = "#login";
        } catch (error) {
            console.error("Error during registration:", error);
            registerError.textContent = "Unable to connect to the server. Please try again later.";
        }
    });
//});
