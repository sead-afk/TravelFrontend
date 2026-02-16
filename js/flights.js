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
        const departureDate = flight.departureTime ? new Date(flight.departureTime).toLocaleString() : 'N/A';
        const arrivalDate = flight.arrivalTime ? new Date(flight.arrivalTime).toLocaleString() : 'N/A';

        container.innerHTML += `
            <div class="col-md-6 mb-4">
                <div class="card shadow h-100">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h5 class="card-title mb-0">
                                <i class="fas fa-plane"></i> ${flight.airline || 'Flight'}
                            </h5>
                            <span class="badge badge-primary">${flight.flightNumber || 'N/A'}</span>
                        </div>
                        
                        <div class="mb-3">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                    <small class="text-muted">From</small>
                                    <h6 class="mb-0">${flight.origin || 'Unknown'}</h6>
                                    <small>${departureDate}</small>
                                </div>
                                <i class="fas fa-arrow-right text-primary"></i>
                                <div class="text-right">
                                    <small class="text-muted">To</small>
                                    <h6 class="mb-0">${flight.destination || 'Unknown'}</h6>
                                    <small>${arrivalDate}</small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <p class="card-text mb-1">
                                <i class="fas fa-clock text-muted"></i> 
                                <strong>Duration:</strong> ${flight.duration || 'N/A'}
                            </p>
                            <p class="card-text mb-1">
                                <i class="fas fa-dollar-sign text-success"></i> 
                                <strong>Price:</strong> $${flight.price || '0'}
                            </p>
                            ${flight.availableSeats ? `
                                <p class="card-text mb-0">
                                    <i class="fas fa-chair text-info"></i> 
                                    <strong>Available Seats:</strong> ${flight.availableSeats}
                                </p>
                            ` : ''}
                        </div>
                        
                        <button class="btn btn-primary btn-block mt-auto book-flight-btn" 
                                data-flight-id="${flight.id}" 
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
            const flightNumber = this.getAttribute('data-flight-number');

            // Call the global booking function from booking.js
            if (typeof window.openFlightBookingModal === 'function') {
                window.openFlightBookingModal(flightId, flightNumber);
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
                    (f.origin && f.origin.toLowerCase().includes(query)) ||
                    (f.destination && f.destination.toLowerCase().includes(query)) ||
                    (f.flightNumber && f.flightNumber.toLowerCase().includes(query))
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