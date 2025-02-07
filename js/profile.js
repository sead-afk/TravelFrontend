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
            const flightResource = booking.resourceid;

            // Fetch flight details and then append the row
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
                })
                .catch(err => console.error("Error fetching flight details:", err));
        });

        // Process and display hotel bookings
        const hotelBookings = bookings.filter(b => b.type === 'HOTEL');
        const hotelTableBody = document.getElementById('hotel-bookings');

        hotelBookings.forEach(booking => {
            const hotelResource = booking.resourceid;

            fetch(`https://spring-boot-travel-production.up.railway.app/api/hotels/${hotelResource}`)
                .then(response => response.json())
                .then(hotel => {
                    // Find the room by its id from the hotel's rooms array
                    const room = hotel.rooms.find(r => r.id === booking.details);
                    const row = `
                        <tr>
                            <td>${hotel.name}</td>
                            <td>${booking.startDate}</td>
                            <td>${booking.endDate}</td>
                            <td>${room ? room.roomNumber : 'N/A'}</td>
                            <td>${room ? room.amenities.join(', ') : 'N/A'}</td>
                            <td>${booking.amount}</td>
                        </tr>
                    `;
                    hotelTableBody.innerHTML += row;
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



