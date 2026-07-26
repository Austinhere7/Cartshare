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

    console.log("Join Room Clicked");

});