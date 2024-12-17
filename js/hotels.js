document.addEventListener("DOMContentLoaded", () => {
    const hotelList = document.getElementById("hotel-list");

    // Replace this URL with your backend API endpoint
    const apiUrl = "http://localhost:8080/api/hotels/";

    // Fetch the hotel data
    const token = localStorage.getItem("authToken"); // Retrieve the token from localStorage

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                hotelList.innerHTML = "<p>No hotels found.</p>";
                return;
            }

            data.forEach(hotel => {
                const card = document.createElement("div");
                card.className = "col-md-4 mb-4";

                card.innerHTML = `
                    <div class="card shadow">
                        <div class="card-body">
                            <h5 class="card-title">${hotel.name}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">${hotel.location}</h6>
                            <p class="card-text">${hotel.description}</p>
                            <ul>
                                ${hotel.amenities.map(amenity => `<li>${amenity}</li>`).join("")}
                            </ul>
                            <a href="#" class="btn btn-primary">Book Now</a>
                        </div>
                    </div>
                `;

                hotelList.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error fetching hotel data:", error);
            hotelList.innerHTML = `<p class="text-danger">Failed to load hotels. Please try again later.</p>`;
        });
});
