// ==========================
// Receipt Setup
// ==========================
const params = new URLSearchParams(window.location.search);
const roomCode = params.get("roomCode");
const room = JSON.parse(localStorage.getItem(roomCode));

if (!room) {
    alert("Room not found!");
    window.location.href = "../index.html";
}

room.cart = Array.isArray(room.cart) ? room.cart : [];
room.users = Array.isArray(room.users) ? room.users : [];

// ==========================
// Select Elements
// ==========================
const elements = {
    receiptRoom: document.getElementById("receiptRoom"),
    receiptHost: document.getElementById("receiptHost"),
    receiptItems: document.getElementById("receiptItems"),
    receiptMembers: document.getElementById("receiptMembers"),
    receiptTotal: document.getElementById("receiptTotal"),
    receiptDate: document.getElementById("receiptDate"),
    totalItems: document.getElementById("totalItems"),
    totalMembers: document.getElementById("totalMembers"),
    printReceiptBtn: document.getElementById("printReceiptBtn"),
};

function formatCurrency(value) {
    const normalized = Number(value) || 0;
    return `₹${normalized.toLocaleString("en-IN", {
        minimumFractionDigits: normalized % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatDateTime(value) {
    const timestamp = Date.parse(value);

    if (Number.isNaN(timestamp)) {
        return new Date().toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short",
        });
    }

    return new Date(timestamp).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

// ==========================
// Header Details
// ==========================
elements.receiptRoom.textContent = room.roomCode;
elements.receiptHost.textContent = room.host;
elements.receiptDate.textContent = formatDateTime(new Date().toISOString());
elements.totalItems.textContent = room.cart.length;
elements.totalMembers.textContent = room.users.length;

// ==========================
// Receipt Items
// ==========================
let grandTotal = 0;

elements.receiptItems.innerHTML = "";

if (room.cart.length === 0) {
    elements.receiptItems.innerHTML = `
        <tr>
            <td colspan="5">
                <div class="receipt-empty-state">
                    <i class="bi bi-cart-x"></i>
                    <h5 class="mb-2">No items were found in this cart.</h5>
                    <p class="text-secondary mb-0">The receipt will update once items are added to the shared room.</p>
                </div>
            </td>
        </tr>
    `;
}

room.cart.forEach((item) => {
    const total = Number(item.quantity || 0) * Number(item.price || 0);
    grandTotal += total;

    const row = document.createElement("tr");
    row.innerHTML = `
        <td data-label="Item Name">
            <div class="receipt-item-name">${item.name}</div>
            <small class="text-secondary">Added ${item.addedAt ? `on ${formatDateTime(item.addedAt)}` : "recently"}</small>
        </td>
        <td data-label="Added By">${item.addedBy || "Unknown"}</td>
        <td data-label="Qty" class="text-center">${item.quantity}</td>
        <td data-label="Price" class="text-end">${formatCurrency(item.price)}</td>
        <td data-label="Total" class="text-end fw-semibold">${formatCurrency(total)}</td>
    `;

    elements.receiptItems.appendChild(row);
});

// ==========================
// Totals
// ==========================
elements.receiptTotal.textContent = formatCurrency(grandTotal);

// ==========================
// Members
// ==========================
elements.receiptMembers.innerHTML = "";

room.users.forEach((user) => {
    const chip = document.createElement("span");
    chip.className = `member-chip ${user === room.host ? "member-chip-host" : ""}`;
    chip.textContent = user;
    elements.receiptMembers.appendChild(chip);
});

if (room.users.length === 0) {
    const empty = document.createElement("div");
    empty.className = "text-secondary";
    empty.textContent = "No members available.";
    elements.receiptMembers.appendChild(empty);
}

// ==========================
// Print Action
// ==========================
elements.printReceiptBtn.addEventListener("click", () => {
    window.print();
});
