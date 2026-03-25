function initCustomDropdown(fieldId, items) {
    const input = document.getElementById(fieldId + "-input");
    const dropdown = document.getElementById(fieldId + "-dropdown");
    let currentFocus = -1;
    let currentItems = [];

    function renderDropdown(filteredItems) {
        dropdown.innerHTML = "";
        currentItems = filteredItems;
        currentFocus = -1;

        if (!filteredItems.length) {
            dropdown.classList.add("d-none");
            return;
        }

        filteredItems.forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "custom-item"; // класс как в appointment
            div.textContent = item;
            div.onclick = () => selectItem(index);
            dropdown.appendChild(div);
        });

        dropdown.classList.remove("d-none"); // показываем поверх
    }

    function setActive(index) {
        const items = dropdown.querySelectorAll(".custom-item");
        items.forEach(item => item.classList.remove("active"));
        if (index >= 0 && index < items.length) {
            items[index].classList.add("active");
            items[index].scrollIntoView({ block: "nearest" });
        }
    }

    function selectItem(index) {
        if (index >= 0 && index < currentItems.length) {
            input.value = currentItems[index];
            input.dispatchEvent(new Event("change"));
        }
        dropdown.classList.add("d-none");
        currentFocus = -1;
    }

    input.addEventListener("input", () => {
        const value = input.value.trim().toLowerCase();
        const filtered = items.filter(i => i.toLowerCase().includes(value)).slice(0, 50);
        renderDropdown(filtered);
    });

    input.addEventListener("click", () => renderDropdown(items.slice(0, 50)));

    input.addEventListener("keydown", (e) => {
        const itemsDom = dropdown.querySelectorAll(".custom-item");
        if (dropdown.classList.contains("d-none")) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            currentFocus++;
            if (currentFocus >= itemsDom.length) currentFocus = 0;
            setActive(currentFocus);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            currentFocus--;
            if (currentFocus < 0) currentFocus = itemsDom.length - 1;
            setActive(currentFocus);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (currentFocus > -1) selectItem(currentFocus);
        } else if (e.key === "Escape") {
            dropdown.classList.add("d-none");
        }
    });

    document.addEventListener("click", (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add("d-none");
        }
    });
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
    initCustomDropdown("detail", window.detailList || []);
    initCustomDropdown("delivery", window.deliveryList || []);
    initCustomDropdown("payment-method", window.paymentList || []);
    initCustomDropdown("reservation", window.reservationList || []);
    initCustomDropdown("reservation-days", window.reservationDaysList || []);
});
