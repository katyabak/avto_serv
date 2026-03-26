// ============================================
// Кастомный дропдаун с поиском
// ============================================
function initCustomDropdown(fieldId, items, enableSearch = true) {
    const input = document.getElementById(fieldId + "-input");
    const dropdown = document.getElementById(fieldId + "-dropdown");
    let currentFocus = -1;
    let currentItems = [];

    // Если элемент не найден, выходим
    if (!input || !dropdown) return;

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
            div.className = "custom-item";
            div.textContent = item;
            div.onclick = () => selectItem(index);
            dropdown.appendChild(div);
        });

        dropdown.classList.remove("d-none");
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
            input.dispatchEvent(new Event("change", { bubbles: true }));
        }
        dropdown.classList.add("d-none");
        currentFocus = -1;
    }

    // Обработчик ввода текста (поиск)
    input.addEventListener("input", () => {
        const value = input.value.trim();
        if (!value && !enableSearch) {
            // Если поиск отключен и поле пустое, показываем все
            renderDropdown(items.slice(0, 50));
        } else if (enableSearch) {
            // Если поиск включен, фильтруем
            const filtered = items.filter(i =>
                i.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 50);
            renderDropdown(filtered);
        } else {
            // Если поиск отключен, показываем все при любом вводе
            renderDropdown(items.slice(0, 50));
        }
    });

    // Обработчик клика - показываем список
    input.addEventListener("click", () => {
        renderDropdown(items.slice(0, 50));
    });

    // Обработчик фокуса - тоже показываем список
    input.addEventListener("focus", () => {
        renderDropdown(items.slice(0, 50));
    });

    // Обработчик клавиатуры
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
            if (currentFocus > -1) {
                selectItem(currentFocus);
            } else if (currentItems.length > 0) {
                selectItem(0);
            }
        } else if (e.key === "Escape") {
            dropdown.classList.add("d-none");
        }
    });

    // Закрытие dropdown при клике вне
    document.addEventListener("click", (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add("d-none");
        }
    });
}


// ============================================
// Инициализация всех полей
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    // включаем поиск (enableSearch = true)
    initCustomDropdown("detail", window.detailList || [], true);
    initCustomDropdown("delivery", window.deliveryList || [], false);
    initCustomDropdown("payment-method", window.paymentList || [], false);
    initCustomDropdown("reservation", window.reservationList || [], false);
    initCustomDropdown("reservation-days", window.reservationDaysList || [], false);
});

