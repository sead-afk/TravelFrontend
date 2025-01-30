// Assuming the JWT token is stored in localStorage
// Fetch user info and bookings
async function loadUserProfile() {
    try {
        const token = localStorage.getItem('jwt');
        if (!token) {
            throw new Error("No token found. Please login.");
        }
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
        document.getElementById('profile-username').innerText = user.uniqueUsername;
        document.getElementById('profile-email').innerText = user.email;

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

        // Process and display flight bookings
        const flightBookings = bookings.filter(b => b.type === 'FLIGHT');
        const flightTableBody = document.getElementById('flight-bookings');
        flightBookings.forEach(booking => {
            const flightRow = document.createElement('tr');
            const flightResource = booking.resourceid;

            fetch(`https://spring-boot-travel-production.up.railway.app/api/flights/${flightResource}`)
                .then(response => response.json())
                .then(flight => {
                    const flightDetails = flight.tickets.find(ticket => ticket.id === booking.details);
                    const row = `
                        <td>${flight.flightNumber}</td>
                        <td>${flight.departureAirport}</td>
                        <td>${flight.arrivalAirport}</td>
                        <td>${flight.departureTime}</td>
                        <td>${flight.arrivalTime}</td>
                        <td>${flightDetails ? flightDetails.seatNumber : 'N/A'}</td>
                        <td>${booking.amount}</td>
                    `;
                    flightRow.innerHTML = row;
                    flightTableBody.appendChild(flightRow);
                });
        });

        // Process and display hotel bookings
        const hotelBookings = bookings.filter(b => b.type === 'HOTEL');
        const hotelTableBody = document.getElementById('hotel-bookings');

        hotelBookings.forEach(booking => {
            const hotelResource = booking.resourceid;

            fetch(`https://spring-boot-travel-production.up.railway.app/api/hotels/${hotelResource}`)
                .then(response => response.json())
                .then(hotel => {
                    const room = hotel.rooms.find(r => r.id === booking.details);
                    const row = `
                        <td>${hotel.name}</td>
                        <td>${booking.startDate}</td>
                        <td>${booking.endDate}</td>
                        <td>${room ? room.roomNumber : 'N/A'}</td>
                        <td>${room ? room.amenities.join(', ') : 'N/A'}</td>
                        <td>${booking.amount}</td>
                    `;
                    hotelTableBody.innerHTML += row;
                });
        });
    } catch (error) {
        console.error("Error loading user profile:", error);
    }
}

loadUserProfile();

