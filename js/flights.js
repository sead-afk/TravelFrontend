
/* ===============================
   flights.js — SPA SAFE VERSION
   =============================== */

console.log("flights.js loaded");

/* -------------------------------
   SPA INIT ENTRY POINT
-------------------------------- */
function initFlights() {
    console.log("initFlights() called");

    const flightList = document.getElementById("flight-list");
    const searchInput = document.getElementById("flight-search-input");

    // Abort if this page is not active
    if (!flightList || !searchInput) {
        console.warn("flight-list not found. flights.js aborted.");
        return;
    }

    const API_URL = `${window.API_BASE_URL}/api/flights`;

    fetch(API_URL)
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch flights");
            return res.json();
        })
        .then(flights => {
            console.log("Flights loaded:", flights);

            renderFlights(flights, flightList);

            // Search filter
            searchInput.oninput = () => {
                const term = searchInput.value.toLowerCase();
                const filtered = flights.filter(f =>
                    f.airline.toLowerCase().includes(term) ||
                    f.departure.toLowerCase().includes(term) ||
                    f.arrival.toLowerCase().includes(term)
                );
                renderFlights(filtered, flightList);
            };
        })
        .catch(err => {
            console.error(err);
            flightList.innerHTML =
                `<p class="text-danger">Failed to load flights.</p>`;
        });
}

/* -------------------------------
   RENDER FLIGHT CARDS
-------------------------------- */
function renderFlights(flights, flightList) {
    flightList.innerHTML = "";

    if (!flights.length) {
        flightList.innerHTML = "<p>No flights found.</p>";
        return;
    }

    flights.forEach(flight => {
        const card = document.createElement("div");
        card.className = "col-md-4 mb-4";

        card.innerHTML = `
            <div class="card shadow h-100">
                <div class="card-body text-center">
                    <h5 class="card-title text-primary">${flight.airline}</h5>
                    <p class="mb-1">
                        <strong>${flight.departure}</strong>
                        →
                        <strong>${flight.arrival}</strong>
                    </p>
                    <p class="text-muted">
                        ${flight.departureTime} – ${flight.arrivalTime}
                    </p>
                    <p class="font-weight-bold">${flight.price}$</p>
                </div>
            </div>
        `;

        flightList.appendChild(card);
    });
}

/* -------------------------------
   EXPOSE INIT FOR SPA ROUTER
-------------------------------- */
window.initFlights = initFlights;
