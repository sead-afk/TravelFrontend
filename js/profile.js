// profile.js

// profile.js

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

        // Populate user info (ensure these IDs exist in your profile.html)
        document.getElementById('profile-username').innerText = user.uniqueUsername;
        document.getElementById('profile-email').innerText = user.email;
        document.getElementById('balance-amount').innerText = `$${user.balance.toFixed(2)}`;

        // Attach balance update listener if applicable
        const updateBalanceBtn = document.getElementById('update-balance-btn');
        if (updateBalanceBtn) {
            updateBalanceBtn.addEventListener('click', updateUserBalance);
        } else {
            console.warn("Element 'update-balance-btn' not found.");
        }

        // Fetch bookings for the user
        const bookingResponse = await fetch(`https://spring-boot-travel-production.up.railway.app/api/bookings/user/${user.username}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!bookingResponse.ok) {
            throw new Error("Failed to fetch bookings.");
        }
        const bookings = await bookingResponse.json();

        // Clear booking tables
        document.getElementById('flight-bookings').innerHTML = '';
        document.getElementById('hotel-bookings').innerHTML = '';

        // Process flight bookings
        const flightTableBody = document.getElementById('flight-bookings');
        const flightBookings = bookings.filter(b => b.type === 'FLIGHT');
        flightBookings.forEach(booking => {
            const flightRow = document.createElement('tr');
            flightRow.setAttribute("data-booking-id", booking.id || booking._id);
            const flightResource = booking.resourceid;

            // Fetch flight details for this booking
            fetch(`https://spring-boot-travel-production.up.railway.app/api/flights/${flightResource}`)
                .then(response => response.json())
                .then(flight => {
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

        // Process hotel bookings
        const hotelTableBody = document.getElementById('hotel-bookings');
        const hotelBookings = bookings.filter(b => b.type === 'HOTEL');
        hotelBookings.forEach(booking => {
            const hotelRow = document.createElement('tr');
            hotelRow.setAttribute("data-booking-id", booking.id || booking._id);
            const hotelResource = booking.resourceid;

            fetch(`https://spring-boot-travel-production.up.railway.app/api/hotels/${hotelResource}`)
                .then(response => response.json())
                .then(hotel => {
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

        // Attach delegated event listeners for editing and deleting bookings
        attachBookingActions();
    } catch (error) {
        console.error("Error loading user profile:", error);
    }
}

/**
 * Attaches delegated event listeners to booking tables for edit and delete buttons.
 */
function attachBookingActions() {
    // For flight bookings
    const flightBookingsContainer = document.getElementById('flight-bookings');
    flightBookingsContainer.addEventListener('click', function(event) {
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

    // For hotel bookings
    const hotelBookingsContainer = document.getElementById('hotel-bookings');
    hotelBookingsContainer.addEventListener('click', function(event) {
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

/**
 * Sends a DELETE request for a booking and removes the row upon success.
 * @param {string} bookingId - The ID of the booking to delete.
 * @param {HTMLElement} row - The table row element.
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
 * @param {string} bookingId - The unique booking ID.
 * @param {string} type - The booking type ("HOTEL" or "FLIGHT").
 */
export async function openEditBookingModal(bookingId, type) {
    try {
        const token = localStorage.getItem("jwt");
        if (!token) {
            alert("You must be logged in to edit a booking.");
            return;
        }

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

        // Populate common modal fields
        document.getElementById("edit-booking-id").value = booking.id || booking._id;
        document.getElementById("edit-start-date").value = booking.startDate;
        document.getElementById("edit-end-date").value = booking.endDate;
        document.getElementById("edit-amount").value = booking.amount;

        // Based on type, show the correct dropdown for editing room or seat
        if (type === "HOTEL") {
            document.getElementById("hotel-edit-group").style.display = "block";
            document.getElementById("flight-edit-group").style.display = "none";
            // Load hotels for editing (dropdown)
            loadAvailableHotelsForEdit(booking.resourceid, booking.details);
        } else if (type === "FLIGHT") {
            document.getElementById("hotel-edit-group").style.display = "none";
            document.getElementById("flight-edit-group").style.display = "block";
            // Load flights for editing (dropdown)
            loadAvailableFlightsForEdit(booking.resourceid, booking.details);
        }

        // Attach event listener to the save button for the edit modal
        document.getElementById("save-edit-booking").onclick = async function() {
            await submitEditBooking(booking.id || booking._id, type);
        };

        // Open the appropriate modal using Bootstrap's modal function
        if (type === "HOTEL") {
            $("#editHotelBookingModal").modal("show");
        } else if (type === "FLIGHT") {
            $("#editFlightBookingModal").modal("show");
        }
    } catch (error) {
        console.error("Error opening edit booking modal:", error);
        alert("Error loading booking details for editing. Please try again.");
    }
}

/**
 * Loads available hotels and rooms into the hotel edit modal.
 * @param {string} currentHotelId - The current hotel ID of the booking.
 * @param {string} currentRoomId - The current room ID (stored in booking.details).
 */
async function loadAvailableHotelsForEdit(currentHotelId, currentRoomId) {
    try {
        const token = localStorage.getItem("jwt");
        // Fetch available hotels (adjust URL as needed)
        const hotelResponse = await fetch(`https://spring-boot-travel-production.up.railway.app/api/hotels/available`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!hotelResponse.ok) {
            throw new Error("Failed to fetch hotels.");
        }
        const hotels = await hotelResponse.json();
        const hotelDropdown = document.getElementById("edit-hotel-dropdown");
        hotelDropdown.innerHTML = "";
        hotels.forEach(hotel => {
            const option = document.createElement("option");
            option.value = hotel.id;
            option.textContent = hotel.name;
            if (hotel.id === currentHotelId) {
                option.selected = true;
            }
            hotelDropdown.appendChild(option);
        });

        // Load rooms for the currently selected hotel
        loadAvailableRoomsForEdit(currentHotelId, currentRoomId);

        // When a different hotel is selected, reload rooms for that hotel
        hotelDropdown.onchange = function() {
            loadAvailableRoomsForEdit(this.value, null);
        };
    } catch (error) {
        console.error("Error loading available hotels:", error);
    }
}

/**
 * Loads available rooms for a specific hotel into the hotel edit modal.
 * @param {string} hotelId - The hotel ID.
 * @param {string|null} currentRoomId - The current room ID (if any).
 */
async function loadAvailableRoomsForEdit(hotelId, currentRoomId) {
    try {
        const token = localStorage.getItem("jwt");
        const roomResponse = await fetch(`https://spring-boot-travel-production.up.railway.app/api/hotels/${hotelId}/rooms`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!roomResponse.ok) {
            throw new Error("Failed to fetch rooms.");
        }
        const rooms = await roomResponse.json();
        const roomDropdown = document.getElementById("edit-room-dropdown");
        roomDropdown.innerHTML = "";
        rooms.forEach(room => {
            if (!room.availability && room.id !== currentRoomId) {
                return; // Only show available rooms, unless it's the currently booked room
            }
            const option = document.createElement("option");
            option.value = room.id;
            option.textContent = `Room ${room.roomNumber} - $${room.pricePerNight}`;
            if (room.id === currentRoomId) {
                option.selected = true;
                // Calculate amount if needed based on this room's price
                recalcHotelAmount();
            }
            option.setAttribute("data-price", room.pricePerNight);
            roomDropdown.appendChild(option);
        });

        // When room selection changes, recalc amount (if hotel dates are provided)
        roomDropdown.onchange = recalcHotelAmount;
    } catch (error) {
        console.error("Error loading available rooms:", error);
    }
}

/**
 * Loads available flights and seats into the flight edit modal.
 * @param {string} currentFlightId - The current flight ID of the booking.
 * @param {string} currentTicketId - The current ticket ID (stored in booking.details).
 */
async function loadAvailableFlightsForEdit(currentFlightId, currentTicketId) {
    try {
        const token = localStorage.getItem("jwt");
        // Fetch available flights (adjust URL as needed)
        const flightResponse = await fetch(`https://spring-boot-travel-production.up.railway.app/api/flights/available`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!flightResponse.ok) {
            throw new Error("Failed to fetch flights.");
        }
        const flights = await flightResponse.json();
        const flightDropdown = document.getElementById("edit-flight-dropdown");
        flightDropdown.innerHTML = "";
        flights.forEach(flight => {
            const option = document.createElement("option");
            option.value = flight.id;
            option.textContent = flight.flightNumber;
            if (flight.id === currentFlightId) {
                option.selected = true;
            }
            flightDropdown.appendChild(option);
        });

        // Load seats for the currently selected flight
        loadAvailableSeatsForEdit(currentFlightId, currentTicketId);

        // When a different flight is selected, reload available seats for that flight
        flightDropdown.onchange = function() {
            loadAvailableSeatsForEdit(this.value, null);
        };
    } catch (error) {
        console.error("Error loading available flights:", error);
    }
}

/**
 * Loads available seats for a specific flight into the flight edit modal.
 * @param {string} flightId - The flight ID.
 * @param {string|null} currentTicketId - The current ticket ID (if any).
 */
async function loadAvailableSeatsForEdit(flightId, currentTicketId) {
    try {
        const token = localStorage.getItem("jwt");
        // Fetch flight details (including tickets)
        const response = await fetch(`https://spring-boot-travel-production.up.railway.app/api/flights/${flightId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) {
            throw new Error("Failed to fetch flight details.");
        }
        const flight = await response.json();
        const seatDropdown = document.getElementById("edit-seat-dropdown");
        seatDropdown.innerHTML = "";
        flight.tickets.forEach(ticket => {
            // Show only available tickets, unless it's the currently booked ticket
            if (!ticket.availability && ticket.id !== currentTicketId) {
                return;
            }
            const option = document.createElement("option");
            option.value = ticket.id;
            option.textContent = `Seat ${ticket.seatNumber}`;
            if (ticket.id === currentTicketId) {
                option.selected = true;
            }
            seatDropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading available seats:", error);
    }
}

/**
 * Recalculates the hotel booking amount based on the selected room's price and the number of days.
 */
function recalcHotelAmount() {
    const roomDropdown = document.getElementById("edit-room-dropdown");
    const price = parseFloat(roomDropdown.options[roomDropdown.selectedIndex].getAttribute("data-price"));
    const startDate = document.getElementById("edit-hotel-start-date").value;
    const endDate = document.getElementById("edit-hotel-end-date").value;
    if (startDate && endDate) {
        const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        document.getElementById("edit-hotel-amount").value = price * days;
    }
}

/**
 * Submits the edited booking data.
 * @param {string} bookingId - The booking ID.
 * @param {string} type - "HOTEL" or "FLIGHT".
 */
async function submitEditBooking(bookingId, type) {
    try {
        const token = localStorage.getItem("jwt");
        if (!token) {
            alert("You must be logged in to edit a booking.");
            return;
        }
        let updatedBooking = {};
        if (type === "HOTEL") {
            updatedBooking = {
                startDate: document.getElementById("edit-hotel-start-date").value,
                endDate: document.getElementById("edit-hotel-end-date").value,
                amount: parseFloat(document.getElementById("edit-hotel-amount").value),
                // Optionally, updated details (room selection) can be captured here:
                details: document.getElementById("edit-room-dropdown").value
            };
        } else if (type === "FLIGHT") {
            updatedBooking = {
                // For flights, you might update seat selection
                amount: parseFloat(document.getElementById("edit-flight-amount").value),
                details: document.getElementById("edit-seat-dropdown").value
            };
        }
        const response = await fetch(`https://spring-boot-travel-production.up.railway.app/api/bookings/${bookingId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(updatedBooking)
        });
        if (!response.ok) {
            throw new Error(`Update failed: ${response.status}`);
        }
        alert("Booking updated successfully!");
        // Close the modal and refresh the profile data
        if (type === "HOTEL") {
            $("#editHotelBookingModal").modal("hide");
        } else if (type === "FLIGHT") {
            $("#editFlightBookingModal").modal("hide");
        }
        loadUserProfile();
    } catch (error) {
        console.error("Error updating booking:", error);
        alert("Error updating booking. Please try again.");
    }
}

/**
 * Updates the user's balance.
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
