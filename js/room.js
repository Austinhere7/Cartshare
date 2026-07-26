// Get Room Code from URL
const params = new URLSearchParams(window.location.search);
const roomCode = params.get("roomCode");

// Get Room Data from Local Storage
const room = JSON.parse(localStorage.getItem(roomCode));

// Ensure activity array exists
if (!room.activity) {
    room.activity = [];
}

const currentUser = room.host;

// Select Elements
const roomTitle = document.getElementById("roomTitle");
const roomCodeDisplay = document.getElementById("roomCodeDisplay");
const hostDisplay = document.getElementById("hostDisplay");
const memberList = document.getElementById("memberList");

const itemName = document.getElementById("itemName");
const itemQuantity = document.getElementById("itemQuantity");
const itemPrice = document.getElementById("itemPrice");
const addItemBtn = document.getElementById("addItemBtn");

const cartItems = document.getElementById("cartItems");
const activityLog = document.getElementById("activityLog");

// Display Room Details
roomTitle.textContent = "Shopping Room";
roomCodeDisplay.textContent = `Room Code: ${room.roomCode}`;
hostDisplay.textContent = `Host: ${room.host}`;

// Display Members
memberList.innerHTML = "";

room.users.forEach(user => {

    const listItem = document.createElement("li");

    listItem.className = "list-group-item";

    listItem.innerHTML = `<i class="bi bi-person-fill text-primary"></i> ${user}`;

    memberList.appendChild(listItem);

});

// Display Shopping Cart
function displayCart() {

    cartItems.innerHTML = "";

    let grandTotal = 0;

    room.cart.forEach((item, index) => {

        const total = item.quantity * item.price;

        grandTotal += total;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price}</td>
            <td>₹${total}</td>
            <td>
                <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        cartItems.appendChild(row);

    });

    document.getElementById("grandTotal").textContent = `₹${grandTotal}`;

    // Delete Item
    const deleteButtons = document.querySelectorAll(".delete-btn");

    deleteButtons.forEach((button) => {

        button.addEventListener("click", () => {

            const index = Number(button.dataset.index);

            const deletedItem = room.cart[index];

            room.cart.splice(index, 1);

            room.activity.push(
                `${currentUser} deleted ${deletedItem.name}`
            );

            localStorage.setItem(roomCode, JSON.stringify(room));

            displayCart();
            displayActivity();

        });

    });

}

// Display Activity Log
function displayActivity() {

    activityLog.innerHTML = "";

    room.activity.forEach((activity) => {

        const log = document.createElement("div");

        log.className = "border rounded p-2 mb-2";

        log.textContent = activity;

        activityLog.appendChild(log);

    });

}

// Initial Load
displayCart();
displayActivity();

// Add Item
addItemBtn.addEventListener("click", () => {

    const name = itemName.value.trim();
    const quantity = itemQuantity.value.trim();
    const price = itemPrice.value.trim();

    if (name === "" || quantity === "" || price === "") {
        alert("Please fill all fields.");
        return;
    }

    const item = {
        name: name,
        quantity: Number(quantity),
        price: Number(price)
    };

    room.cart.push(item);

    room.activity.push(
        `${currentUser} added ${name} (Qty: ${quantity})`
    );

    localStorage.setItem(roomCode, JSON.stringify(room));

    displayCart();
    displayActivity();

    itemName.value = "";
    itemQuantity.value = "";
    itemPrice.value = "";

});

// Real-time Sync
window.addEventListener("storage", (event) => {

    if (event.key === roomCode) {

        const updatedRoom = JSON.parse(event.newValue);

        room.users = updatedRoom.users;
        room.cart = updatedRoom.cart;
        room.activity = updatedRoom.activity;

        // Refresh Members
        memberList.innerHTML = "";

        room.users.forEach(user => {

            const listItem = document.createElement("li");

            listItem.className = "list-group-item";

            listItem.innerHTML =
                `<i class="bi bi-person-fill text-primary"></i> ${user}`;

            memberList.appendChild(listItem);

        });

        displayCart();
        displayActivity();

    }

});