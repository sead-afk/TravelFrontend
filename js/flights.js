console.log("flights.js loaded");

function initFlightsPage() {
    const flightList = document.getElementById("flight-list");
    const searchInput = document.getElementById("flight-search-input");

    if (!flightList || !searchInput) {
        return;
    }

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
                        f.departureAirport.toLowerCase().includes(q) ||
                        f.arrivalAirport.toLowerCase().includes(q)
                    )
                );
            };
        } catch (err) {
            console.error("Failed to load flights", err);
        }
    }

    function renderFlights(flights) {
        flightList.innerHTML = "";

        flights.forEach(flight => {
            flightList.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card shadow h-100">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title"><i class="fas fa-plane"></i> ${flight.airline}</h5>
                            <p class="card-text"><strong>${flight.departureAirport}</strong> → <strong>${flight.arrivalAirport}</strong></p>
                            <p class="card-text text-muted">${flight.departureTime} - ${flight.arrivalTime}</p>
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

                if (typeof window.openFlightBookingModal === 'function') {
                    window.openFlightBookingModal(flightId, airline, flightNumber);
                }
            });
        });
    }

    loadFlights();
}

initFlightsPage();
$(document).on('spapp:page:loaded', initFlightsPage);