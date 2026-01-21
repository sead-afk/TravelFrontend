
document.addEventListener("DOMContentLoaded", () => {
    const flightList = document.getElementById("flight-list");
    const flightSearchInput = document.getElementById("flight-search-input");

    // Abort if we're not on the flights page
    if (!flightList) {
        console.warn("flight-list not found. flights.js aborted.");
        return;
    }

    const FLIGHT_API_URL = `${window.API_BASE_URL}/api/flights`;

    let allFlights = [];

    /* =========================
       FETCH FLIGHTS
    ========================= */
    fetch(FLIGHT_API_URL)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            allFlights = data;
            renderFlights(allFlights);
        })
        .catch(err => {
            console.error("Error fetching flight data:", err);
            flightList.innerHTML =
                `<p class="text-danger">Failed to load flights.</p>`;
        });

    /* =========================
       SEARCH
    ========================= */
    if (flightSearchInput) {
        flightSearchInput.addEventListener("input", () => {
            const term = flightSearchInput.value.toLowerCase();
            const filtered = allFlights.filter(f =>
                f.airline.toLowerCase().includes(term) ||
                f.departure.toLowerCase().includes(term) ||
                f.arrival.toLowerCase().includes(term)
            );
            renderFlights(filtered);
        });
    }

    /* =========================
       RENDER FLIGHTS
    ========================= */
    function renderFlights(flights) {
        flightList.innerHTML = "";

        if (!flights.length) {
            flightList.innerHTML = "<p>No flights found.</p>";
            return;
        }

        flights.forEach(flight => {
            const card = document.createElement("div");
            card.className = "col-md-4 mb-4";

            card.innerHTML = `
                <div class="card shadow">
                    <div class="card-body text-center">
                        <h5 class="text-primary">${flight.airline}</h5>
                        <p class="mb-1">
                            <strong>${flight.departure}</strong>
                            →
                            <strong>${flight.arrival}</strong>
                        </p>
                        <p class="text-muted">
                            ${flight.departureTime} - ${flight.arrivalTime}
                        </p>
                        <p class="font-weight-bold">$${flight.price}</p>

                        <button
                            class="btn btn-primary book-flight-btn"
                            data-flight-id="${flight.id}">
                            Book Flight
                        </button>
                    </div>
                </div>
            `;

            flightList.appendChild(card);
        });
    }

    /* =========================
       BOOK FLIGHT (PLACEHOLDER)
       (you can expand later)
    ========================= */
    flightList.addEventListener("click", e => {
        const btn = e.target.closest(".book-flight-btn");
        if (!btn) return;

        const flightId = btn.dataset.flightId;
        alert(`Flight booking not implemented yet (ID: ${flightId})`);
    });
});
