console.log("hotels.js loaded");

async function initHotels() {
    const hotelList = document.getElementById("hotel-list");
    const searchInput = document.getElementById("hotel-search-input");

    if (!hotelList || !searchInput) {
        console.log("Hotels DOM not ready, aborting");
        return;
    }

    console.log("Initializing hotels page");

    try {
        const res = await fetch(`${API_BASE_URL}/api/hotels`);
        const hotels = await res.json();

        console.log("Hotels loaded:", hotels);

        renderHotels(hotels);

        searchInput.oninput = () => {
            const q = searchInput.value.toLowerCase();
            renderHotels(
                hotels.filter(h =>
                    h.name.toLowerCase().includes(q) ||
                    h.location.toLowerCase().includes(q)
                )
            );
        };

    } catch (err) {
        console.error("Failed to load hotels", err);
    }
}

function renderHotels(hotels) {
    const hotelList = document.getElementById("hotel-list");
    hotelList.innerHTML = "";

    hotels.forEach(hotel => {
        hotelList.innerHTML += `
            <div class="col-md-4 mb-4">
                <div class="card shadow">
                    <div class="card-body">
                        <h5>${hotel.name}</h5>
                        <p>${hotel.location}</p>
                    </div>
                </div>
            </div>
        `;
    });
}
