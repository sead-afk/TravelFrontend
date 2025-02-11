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
        console.log("BOOKINGS: ",bookings);
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
        for (const booking of hotelBookings) {
            const hotelRow = document.createElement('tr');
            hotelRow.setAttribute("data-booking-id", booking.id || booking._id);
            const hotelResource = booking.resourceid;

            // Fetch hotel details for this booking

            const hotelResponse = await fetch(`https://spring-boot-travel-production.up.railway.app/api/hotels/${hotelResource}`);
            const hotel = await hotelResponse.json();
            //const hotel=JSON.stringify(jsonHotel);
            // Find the room in the hotel's room list using booking.details

            const room = hotel.rooms.find(r => r.id  === booking.details);
            //console.log("BOOKING ID: ",booking.details,"ROOM: ",room);
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
        }

        // After populating the tables, attach delegated event listeners
        await attachBookingActions();
    } catch (error) {
        console.error("Error loading user profile:", error);
    }
}

/**
 * Attaches event listeners for Edit and Delete actions using event delegation.
 */
async function attachBookingActions() {
    // Delegated event listener for flight bookings
    const flightBookingsContainer = document.getElementById('flight-bookings');
    if (flightBookingsContainer) {
        flightBookingsContainer.addEventListener('click', async function (event) {
            const target = event.target;
            if (target.closest('.edit-booking')) {
                const row = target.closest('tr');
                const bookingId = row.getAttribute('data-booking-id');
                await openEditBookingModal(bookingId, "FLIGHT");
            }
            if (target.closest('.delete-booking')) {
                const row = target.closest('tr');
                const bookingId = row.getAttribute('data-booking-id');
                if (confirm("Are you sure you want to delete this booking?")) {
                    await deleteBooking(bookingId, row);
                }
            }
        });
    }
    // Delegated event listener for hotel bookings
    const hotelBookingsContainer = document.getElementById('hotel-bookings');
    if (hotelBookingsContainer) {
        hotelBookingsContainer.addEventListener('click', async function (event) {
            const target = event.target;
            if (target.closest('.edit-booking')) {
                const row = target.closest('tr');
                const bookingId = row.getAttribute('data-booking-id');
                await openEditBookingModal(bookingId, "HOTEL");
            }
            if (target.closest('.delete-booking')) {
                const row = target.closest('tr');
                const bookingId = row.getAttribute('data-booking-id');
                if (confirm("Are you sure you want to delete this booking?")) {
                    await deleteBooking(bookingId, row);
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
async function deleteBooking(bookingId) {
    try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwt')}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Delete failed: ${response.status}`);
        }
        console.log('Booking deleted successfully');
        await refreshUserProfile(); // Update balance after deletion
    } catch (error) {
        console.error('Error deleting booking:', error);
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
        const response = await fetch(`https://spring-boot-travel-production.up.railway.app/api/bookings/${bookingId}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch booking details: ${response.status}`);
        }
        const booking = await response.json();

        if (type === "HOTEL") {
            // Get hotel modal elements (for HOTEL bookings)
            const bookingIdElem = document.getElementById("edit-hotel-booking-id");
            const startDateElem = document.getElementById("edit-hotel-start-date");
            const endDateElem = document.getElementById("edit-hotel-end-date");
            const amountElem = document.getElementById("edit-hotel-amount");
            const hotelDropdown = document.getElementById("edit-hotel-dropdown");
            const roomDropdown = document.getElementById("edit-room-dropdown");

            if (!bookingIdElem || !startDateElem || !endDateElem || !amountElem || !hotelDropdown || !roomDropdown) {
                throw new Error("One or more hotel modal elements not found. Please check your modal HTML.");
            }

            // Populate editable fields
            bookingIdElem.value = booking.id || booking._id;
            startDateElem.value = booking.startDate;
            endDateElem.value = booking.endDate;
            amountElem.value = booking.amount;

            // Set hotel dropdown to only display the current hotel (read-only)
            hotelDropdown.innerHTML = `<option value="${booking.resourceid}" selected>${booking.hotelName || "Current Hotel"}</option>`;
            hotelDropdown.disabled = true;

            // Load available rooms for the current hotel.
            // This function should populate roomDropdown with available rooms (plus include the current room even if unavailable)
            await loadAvailableRoomsForEdit(booking.resourceid, booking.details);
            // The room dropdown remains enabled so the user can choose a different room.

            // Attach save handler for hotel modal
            document.getElementById("save-hotel-edit").onclick = async function () {
                await submitEditBooking(booking.id || booking._id, "HOTEL");
                refreshUserProfile();
            };

            $("#editHotelBookingModal").modal("show");
        } else if (type === "FLIGHT") {
            // Get flight modal elements (for FLIGHT bookings)
            const bookingIdElem = document.getElementById("edit-flight-booking-id");
            const amountElem = document.getElementById("edit-flight-amount");
            const flightDropdown = document.getElementById("edit-flight-dropdown");
            const seatDropdown = document.getElementById("edit-seat-dropdown");

            if (!bookingIdElem || !amountElem || !flightDropdown || !seatDropdown) {
                throw new Error("One or more flight modal elements not found. Please check your modal HTML.");
            }

            bookingIdElem.value = booking.id || booking._id;
            amountElem.value = booking.amount;

            // Set flight dropdown to only display the current flight (read-only)
            flightDropdown.innerHTML = `<option value="${booking.resourceid}" selected>${booking.flightNumber || "Current Flight"}</option>`;
            flightDropdown.disabled = true;

            // Load available seats for the current flight.
            // This function should populate seatDropdown with available seats (plus include the current seat)
            await loadAvailableSeatsForEdit(booking.resourceid, booking.details);
            // The seat dropdown remains enabled.

            // Attach save handler for flight modal
            document.getElementById("save-flight-edit").onclick = async function () {
                await submitEditBooking(booking.id || booking._id, "FLIGHT");
                refreshUserProfile();
            };

            $("#editFlightBookingModal").modal("show");
        }
    } catch (error) {
        console.error("Error opening edit booking modal:", error);
        alert("Error loading booking details for editing. Please try again.");
    }
}


/**
 * Recalculates the hotel booking amount based on the selected room's price and number of days.
 */
function recalcHotelAmount() {
    const roomDropdown = document.getElementById("edit-room-dropdown");
    if (!roomDropdown || roomDropdown.selectedIndex === -1) return;
    const selectedOption = roomDropdown.options[roomDropdown.selectedIndex];
    const price = parseFloat(selectedOption.getAttribute("data-price"));
    const startDate = document.getElementById("edit-hotel-start-date").value;
    const endDate = document.getElementById("edit-hotel-end-date").value;
    if (!startDate || !endDate) return;
    const days = Math.floor((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    document.getElementById("edit-hotel-amount").value = price * days;
}

/**
 * Submits the edited booking data.
 * For HOTEL, allows editing start/end dates and room (and recalculates amount).
 * For FLIGHT, allows editing seat selection.
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
            const startDate = document.getElementById("edit-hotel-start-date").value;
            const endDate = document.getElementById("edit-hotel-end-date").value;
            const amountStr = document.getElementById("edit-hotel-amount").value;
            const roomId = document.getElementById("edit-room-dropdown").value;

            // Basic validation
            if (!startDate || !endDate) {
                alert("Please select both start and end dates.");
                return;
            }
            if (new Date(startDate) >= new Date(endDate)) {
                alert("Start date must be before the end date.");
                return;
            }
            if (isNaN(parseFloat(amountStr))) {
                alert("Invalid amount.");
                return;
            }
            if (!roomId) {
                alert("Please select a room.");
                return;
            }

            updatedBooking = {
                startDate: startDate,
                endDate: endDate,
                amount: parseFloat(amountStr),
                details: roomId
            };
        } else if (type === "FLIGHT") {
            const amountStr = document.getElementById("edit-flight-amount").value;
            const seatId = document.getElementById("edit-seat-dropdown").value;
            if (isNaN(parseFloat(amountStr))) {
                alert("Invalid amount.");
                return;
            }
            if (!seatId) {
                alert("Please select a seat.");
                return;
            }

            updatedBooking = {
                amount: parseFloat(amountStr),
                details: seatId
            };
        }

        console.log("Submitting updated booking payload:", updatedBooking);

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
        if (type === "HOTEL") {
            $("#editHotelBookingModal").modal("hide");
        } else if (type === "FLIGHT") {
            $("#editFlightBookingModal").modal("hide");
        }
        await loadUserProfile();
    } catch (error) {
        console.error("Error updating booking:", error);
        alert("Error updating booking. Please try again.");
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
            body: JSON.stringify({amount: addAmount})
        });
        if (!response.ok) {
            throw new Error("Failed to update balance.");
        }
        alert("Balance updated successfully!");
        await loadUserProfile(); // Refresh profile data to reflect updated balance
    } catch (error) {
        console.error("Error updating balance:", error);
    }
}

async function loadAvailableHotelsForEdit(currentHotelId, currentRoomId) {
    try {
        const token = localStorage.getItem("jwt");
        const hotelResponse = await fetch(`https://spring-boot-travel-production.up.railway.app/api/hotels/`, {
            headers: {"Authorization": `Bearer ${token}`}
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
        // Load available rooms for the currently selected hotel
        await loadAvailableRoomsForEdit(currentHotelId, currentRoomId);
        hotelDropdown.onchange = function () {
            loadAvailableRoomsForEdit(this.value, null);
        };
    } catch (error) {
        console.error("Error loading available hotels:", error);
    }
}

async function loadAvailableRoomsForEdit(hotelId, currentRoomId) {
    try {
        const token = localStorage.getItem("jwt");
        const roomResponse = await fetch(`https://spring-boot-travel-production.up.railway.app/api/hotels/${hotelId}/rooms`, {
            headers: {"Authorization": `Bearer ${token}`}
        });
        if (!roomResponse.ok) {
            throw new Error("Failed to fetch rooms.");
        }
        const rooms = await roomResponse.json();
        const roomDropdown = document.getElementById("edit-room-dropdown");
        roomDropdown.innerHTML = "";
        rooms.forEach(room => {
            const roomId = room.id || room._id; // Use _id if id isn't defined
            const option = document.createElement("option");
            option.value = roomId;
            option.textContent = `Room ${room.roomNumber} - $${room.pricePerNight}`;
            if (roomId === currentRoomId) {
                option.selected = true;
                recalcHotelAmount(); // Recalculate amount if needed.
            }
            option.setAttribute("data-price", room.pricePerNight);
            roomDropdown.appendChild(option);
        });
        roomDropdown.onchange = recalcHotelAmount;
    } catch (error) {
        console.error("Error loading available rooms:", error);
    }
}

/**
 * Loads available flights into the flight edit modal and then loads available seats.
 * @param {string} currentFlightId - The current flight ID for the booking.
 * @param {string|null} currentTicketId - The current ticket ID (if any).
 */
async function loadAvailableFlightsForEdit(currentFlightId, currentTicketId) {
    try {
        const token = localStorage.getItem("jwt");
        const flightResponse = await fetch(`https://spring-boot-travel-production.up.railway.app/api/flights/`, {
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
            // Use the flight ID and a display property (e.g., flightNumber)
            option.value = flight.id;
            option.textContent = flight.flightNumber;
            if (flight.id === currentFlightId) {
                option.selected = true;
            }
            flightDropdown.appendChild(option);
        });
        // Load available seats for the currently selected flight.
        await loadAvailableSeatsForEdit(currentFlightId, currentTicketId);
        // When the selected flight changes, reload available seats.
        flightDropdown.onchange = function () {
            loadAvailableSeatsForEdit(this.value, null);
        };
    } catch (error) {
        console.error("Error loading available flights:", error);
    }
}

/**
 * Loads available seats for a flight into the flight edit modal.
 * @param {string} flightId - The flight ID.
 * @param {string|null} currentTicketId - The current ticket ID (if any).
 */
async function loadAvailableSeatsForEdit(flightId, currentTicketId) {
    try {
        const token = localStorage.getItem("jwt");
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
            // Only show available seats unless it is the currently booked ticket.
            if (ticket.id !== currentTicketId) return;
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

async function refreshUserProfile() {
    try {
        const response = await fetch(`/api/users/profile`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt")}`,
            },
        });
        if (response.ok) {
            const userData = await response.json();
            document.getElementById("balance").textContent = userData.balance.toFixed(2);
        }
    } catch (error) {
        console.error("Error refreshing user profile:", error);
    }
}




