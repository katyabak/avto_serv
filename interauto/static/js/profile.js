// ============================================
// Модуль для страницы профиля
// ============================================

(function() {
    'use strict';

    // Форматирование телефона при вводе
    const phoneInput = document.getElementById('id_phone_number');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = this.value.replace(/[^0-9+]/g, '');
            if (value.startsWith('+')) {
                value = '+' + value.slice(1).replace(/[^0-9]/g, '').slice(0, 11);
            } else {
                value = value.replace(/[^0-9]/g, '').slice(0, 11);
            }
            this.value = value;
        });
    }

    // Валидация перед отправкой формы
    const form = document.getElementById('profile-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            let isValid = true;

            // Проверка фамилии
            const lastName = document.getElementById('id_last_name').value.trim();
            const lastNameError = document.getElementById('last-name-error');
            const nameRegex = /^[а-яА-Яa-zA-Z\s-]+$/;

            if (!lastName) {
                lastNameError.textContent = 'Фамилия обязательна для заполнения';
                isValid = false;
            } else if (lastName.length < 2) {
                lastNameError.textContent = 'Фамилия должна содержать минимум 2 символа';
                isValid = false;
            } else if (!nameRegex.test(lastName)) {
                lastNameError.textContent = 'Фамилия должна содержать только буквы';
                isValid = false;
            } else {
                lastNameError.textContent = '';
            }

            // Проверка имени
            const firstName = document.getElementById('id_first_name').value.trim();
            const firstNameError = document.getElementById('first-name-error');

            if (!firstName) {
                firstNameError.textContent = 'Имя обязательно для заполнения';
                isValid = false;
            } else if (firstName.length < 2) {
                firstNameError.textContent = 'Имя должно содержать минимум 2 символа';
                isValid = false;
            } else if (!nameRegex.test(firstName)) {
                firstNameError.textContent = 'Имя должно содержать только буквы';
                isValid = false;
            } else {
                firstNameError.textContent = '';
            }

            // Проверка отчества (если заполнено)
            const middleName = document.getElementById('id_middle_name').value.trim();
            const middleNameError = document.getElementById('middle-name-error');

            if (middleName && middleName.length < 2) {
                middleNameError.textContent = 'Отчество должно содержать минимум 2 символа';
                isValid = false;
            } else if (middleName && !nameRegex.test(middleName)) {
                middleNameError.textContent = 'Отчество должно содержать только буквы';
                isValid = false;
            } else {
                middleNameError.textContent = '';
            }

            // Проверка телефона
            const phone = document.getElementById('id_phone_number').value;
            const phoneError = document.getElementById('phone-error');
            const phoneDigits = phone.replace(/[^0-9]/g, '');

            if (!phone) {
                phoneError.textContent = 'Телефон обязателен для заполнения';
                isValid = false;
            } else if (phoneDigits.length < 10) {
                phoneError.textContent = 'Номер телефона слишком короткий (минимум 10 цифр)';
                isValid = false;
            } else if (phoneDigits.length > 11) {
                phoneError.textContent = 'Номер телефона слишком длинный (максимум 11 цифр)';
                isValid = false;
            } else {
                phoneError.textContent = '';
            }

            if (!isValid) {
                e.preventDefault();
            }
        });
    }
})();
