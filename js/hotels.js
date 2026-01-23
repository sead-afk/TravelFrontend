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
                            <h5 class="card-title">${hotel.name}</h5>
                            <p class="card-text text-muted">${hotel.location}</p>
                            <p class="card-text">${hotel.description || 'Experience comfort and luxury'}</p>
                            <button class="btn btn-primary btn-block book-hotel-btn" 
                                    data-hotel-id="${hotel.id}" 
                                    data-hotel-name="${hotel.name}">
                                <i class="fas fa-calendar-check"></i> Book Now
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        // Attach event listeners to booking buttons
        attachBookingListeners();
    }

    function attachBookingListeners() {
        const bookButtons = document.querySelectorAll('.book-hotel-btn');
        bookButtons.forEach(button => {
            button.addEventListener('click', function() {
                const hotelId = this.getAttribute('data-hotel-id');
                const hotelName = this.getAttribute('data-hotel-name');
                openBookingModal(hotelId, hotelName);
            });
        });
    }

    function openBookingModal(hotelId, hotelName) {
        // Set the modal title
        document.getElementById('bookingModalLabel').textContent = `Book Your Stay at ${hotelName}`;

        // Load rooms for the selected hotel
        loadHotelRooms(hotelId);

        // Store hotel info for form submission
        document.getElementById('confirm-booking').setAttribute('data-hotel-id', hotelId);
        document.getElementById('confirm-booking').setAttribute('data-hotel-name', hotelName);

        // Show the modal
        $('#bookingModal').modal('show');
    }

    function loadHotelRooms(hotelId) {
        const roomSelect = document.getElementById("room-select");
        roomSelect.innerHTML = "<option>Loading rooms...</option>";

        fetch(`${API_BASE_URL}/api/hotels/${hotelId}/rooms`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch rooms");
                }
                return response.json();
            })
            .then(rooms => {
                roomSelect.innerHTML = "";
                rooms.forEach(room => {
                    const option = document.createElement("option");
                    option.value = room.id;
                    option.textContent = `${room.name} - $${room.price} per night`;
                    roomSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error("Error loading rooms:", error);
                roomSelect.innerHTML = "<option>Error loading rooms</option>";
            });
    }

    loadHotels();
}

// Run when script first loads (in case DOM already ready)
initHotelsPage();

// Also run when SPAPP loads a new page
$(document).on('spapp:page:loaded', initHotelsPage);
