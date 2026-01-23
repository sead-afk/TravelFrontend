console.log("hotels.js loaded");

function initHotelsPage() {
    const hotelList = document.getElementById("hotel-list");
    const searchInput = document.getElementById("hotel-search-input");

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
            hotelList.innerHTML = '<div class="col-12"><div class="alert alert-danger">Failed to load hotels.</div></div>';
        }
    }

    function renderHotels(hotels) {
        hotelList.innerHTML = "";

        if (hotels.length === 0) {
            hotelList.innerHTML = '<div class="col-12"><p class="text-center text-muted">No hotels found.</p></div>';
            return;
        }

        hotels.forEach(hotel => {
            hotelList.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card shadow h-100">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${hotel.name}</h5>
                            <p class="card-text text-muted"><i class="fas fa-map-marker-alt"></i> ${hotel.location}</p>
                            <p class="card-text">${hotel.description || 'Experience comfort and luxury.'}</p>
                            <button class="btn btn-primary btn-block mt-auto book-hotel-btn" 
                                    data-hotel-id="${hotel.id}" 
                                    data-hotel-name="${hotel.name}">
                                <i class="fas fa-calendar-check"></i> Book Now
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        attachBookingListeners();
    }

    function attachBookingListeners() {
        const bookButtons = document.querySelectorAll('.book-hotel-btn');
        bookButtons.forEach(button => {
            button.addEventListener('click', function() {
                const hotelId = this.getAttribute('data-hotel-id');
                const hotelName = this.getAttribute('data-hotel-name');

                // Call the global booking function from booking.js
                if (typeof window.openHotelBookingModal === 'function') {
                    window.openHotelBookingModal(hotelId, hotelName);
                } else {
                    console.error('Booking function not loaded');
                }
            });
        });
    }

    loadHotels();
}

initHotelsPage();
$(document).on('spapp:page:loaded', initHotelsPage);
