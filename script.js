<!-- Example: Put this in your HTML, just once -->
<script>
  // 1) SCROLL ANIMATION CODE
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom >= 0;
  }

  function handleScrollAnimation() {
    const elements = document.querySelectorAll('.animate-text');
    elements.forEach((element) => {
      if (isInViewport(element)) {
        element.classList.add('visible');
      }
    });
  }

  // Register scroll and DOMContentLoaded handlers
  document.addEventListener('scroll', handleScrollAnimation);
  document.addEventListener('DOMContentLoaded', handleScrollAnimation);

  // 2) TICKET PURCHASING CODE (STATIC DOM approach)
  function buyTicket(eventId) {
    // Example usage: buyTicket('HolidayLights')
    const seatsElement = document.getElementById(`${eventId}-seats`);
    const buttonElement = document.getElementById(`${eventId}-button`);
    if (!seatsElement) return; // If element doesn't exist, exit

    let seats = parseInt(seatsElement.textContent, 10);
    if (!isNaN(seats) && seats > 0) {
      seats -= 1;
      seatsElement.textContent = seats;

      if (seats === 0 && buttonElement) {
        buttonElement.disabled = true;
        buttonElement.textContent = "Sold Out";
      }
      alert("Ticket purchased! Please check your email for confirmation.");
      // (Optional) Add code to send purchase data to Google Sheets here
    }
  }

  // 3) DYNAMIC GOOGLE SHEET CODE
  async function fetchSheetData() {
    try {
      // Replace this URL with your actual published CSV link:
      const sheetUrl = "https://docs.google.com/spreadsheets/d/XXXX/pub?output=csv";
      const response = await fetch(sheetUrl);
      const csvText = await response.text();

      // Convert CSV text to an array of objects
      const events = parseCsvToObjects(csvText);

      // Now generate the cards dynamically
      const container = document.getElementById("events-container");
      if (!container) {
        console.warn("No #events-container found in the DOM.");
        return;
      }

      container.innerHTML = ""; // Clear existing content
      events.forEach((event) => {
        // Make sure your CSV has columns named exactly:
        // thumbnail, eventName, date, description, seatsRemaining, checkoutLink
        const eventName = event.eventName || "Event";
        const seatsRem = event.seatsRemaining || "0";
        const cardHtml = `
          <div class="col-md-4">
            <div class="card event-card mb-3">
              <img
                src="${event.thumbnail || ''}"
                class="card-img-top"
                alt="${eventName} Thumbnail"
              />
              <div class="card-body">
                <h5 class="card-title">${eventName}</h5>
                <p class="event-date">Date: ${event.date || ''}</p>
                <p class="card-text">${event.description || ''}</p>
                <p class="mb-2">
                  Seats Remaining:
                  <span
                    id="${eventName}-seats"
                    class="seats-remaining"
                  >
                    ${seatsRem}
                  </span>
                </p>
                <button
                  id="${eventName}-button"
                  class="btn btn-primary w-100"
                  onclick="buyTicket('${eventName}')"
                >
                  Buy Tickets
                </button>
              </div>
            </div>
          </div>
        `;
        container.insertAdjacentHTML("beforeend", cardHtml);
      });
    } catch (err) {
      console.error("Error fetching/parsing sheet data:", err);
    }
  }

  // Helper: CSV -> Array of Objects
  function parseCsvToObjects(csvText) {
    // Remove any blank lines, then split
    const lines = csvText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l);

    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const rowCells = lines[i].split(",").map((cell) => cell.trim());
      const rowObj = {};
      headers.forEach((header, idx) => {
        rowObj[header] = rowCells[idx] || "";
      });
      data.push(rowObj);
    }
    return data;
  }

  // Fetch sheet data after the DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    // Kick off the Google Sheet fetch
    fetchSheetData();
  });
</script>
