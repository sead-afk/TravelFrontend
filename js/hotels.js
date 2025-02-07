const hotelList = document.getElementById("hotel-list");
const hotelSearchInput = document.getElementById("hotel-search-input"); // Search bar element

// Replace this URL with your backend API endpoint
const hotelApiUrl = "https://spring-boot-travel-production.up.railway.app/api/hotels/";

// Fetch the hotel data
fetch(hotelApiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        if (data.length === 0) {
            hotelList.innerHTML = "<p>No hotels found.</p>";
            return;
        }

        // Store the original hotel data for filtering
        let hotels = data;
        renderHotels(hotels);

        // Search functionality: filter hotels by name or location
        hotelSearchInput.addEventListener('input', function () {
            const searchTerm = hotelSearchInput.value.toLowerCase();

            // Filter hotels based on name or location
            const filteredHotels = hotels.filter(hotel => {
                return (
                    hotel.name.toLowerCase().includes(searchTerm) ||
                    hotel.location.toLowerCase().includes(searchTerm)
                );
            });

            renderHotels(filteredHotels); // Re-render filtered hotels
        });

        // Function to render the hotel data
        function renderHotels(hotels) {
            hotelList.innerHTML = ""; // Clear previous hotel listings

            if (hotels.length === 0) {
                hotelList.innerHTML = "<p>No hotels match your search.</p>";
                return;
            }

            // Render each hotel card
            hotels.forEach(hotel => {
                const card = document.createElement("div");
                card.className = "col-md-4 mb-4";

                card.innerHTML = `  
                    <div class="card shadow" style="border-radius: 15px; overflow: hidden; transition: transform 0.2s;">  
                        <div class="card-body text-center">  
                            <h5 class="card-title font-weight-bold text-primary">${hotel.name}</h5>  
                            <h6 class="card-subtitle mb-2 text-muted">${hotel.location}</h6>  
                            <p class="card-text">${hotel.description}</p>  
                            <h6 class="mt-3">Amenities:</h6>  
                            <ul class="list-unstyled">  
                                ${hotel.amenities.map(amenity => `<li class="badge badge-light">${amenity}</li>`).join("")}  
                            </ul>  
                            <a href="javascript:void(0);" class="btn btn-primary btn-lg mt-3"   
                               onclick="handleBookNow('${hotel.id}', '${hotel.name}')">  
                               Book Now  
                            </a>  
                        </div>  
                    </div>  
                `;
                hotelList.appendChild(card);
            });
        }
    })
    .catch(error => {
        console.error("Error fetching hotel data:", error);
        hotelList.innerHTML = `<p class="text-danger">Failed to load hotels. Please try again later.</p>`;
    });

// Handle booking functionality
function handleBookNow(hotelId, hotelName) {
    console.log("Opening modal for:", hotelId, hotelName);

    // Update modal title with the hotel name
    document.getElementById("modal-hotel-name").textContent = `Hotel Name: ${hotelName}`;

    // Fetch room data from the API
    fetch(hotelApiUrl + `${hotelId}/rooms`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to fetch rooms for hotel ID ${hotelId}`);
            }
            return response.json();
        })
        .then((rooms) => {
            const roomSelect = document.getElementById("room-select");
            roomSelect.innerHTML = ""; // Clear previous options

            // Populate the room selector with data
            if (rooms.length > 0) {
                rooms.forEach((room) => {
                    const option = document.createElement("option");
                    option.value = room.id; // MongoDB's auto-generated _id field
                    option.textContent = `Room ${room.roomNumber} - Price per night: ${room.pricePerNight}$`;
                    option.setAttribute("data-price", room.pricePerNight);
                    roomSelect.appendChild(option);
                });
            } else {
                // Handle case where no rooms are available
                const option = document.createElement("option");
                option.value = "";
                option.textContent = "No rooms available";
                roomSelect.appendChild(option);
            }

            document.getElementById("confirm-booking").setAttribute("data-hotel-id", hotelId);
            // Open the modal after data is loaded
            $("#bookingModal").modal("show");
        })
        .catch((error) => {
            console.error("Error fetching rooms:", error);
            alert("Failed to load room data. Please try again.");
        });
}

// Handle booking confirmation
document.getElementById("confirm-booking").addEventListener("click", async () => {
    const roomSelect = document.getElementById("room-select");
    const selectedRoomId = roomSelect.value;
    const pricePerNight = parseFloat(roomSelect.options[roomSelect.selectedIndex].getAttribute("data-price"));
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    if (!selectedRoomId || !startDate || !endDate) {
        alert("Please select a room and provide both start and end dates.");
        return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
        alert("Start date must be before the end date.");
        return;
    }

    const nights = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const amount = pricePerNight * nights;

    const hotelId = document.getElementById("confirm-booking").getAttribute("data-hotel-id");

    function getUsernameFromJwt() {
        const token = localStorage.getItem("jwt");
        if (!token) {
            console.error("No JWT token found in localStorage.");
            return null;
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
            console.log("Decoded JWT payload:", payload);
            return payload.username || payload.sub || null; // Adjust key based on your token structure
        } catch (error) {
            console.error("Error decoding JWT token:", error);
            return null;
        }
    }

    const username = getUsernameFromJwt();
    console.log("Retrieved username:", username);
    const token = localStorage.getItem("jwt"); // Replace with the correct storage mechanism
    if (!token) {
        alert("User is not authenticated. Please log in.");
        return;
    }

    const bookingDetails = {
        username: username,
        resourceid: hotelId,
        details: selectedRoomId,
        type: "HOTEL",
        startDate: startDate,
        endDate: endDate,
        amount: amount,
    };

    console.log("Booking payload:", bookingDetails);

    try {
        const response = await fetch("https://spring-boot-travel-production.up.railway.app/api/hotels/bookRoom", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(bookingDetails),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        alert(`Booking confirmed! Your booking ID is: ${data.id}`);
        $("#bookingModal").modal("hide");
    } catch (error) {
        console.error("Error creating booking:", error);
        alert("Error creating booking. Please try again later.");
    }
});













