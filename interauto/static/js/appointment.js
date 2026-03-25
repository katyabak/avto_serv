/* ============================================
   Модуль для страницы записи на СТО
   ============================================ */

// ============================================
// Инициализация календаря и временных слотов
// ============================================
(function() {
    'use strict';

    // Получаем элементы DOM
    const timeSlotsContainer = document.getElementById("time-slots");
    const selectedTimeInput = document.getElementById("selected-time");
    const dateInput = document.getElementById("id_date");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /**
     * Генерация слотов времени на основе выбранной даты
     * Загружает занятые времена с сервера и отображает доступные слоты
     */
    async function generateTimeSlots() {
        timeSlotsContainer.innerHTML = "";

        if (!dateInput.value) {
            const placeholder = document.createElement("div");
            placeholder.className = "text-muted w-100 text-left py-3";
            placeholder.innerHTML = 'Сначала выберите дату';
            timeSlotsContainer.appendChild(placeholder);
            return;
        }

        const loading = document.createElement("div");
        loading.className = "text-muted w-100 text-center py-3 loading-slots";
        loading.innerHTML = 'Загрузка...';
        timeSlotsContainer.appendChild(loading);

        try {
            const response = await fetch(`/account/appointment/busy-times/?date=${dateInput.value}`);
            const data = await response.json();
            const busyTimes = data.busy_times;

            timeSlotsContainer.innerHTML = "";
            let hasAvailableSlots = false;

            // Генерируем слоты с 9:00 до 17:00
            for (let h = 9; h < 18; h++) {
                let time = `${h.toString().padStart(2, '0')}:00`;
                let btn = document.createElement("button");
                btn.type = "button";
                btn.className = "btn";

                if (busyTimes.includes(time)) {
                    btn.className += " btn-secondary";
                    btn.innerText = time;
                    btn.disabled = true;
                } else {
                    hasAvailableSlots = true;
                    btn.className += " btn-outline-secondary";
                    btn.innerText = time;
                    btn.onclick = () => {
                        document.querySelectorAll("#time-slots button")
                            .forEach(b => b.classList.remove("btn-success"));
                        btn.classList.add("btn-success");
                        selectedTimeInput.value = time;
                    };
                }
                timeSlotsContainer.appendChild(btn);
            }

            if (!hasAvailableSlots) {
                const noSlots = document.createElement("div");
                noSlots.className = "text-danger w-100 text-center py-3";
                noSlots.innerHTML = '❌ На эту дату нет свободного времени';
                timeSlotsContainer.appendChild(noSlots);
            }
        } catch (error) {
            timeSlotsContainer.innerHTML = "";
            const errorMsg = document.createElement("div");
            errorMsg.className = "text-danger w-100 text-center py-3";
            errorMsg.innerHTML = '⚠️ Ошибка загрузки времени. Пожалуйста, попробуйте позже.';
            timeSlotsContainer.appendChild(errorMsg);
        }
    }

    /**
     * Инициализация Flatpickr календаря
     */
    function initFlatpickr() {
        flatpickr(".datepicker-input", {
            locale: "ru",
            dateFormat: "Y-m-d",
            altInput: true,
            altFormat: "J.m.Y",
            minDate: "today",
            allowInput: false,
            disableMobile: true,
            onChange: function(selectedDates, dateStr, instance) {
                dateInput.value = dateStr;
                generateTimeSlots();
            },
            onReady: function(selectedDates, dateStr, instance) {
                instance.calendarContainer.classList.add('custom-calendar');
                const days = instance.calendarContainer.querySelectorAll('.flatpickr-day');
                days.forEach(day => {
                    const dayDate = day.dateObj;
                    if (dayDate && dayDate < today) {
                        day.classList.add('disabled');
                    }
                });
            },
            onMonthChange: function(selectedDates, dateStr, instance) {
                setTimeout(() => {
                    const days = instance.calendarContainer.querySelectorAll('.flatpickr-day');
                    days.forEach(day => {
                        const dayDate = day.dateObj;
                        if (dayDate && dayDate < today) {
                            day.classList.add('disabled');
                        }
                    });
                }, 10);
            }
        });
    }

    // Инициализация календаря при загрузке страницы
    initFlatpickr();

    // Установка начального состояния временных слотов
    setTimeout(() => {
        if (!dateInput.value) {
            const placeholder = document.createElement("div");
            placeholder.className = "text-muted w-100 text-left py-3";
            placeholder.innerHTML = 'Сначала выберите дату';
            timeSlotsContainer.innerHTML = "";
            timeSlotsContainer.appendChild(placeholder);
        }
    }, 100);

    // ============================================
    // Валидация и форматирование поля года
    // ============================================
    const yearInput = document.getElementById("id_year");
    yearInput.addEventListener("input", function () {
        this.value = this.value.replace(/[^0-9]/g, '').slice(0, 4);
    });

    // ============================================
    // Стилизация поля выбора услуги
    // ============================================
    const serviceSelect = document.getElementById('id_service');
    if (serviceSelect) {
        if (serviceSelect.value === '') {
            serviceSelect.style.color = '#adb5bd';
        }
        serviceSelect.addEventListener('change', function() {
            if (this.value === '') {
                this.style.color = '#adb5bd';
            } else {
                this.style.color = '#243642';
            }
        });
    }
})();

// ============================================
// Модуль автодополнения для марок автомобилей
// ============================================
(function() {
    'use strict';

    const brands = window.brandsList || []; // Список марок передается из шаблона
    const input = document.getElementById("brand-input");
    const dropdown = document.getElementById("brand-dropdown");

    let currentFocus = -1;
    let currentItems = [];

    /**
     * Фильтрация марок по введенному запросу
     * @param {string} query - поисковый запрос
     * @returns {Array} отфильтрованный список марок
     */
    function filterBrands(query) {
        return brands.filter(b =>
            b.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 10);
    }

    /**
     * Отображение выпадающего списка
     * @param {Array} items - список марок для отображения
     */
    function renderDropdown(items) {
        dropdown.innerHTML = "";
        currentItems = items;
        currentFocus = -1;

        if (items.length === 0) {
            dropdown.classList.add("d-none");
            return;
        }

        items.forEach((brand, index) => {
            const div = document.createElement("div");
            div.className = "brand-item";
            div.textContent = brand;
            div.onclick = () => selectItem(index);
            dropdown.appendChild(div);
        });

        dropdown.classList.remove("d-none");
    }

    /**
     * Установка активного элемента в выпадающем списке
     * @param {number} index - индекс активного элемента
     */
    function setActive(index) {
        const items = dropdown.querySelectorAll(".brand-item");
        items.forEach(item => item.classList.remove("active"));

        if (index >= 0 && index < items.length) {
            items[index].classList.add("active");
            items[index].scrollIntoView({ block: "nearest" });
        }
    }

    /**
     * Выбор марки из списка
     * @param {number} index - индекс выбранной марки
     */
    function selectItem(index) {
        if (index >= 0 && index < currentItems.length) {
            input.value = currentItems[index];
        }
        dropdown.classList.add("d-none");
        currentFocus = -1;
    }

    // Обработчик ввода текста
    input.addEventListener("input", () => {
        const value = input.value.trim();
        if (!value) {
            dropdown.classList.add("d-none");
            return;
        }
        const filtered = filterBrands(value);
        renderDropdown(filtered);
    });

    // Обработчик фокуса
    input.addEventListener("focus", () => {
        renderDropdown(brands.slice(0, 700));
    });

    // Обработчик клавиатуры
    input.addEventListener("keydown", (e) => {
        const items = dropdown.querySelectorAll(".brand-item");
        if (dropdown.classList.contains("d-none")) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            currentFocus++;
            if (currentFocus >= items.length) currentFocus = 0;
            setActive(currentFocus);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            currentFocus--;
            if (currentFocus < 0) currentFocus = items.length - 1;
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
})();