console.log("hotels.js loaded");

// Auto-initialize when the hotels section is in the DOM
function initHotelsPage() {
    const hotelList = document.getElementById("hotel-list");
    const searchInput = document.getElementById("hotel-search-input");

    // Guard: only run if elements exist
    if (!hotelList || !searchInput) {
        return;
    }

    console.log("Initializing hotels page");

    async function loadHotels() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/hotels`);
            const hotels = await res.json();

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

    loadHotels();
}

// Run when script first loads (in case DOM already ready)
initHotelsPage();

// Also run when SPAPP loads a new page
$(document).on('spapp:page:loaded', initHotelsPage);
