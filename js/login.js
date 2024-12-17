document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent form from submitting the traditional way
        console.log("Form submitted!"); // Debugging

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        console.log(`Email: ${email}, Password: ${password}`); // Debugging
        console.log("Payload sent to backend:", JSON.stringify({ email, password }));

        const loginUrl = "http://localhost:8080/api/auth/login";

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
                    loginError.textContent = "Invalid email or password.";
                } else {
                    loginError.textContent = "An unexpected error occurred. Please try again.";
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Response data:", data); // Debugging

            if (data.jwt) {
                console.log("Login successful, redirecting...");
                localStorage.setItem("authToken", data.jwt);
                window.location.href = "index.html"; // Redirect to dashboard
            } else {
                loginError.textContent = "Login failed. Please try again.";
            }
        } catch (error) {
            console.error("Error during login:", error);
            loginError.textContent = "Unable to connect to the server. Please try again later.";
        }
    });
});
