// ==========================
// Select Elements
// ==========================
const displayNameInput = document.getElementById("displayName");
const roomCodeInput = document.getElementById("roomCode");

const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");

// ==========================
// Generate Room Code
// ==========================
function generateRoomCode() {
    const randomNumber = Math.floor(100 + Math.random() * 900);
    return `HOSTEL${randomNumber}`;
}

// ==========================
// Save Room to Local Storage
// ==========================
function saveRoom(room) {
    localStorage.setItem(room.roomCode, JSON.stringify(room));

    console.log("Saved Key:", room.roomCode);
    console.log("Saved Value:", localStorage.getItem(room.roomCode));
}

// ==========================
// Create Room Button
// ==========================
createRoomBtn.addEventListener("click", () => {

    const displayName = displayNameInput.value.trim();

    if (displayName === "") {
        alert("Please enter your display name.");
        return;
    }

    const roomCode = generateRoomCode();

    roomCodeInput.value = roomCode;

    const room = {
        roomCode: roomCode,
        host: displayName,
        users: [displayName],
        cart: [],
        activity: []
    };

    saveRoom(room);

    // IMPORTANT
    sessionStorage.setItem("currentUser", displayName);

    console.log("Room Created Successfully");
    console.log(room);

    window.location.href = `pages/room.html?roomCode=${roomCode}`;

});

// ==========================
// Join Room Button
// ==========================
joinRoomBtn.addEventListener("click", () => {

    const displayName = displayNameInput.value.trim();

    const roomCode = roomCodeInput.value.trim().toUpperCase();

    if (displayName === "" || roomCode === "") {

        alert("Please fill all fields.");

        return;

    }

    const room = JSON.parse(localStorage.getItem(roomCode));

    if (!room) {

        alert("Room not found!");

        return;

    }

    if (!room.users.includes(displayName)) {

        room.users.push(displayName);

    }

    if (!room.activity) {

        room.activity = [];

    }

    room.activity.push(`${displayName} joined the room`);

    localStorage.setItem(roomCode, JSON.stringify(room));

    // IMPORTANT
    sessionStorage.setItem("currentUser", displayName);

   window.location.href =
    `pages/room.html?roomCode=${roomCode}&user=${encodeURIComponent(displayName)}`;

});