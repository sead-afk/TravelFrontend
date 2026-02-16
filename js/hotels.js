console.log("hotels.js loaded");

// ============================================
// HELPER FUNCTIONS
// ============================================

function renderHotels(hotels, container) {
    container.innerHTML = "";

    if (hotels.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center text-muted">No hotels found.</p></div>';
        return;
    }

    hotels.forEach(hotel => {
        container.innerHTML += `
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
                alert('Booking system not available. Please refresh the page.');
            }
        });
    });
}

async function loadHotels(hotelList, searchInput, allHotels) {
    console.log('Loading hotels from API...');

    // Show loading state
    hotelList.innerHTML = '<div class="col-12 text-center"><i class="fas fa-spinner fa-spin fa-3x text-primary"></i></div>';

    try {
        // Use API helper instead of raw fetch
        const response = await API.get('/api/hotels');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const hotels = await response.json();
        console.log(`✅ Loaded ${hotels.length} hotels`);

        // Store for filtering
        allHotels.data = hotels;

        // Render hotels
        renderHotels(hotels, hotelList);

        // Setup search filter
        searchInput.oninput = () => {
            const query = searchInput.value.toLowerCase();
            const filtered = allHotels.data.filter(h =>
                h.name.toLowerCase().includes(query) ||
                h.location.toLowerCase().includes(query)
            );
            renderHotels(filtered, hotelList);
        };

    } catch (err) {
        console.error("Failed to load hotels:", err);
        hotelList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <h5><i class="fas fa-exclamation-triangle"></i> Failed to load hotels</h5>
                    <p>${err.message}</p>
                    <button class="btn btn-sm btn-outline-danger" onclick="initHotelsPage()">
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

function initHotelsPage() {
    console.log("Initializing hotels page");

    const hotelList = document.getElementById("hotel-list");
    const searchInput = document.getElementById("hotel-search-input");

    if (!hotelList) {
        console.error("Element #hotel-list not found!");
        return;
    }

    if (!searchInput) {
        console.warn("Element #hotel-search-input not found - search will be disabled");
    }

    // Store all hotels for filtering (use object to pass by reference)
    const allHotels = { data: [] };

    // Load hotels
    loadHotels(hotelList, searchInput, allHotels);

    console.log("Hotels page initialized");
}

// ============================================
// EXPORT
// ============================================

window.initHotelsPage = initHotelsPage;

console.log('hotels.js: Exported initHotelsPage -', typeof window.initHotelsPage);

