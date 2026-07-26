// Get Room Code from URL
const params = new URLSearchParams(window.location.search);
const roomCode = params.get("roomCode");

// Load Room
const room = JSON.parse(localStorage.getItem(roomCode));

// Select Elements
const receiptRoom = document.getElementById("receiptRoom");
const receiptHost = document.getElementById("receiptHost");
const receiptItems = document.getElementById("receiptItems");
const receiptMembers = document.getElementById("receiptMembers");
const receiptTotal = document.getElementById("receiptTotal");

// Display Room Details
receiptRoom.textContent = room.roomCode;
receiptHost.textContent = room.host;

// Display Cart
let grandTotal = 0;

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

// Display Grand Total
receiptTotal.textContent = `₹${grandTotal}`;

// Display Members
room.users.forEach((user) => {

    const li = document.createElement("li");

    li.textContent = user;

    receiptMembers.appendChild(li);

});