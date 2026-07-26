// Get Room Code from URL
const params = new URLSearchParams(window.location.search);
const roomCode = params.get("roomCode");

// Load Room
const room = JSON.parse(localStorage.getItem(roomCode));

if (!room) {
    alert("Room not found!");
    window.location.href = "../index.html";
}

// Select Elements
const receiptRoom = document.getElementById("receiptRoom");
const receiptHost = document.getElementById("receiptHost");
const receiptItems = document.getElementById("receiptItems");
const receiptMembers = document.getElementById("receiptMembers");
const receiptTotal = document.getElementById("receiptTotal");

const receiptDate = document.getElementById("receiptDate");
const totalItems = document.getElementById("totalItems");
const totalMembers = document.getElementById("totalMembers");

// Display Room Details
receiptRoom.textContent = room.roomCode;
receiptHost.textContent = room.host;

// Display Date
if (receiptDate) {
    receiptDate.textContent = new Date().toLocaleString();
}

// Display Totals
if (totalItems) {
    totalItems.textContent = room.cart.length;
}

if (totalMembers) {
    totalMembers.textContent = room.users.length;
}

// Display Cart
let grandTotal = 0;

receiptItems.innerHTML = "";

room.cart.forEach((item) => {

    const total = item.quantity * item.price;

    grandTotal += total;

    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>₹${item.price}</td>
        <td>₹${total}</td>
    `;

    receiptItems.appendChild(row);

});

// Grand Total
receiptTotal.textContent = `₹${grandTotal}`;

// Members
receiptMembers.innerHTML = "";

room.users.forEach((user) => {

    const li = document.createElement("li");

    li.textContent = user;

    receiptMembers.appendChild(li);

});