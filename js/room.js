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
const itemName = document.getElementById("itemName");
const itemQuantity = document.getElementById("itemQuantity");
const itemPrice = document.getElementById("itemPrice");
const addItemBtn = document.getElementById("addItemBtn");
const cartItems = document.getElementById("cartItems");


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

            const index = button.dataset.index;

            room.cart.splice(index, 1);

            localStorage.setItem(roomCode, JSON.stringify(room));

            displayCart();

        });

    });

}
displayCart();

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

    localStorage.setItem(roomCode, JSON.stringify(room));

    displayCart();

    itemName.value = "";
    itemQuantity.value = "";
    itemPrice.value = "";

});