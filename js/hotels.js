document.addEventListener("DOMContentLoaded", () => {
    const hotelList = document.getElementById("hotel-list");
    const hotelSearchInput = document.getElementById("hotel-search-input");
    const bookingModal = $("#bookingModal");
    const confirmBookingBtn = document.getElementById("confirm-booking");

    if (!hotelList) {
        console.warn("hotel-list not found on this page. hotels.js aborted.");
        return;
    }

    const HOTEL_API_URL = `${window.API_BASE_URL}/api/hotels`;

    let allHotels = [];
    let selectedHotelId = null;

    /* =========================
       FETCH HOTELS
    ========================= */
    fetch(HOTEL_API_URL)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            allHotels = data;
            renderHotels(allHotels);
        })
        .catch(err => {
            console.error("Error fetching hotels:", err);
            hotelList.innerHTML =
                `<p class="text-danger">Failed to load hotels.</p>`;
        });

    /* =========================
       SEARCH
    ========================= */
    if (hotelSearchInput) {
        hotelSearchInput.addEventListener("input", () => {
            const term = hotelSearchInput.value.toLowerCase();
            const filtered = allHotels.filter(h =>
                h.name.toLowerCase().includes(term) ||
                h.location.toLowerCase().includes(term)
            );
            renderHotels(filtered);
        });
    }

    /* =========================
       RENDER HOTELS
    ========================= */
    function renderHotels(hotels) {
        hotelList.innerHTML = "";

        if (!hotels.length) {
            hotelList.innerHTML = "<p>No hotels found.</p>";
            return;
        }

        hotels.forEach(hotel => {
            const card = document.createElement("div");
            card.className = "col-md-4 mb-4";

            card.innerHTML = `
                <div class="card shadow">
                    <div class="card-body text-center">
                        <h5 class="card-title text-primary">${hotel.name}</h5>
                        <h6 class="text-muted">${hotel.location}</h6>
                        <p>${hotel.description || ""}</p>

                        <button
                            class="btn btn-primary mt-3 book-now-btn"
                            data-hotel-id="${hotel.id}"
                            data-hotel-name="${hotel.name}">
                            Book Now
                        </button>
                    </div>
                </div>
            `;

            hotelList.appendChild(card);
        });
    }

    /* =========================
       BOOK NOW (DELEGATED)
    ========================= */
    hotelList.addEventListener("click", async (e) => {
        const btn = e.target.closest(".book-now-btn");
        if (!btn) return;

        selectedHotelId = btn.dataset.hotelId;
        const hotelName = btn.dataset.hotelName;

        document.getElementById("modal-hotel-name").textContent = hotelName;

        try {
            const res = await fetch(`${HOTEL_API_URL}/${selectedHotelId}/rooms`);
            if (!res.ok) throw new Error("Failed to fetch rooms");

            const rooms = await res.json();
            const roomSelect = document.getElementById("room-select");
            roomSelect.innerHTML = "";

            if (!rooms.length) {
                roomSelect.innerHTML =
                    `<option disabled>No rooms available</option>`;
            } else {
                rooms.forEach(room => {
                    const option = document.createElement("option");
                    option.value = room.id;
                    option.dataset.price = room.pricePerNight;
                    option.textContent =
                        `Room ${room.roomNumber} - $${room.pricePerNight}/night`;
                    roomSelect.appendChild(option);
                });
            }

            bookingModal.modal("show");
        } catch (err) {
            console.error(err);
            alert("Failed to load rooms.");
        }
    });

    /* =========================
       CONFIRM BOOKING
    ========================= */
    if (confirmBookingBtn) {
        confirmBookingBtn.addEventListener("click", async () => {
            const roomSelect = document.getElementById("room-select");
            const startDate = document.getElementById("start-date").value;
            const endDate = document.getElementById("end-date").value;

            if (!roomSelect.value || !startDate || !endDate) {
                alert("Please complete all fields.");
                return;
            }

            const price =
                parseFloat(roomSelect.selectedOptions[0].dataset.price);
            const nights =
                (new Date(endDate) - new Date(startDate)) /
                (1000 * 60 * 60 * 24);

            if (nights <= 0) {
                alert("Invalid date range.");
                return;
            }

            const token = localStorage.getItem("jwt");
            if (!token) {
                alert("Please log in first.");
                return;
            }

            const payload = JSON.parse(atob(token.split(".")[1]));
            const username = payload.username || payload.sub;

            const booking = {
                username,
                resourceid: selectedHotelId,
                details: roomSelect.value,
                type: "HOTEL",
                startDate,
                endDate,
                amount: price * nights
            };

            try {
                const res = await fetch(
                    `${window.API_BASE_URL}/api/hotels/bookRoom`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify(booking)
                    }
                );

                if (!res.ok) throw new Error("Booking failed");

                alert("Booking successful!");
                bookingModal.modal("hide");
            } catch (err) {
                console.error(err);
                alert("Booking failed.");
            }
        });
    }
});








