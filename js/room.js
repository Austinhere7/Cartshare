// Get Room Code from URL
const params = new URLSearchParams(window.location.search);
const roomCode = params.get("roomCode");

// Get Room Data from Local Storage
const room = JSON.parse(localStorage.getItem(roomCode));

// Select Elements
const roomTitle = document.getElementById("roomTitle");
const roomCodeDisplay = document.getElementById("roomCodeDisplay");
const hostDisplay = document.getElementById("hostDisplay");

// Display Room Details
roomTitle.textContent = "Shopping Room";
roomCodeDisplay.textContent = `Room Code: ${room.roomCode}`;
hostDisplay.textContent = `Host: ${room.host}`;