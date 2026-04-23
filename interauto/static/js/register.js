// ============================================
// Модуль для страницы регистрации
// ============================================

(function() {
    'use strict';

    // Переключение видимости пароля
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            const input = document.getElementById(targetId);
            const icon = button.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
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
    // Дополнительная валидация перед отправкой
    const form = document.getElementById('register-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            const lastName = document.getElementById('id_last_name').value;
            const firstName = document.getElementById('id_first_name').value;
            const middleName = document.getElementById('id_middle_name').value;
            const phone = document.getElementById('id_phone_number').value;

            // Проверка имени (только буквы)
            const nameRegex = /^[а-яА-Яa-zA-Z\s-]+$/;
            if (lastName && !nameRegex.test(lastName)) {
                e.preventDefault();
                alert('Фамилия должна содержать только буквы');
                return false;
            }
            if (firstName && !nameRegex.test(firstName)) {
                e.preventDefault();
                alert('Имя должно содержать только буквы');
                return false;
            }
            if (middleName && middleName.trim() && !nameRegex.test(middleName)) {
                e.preventDefault();
                alert('Отчество должно содержать только буквы');
                return false;
            }

            // Проверка телефона (должен содержать цифры)
            const phoneDigits = phone.replace(/[^0-9]/g, '');
            if (!phoneDigits || phoneDigits.length < 10) {
                e.preventDefault();
                alert('Введите корректный номер телефона (минимум 10 цифр)');
                return false;
            }
            if (phoneDigits.length > 11) {
                e.preventDefault();
                alert('Номер телефона слишком длинный (максимум 11 цифр)');
                return false;
            }
        });
    }
})();