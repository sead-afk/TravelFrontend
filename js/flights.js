//document.addEventListener("DOMContentLoaded", () => {
    const flightList = document.getElementById("flight-list");

    // Replace this URL with your backend API endpoint
    const flightApiUrl = "http://localhost:8080/api/flights/";

    // Fetch the flight data
    //const token = localStorage.getItem("authToken"); // Retrieve the token from localStorage

    fetch(flightApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.length === 0) {
                flightList.innerHTML = "<p>No flights found.</p>";
                return;
            }

            data.forEach(flight => {
                const card = document.createElement("div");
                card.className = "col-md-4 mb-4";

                card.innerHTML = `
                    <div class="card shadow">
                        <div class="card-body">
                            <h5 class="card-title">${flight.airline}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">${flight.departureAirport}</h6>
                            <h6 class="card-subtitle mb-2 text-muted">${flight.arrivalAirport}</h6>
                            <h6 class="card-subtitle mb-2 text-muted">${flight.departureTime}</h6>
                            <h6 class="card-subtitle mb-2 text-muted">${flight.arrivalTime}</h6>
                            <p class="card-text">${flight.price}</p>
                            
                            <a href="#" class="btn btn-primary">Book Now</a>
                        </div>
                    </div>
                `;

                flightList.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error fetching flight data:", error);
            flightList.innerHTML = `<p class="text-danger">Failed to load flights. Please try again later.</p>`;
        });
//});