//document.addEventListener("DOMContentLoaded", () => {
const flightList = document.getElementById("flight-list");
const flightSearchInput = document.getElementById("flight-search-input");

// Replace this URL with your backend API endpoint
const flightApiUrl = "https://spring-boot-travel-production.up.railway.app/api/flights/";

// Fetch the flight data
fetch(flightApiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.length === 0) {
            flightList.innerHTML = "<p>No flights found.</p>";
            return;
        }

        const flights = data;
        renderFlightCards(flights);

        // Search functionality
        flightSearchInput.addEventListener("input", function() {
            const searchQuery = flightSearchInput.value.toLowerCase();
            const filteredFlights = flights.filter(flight =>
                flight.airline.toLowerCase().includes(searchQuery) ||
                flight.departureAirport.toLowerCase().includes(searchQuery) ||
                flight.arrivalAirport.toLowerCase().includes(searchQuery)
            );
            renderFlightCards(filteredFlights);
        });
    })
    .catch(error => {
        console.error("Error fetching flight data:", error);
        flightList.innerHTML = `<p class="text-danger">Failed to load flights. Please try again later.</p>`;
    });

function renderFlightCards(flights) {
    flightList.innerHTML = ''; // Clear the current flight list
    flights.forEach(flight => {
        const card = document.createElement("div");
        card.className = "col-md-4 mb-4";

        card.innerHTML = `
        <div class="card shadow" style="border-radius: 15px; overflow: hidden; transition: transform 0.2s;">
            <div class="card-body text-center">
                <h5 class="card-title font-weight-bold text-primary">${flight.airline}</h5>
                <h6 class="card-subtitle mb-2 text-muted">${flight.departureAirport} to ${flight.arrivalAirport}</h6>
                <div class="flight-times mb-2">
                    <span class="badge badge-light">${flight.departureTime}</span>
                    <span class="badge badge-light">${flight.arrivalTime}</span>
                </div>
                <a href="javascript:void(0);" class="btn btn-primary btn-lg mt-3"
                   onclick="handleBookFlight('${flight.id}', '${flight.airline}')">
                   Book Now
                </a>
            </div>
        </div>
        `;

        flightList.appendChild(card);
    });
}

function handleBookFlight(flightId, airline) {
    console.log("Opening modal for:", flightId, airline);

    // Update modal title with the flight name
    document.getElementById("airline").textContent = `${airline}`;
    document.getElementById("airline").setAttribute("data-flight-id", flightId);

    // Fetch ticket data from the API (change the endpoint as needed)
    fetch(flightApiUrl + `${flightId}/tickets`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch tickets for flight ID ${flightId}`);
            }
            return response.json();
        })
        .then((tickets) => {
            const seatSelect = document.getElementById("seat-select");
            seatSelect.innerHTML = ""; // Clear previous options

            // Populate the destination selector with data (assuming destination options come from tickets)
            if (tickets.length > 0) {
                tickets.forEach((ticket) => {
                    const option = document.createElement("option");
                    option.value = ticket.id; // Assuming ticket has an ID
                    option.textContent = `Seat ${ticket.seatNumber} - Price: $${ticket.price}`; // Modify as necessary
                    option.setAttribute("data-price", ticket.price);
                    seatSelect.appendChild(option);
                });
            } else {
                // Handle case where no tickets are available
                const option = document.createElement("option");
                option.value = "";
                option.textContent = "No tickets available";
                seatSelect.appendChild(option);
            }

            document.getElementById("confirm-flight-booking").setAttribute("data-flight-id", flightId);
            // After loading ticket data, open the modal
            $("#flightBookingModal").modal("show");
        })
        .catch((error) => {
            console.error("Error fetching tickets:", error);
            alert("Failed to load ticket data. Please try again.");
        });
}

document.getElementById("confirm-flight-booking").addEventListener("click", async () => {
    const seatSelect = document.getElementById("seat-select");
    const ticketId = seatSelect.value;
    const pricePerTicket = parseFloat(seatSelect.options[seatSelect.selectedIndex].getAttribute("data-price"));

    // Input validation
    if (!ticketId) {
        alert("Please select a destination.");
        return;
    }

    const flightId = document.getElementById("confirm-flight-booking").getAttribute("data-flight-id"); // Assuming flight ID is stored here

    function getUsernameFromJwt() {
        const token = localStorage.getItem("jwt");
        if (!token) {
            console.error("No JWT token found in localStorage.");
            return null;
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
            console.log("Decoded JWT payload:", payload);
            return payload.username || payload.sub || null; // Adjust key based on your token structure
        } catch (error) {
            console.error("Error decoding JWT token:", error);
            return null;
        }
    }

    const username = getUsernameFromJwt();
    console.log("Retrieved username:", username);
    const token = localStorage.getItem("jwt"); // Get JWT from local storage
    if (!token) {
        alert("User is not authenticated. Please log in.");
        return;
    }

    // Create booking details object
    const bookingDetails = {
        username: username,
        resourceid: flightId,
        details: ticketId,
        type: "FLIGHT",
        amount: pricePerTicket,
    };

    console.log("Booking payload:", bookingDetails);

    let responseStatusText="";
    // Make the booking request
    try {
        const response = await fetch("https://spring-boot-travel-production.up.railway.app/api/flights/bookTicket", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(bookingDetails),
        });

        // Check for errors in the response
        if (!response.ok) {
            responseStatusText = response.statusText.length === 0 ?"" : response.statusText;
            throw new Error(`Error: ${response.status} ${response.statusText}`);

        }

        const data = await response.json(); // Parse response
        alert(`Booking confirmed! Your booking ID is: ${data.id}`);
        $("#flightBookingModal").modal("hide"); // Hide the modal on success
    } catch (error) {
        console.error("Error creating booking:", error);
        alert(responseStatusText.length === 0 ? "Error creating booking. Please try again later.":responseStatusText);
    }
});


