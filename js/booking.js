console.log("booking.js loaded");

// ============================================
// HOTEL BOOKING FUNCTIONS
// ============================================

function loadHotelRooms(hotelId) {
    const roomSelect = document.getElementById("room-select");
    if (!roomSelect) return;

    roomSelect.innerHTML = "<option value=''>Loading rooms...</option>";
    roomSelect.disabled = true;

    fetch(`${window.API_BASE_URL}/api/hotels/${hotelId}/rooms`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch rooms");
            }
            return response.json();
        })
        .then(rooms => {
            roomSelect.innerHTML = "<option value=''>-- Select a room --</option>";
            rooms.forEach(room => {
                const option = document.createElement("option");
                option.value = room.id;
                option.textContent = `${room.name || room.roomNumber} - $${room.pricePerNight} per night`;
                option.setAttribute('data-price', room.pricePerNight);
                roomSelect.appendChild(option);
            });
            roomSelect.disabled = false;
        })
        .catch(error => {
            console.error("Error loading rooms:", error);
            roomSelect.innerHTML = "<option value=''>Error loading rooms</option>";
            roomSelect.disabled = true;
        });
}

function openHotelBookingModal(hotelId, hotelName) {
    console.log("Opening booking modal for:", hotelName);

    // Get modal elements
    const modalTitle = document.getElementById('bookingModalLabel');
    const modalHotelName = document.getElementById('modal-hotel-name'); // 🟢 Add this
    const confirmBtn = document.getElementById('confirm-booking');
    const checkInInput = document.getElementById('check-in-date');
    const checkOutInput = document.getElementById('check-out-date');

    // Verify critical elements exist
    if (!modalTitle || !confirmBtn) {
        console.error('Critical modal elements missing!');
        alert('Booking modal not ready. Please refresh the page.');
        return;
    }

    // Set the modal title
    modalTitle.textContent = `Book Your Stay at ${hotelName}`;

    // 🟢 Set the hotel name in the modal body
    if (modalHotelName) {
        modalHotelName.innerHTML = `<strong>Hotel:</strong> ${hotelName}`;
    }

    // Load rooms for the selected hotel
    loadHotelRooms(hotelId);

    // Store hotel info for form submission
    confirmBtn.setAttribute('data-hotel-id', hotelId);
    confirmBtn.setAttribute('data-hotel-name', hotelName);

    // Set date constraints
    if (checkInInput && checkOutInput) {
        const today = new Date().toISOString().split('T')[0];
        checkInInput.setAttribute('min', today);
        checkOutInput.setAttribute('min', today);
        checkInInput.value = '';
        checkOutInput.value = '';
    }

    // Show the modal
    $('#bookingModal').modal('show');
}

async function submitHotelBooking() {
    const confirmBtn = document.getElementById('confirm-booking');
    const hotelId = confirmBtn.getAttribute('data-hotel-id');
    const hotelName = confirmBtn.getAttribute('data-hotel-name');
    const roomId = document.getElementById('room-select').value;
    const checkInDate = document.getElementById('check-in-date').value;
    const checkOutDate = document.getElementById('check-out-date').value;

    // Validation
    if (!roomId) {
        alert('Please select a room');
        return;
    }
    if (!checkInDate || !checkOutDate) {
        alert('Please select check-in and check-out dates');
        return;
    }
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
        alert('Check-out date must be after check-in date');
        return;
    }

    // Check authentication
    if (!isLoggedIn()) {
        const shouldLogin = confirm(
            'You need to log in to make a booking.\n\n' +
            'Click OK to go to the login page, or Cancel to stay here.'
        );

        if (shouldLogin) {
            // ... save pending booking
            $('#bookingModal').modal('hide');
            window.location.hash = '#login';
        }
        return;
    }

// User is logged in, get credentials
    const token = localStorage.getItem('jwt');
    const username = localStorage.getItem('username');

    // Calculate total amount
    const roomPrice = parseFloat(
        document.getElementById('room-select')
            .selectedOptions[0]
            .getAttribute('data-price') || 0
    );
    const days = Math.ceil(
        (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
    );
    const totalAmount = roomPrice * days;

    // Prepare booking data
    const bookingData = {
        username: username,
        type: 'HOTEL',
        resourceid: hotelId,
        details: roomId,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        amount: totalAmount
    };

    console.log('Submitting hotel booking:', bookingData);

    // Show loading state
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/bookings/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create booking');
        }

        const result = await response.json();
        console.log('Booking successful:', result);

        // Success!
        alert(`Booking confirmed!\n\nHotel: ${hotelName}\nTotal: $${totalAmount.toFixed(2)}\n\nThank you for your booking!`);

        $('#bookingModal').modal('hide');

    } catch (error) {
        console.error('Booking error:', error);
        alert(`Booking failed: ${error.message}\n\nPlease try again.`);
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="fas fa-check"></i> Confirm Booking';
    }
}

// ============================================
// FLIGHT BOOKING FUNCTIONS
// ============================================

function loadFlightSeats(flightId) {
    const seatSelect = document.getElementById("seat-select");
    if (!seatSelect) {
        console.error('seat-select element not found');
        return;
    }

    console.log('Loading seats for flight:', flightId);
    seatSelect.innerHTML = "<option value=''>Loading seats...</option>";
    seatSelect.disabled = true;

    // Try fetching the flight first, then get tickets from it
    fetch(`${window.API_BASE_URL}/api/flights/${flightId}`)
        .then(response => {
            console.log('Flight fetch response:', response);
            if (!response.ok) {
                throw new Error("Failed to fetch flight");
            }
            return response.json();
        })
        .then(flight => {
            console.log('Flight data received:', flight);

            // Check if tickets exist on the flight object
            if (!flight.tickets || !Array.isArray(flight.tickets)) {
                throw new Error("No tickets found for this flight");
            }

            seatSelect.innerHTML = "<option value=''>-- Select a seat --</option>";

            let availableSeats = 0;
            flight.tickets.forEach(ticket => {
                // Only show available seats
                if (ticket.available !== false) {
                    const option = document.createElement("option");
                    option.value = ticket.id;
                    option.textContent = `Seat ${ticket.seatNumber} - ${ticket.seatClass || 'Economy'} - $${ticket.price}`;
                    option.setAttribute('data-price', ticket.price);
                    seatSelect.appendChild(option);
                    availableSeats++;
                }
            });

            console.log(`Loaded ${availableSeats} available seats`);

            if (availableSeats === 0) {
                seatSelect.innerHTML = "<option value=''>No seats available</option>";
                seatSelect.disabled = true;
            } else {
                seatSelect.disabled = false;
            }
        })
        .catch(error => {
            console.error("Error loading seats:", error);
            seatSelect.innerHTML = "<option value=''>Error loading seats</option>";
            seatSelect.disabled = true;
        });
}

function openFlightBookingModal(flightId, airline, flightNumber) {
    console.log("Opening flight booking modal for:", airline);

    // Get modal elements
    const modalTitle = document.getElementById('flightBookingModalLabel');
    const modalFlightInfo = document.getElementById('modal-flight-info');
    const confirmBtn = document.getElementById('confirm-flight-booking');

    // Verify critical elements exist
    if (!modalTitle || !confirmBtn) {
        console.error('Critical flight modal elements missing!');
        alert('Flight booking modal not ready. Please refresh the page.');
        return;
    }

    // Set the modal title
    modalTitle.textContent = `Book Flight: ${airline}`;

    // 🟢 Set flight info - same format as hotel
    if (modalFlightInfo) {
        modalFlightInfo.innerHTML = `<strong>Flight:</strong> ${airline} ${flightNumber}`;
    }

    // Load seats for the selected flight
    loadFlightSeats(flightId);

    // Store flight info for form submission
    confirmBtn.setAttribute('data-flight-id', flightId);
    confirmBtn.setAttribute('data-airline', airline);
    confirmBtn.setAttribute('data-flight-number', flightNumber);

    // Show the modal
    $('#flightBookingModal').modal('show');
}

async function submitFlightBooking() {
    const confirmBtn = document.getElementById('confirm-flight-booking');
    const flightId = confirmBtn.getAttribute('data-flight-id');
    const airline = confirmBtn.getAttribute('data-airline');
    const flightNumber = confirmBtn.getAttribute('data-flight-number');
    const ticketId = document.getElementById('seat-select').value;

    // Validation
    if (!ticketId) {
        alert('Please select a seat');
        return;
    }

    // Check authentication
    if (!isLoggedIn()) {
        const shouldLogin = confirm(
            'You need to log in to make a booking.\n\n' +
            'Click OK to go to the login page, or Cancel to stay here.'
        );

        if (shouldLogin) {
            // ... save pending booking
            $('#bookingModal').modal('hide');
            window.location.hash = '#login';
        }
        return;
    }

// User is logged in, get credentials
    const token = localStorage.getItem('jwt');
    const username = localStorage.getItem('username');

    // Get ticket price
    const ticketPrice = parseFloat(
        document.getElementById('seat-select')
            .selectedOptions[0]
            .getAttribute('data-price') || 0
    );

    // Prepare booking data
    const bookingData = {
        username: username,
        type: 'FLIGHT',
        resourceid: flightId,
        details: ticketId,
        amount: ticketPrice
    };

    console.log('Submitting flight booking:', bookingData);

    // Show loading state
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/bookings/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create booking');
        }

        const result = await response.json();
        console.log('Flight booking successful:', result);

        // Success!
        alert(
            `Flight booking confirmed!\n\n` +
            `Flight: ${airline} ${flightNumber}\n` +
            `Total: $${ticketPrice.toFixed(2)}\n\n` +
            `Thank you for your booking!`
        );

        $('#flightBookingModal').modal('hide');

    } catch (error) {
        console.error('Flight booking error:', error);
        alert(`Booking failed: ${error.message}\n\nPlease try again.`);
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="fas fa-check"></i> Confirm Booking';
    }
}

// ============================================
// INITIALIZE EVENT LISTENERS
// ============================================

function initializeBookingListeners() {
    // Hotel booking confirmation
    const hotelConfirmBtn = document.getElementById('confirm-booking');
    if (hotelConfirmBtn) {
        hotelConfirmBtn.onclick = submitHotelBooking;
    }

    // Flight booking confirmation
    const flightConfirmBtn = document.getElementById('confirm-flight-booking');
    if (flightConfirmBtn) {
        flightConfirmBtn.onclick = submitFlightBooking;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeBookingListeners);

// Also initialize on SPA page load
$(document).on('spapp:page:loaded', initializeBookingListeners);

// Make functions globally available
window.openHotelBookingModal = openHotelBookingModal;
window.openFlightBookingModal = openFlightBookingModal;