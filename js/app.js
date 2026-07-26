// Select Elements
const displayNameInput = document.getElementById("displayName");
const roomCodeInput = document.getElementById("roomCode");

const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");

// Generate Room Code
function generateRoomCode() {
    const randomNumber = Math.floor(100 + Math.random() * 900);
    return `HOSTEL${randomNumber}`;
}

// Create Room Button Click
createRoomBtn.addEventListener("click", () => {

    const displayName = displayNameInput.value.trim();

    if (displayName === "") {
        alert("Please enter your display name.");
        return;
    }

    const roomCode = generateRoomCode();

    console.log(displayName);
    console.log(roomCode);

});