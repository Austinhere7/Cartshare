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

    // Get Display Name
    const displayName = displayNameInput.value.trim();

    // Validate Display Name
    if (displayName === "") {
        alert("Please enter your display name.");
        return;
    }

    // Generate Room Code
    const roomCode = generateRoomCode();

    // Display Room Code
    roomCodeInput.value = roomCode;

    // Create Room Object
    const room = {
        roomCode: roomCode,
        host: displayName,
        users: [displayName],
        cart: [],
        activity: []
    };

    // Save Room
  
    saveRoom(room);
    // Redirect to Room Page
    window.location.href = `pages/room.html?roomCode=${roomCode}`;
    console.log(localStorage.getItem(roomCode));

    // Console Output
    console.log("Room Created Successfully");
    console.log(room);

});


// ==========================
// Join Room Button
// ==========================
joinRoomBtn.addEventListener("click", () => {

    const displayName = document.getElementById("displayName").value.trim();

    const roomCode = document.getElementById("roomCode").value.trim().toUpperCase();

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

    window.location.href = `pages/room.html?roomCode=${roomCode}`;

});