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

        console.log("Password:", password);
        console.log("Confirm Password:", confirmPassword);

        // Strong password regex
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        // Validate password strength
        if (!passwordRegex.test(password)) {
            registerError.textContent = "Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.";
            return;
        }

        // Validate passwords match
        if (password !== confirmPassword) {
            registerError.textContent = "Passwords do not match.";
            return;
        }

        const registerUrl = "https://spring-boot-travel-production.up.railway.app/api/auth/register";
        const bodyJson= JSON.stringify(
            { userType:userType,
                firstName:firstName,
                lastName: lastName,
                email:email,
                username: email,
                password: password,
                uniqueUsername: username
        });

        try {
            const response = await fetch(registerUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: bodyJson,
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
