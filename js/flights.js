console.log("flights.js loaded");

function initFlightsPage() {
    const flightList = document.getElementById("flight-list");
    const searchInput = document.getElementById("flight-search-input");

    if (!flightList || !searchInput) {
        return;
    }

    console.log("Initializing flights page");

    async function loadFlights() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/flights`);
            const flights = await res.json();

            renderFlights(flights);

            searchInput.oninput = () => {
                const q = searchInput.value.toLowerCase();
                renderFlights(
                    flights.filter(f =>
                        f.airline.toLowerCase().includes(q) ||
                        f.flightNumber.toLowerCase().includes(q) ||
                        f.departureAirport.toLowerCase().includes(q) ||
                        f.arrivalAirport.toLowerCase().includes(q)
                    )
                );
            };
        } catch (err) {
            console.error("Failed to load flights", err);
            flightList.innerHTML = '<div class="col-12"><div class="alert alert-danger">Failed to load flights.</div></div>';
        }
    }

    function renderFlights(flights) {
        flightList.innerHTML = "";

        if (flights.length === 0) {
            flightList.innerHTML = '<div class="col-12"><p class="text-center text-muted">No flights found.</p></div>';
            return;
        }

        flights.forEach(flight => {
            flightList.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card shadow h-100">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">
                                <i class="fas fa-plane"></i> ${flight.airline}
                            </h5>
                            <p class="card-text">
                                <strong>Flight:</strong> ${flight.flightNumber}
                            </p>
                            <p class="card-text">
                                <i class="fas fa-plane-departure"></i> <strong>${flight.departureAirport}</strong>
                                <br>
                                <i class="fas fa-plane-arrival"></i> <strong>${flight.arrivalAirport}</strong>
                            </p>
                            <p class="card-text text-muted">
                                <i class="fas fa-clock"></i> 
                                ${flight.departureTime} - ${flight.arrivalTime}
                            </p>
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
                }
            });
        });
    }

    loadFlights();
}

initFlightsPage();
$(document).on('spapp:page:loaded', initFlightsPage);