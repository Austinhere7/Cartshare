// Get Room Code from URL
const params = new URLSearchParams(window.location.search);
const roomCode = params.get("roomCode");

// Get Room Data from Local Storage
const room = JSON.parse(localStorage.getItem(roomCode));

// Select Elements
const roomTitle = document.getElementById("roomTitle");
const roomCodeDisplay = document.getElementById("roomCodeDisplay");
const hostDisplay = document.getElementById("hostDisplay");
const memberList = document.getElementById("memberList");

// Display Room Details
roomTitle.textContent = "Shopping Room";
roomCodeDisplay.textContent = `Room Code: ${room.roomCode}`;
hostDisplay.textContent = `Host: ${room.host}`;

// Display Members
room.users.forEach(user => {

    const listItem = document.createElement("li");

    listItem.className = "list-group-item";

    listItem.innerHTML = `<i class="bi bi-person-fill text-primary"></i> ${user}`;

    memberList.appendChild(listItem);

});