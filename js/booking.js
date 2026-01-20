

function loadHotelRooms(hotelId) {
    const roomSelect = document.getElementById("room-select");
    roomSelect.innerHTML = "<option>Loading rooms...</option>";

    fetch(`${window.API_BASE_URL}/api/hotels/${hotelId}/rooms`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch rooms");
            }
            return response.json();
        })
        .then(rooms => {
            roomSelect.innerHTML = ""; // Clear placeholder
            rooms.forEach(room => {
                const option = document.createElement("option");
                option.value = room.id;
                option.textContent = `${room.name} (${room.price} per night)`;
                roomSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error("Error loading rooms:", error);
            roomSelect.innerHTML = "<option>Error loading rooms</option>";
        });
}

function submitBookingForm(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const apiUrl = `${window.API_BASE_URL}//api/bookings/hotel`;

    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to book");
            }
            return response.json();
        })
        .then(result => {
            alert("Booking successful! Confirmation ID: " + result.confirmationId);
            location.hash = "#"; // Redirect back to home or another section
        })
        .catch(error => {
            console.error("Error submitting booking:", error);
            alert("Failed to submit booking. Please try again.");
        });
}












