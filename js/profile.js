// Assuming the JWT token is stored in localStorage
// Fetch user info and bookings
export async function loadUserProfile() {
    try {
        const token = localStorage.getItem('jwt');
        if (!token) {
            throw new Error("No token found. Please login.");
        }

        // Fetch user profile
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

        // Populate user info
        // (Ensure that profile.html includes elements with these IDs)
        document.getElementById('profile-username').innerText = user.uniqueUsername;
        document.getElementById('profile-email').innerText = user.email;
        document.getElementById('balance-amount').innerText = `$${user.balance.toFixed(2)}`;

        // Attach event listener for updating balance only after the element is present
        const updateBalanceBtn = document.getElementById('update-balance-btn');
        if (updateBalanceBtn) {
            updateBalanceBtn.addEventListener('click', updateUserBalance);
        } else {
            console.warn("Element 'update-balance-btn' not found. Make sure it exists in your profile HTML.");
        }

        // Fetch and display bookings
        const bookingResponse = await fetch(`https://spring-boot-travel-production.up.railway.app/api/bookings/user/${user.username}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!bookingResponse.ok) {
            throw new Error("Failed to fetch bookings.");
        }

        const bookings = await bookingResponse.json();

        // Clear existing table rows (assuming profile.html has these table bodies)
        document.getElementById('flight-bookings').innerHTML = '';
        document.getElementById('hotel-bookings').innerHTML = '';

        // Process and display flight bookings
        const flightBookings = bookings.filter(b => b.type === 'FLIGHT');
        const flightTableBody = document.getElementById('flight-bookings');
        flightBookings.forEach(booking => {
            const flightRow = document.createElement('tr');
            // Set a data attribute with the booking ID for later reference
            flightRow.setAttribute("data-booking-id", booking.id || booking._id);

            const flightResource = booking.resourceid;
            // Fetch flight details for each booking
            fetch(`https://spring-boot-travel-production.up.railway.app/api/flights/${flightResource}`)
                .then(response => response.json())
                .then(flight => {
                    const flightDetails = flight.tickets.find(ticket => ticket.id === booking.details);
                    // Build the row HTML, including an extra cell for action buttons
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

                    // Attach event listeners to the Edit and Delete buttons
                    const editBtn = flightRow.querySelector(".edit-booking");
                    const deleteBtn = flightRow.querySelector(".delete-booking");

                    editBtn.addEventListener("click", () => {
                        const bookingId = flightRow.getAttribute("data-booking-id");
                        openEditBookingModal(bookingId, "FLIGHT");
                    });

                    deleteBtn.addEventListener("click", async () => {
                        const bookingId = flightRow.getAttribute("data-booking-id");
                        if (confirm("Are you sure you want to delete this booking?")) {
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
                                flightRow.remove(); // Remove the row from the table
                            } catch (error) {
                                console.error("Error deleting booking:", error);
                                alert("Error deleting booking. Please try again.");
                            }
                        }
                    });
                })
                .catch(err => console.error("Error fetching flight details:", err));
        });


        // Process and display hotel bookings
        const hotelBookings = bookings.filter(b => b.type === 'HOTEL');
        const hotelTableBody = document.getElementById('hotel-bookings');

        hotelBookings.forEach(booking => {
            const hotelRow = document.createElement('tr');
            hotelRow.setAttribute("data-booking-id", booking.id || booking._id);

            const hotelResource = booking.resourceid;
            // Fetch hotel details for each booking
            fetch(`https://spring-boot-travel-production.up.railway.app/api/hotels/${hotelResource}`)
                .then(response => response.json())
                .then(hotel => {
                    // Find the room based on booking.details (room ID)
                    const room = hotel.rooms.find(r => r.id === booking.details);
                    // Build the row HTML with action buttons
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
                    hotelTableBody.innerHTML += hotelRow.outerHTML;

                    // After inserting into the DOM, attach event listeners
                    // Note: Because we appended using innerHTML, we need to re-select the row.
                    const insertedRow = hotelTableBody.querySelector(`tr[data-booking-id="${booking.id || booking._id}"]`);
                    if (insertedRow) {
                        const editBtn = insertedRow.querySelector(".edit-booking");
                        const deleteBtn = insertedRow.querySelector(".delete-booking");

                        editBtn.addEventListener("click", () => {
                            const bookingId = insertedRow.getAttribute("data-booking-id");
                            openEditBookingModal(bookingId, "HOTEL");
                        });

                        deleteBtn.addEventListener("click", async () => {
                            const bookingId = insertedRow.getAttribute("data-booking-id");
                            if (confirm("Are you sure you want to delete this booking?")) {
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
                                    insertedRow.remove();
                                } catch (error) {
                                    console.error("Error deleting booking:", error);
                                    alert("Error deleting booking. Please try again.");
                                }
                            }
                        });
                    }
                })
                .catch(err => console.error("Error fetching hotel details:", err));
        });

    } catch (error) {
        console.error("Error loading user profile:", error);
    }
}

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
        loadUserProfile(); // Reload the profile to reflect the updated balance
    } catch (error) {
        console.error("Error updating balance:", error);

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

        // Fetch the booking details by bookingId from your backend
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
        // Ensure that your edit modal (e.g., with id "editBookingModal") has these input fields.
        document.getElementById("edit-booking-id").value = booking.id;
        document.getElementById("edit-start-date").value = booking.startDate;
        document.getElementById("edit-end-date").value = booking.endDate;
        document.getElementById("edit-amount").value = booking.amount;

        // If the booking is of type HOTEL, you might want to populate additional fields (like room info)
        if (type === "HOTEL") {
            // For example, populate a read-only field for the room number
            document.getElementById("edit-room-number").value = booking.details; // Or fetch room details if necessary
        } else if (type === "FLIGHT") {
            // For flight bookings, populate fields such as seat number
            document.getElementById("edit-seat-number").value = booking.details; // Adjust as needed
        }

        // Open the edit modal (assuming you're using Bootstrap's modal)
        $("#editBookingModal").modal("show");
    } catch (error) {
        console.error("Error opening edit booking modal:", error);
        alert("Error loading booking details for editing. Please try again.");
    }
}




