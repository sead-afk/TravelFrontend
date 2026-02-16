console.log("flights.js loaded");

// ============================================
// HELPER FUNCTIONS
// ============================================

function renderFlights(flights, container) {
    container.innerHTML = "";

    if (flights.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center text-muted">No flights found.</p></div>';
        return;
    }

    flights.forEach(flight => {
        // Use the correct field names from your API
        const departureTime = flight.departureTime || 'N/A';
        const arrivalTime = flight.arrivalTime || 'N/A';

        container.innerHTML += `
            <div class="col-md-4 mb-4">
                <div class="card shadow h-100">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">
                            <i class="fas fa-plane"></i> ${flight.airline || 'Unknown Airline'}
                        </h5>
                        <p class="card-text">
                            <strong>Flight:</strong> ${flight.flightNumber || 'N/A'}
                        </p>
                        <p class="card-text">
                            <i class="fas fa-plane-departure"></i> <strong>${flight.departureAirport || 'Unknown'}</strong>
                            <br>
                            <i class="fas fa-plane-arrival"></i> <strong>${flight.arrivalAirport || 'Unknown'}</strong>
                        </p>
                        <p class="card-text text-muted">
                            <i class="fas fa-clock"></i> 
                            ${departureTime} - ${arrivalTime}
                        </p>
                        ${flight.price ? `
                            <p class="card-text">
                                <strong>Price:</strong> $${flight.price}
                            </p>
                        ` : ''}
                        <button class="btn btn-primary btn-block mt-auto book-flight-btn" 
                                data-flight-id="${flight.id}" 
                                data-airline="${flight.airline}"
                                data-flight-number="${flight.flightNumber}">
                            <i class="fas fa-ticket-alt"></i> Book Flight
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    attachFlightBookingListeners();
}

function attachFlightBookingListeners() {
    const bookButtons = document.querySelectorAll('.book-flight-btn');
    bookButtons.forEach(button => {
        button.addEventListener('click', function() {
            const flightId = this.getAttribute('data-flight-id');
            const airline = this.getAttribute('data-airline');
            const flightNumber = this.getAttribute('data-flight-number');

            // Call the global booking function from booking.js
            if (typeof window.openFlightBookingModal === 'function') {
                window.openFlightBookingModal(flightId, airline, flightNumber);
            } else {
                console.error('Flight booking function not loaded');
                alert('Booking system not available. Please refresh the page.');
            }
        });
    });
}

async function loadFlights(flightList, searchInput, allFlights) {
    console.log('Loading flights from API...');

    // Show loading state
    flightList.innerHTML = '<div class="col-12 text-center"><i class="fas fa-spinner fa-spin fa-3x text-primary"></i></div>';

    try {
        // Use API helper instead of raw fetch
        const response = await API.get('/api/flights');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const flights = await response.json();
        console.log(`✅ Loaded ${flights.length} flights`);

        // Store for filtering
        allFlights.data = flights;

        // Render flights
        renderFlights(flights, flightList);

        // Setup search filter (if search input exists)
        if (searchInput) {
            searchInput.oninput = () => {
                const query = searchInput.value.toLowerCase();
                const filtered = allFlights.data.filter(f =>
                    (f.airline && f.airline.toLowerCase().includes(query)) ||
                    (f.flightNumber && f.flightNumber.toLowerCase().includes(query)) ||
                    (f.departureAirport && f.departureAirport.toLowerCase().includes(query)) ||
                    (f.arrivalAirport && f.arrivalAirport.toLowerCase().includes(query))
                );
                renderFlights(filtered, flightList);
            };
        }

    } catch (err) {
        console.error("Failed to load flights:", err);
        flightList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <h5><i class="fas fa-exclamation-triangle"></i> Failed to load flights</h5>
                    <p>${err.message}</p>
                    <button class="btn btn-sm btn-outline-danger" onclick="initFlightsPage()">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            </div>
        `;
    }
}

// ============================================
// INITIALIZATION FUNCTION
// ============================================

function initFlightsPage() {
    console.log("Initializing flights page");

    const flightList = document.getElementById("flight-list");
    const searchInput = document.getElementById("flight-search-input");

    if (!flightList) {
        console.error("Element #flight-list not found!");
        return;
    }

    if (!searchInput) {
        console.warn("Element #flight-search-input not found - search will be disabled");
    }

    // Store all flights for filtering (use object to pass by reference)
    const allFlights = { data: [] };

    // Load flights
    loadFlights(flightList, searchInput, allFlights);

    console.log("Flights page initialized");
}

// ============================================
// EXPORT
// ============================================

window.initFlightsPage = initFlightsPage;

console.log('flights.js: Exported initFlightsPage -', typeof window.initFlightsPage);