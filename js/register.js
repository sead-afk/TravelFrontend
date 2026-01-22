console.log("register.js loaded");

function initRegister() {
    const registerForm = document.getElementById("registerForm");
    const registerError = document.getElementById("registerError");

    // 🔒 Guard: only run on register page
    if (!registerForm) {
        console.log("registerForm not found, register.js aborted");
        return;
    }

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userType = "USER";
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;
        const email = document.getElementById("email").value;
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-__+.]).{8,}$/;

        if (!passwordRegex.test(password)) {
            registerError.textContent =
                "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.";
            return;
        }

        if (password !== confirmPassword) {
            registerError.textContent = "Passwords do not match.";
            return;
        }

        try {
            const response = await fetch(
                `${window.API_BASE_URL}/api/auth/register`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userType,
                        firstName,
                        lastName,
                        email,
                        username: email,
                        password,
                        uniqueUsername: username,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Registration failed");
            }

            alert("Registration successful!");
            window.location.hash = "#login";
        } catch (err) {
            console.error(err);
            registerError.textContent = "Registration failed.";
        }
    });
}

//  SPA-safe hook
document.addEventListener("spapp:page:loaded", initRegister);

