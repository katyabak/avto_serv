// ============================================
// Кастомный дропдаун с поиском (после 3 символов)
// ============================================
function initCustomDropdown(fieldId, items, enableSearch = true, minChars = 0) {
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

        if (!enableSearch) {
            // Если поиск отключен, показываем все (БЕЗ ОГРАНИЧЕНИЙ)
            renderDropdown(items);
        } else {
            // Если поиск включен
            if (value.length < minChars) {
                // Если введено меньше minChars символов, скрываем список
                dropdown.classList.add("d-none");
                return;
            }
            // Фильтруем результаты (БЕЗ ОГРАНИЧЕНИЙ - показываем ВСЕ совпадения)
            const filtered = items.filter(i =>
                i.toLowerCase().includes(value.toLowerCase())
            );
            renderDropdown(filtered);
        }
    });

    // Обработчик клика - показываем список только если поиск отключен
    if (!enableSearch) {
        input.addEventListener("click", () => {
            renderDropdown(items);
        });

        input.addEventListener("focus", () => {
            renderDropdown(items);
        });
    }

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
    // Для запчастей: поиск включен, список появляется после ввода 3 символов, ВСЕ результаты
    initCustomDropdown("detail", window.detailList || [], true, 3);

    // Для остальных полей: поиск отключен, список показывается при клике, все результаты
    initCustomDropdown("delivery", window.deliveryList || [], false, 0);
    initCustomDropdown("payment-method", window.paymentList || [], false, 0);
    initCustomDropdown("reservation", window.reservationList || [], false, 0);
    initCustomDropdown("reservation-days", window.reservationDaysList || [], false, 0);

    // Инициализация логики отображения дней резервирования
    initReservationDaysToggle();
});
