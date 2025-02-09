
// app.route('#booking', function () {
//     console.log("Route detected: booking");
//     const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
//     const type = hashParams.get('type');
//     const hotelId = hashParams.get('hotelId');
//     const hotelName = decodeURIComponent(hashParams.get('hotelName'));
//
//     console.log("Type:", type, "Hotel ID:", hotelId, "Hotel Name:", hotelName);
//
//     // Call initializeBookingForm or other functions
//     initializeBookingForm(type, hotelId, hotelName);
// });

// app.route('#booking', function () {
//     console.log("Route detected: booking");
//     const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
//     const type = hashParams.get('type');
//     const hotelId = hashParams.get('hotelId');
//     const hotelName = decodeURIComponent(hashParams.get('hotelName'));
//
//     console.log("Type:", type, "Hotel ID:", hotelId, "Hotel Name:", hotelName);
//
//     // Call initializeBookingForm or other functions
//     initializeBookingForm(type, hotelId, hotelName);
// });


// function initializeBookingForm(type, id, name) {
//     const titleElement = document.getElementById("booking-title");
//     const formElement = document.getElementById("booking-form");
//
//     if (type === "hotel") {
//         titleElement.textContent = `Book Your Stay at ${name}`;
//         loadHotelRooms(id);
//     } else {
//         console.error("Unknown booking type:", type);
//         titleElement.textContent = "Invalid Booking Type";
//         formElement.innerHTML = "<p class='text-danger'>Error: Invalid booking type.</p>";
//     }
// }
//
// // index.js
//
// // Function to handle the hash change event
// function handleHashChange() {
//     const hash = location.hash;
//
//     if (hash === "#booking") {
//         // Retrieve data from sessionStorage
//         const bookingData = JSON.parse(sessionStorage.getItem("bookingData"));
//
//         if (bookingData) {
//             const { type, hotelId, hotelName } = bookingData;
//
//             console.log("Type:", type, "Hotel ID:", hotelId, "Hotel Name:", hotelName);
//
//             // Clear the existing content
//             document.body.innerHTML = "";
//
//             // Dynamically add the booking content
//             document.body.innerHTML = `
//                 <div class="container mt-4">
//                     <h1 id="booking-title" class="mb-4">Booking for ${hotelName}</h1>
//                     <div>
//                         <p>Type: ${type}</p>
//                         <p>Hotel ID: ${hotelId}</p>
//                         <p>Hotel Name: ${hotelName}</p>
//                     </div>
//                     <form id="booking-form">
//                         <div class="form-group">
//                             <label for="name">Full Name</label>
//                             <input type="text" id="name" name="name" class="form-control" required>
//                         </div>
//                         <div class="form-group">
//                             <label for="guests">Number of Guests</label>
//                             <input type="number" id="guests" name="guests" class="form-control" min="1" max="10" required>
//                         </div>
//                         <button type="submit" class="btn btn-primary btn-block">Confirm Booking</button>
//                     </form>
//                 </div>
//             `;
//         } else {
//             console.error("No booking data found in sessionStorage.");
//         }
//     }
// }
//
// // Initialize the router
// console.log("Router initialized. Current hash:", location.hash);
// window.addEventListener("hashchange", handleHashChange);
// // Run the hash change handler once on load
// handleHashChange();

// Define renderAuthLinks function in index.js
// Define renderAuthLinks function in index.js
import { loadUserProfile, openEditBookingModal } from "./profile.js";

document.addEventListener("DOMContentLoaded", () => {
    const authLinks = document.getElementById("authLinks");
    const profileNavItem = document.getElementById("profileNavItem");

    const isLoggedIn = () => !!localStorage.getItem("jwt");

    // Attach renderAuthLinks to the window object for global access
    window.renderAuthLinks = function() {
        authLinks.innerHTML = ""; // Clear existing links

        if (isLoggedIn()) {
            profileNavItem.style.display = "block"; // Show Profile link

            const logoutItem = document.createElement("li");
            logoutItem.className = "nav-item";
            logoutItem.innerHTML = `
                <a class="nav-link" href="#" id="logoutLink">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                </a>
            `;
            authLinks.appendChild(logoutItem);

            document.getElementById("logoutLink").addEventListener("click", () => {
                localStorage.removeItem("jwt");
                localStorage.removeItem("userId");
                renderAuthLinks(); // Refresh the UI after logout
                location.hash = "#login"; // Redirect to login page
            });
        } else {
            profileNavItem.style.display = "none"; // Hide Profile link

            const loginItem = document.createElement("li");
            loginItem.className = "nav-item";
            loginItem.innerHTML = `
                <a class="nav-link" href="#login">
                    <i class="fas fa-sign-in-alt"></i>
                    <span>Login</span>
                </a>
            `;
            authLinks.appendChild(loginItem);

            const registerItem = document.createElement("li");
            registerItem.className = "nav-item";
            registerItem.innerHTML = `
                <a class="nav-link" href="#register">
                    <i class="fas fa-user-plus"></i>
                    <span>Register</span>
                </a>
            `;
            authLinks.appendChild(registerItem);
        }
    };

    renderAuthLinks(); // Call once on load to initialize the navbar

    handleRouteChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleRouteChange);
});

function handleRouteChange() {
    const currentHash = window.location.hash;

    if (currentHash === "#profile") {
        loadUserProfile();
    }
    // Additional route handling can go here for #hotels, #flights, etc.
}











