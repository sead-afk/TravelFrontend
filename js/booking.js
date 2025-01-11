/*document.addEventListener("DOMContentLoaded", () => {
    console.log("booking.js loaded!");

    populateDropdowns();

    const bookingForm = document.getElementById("bookingForm");
    const bookingError = document.getElementById("bookingError");

    // Add onchange event listener to the booking type dropdown
    const typeDropdown = document.getElementById("type");
    const hotelDropdownContainer = document.getElementById("hotelDropdownContainer");
    const flightDropdownContainer = document.getElementById("flightDropdownContainer");

    typeDropdown.addEventListener("change", () => {
        const selectedType = typeDropdown.value;

        if (selectedType === "HOTEL") {
            hotelDropdownContainer.style.display = "block";
            flightDropdownContainer.style.display = "none";
        } else if (selectedType === "FLIGHT") {
            hotelDropdownContainer.style.display = "none";
            flightDropdownContainer.style.display = "block";
        } else {
            hotelDropdownContainer.style.display = "none";
            flightDropdownContainer.style.display = "none";
        }
    });

    // Trigger onchange event on page load to set initial visibility
    typeDropdown.dispatchEvent(new Event("change"));

    // Handle form submission
    bookingForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const type = typeDropdown.value;
        const hotel = document.getElementById("hotel").value || null;
        const flight = document.getElementById("flight").value || null;
        const startDate = document.getElementById("startDate").value;
        const endDate = document.getElementById("endDate").value;
        const amount = parseFloat(document.getElementById("amount").value);
        const bookingDate = new Date().toISOString().split("T")[0];

        const payload = {
            type,
            hotel: hotel ? { id: hotel } : null,
            flight: flight ? { id: flight } : null,
            bookingDate,
            startDate,
            endDate,
            amount,
        };

        console.log("Payload sent to backend:", JSON.stringify(payload));

        const bookingUrl = "http://localhost:8080/api/bookings";

        try {
            const response = await fetch(bookingUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                bookingError.textContent = response.status === 400
                    ? "Invalid data. Please check your inputs."
                    : "An unexpected error occurred. Please try again.";
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            alert("Booking created successfully!");
            window.location.href = "index.html";
        } catch (error) {
            console.error("Error during booking creation:", error);
            bookingError.textContent = "Unable to connect to the server. Please try again later.";
        }
    });

    function populateDropdowns() {
        const hotelDropdown = document.getElementById("hotel");
        const flightDropdown = document.getElementById("flight");

        const hotels = [
            { id: "1", name: "Grand Hotel" },
            { id: "2", name: "Seaside Inn" },
            { id: "3", name: "Mountain Lodge" },
        ];

        const flights = [
            { id: "101", name: "Flight 101 - NYC to LA" },
            { id: "202", name: "Flight 202 - Paris to Tokyo" },
            { id: "303", name: "Flight 303 - Sydney to London" },
        ];

        hotels.forEach(hotel => {
            const option = document.createElement("option");
            option.value = hotel.id;
            option.textContent = hotel.name;
            hotelDropdown.appendChild(option);
        });

        flights.forEach(flight => {
            const option = document.createElement("option");
            option.value = flight.id;
            option.textContent = flight.name;
            flightDropdown.appendChild(option);
        });
    }
});*/

/*document.addEventListener("DOMContentLoaded", () => {
    console.log("booking.js loaded!");
});*/
/*console.log("Testing if booking.js runs at all!");
$(s(){
    $('.check').trigger('change'); //This event will fire the change event.
    $('.check').change(function(){
        var data= $(this).val();
        alert(data);
    });
});*/

async function updateDropdowns(selectedValue) {
    console.log(`Selected type: ${selectedValue}`);

    // Clear existing dropdowns
    const hotelDropdown = document.getElementById("hotelDropdown");
    const flightDropdown = document.getElementById("flightDropdown");

    if (selectedValue === "HOTEL") {
        // Show hotel dropdown, hide flight dropdown
        document.getElementById("hotelDropdownContainer").style.display = "block";
        document.getElementById("flightDropdownContainer").style.display = "none";

        // Fetch hotel data
        try {
            const response = await fetch("http://localhost:8080/api/hotels");
            const hotels = await response.json();
            console.log("Hotels fetched:", hotels);

            // Populate hotel dropdown
            hotelDropdown.innerHTML = '<option value="">Select Hotel</option>';
            hotels.forEach(hotel => {
                const option = document.createElement("option");
                option.value = hotel.id;
                option.textContent = hotel.name;
                hotelDropdown.appendChild(option);
            });
        } catch (error) {
            console.error("Error fetching hotels:", error);
        }
    } else if (selectedValue === "FLIGHT") {
        // Show flight dropdown, hide hotel dropdown
        document.getElementById("flightDropdownContainer").style.display = "block";
        document.getElementById("hotelDropdownContainer").style.display = "none";

        // Fetch flight data
        try {
            const response = await fetch("http://localhost:8080/api/flights");
            const flights = await response.json();
            console.log("Flights fetched:", flights);

            // Populate flight dropdown
            flightDropdown.innerHTML = '<option value="">Select Flight</option>';
            flights.forEach(flight => {
                const option = document.createElement("option");
                option.value = flight.id;
                option.textContent = `${flight.airline}: ${flight.flightNumber}, (${flight.departureAirport} ➔ ${flight.arrivalAirport})`;
                flightDropdown.appendChild(option)
            });
        } catch (error) {
            console.error("Error fetching flights:", error);
        }
    } else {
        // Hide both dropdowns
        document.getElementById("hotelDropdownContainer").style.display = "none";
        document.getElementById("flightDropdownContainer").style.display = "none";
    }
}










