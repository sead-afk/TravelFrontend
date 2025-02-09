// profile.js

/**
 * Loads and renders the user's profile data, including their bookings.
 */
export async function loadUserProfile() {
    try {
        const token = localStorage.getItem('jwt');
        if (!token) {
            throw new Error("No token found. Please login.");
        }

        // Fetch user profile from the backend
        const userResponse = await fetch('https://spring-boot-travel-production.up.railway.app/api/users/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!userResponse.ok) {
            throw new Error("Failed to fetch user data.");
        }
        const user = await userResponse.json();

        // Populate user info (make sure these IDs exist in your profile.html)
        document.getElementById('profile-username').innerText = user.uniqueUsername;
        document.getElementById('profile-email').innerText = user.email;
        document.getElementById('balance-amount').innerText = `$${user.balance.toFixed(2)}`;

        // Attach event listener for updating balance if the button exists
        const updateBalanceBtn = document.getElementById('update-balance-btn');
        if (updateBalanceBtn) {
            updateBalanceBtn.addEventListener('click', updateUserBalance);
        } else {
            console.warn("Element 'update-balance-btn' not found. Please check your profile HTML.");
        }

        // Fetch the user's bookings
        const bookingResponse = await fetch(`https://spring-boot-travel-production.up.railway.app/api/bookings/user/${user.username}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!bookingResponse.ok) {
            throw new Error("Failed to fetch bookings.");
        }
        const bookings = await bookingResponse.json();

        // Clear existing table rows in both flight and hotel bookings tables
        const flightTableBody = document.getElementById('flight-bookings');
        const hotelTableBody = document.getElementById('hotel-bookings');
        flightTableBody.innerHTML = '';
        hotelTableBody.innerHTML = '';

        // Process and display flight bookings
        const flightBookings = bookings.filter(b => b.type === 'FLIGHT');
        flightBookings.forEach(booking => {
            const flightRow = document.createElement('tr');
            // Set data-booking-id attribute for event delegation
            flightRow.setAttribute("data-booking-id", booking.id || booking._id);
            const flightResource = booking.resourceid;

            // Fetch flight details for this booking
            fetch(`https://spring-boot-travel-production.up.railway.app/api/flights/${flightResource}`)
                .then(response => response.json())
                .then(flight => {
                    // Find the ticket that matches the booking details (seat info)
                    const flightDetails = flight.tickets.find(ticket => ticket.id === booking.details);
                    const rowHtml = `
                        <td>${flight.flightNumber}</td>
                        <td>${flight.departureAirport}</td>
                        <td>${flight.arrivalAirport}</td>
                        <td>${flight.departureTime}</td>
                        <td>${flight.arrivalTime}</td>
                        <td>${flightDetails ? flightDetails.seatNumber : 'N/A'}</td>
                        <td>${booking.amount}</td>
                        <td>
                            <button class="edit-booking btn btn-sm btn-warning">Edit</button>
                            <button class="delete-booking btn btn-sm btn-danger">Delete</button>
                        </td>
                    `;
                    flightRow.innerHTML = rowHtml;
                    flightTableBody.appendChild(flightRow);
                })
                .catch(err => console.error("Error fetching flight details:", err));
        });

        // Process and display hotel bookings
        const hotelBookings = bookings.filter(b => b.type === 'HOTEL');
        hotelBookings.forEach(booking => {
            const hotelRow = document.createElement('tr');
            hotelRow.setAttribute("data-booking-id", booking.id || booking._id);
            const hotelResource = booking.resourceid;

            // Fetch hotel details for this booking
            fetch(`https://spring-boot-travel-production.up.railway.app/api/hotels/${hotelResource}`)
                .then(response => response.json())
                .then(hotel => {
                    // Find the room in the hotel's room list using booking.details
                    const room = hotel.rooms.find(r => r.id === booking.details);
                    const rowHtml = `
                        <td>${hotel.name}</td>
                        <td>${booking.startDate}</td>
                        <td>${booking.endDate}</td>
                        <td>${room ? room.roomNumber : 'N/A'}</td>
                        <td>${room ? room.amenities.join(', ') : 'N/A'}</td>
                        <td>${booking.amount}</td>
                        <td>
                            <button class="edit-booking btn btn-sm btn-warning">Edit</button>
                            <button class="delete-booking btn btn-sm btn-danger">Delete</button>
                        </td>
                    `;
                    hotelRow.innerHTML = rowHtml;
                    hotelTableBody.appendChild(hotelRow);
                })
                .catch(err => console.error("Error fetching hotel details:", err));
        });

        // After populating the tables, attach delegated event listeners
        attachBookingActions();
    } catch (error) {
        console.error("Error loading user profile:", error);
    }
}

/**
 * Attaches event listeners for Edit and Delete actions using event delegation.
 */
function attachBookingActions() {
    // Delegated event listener for flight bookings
    const flightBookingsContainer = document.getElementById('flight-bookings');
    if (flightBookingsContainer) {
        flightBookingsContainer.addEventListener('click', function (event) {
            const target = event.target;
            if (target.closest('.edit-booking')) {
                const row = target.closest('tr');
                const bookingId = row.getAttribute('data-booking-id');
                openEditBookingModal(bookingId, "FLIGHT");
            }
            if (target.closest('.delete-booking')) {
                const row = target.closest('tr');
                const bookingId = row.getAttribute('data-booking-id');
                if (confirm("Are you sure you want to delete this booking?")) {
                    deleteBooking(bookingId, row);
                }
            }
        });
    }
    // Delegated event listener for hotel bookings
    const hotelBookingsContainer = document.getElementById('hotel-bookings');
    if (hotelBookingsContainer) {
        hotelBookingsContainer.addEventListener('click', function (event) {
            const target = event.target;
            if (target.closest('.edit-booking')) {
                const row = target.closest('tr');
                const bookingId = row.getAttribute('data-booking-id');
                openEditBookingModal(bookingId, "HOTEL");
            }
            if (target.closest('.delete-booking')) {
                const row = target.closest('tr');
                const bookingId = row.getAttribute('data-booking-id');
                if (confirm("Are you sure you want to delete this booking?")) {
                    deleteBooking(bookingId, row);
                }
            }
        });
    }
}

/**
 * Sends a DELETE request to delete a booking and removes the row from the table on success.
 * @param {string} bookingId - The ID of the booking to delete.
 * @param {HTMLElement} row - The table row element corresponding to the booking.
 */
async function deleteBooking(bookingId, row) {
    try {
        const token = localStorage.getItem("jwt");
        const response = await fetch(`https://spring-boot-travel-production.up.railway.app/api/bookings/${bookingId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`Delete failed: ${response.status}`);
        }
        alert("Booking deleted successfully");
        row.remove();
    } catch (error) {
        console.error("Error deleting booking:", error);
        alert("Error deleting booking. Please try again.");
    }
}

/**
 * Opens an edit modal for a booking.
 * @param {string} bookingId - The unique identifier for the booking.
 * @param {string} type - The booking type (e.g., "HOTEL" or "FLIGHT").
 */
export async function openEditBookingModal(bookingId, type) {
    try {
        const token = localStorage.getItem("jwt");
        if (!token) {
            alert("You must be logged in to edit a booking.");
            return;
        }

        // Fetch the booking details by bookingId from the backend
        const response = await fetch(`https://spring-boot-travel-production.up.railway.app/api/bookings/${bookingId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch booking details: ${response.status}`);
        }

        const booking = await response.json();

        // Populate the edit modal fields with the current booking data.
        // Ensure that your edit modal (with id "editBookingModal") has these input fields.
        document.getElementById("edit-booking-id").value = booking.id;
        document.getElementById("edit-start-date").value = booking.startDate;
        document.getElementById("edit-end-date").value = booking.endDate;
        document.getElementById("edit-amount").value = booking.amount;

        if (type === "HOTEL") {
            document.getElementById("edit-room-number").value = booking.details;
        } else if (type === "FLIGHT") {
            document.getElementById("edit-seat-number").value = booking.details;
        }

        // Open the edit modal (using Bootstrap's modal function)
        $("#editBookingModal").modal("show");
    } catch (error) {
        console.error("Error opening edit booking modal:", error);
        alert("Error loading booking details for editing. Please try again.");
    }
}

/**
 * Updates the user's balance by sending a request to the backend.
 */
async function updateUserBalance() {
    try {
        const token = localStorage.getItem('jwt');
        if (!token) {
            throw new Error("No token found. Please login.");
        }
        const addAmount = parseFloat(document.getElementById('add-amount').value);
        if (isNaN(addAmount) || addAmount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }
        const response = await fetch('https://spring-boot-travel-production.up.railway.app/api/users/add-funds', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount: addAmount })
        });
        if (!response.ok) {
            throw new Error("Failed to update balance.");
        }
        alert("Balance updated successfully!");
        loadUserProfile(); // Refresh profile data to reflect updated balance
    } catch (error) {
        console.error("Error updating balance:", error);
    }
}


