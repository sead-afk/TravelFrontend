/* ===============================
   hotels.js — SPA SAFE VERSION
   =============================== */

console.log("hotels.js loaded");

/* -------------------------------
   SPA INIT ENTRY POINT
-------------------------------- */
function initHotels() {
    console.log("initHotels() called");

    const hotelList = document.getElementById("hotel-list");
    const searchInput = document.getElementById("hotel-search-input");

    // Abort if this page is not active
    if (!hotelList || !searchInput) {
        console.warn("hotel-list not found on this page. hotels.js aborted.");
        return;
    }

    const API_URL = `${window.API_BASE_URL}/api/hotels`;

    fetch(API_URL)
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch hotels");
            return res.json();
        })
        .then(hotels => {
            console.log("Hotels loaded:", hotels);

            renderHotels(hotels, hotelList);

            // Search filter
            searchInput.oninput = () => {
                const term = searchInput.value.toLowerCase();
                const filtered = hotels.filter(h =>
                    h.name.toLowerCase().includes(term) ||
                    h.location.toLowerCase().includes(term)
                );
                renderHotels(filtered, hotelList);
            };
        })
        .catch(err => {
            console.error(err);
            hotelList.innerHTML =
                `<p class="text-danger">Failed to load hotels.</p>`;
        });
}

/* -------------------------------
   RENDER HOTEL CARDS
-------------------------------- */
function renderHotels(hotels, hotelList) {
    hotelList.innerHTML = "";

    if (!hotels.length) {
        hotelList.innerHTML = "<p>No hotels found.</p>";
        return;
    }

    hotels.forEach(hotel => {
        const card = document.createElement("div");
        card.className = "col-md-4 mb-4";

        card.innerHTML = `
            <div class="card shadow h-100">
                <div class="card-body text-center">
                    <h5 class="card-title text-primary">${hotel.name}</h5>
                    <h6 class="text-muted">${hotel.location}</h6>
                    <p>${hotel.description || ""}</p>

                    <button
                        class="btn btn-primary mt-3"
                        onclick="handleBookNow('${hotel.id}', '${hotel.name.replace(/'/g, "\\'")}')">
                        Book Now
                    </button>
                </div>
            </div>
        `;

        hotelList.appendChild(card);
    });
}

/* -------------------------------
   GLOBAL BOOK NOW HANDLER
-------------------------------- */
window.handleBookNow = function (hotelId, hotelName) {
    console.log("Book hotel:", hotelId, hotelName);

    document.getElementById("modal-hotel-name").textContent = hotelName;

    fetch(`${window.API_BASE_URL}/api/hotels/${hotelId}/rooms`)
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch rooms");
            return res.json();
        })
        .then(rooms => {
            const roomSelect = document.getElementById("room-select");
            roomSelect.innerHTML = "";

            if (!rooms.length) {
                roomSelect.innerHTML =
                    `<option disabled>No rooms available</option>`;
                return;
            }

            rooms.forEach(room => {
                const opt = document.createElement("option");
                opt.value = room.id;
                opt.textContent =
                    `Room ${room.roomNumber} — ${room.pricePerNight}$ / night`;
                opt.dataset.price = room.pricePerNight;
                roomSelect.appendChild(opt);
            });

            document
                .getElementById("confirm-booking")
                .dataset.hotelId = hotelId;

            $("#bookingModal").modal("show");
        })
        .catch(err => {
            console.error(err);
            alert("Failed to load rooms.");
        });
};

/* -------------------------------
   CONFIRM BOOKING (DELEGATED)
-------------------------------- */
document.addEventListener("click", async (e) => {
    if (!e.target.matches("#confirm-booking")) return;

    const btn = e.target;
    const hotelId = btn.dataset.hotelId;
    const roomSelect = document.getElementById("room-select");

    if (!hotelId || !roomSelect) return;

    const roomId = roomSelect.value;
    const price = roomSelect.selectedOptions[0]?.dataset.price;
    const start = document.getElementById("start-date").value;
    const end = document.getElementById("end-date").value;

    if (!roomId || !start || !end) {
        alert("Please fill all fields.");
        return;
    }

    const token = localStorage.getItem("jwt");
    if (!token) {
        alert("Please login first.");
        return;
    }

    const payload = JSON.parse(atob(token.split(".")[1]));

    const booking = {
        username: payload.sub,
        resourceid: hotelId,
        details: roomId,
        type: "HOTEL",
        startDate: start,
        endDate: end,
        amount: price
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
        $("#bookingModal").modal("hide");
    } catch (err) {
        console.error(err);
        alert("Booking failed.");
    }
});

/* -------------------------------
   EXPOSE INIT FOR SPA ROUTER
-------------------------------- */
window.initHotels = initHotels;



