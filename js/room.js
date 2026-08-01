// ==========================
// Room Setup
// ==========================
const params = new URLSearchParams(window.location.search);
const roomCode = params.get("roomCode");

if (!roomCode) {
    alert("Invalid room link.");
    window.location.href = "../index.html";
}

const storedRoom = JSON.parse(localStorage.getItem(roomCode));

if (!storedRoom) {
    alert("Room not found.");
    window.location.href = "../index.html";
}

const room = storedRoom;
room.activity = Array.isArray(room.activity) ? room.activity : [];
room.cart = Array.isArray(room.cart) ? room.cart : [];
room.users = Array.isArray(room.users) ? room.users : [];

const currentUser = params.get("user") || room.host;

// ==========================
// Select Elements
// ==========================
const elements = {
    roomTitle: document.getElementById("roomTitle"),
    roomCodeDisplay: document.getElementById("roomCodeDisplay"),
    hostDisplay: document.getElementById("hostDisplay"),
    roomMemberCount: document.getElementById("roomMemberCount"),
    roomItemCount: document.getElementById("roomItemCount"),
    roomConnectionStatus: document.getElementById("roomConnectionStatus"),
    connectionStatusBadge: document.getElementById("connectionStatusBadge"),
    connectionStatusText: document.getElementById("connectionStatusText"),
    memberCount: document.getElementById("memberCount"),
    itemCount: document.getElementById("itemCount"),
    memberCountCard: document.getElementById("memberCountCard"),
    itemCountCard: document.getElementById("itemCountCard"),
    dashboardTotal: document.getElementById("dashboardTotal"),
    dashboardTotalCard: document.getElementById("dashboardTotalCard"),
    memberList: document.getElementById("memberList"),
    itemName: document.getElementById("itemName"),
    itemQuantity: document.getElementById("itemQuantity"),
    itemPrice: document.getElementById("itemPrice"),
    addItemBtn: document.getElementById("addItemBtn"),
    addItemLabel: document.querySelector("#addItemBtn .btn-label"),
    addItemLoading: document.querySelector("#addItemBtn .btn-loading"),
    itemSearch: document.getElementById("itemSearch"),
    sortItemsSelect: document.getElementById("sortItemsSelect"),
    cartItems: document.getElementById("cartItems"),
    activityLog: document.getElementById("activityLog"),
    receiptBtn: document.getElementById("receiptBtn"),
    emptyCartBtn: document.getElementById("emptyCartBtn"),
    copyRoomCodeBtn: document.getElementById("copyRoomCodeBtn"),
    confirmEmptyCartBtn: document.getElementById("confirmEmptyCartBtn"),
    toastElement: document.getElementById("liveToast"),
    toastMessage: document.getElementById("toastMessage"),
    grandTotal: document.getElementById("grandTotal"),
};

const toast = new bootstrap.Toast(elements.toastElement);
const emptyCartModal = new bootstrap.Modal(document.getElementById("emptyCartModal"));

const state = {
    searchTerm: "",
    sortBy: "newest",
    newlyAddedId: null,
    deletingIds: new Set(),
};

let localItemSequence = 0;

// ==========================
// Helpers
// ==========================
function getItemId(item, fallbackIndex = 0) {
    if (item.id) {
        return item.id;
    }

    return `${item.name || "item"}-${item.addedAt || fallbackIndex}-${fallbackIndex}`;
}

function generateId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    const timestamp = Date.now().toString(36);
    localItemSequence += 1;
    return `${timestamp}-${localItemSequence.toString(36)}`;
}

function formatCurrency(value) {
    const normalized = Number(value) || 0;
    return `₹${normalized.toLocaleString("en-IN", {
        minimumFractionDigits: normalized % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    })}`;
}

function parseTimestamp(value) {
    if (!value) {
        return null;
    }

    if (typeof value === "number") {
        return value;
    }

    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
}

function formatDateTime(value) {
    const timestamp = parseTimestamp(value);

    if (!timestamp) {
        return "-";
    }

    return new Date(timestamp).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function formatRelativeTime(value) {
    const timestamp = parseTimestamp(value);

    if (!timestamp) {
        return "Just now";
    }

    const diffSeconds = Math.round((timestamp - Date.now()) / 1000);
    const absoluteSeconds = Math.abs(diffSeconds);
    const units = [
        ["year", 31536000],
        ["month", 2592000],
        ["day", 86400],
        ["hour", 3600],
        ["minute", 60],
        ["second", 1],
    ];

    for (const [unit, size] of units) {
        if (absoluteSeconds >= size || unit === "second") {
            const value = Math.round(diffSeconds / size);
            return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(value, unit);
        }
    }

    return "Just now";
}

function saveRoomState() {
    localStorage.setItem(roomCode, JSON.stringify(room));
}

function showToast(message, type = "primary") {
    elements.toastElement.className = `toast align-items-center text-bg-${type} border-0`;
    elements.toastMessage.textContent = message;
    toast.show();
}

function setAddButtonLoading(isLoading) {
    elements.addItemBtn.disabled = isLoading;
    elements.addItemLabel.classList.toggle("d-none", isLoading);
    elements.addItemLoading.classList.toggle("d-none", !isLoading);
}

function pushActivity(message, icon = "bi-activity", tone = "primary", timestamp = Date.now()) {
    room.activity.unshift({
        message,
        icon,
        tone,
        timestamp,
        user: currentUser,
    });
}

function isActivityObject(entry) {
    return entry && typeof entry === "object" && !Array.isArray(entry);
}

function getActivityEntry(entry) {
    if (isActivityObject(entry)) {
        return {
            message: entry.message || "Activity update",
            icon: entry.icon || "bi-activity",
            tone: entry.tone || "primary",
            timestamp: entry.timestamp || null,
        };
    }

    return {
        message: entry,
        icon: "bi-activity",
        tone: "primary",
        timestamp: null,
    };
}

function getVisibleItems() {
    const query = state.searchTerm.trim().toLowerCase();

    const items = room.cart.map((item, index) => ({
        ...item,
        _index: index,
        _id: getItemId(item, index),
        _timestamp: parseTimestamp(item.addedAt) || 0,
    }));

    const filtered = query
        ? items.filter((item) => {
            return [item.name, item.addedBy, item.addedAt]
                .filter(Boolean)
                .some((field) => String(field).toLowerCase().includes(query));
        })
        : items;

    const sorted = [...filtered].sort((left, right) => {
        if (state.sortBy === "oldest") {
            return left._timestamp - right._timestamp;
        }

        if (state.sortBy === "name") {
            return String(left.name).localeCompare(String(right.name));
        }

        if (state.sortBy === "price") {
            return Number(right.price) - Number(left.price);
        }

        if (state.sortBy === "quantity") {
            return Number(right.quantity) - Number(left.quantity);
        }

        return right._timestamp - left._timestamp;
    });

    return sorted;
}

function updateDashboard() {
    const memberTotal = room.users.length;
    const itemTotal = room.cart.length;
    const grandTotal = room.cart.reduce((total, item) => {
        return total + Number(item.quantity || 0) * Number(item.price || 0);
    }, 0);

    const formattedTotal = formatCurrency(grandTotal);
    const connectionText = "Connected";

    elements.memberCount.textContent = memberTotal;
    elements.itemCount.textContent = itemTotal;
    elements.memberCountCard.textContent = memberTotal;
    elements.itemCountCard.textContent = itemTotal;
    elements.dashboardTotal.textContent = formattedTotal;
    elements.dashboardTotalCard.textContent = formattedTotal;
    elements.grandTotal.textContent = grandTotal.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
    elements.roomMemberCount.textContent = memberTotal;
    elements.roomItemCount.textContent = itemTotal;
    elements.roomConnectionStatus.textContent = connectionText;
    elements.connectionStatusText.textContent = connectionText;
    elements.connectionStatusBadge.innerHTML = '<i class="bi bi-wifi"></i> Connected';
    elements.roomConnectionStatus.className = "info-badge info-badge-connected";
}

function renderMembers() {
    elements.memberList.innerHTML = "";

    room.users.forEach((user) => {
        const listItem = document.createElement("li");
        listItem.className = "member-item";
        listItem.innerHTML = `
            <span class="member-avatar"><i class="bi bi-person-fill"></i></span>
            <span class="member-name">${user}</span>
            ${user === room.host ? '<span class="badge rounded-pill text-bg-primary-subtle text-primary">Host</span>' : ''}
        `;
        elements.memberList.appendChild(listItem);
    });

    if (room.users.length === 0) {
        const emptyState = document.createElement("li");
        emptyState.className = "empty-state-inline";
        emptyState.innerHTML = `
            <i class="bi bi-people"></i>
            <strong>No members yet</strong>
        `;
        elements.memberList.appendChild(emptyState);
    }
}

function renderCart() {
    const visibleItems = getVisibleItems();
    elements.cartItems.innerHTML = "";

    if (room.cart.length === 0) {
        elements.cartItems.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state-card">
                        <div class="empty-state-icon empty-state-icon-cart">
                            <i class="bi bi-cart-x"></i>
                        </div>
                        <h5 class="mb-2">Your shopping cart is empty</h5>
                        <p class="text-secondary mb-0">Add items to start building the shared receipt.</p>
                    </div>
                </td>
            </tr>
        `;
        updateDashboard();
        return;
    }

    if (visibleItems.length === 0) {
        elements.cartItems.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state-card">
                        <div class="empty-state-icon empty-state-icon-search">
                            <i class="bi bi-search"></i>
                        </div>
                        <h5 class="mb-2">No items match your search</h5>
                        <p class="text-secondary mb-0">Try a different keyword or clear the search field.</p>
                    </div>
                </td>
            </tr>
        `;
        updateDashboard();
        return;
    }

    visibleItems.forEach((item) => {
        const total = Number(item.quantity || 0) * Number(item.price || 0);
        const row = document.createElement("tr");
        row.dataset.itemId = item._id;
        row.className = "cart-row";

        if (state.newlyAddedId === item._id) {
            row.classList.add("row-highlight");
        }

        if (state.deletingIds.has(item._id)) {
            row.classList.add("row-removing");
        }

        row.innerHTML = `
            <td data-label="Item Name">
                <div class="cart-item-title">${item.name}</div>
            </td>
            <td data-label="Added By">
                <span class="cart-added-by">${item.addedBy || "Unknown"}</span>
            </td>
            <td data-label="Added Time">
                <div class="cart-time">
                    <span>${formatRelativeTime(item.addedAt)}</span>
                    <small>${formatDateTime(item.addedAt)}</small>
                </div>
            </td>
            <td data-label="Quantity" class="text-center">${item.quantity}</td>
            <td data-label="Price" class="text-end">${formatCurrency(item.price)}</td>
            <td data-label="Total" class="text-end fw-semibold">${formatCurrency(total)}</td>
            <td data-label="Action" class="text-center">
                <button class="btn btn-sm btn-outline-danger delete-btn" type="button" title="Delete item" aria-label="Delete ${item.name}" data-item-id="${item._id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        elements.cartItems.appendChild(row);
    });

    updateDashboard();
    bindDeleteButtons();

    if (state.newlyAddedId) {
        window.setTimeout(() => {
            state.newlyAddedId = null;
            renderCart();
        }, 900);
    }
}

function renderActivity() {
    elements.activityLog.innerHTML = "";

    if (room.activity.length === 0) {
        elements.activityLog.innerHTML = `
            <div class="empty-state-card empty-state-card-compact">
                <div class="empty-state-icon empty-state-icon-activity">
                    <i class="bi bi-journal-text"></i>
                </div>
                <h5 class="mb-2">No activity yet</h5>
                <p class="text-secondary mb-0">Actions in this room will appear here in real time.</p>
            </div>
        `;
        return;
    }

    room.activity
        .map(getActivityEntry)
        .forEach((entry) => {
            const activityCard = document.createElement("div");
            activityCard.className = "activity-card";
            activityCard.innerHTML = `
                <div class="activity-icon activity-icon-${entry.tone}">
                    <i class="bi ${entry.icon}"></i>
                </div>
                <div class="activity-body">
                    <div class="activity-message">${entry.message}</div>
                    <div class="activity-meta">
                        <span>${formatRelativeTime(entry.timestamp)}</span>
                        <span>•</span>
                        <span>${formatDateTime(entry.timestamp)}</span>
                    </div>
                </div>
            `;
            elements.activityLog.appendChild(activityCard);
        });
}

function bindDeleteButtons() {
    document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const itemId = button.dataset.itemId;
            const index = room.cart.findIndex((item, currentIndex) => {
                return getItemId(item, currentIndex) === itemId;
            });

            if (index < 0) {
                return;
            }

            const deletedItem = room.cart[index];
            state.deletingIds.add(itemId);
            renderCart();

            window.setTimeout(() => {
                room.cart.splice(index, 1);
                pushActivity(`${currentUser} deleted ${deletedItem.name}`, "bi-trash3-fill", "danger", Date.now());
                saveRoomState();
                state.deletingIds.delete(itemId);
                renderCart();
                renderActivity();
                showToast("Item deleted successfully.", "success");
            }, 200);
        });
    });
}

async function copyRoomCode() {
    if (!navigator.clipboard?.writeText) {
        showToast("Clipboard access is unavailable.", "warning");
        return;
    }

    navigator.clipboard.writeText(room.roomCode)
        .then(() => {
            showToast("Room code copied successfully.", "success");
        })
        .catch(() => {
            showToast("Unable to copy room code.", "danger");
        });
}

// ==========================
// Initial Render
// ==========================
function renderAll() {
    renderMembers();
    renderCart();
    renderActivity();
    updateDashboard();
}

renderAll();

// ==========================
// Events
// ==========================
elements.copyRoomCodeBtn.addEventListener("click", copyRoomCode);

elements.itemSearch.addEventListener("input", (event) => {
    state.searchTerm = event.target.value;
    renderCart();
});

elements.sortItemsSelect.addEventListener("change", (event) => {
    state.sortBy = event.target.value;
    renderCart();
});

elements.addItemBtn.addEventListener("click", () => {
    const name = elements.itemName.value.trim();
    const quantity = Number(elements.itemQuantity.value);
    const price = Number(elements.itemPrice.value);

    if (name === "") {
        showToast("Please enter an item name.", "warning");
        elements.itemName.focus();
        return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
        showToast("Quantity must be greater than 0.", "warning");
        elements.itemQuantity.focus();
        return;
    }

    if (!Number.isFinite(price) || price <= 0) {
        showToast("Price must be greater than 0.", "warning");
        elements.itemPrice.focus();
        return;
    }

    setAddButtonLoading(true);

    window.setTimeout(() => {
        const item = {
            id: generateId(),
            name,
            quantity,
            price,
            addedBy: currentUser,
            addedAt: new Date().toISOString(),
        };

        room.cart.push(item);
        room.activity.unshift({
            message: `${currentUser} added ${name} (Qty: ${quantity})`,
            icon: "bi-plus-circle-fill",
            tone: "success",
            timestamp: Date.now(),
            user: currentUser,
        });

        state.newlyAddedId = item.id;
        saveRoomState();
        renderCart();
        renderActivity();

        elements.itemName.value = "";
        elements.itemQuantity.value = "";
        elements.itemPrice.value = "";
        elements.itemName.focus();
        setAddButtonLoading(false);
        showToast("Item added successfully.", "success");
    }, 180);
});

window.addEventListener("storage", (event) => {
    if (event.key !== roomCode || !event.newValue) {
        return;
    }

    const updatedRoom = JSON.parse(event.newValue);

    if (!updatedRoom) {
        return;
    }

    room.users = Array.isArray(updatedRoom.users) ? updatedRoom.users : [];
    room.cart = Array.isArray(updatedRoom.cart) ? updatedRoom.cart : [];
    room.activity = Array.isArray(updatedRoom.activity) ? updatedRoom.activity : [];

    renderAll();
});

elements.receiptBtn.addEventListener("click", () => {
    window.location.href = `receipt.html?roomCode=${roomCode}`;
});

elements.emptyCartBtn.addEventListener("click", () => {
    if (room.cart.length === 0) {
        showToast("Cart is already empty.", "warning");
        return;
    }

    emptyCartModal.show();
});

elements.confirmEmptyCartBtn.addEventListener("click", () => {
    room.cart = [];
    pushActivity(`${currentUser} cleared the shopping cart`, "bi-trash3-fill", "danger", Date.now());
    saveRoomState();
    emptyCartModal.hide();
    renderCart();
    renderActivity();
    showToast("Shopping cart cleared successfully!", "success");
});
