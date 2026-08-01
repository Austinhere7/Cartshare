// ==========================
// Get Room Code from URL
// ==========================
const params = new URLSearchParams(window.location.search);
const roomCode = params.get("roomCode");

// Redirect if room code is missing
if (!roomCode) {
    alert("Invalid room link.");
    window.location.href = "../index.html";
}

// ==========================
// Get Room Data
// ==========================
const room = JSON.parse(localStorage.getItem(roomCode));

// Redirect if room doesn't exist
if (!room) {
    alert("Room not found.");
    window.location.href = "../index.html";
}

// Ensure activity array exists
if (!room.activity) {
    room.activity = [];
}

// Current User
const currentUser = params.get("user") || room.host;

// ==========================
// Select Elements
// ==========================
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

const receiptBtn = document.getElementById("receiptBtn");
const emptyCartBtn = document.getElementById("emptyCartBtn");

const memberCount = document.getElementById("memberCount");
const itemCount = document.getElementById("itemCount");
const toastElement = document.getElementById("liveToast");
const toastMessage = document.getElementById("toastMessage");

const toast = new bootstrap.Toast(toastElement);
const dashboardTotal = document.getElementById("dashboardTotal");

// ==========================
// Display Room Details
// ==========================
roomTitle.textContent = "Shopping Room";
roomCodeDisplay.textContent = `Room Code: ${room.roomCode}`;
hostDisplay.textContent = `Host: ${room.host}`;

// ==========================
// Display Members
// ==========================
function displayMembers() {

    memberList.innerHTML = "";

    room.users.forEach(user => {

        const listItem = document.createElement("li");

        listItem.className = "list-group-item";

        listItem.innerHTML = `
            <i class="bi bi-person-fill text-primary"></i>
            ${user}
        `;

        memberList.appendChild(listItem);

    });

    updateDashboard();

    // ==========================
// Show Toast
// ==========================
function showToast(message, type = "primary") {

    toastElement.className =
        `toast align-items-center text-bg-${type} border-0`;

    toastMessage.textContent = message;

    toast.show();

}

}

// ==========================
// Dashboard Statistics
// ==========================
function updateDashboard() {

    memberCount.textContent = room.users.length;

    itemCount.textContent = room.cart.length;

    let total = 0;

    room.cart.forEach(item => {

        total += item.quantity * item.price;

    });

    dashboardTotal.textContent = `₹${total}`;

}

// ==========================
// Bootstrap Toast
// ==========================
const toastElement = document.getElementById("liveToast");
const toastMessage = document.getElementById("toastMessage");

let toast = null;

if (toastElement) {
    toast = new bootstrap.Toast(toastElement);
}

function showToast(message, type = "primary") {

    if (!toastElement || !toast) return;

    toastElement.className =
        `toast align-items-center text-bg-${type} border-0`;

    toastMessage.textContent = message;

    toast.show();

}

// ==========================
// Display Shopping Cart
// ==========================


// ==========================
// Display Shopping Cart
// ==========================
function displayCart() {

    cartItems.innerHTML = "";

    if (room.cart.length === 0) {

        cartItems.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-5">

                    <i class="bi bi-cart-x fs-1 d-block mb-3"></i>

                    <h5>Your shopping cart is empty</h5>

                    <small>Add an item to get started.</small>

                </td>
            </tr>
        `;

        document.getElementById("grandTotal").textContent = "₹0";

        updateDashboard();

        return;

    }

    let grandTotal = 0;

    // Latest items first
    [...room.cart].reverse().forEach((item, index) => {

        const total = item.quantity * item.price;

        grandTotal += total;

        // Convert reverse index back to original index
        const originalIndex = room.cart.length - 1 - index;

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>

                <strong>${item.name}</strong>

                <br>

                <small class="text-muted">

                    <i class="bi bi-person-fill"></i>

                    ${item.addedBy || "Unknown"}

                </small>

                <br>

                <small class="text-muted">

                    <i class="bi bi-clock"></i>

                    ${item.addedAt || "-"}

                </small>

            </td>

            <td>

                ${item.quantity}

            </td>

            <td>

                ₹${item.price}

            </td>

            <td>

                ₹${total}

            </td>

            <td>

                <button
                    class="btn btn-sm btn-danger delete-btn"
                    data-index="${originalIndex}">

                    <i class="bi bi-trash"></i>

                </button>

            </td>

        `;

        cartItems.appendChild(row);

    });

    document.getElementById("grandTotal").textContent = `₹${grandTotal}`;

    updateDashboard();

    // Delete Item
    document.querySelectorAll(".delete-btn").forEach(button => {

        button.addEventListener("click", () => {

            const index = Number(button.dataset.index);

            const deletedItem = room.cart[index];

            room.cart.splice(index, 1);

            room.activity.push(
                `${currentUser} deleted ${deletedItem.name}`
            );

            localStorage.setItem(
                roomCode,
                JSON.stringify(room)
            );

            displayCart();
            displayActivity();
            showToast("Item added successfully!", "success");

        });

    });

}


// ==========================
// Display Activity
// ==========================
function displayActivity() {

    activityLog.innerHTML = "";

    // Display latest activity first
    [...room.activity].reverse().forEach(activity => {

        const log = document.createElement("div");

        log.className = "border rounded p-3 bg-light";

        log.innerHTML = `
            <i class="bi bi-activity text-success me-2"></i>
            ${activity}
        `;

        activityLog.appendChild(log);

    });

}

// ==========================
// Initial Load
// ==========================
displayMembers();
displayCart();
displayActivity();

// ==========================
// Add Item
// ==========================
addItemBtn.addEventListener("click", () => {

    const name = itemName.value.trim();
    const quantity = itemQuantity.value.trim();
    const price = itemPrice.value.trim();

    if (name === "") {

        showToast("Please enter an item name.", "warning");
        itemName.focus();
        return;

    }

    if (quantity === "" || Number(quantity) <= 0) {

        showToast("Quantity must be greater than 0.", "warning");
        return;

    }

    if (price === "" || Number(price) <= 0) {

        showToast("Price must be greater than 0.", "warning");
        itemPrice.focus();
        return;

    }

    const item = {

        name: name,
        quantity: Number(quantity),
        price: Number(price),

        addedBy: currentUser,

        addedAt: new Date().toLocaleString()

    };

    room.cart.push(item);

    room.activity.push(
        `${currentUser} added ${name} (Qty: ${quantity})`
    );

    localStorage.setItem(
        roomCode,
        JSON.stringify(room)
    );

    displayCart();
    displayActivity();

    itemName.value = "";
    itemQuantity.value = "";
    itemPrice.value = "";

    itemName.focus();

});

// ==========================
// Storage Sync
// ==========================
window.addEventListener("storage", (event) => {

    if (event.key === roomCode) {

        const updatedRoom = JSON.parse(event.newValue);

        if (!updatedRoom) return;

        room.users = updatedRoom.users;
        room.cart = updatedRoom.cart;
        room.activity = updatedRoom.activity || [];

        displayMembers();
        displayCart();
        displayActivity();

    }

});

// ==========================
// Receipt
// ==========================
receiptBtn.addEventListener("click", () => {

    window.location.href = `receipt.html?roomCode=${roomCode}`;

});

// ==========================
// Empty Cart
// ==========================
emptyCartBtn.addEventListener("click", () => {

    if (room.cart.length === 0) {

        showToast("Cart is already empty.", "danger");
        return;

    }

    if (!confirm("Are you sure you want to empty the cart?")) {

        return;

    }

    room.cart = [];

room.activity.push(
    `${currentUser} cleared the shopping cart`
);

localStorage.setItem(
    roomCode,
    JSON.stringify(room)
);

displayCart();
displayActivity();

showToast("Shopping cart cleared successfully!", "success");

});