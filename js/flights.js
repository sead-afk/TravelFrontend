console.log("flights.js loaded");

async function initFlights() {
    const flightList = document.getElementById("flight-list");
    const searchInput = document.getElementById("flight-search-input");

    if (!flightList || !searchInput) {
        console.log("Flights DOM not ready, aborting");
        return;
    }

    console.log("Initializing flights page");

    try {
        const res = await fetch(`${API_BASE_URL}/api/flights`);
        const flights = await res.json();

        console.log("Flights loaded:", flights);

        renderFlights(flights);

        searchInput.oninput = () => {
            const q = searchInput.value.toLowerCase();
            renderFlights(
                flights.filter(f =>
                    f.airline.toLowerCase().includes(q) ||
                    f.departure.toLowerCase().includes(q) ||
                    f.arrival.toLowerCase().includes(q)
                )
            );
        };

    } catch (err) {
        console.error("Failed to load flights", err);
    }
}

function renderFlights(flights) {
    const flightList = document.getElementById("flight-list");
    flightList.innerHTML = "";

    flights.forEach(flight => {
        flightList.innerHTML += `
            <div class="col-md-4 mb-4">
                <div class="card shadow">
                    <div class="card-body">
                        <h5>${flight.airline}</h5>
                        <p>${flight.departure} → ${flight.arrival}</p>
                    </div>
                </div>
            </div>
        `;
    });
}
