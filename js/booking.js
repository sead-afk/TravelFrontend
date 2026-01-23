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
                option.textContent = `${room.name || room.roomNumber} - $${room.price} per night`;
                option.setAttribute('data-price', room.price);
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
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');

    if (!token || !username) {
        // 🟢 Better UX: Ask user if they want to login
        const shouldLogin = confirm(
            'You need to log in to make a booking.\n\n' +
            'Click OK to go to the login page, or Cancel to stay here.'
        );

        if (shouldLogin) {
            // Save booking details to resume later (optional)
            sessionStorage.setItem('pendingBooking', JSON.stringify({
                type: 'hotel',
                hotelId,
                hotelName,
                roomId,
                checkInDate,
                checkOutDate
            }));

            $('#bookingModal').modal('hide');
            window.location.hash = '#login';
        }
        return;
    }

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
        checkInFate: checkInDate,
        checkOutDate: checkOutDate,
        amount: totalAmount
    };

    console.log('Submitting hotel booking:', bookingData);

    // Show loading state
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/bookings/hotel`, {
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
    if (!seatSelect) return;

    seatSelect.innerHTML = "<option value=''>Loading seats...</option>";
    seatSelect.disabled = true;

    fetch(`${window.API_BASE_URL}/api/flights/${flightId}/tickets`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch seats");
            }
            return response.json();
        })
        .then(tickets => {
            seatSelect.innerHTML = "<option value=''>-- Select a seat --</option>";
            tickets.forEach(ticket => {
                if (ticket.available) {
                    const option = document.createElement("option");
                    option.value = ticket.id;
                    option.textContent = `Seat ${ticket.seatNumber} - ${ticket.seatClass} - $${ticket.price}`;
                    option.setAttribute('data-price', ticket.price);
                    seatSelect.appendChild(option);
                }
            });
            seatSelect.disabled = false;
        })
        .catch(error => {
            console.error("Error loading seats:", error);
            seatSelect.innerHTML = "<option value=''>Error loading seats</option>";
            seatSelect.disabled = true;
        });
}

function openFlightBookingModal(flightId, airline, flightNumber) {
    console.log("Opening flight booking modal for:", airline);

    document.getElementById('flightBookingModalLabel').textContent = `Book Flight: ${airline}`;
    document.getElementById('airline').textContent = `${airline} - ${flightNumber}`;

    loadFlightSeats(flightId);

    const confirmBtn = document.getElementById('confirm-flight-booking');
    confirmBtn.setAttribute('data-flight-id', flightId);
    confirmBtn.setAttribute('data-airline', airline);

    $('#flightBookingModal').modal('show');
}

async function submitFlightBooking() {
    const confirmBtn = document.getElementById('confirm-flight-booking');
    const flightId = confirmBtn.getAttribute('data-flight-id');
    const airline = confirmBtn.getAttribute('data-airline');
    const ticketId = document.getElementById('seat-select').value;

    if (!ticketId) {
        alert('Please select a seat');
        return;
    }

    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');

    if (!token || !username) {
        alert('Please log in to make a booking');
        $('#flightBookingModal').modal('hide');
        window.location.hash = '#login';
        return;
    }

    const ticketPrice = parseFloat(
        document.getElementById('seat-select')
            .selectedOptions[0]
            .getAttribute('data-price') || 0
    );

    const bookingData = {
        username: username,
        type: 'FLIGHT',
        resourceid: flightId,
        details: ticketId,
        amount: ticketPrice
    };

    console.log('Submitting flight booking:', bookingData);

    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/bookings/flight`, {
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

        alert(`Flight booking confirmed!\n\nAirline: ${airline}\nTotal: $${ticketPrice.toFixed(2)}\n\nThank you!`);

        $('#flightBookingModal').modal('hide');

    } catch (error) {
        console.error('Flight booking error:', error);
        alert(`Booking failed: ${error.message}`);
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