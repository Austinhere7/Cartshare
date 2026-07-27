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
const currentUser =
    params.get("user") || room.host;

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

        listItem.innerHTML =
            `<i class="bi bi-person-fill text-primary"></i> ${user}`;

        memberList.appendChild(listItem);

    });

}

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

        return;

    }

    let grandTotal = 0;

    // Display latest items first
    [...room.cart].reverse().forEach((item, index) => {

        const total = item.quantity * item.price;

        grandTotal += total;

        // Convert reversed index to original index
        const originalIndex = room.cart.length - 1 - index;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.name}</td>

            <td>${item.quantity}</td>

            <td>₹${item.price}</td>

            <td>₹${total}</td>

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

        log.className = "border rounded p-2 mb-2";

        log.textContent = activity;

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

        alert("Please enter an item name.");

        itemName.focus();

        return;

    }

    if (quantity === "" || Number(quantity) <= 0) {

        alert("Quantity must be greater than 0.");

        itemQuantity.focus();

        return;

    }

    if (price === "" || Number(price) <= 0) {

        alert("Price must be greater than 0.");

        itemPrice.focus();

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

    localStorage.setItem(
        roomCode,
        JSON.stringify(room)
    );

    displayCart();
    displayActivity();

    itemName.value = "";
    itemQuantity.value = "";
    itemPrice.value = "";

});


// ==========================
// Storage Sync
// ==========================
window.addEventListener("storage", (event) => {

    if (event.key === roomCode) {

        const updatedRoom = JSON.parse(event.newValue);

        if (!updatedRoom) {
            return;
        }

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

        alert("Cart is already empty.");

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

});