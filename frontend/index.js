async function submitGuest(event) {
    event.preventDefault(); // Prevent form from submitting in the traditional way

    const guest = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value
    };

    await fetch("http://localhost:7000/add_guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guest)
    });

    alert("Thank you! We can't wait to see you!"); // New alert message
}

// Event listener for the form submission
document.getElementById('guestForm').addEventListener('submit', submitGuest);
