let activeMenu = null;

function switchTab(tabName) {
    const url = new URL(window.location);
    url.searchParams.set('tab', tabName);

    // заменяет URL БЕЗ добавления в историю
    window.history.replaceState({}, '', url);

    // перезагрузка страницы
    window.location.reload();
}

function showStatusMenu(event, applicationId, currentStatus) {
    event.stopPropagation();

    // Закрываем активное меню если оно есть
    if (activeMenu) {
        activeMenu.remove();
        activeMenu = null;
    }

    // Создаем меню
    const menu = document.createElement('div');
    menu.className = 'status-menu';
    menu.style.position = 'absolute';

    // Определяем позицию меню
    const target = event.target;
    const rect = target.getBoundingClientRect();
    menu.style.top = rect.bottom + window.scrollY + 'px';
    menu.style.left = rect.left + window.scrollX + 'px';

    // Опции статусов
    const statuses = [
        { value: 'waiting', label: 'На рассмотрении', class: 'waiting' },
        { value: 'accepted', label: 'Принят', class: 'accepted' },
        { value: 'canceled', label: 'Отменено', class: 'canceled' }
    ];

    statuses.forEach(status => {
        const option = document.createElement('div');
        option.className = `status-menu-item ${status.class}`;
        option.textContent = status.label;
        option.onclick = () => updateStatus(applicationId, status.value);
        menu.appendChild(option);
    });

    document.body.appendChild(menu);
    activeMenu = menu;

    // Закрываем меню при клике вне его
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && e.target !== target) {
                menu.remove();
                activeMenu = null;
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 0);
}

function updateStatus(applicationId, newStatus) {
    // Показываем индикатор загрузки
    const cell = document.querySelector(`.status-cell[data-application-id="${applicationId}"]`);
    if (!cell) return;

    const statusBadge = cell.querySelector('.status-badge');
    const originalText = statusBadge.innerHTML;
    statusBadge.innerHTML = '<div class="loading-spinner"></div>';
    statusBadge.style.cursor = 'default';
    statusBadge.onclick = null;

    // Отправляем запрос на сервер
    fetch(`/account/application/${applicationId}/update-status/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Обновляем отображение статуса
            let statusText = '';
            let statusClass = '';

            switch(newStatus) {
                case 'waiting':
                    statusText = 'На рассмотрении';
                    statusClass = 'status-waiting';
                    break;
                case 'accepted':
                    statusText = 'Принят';
                    statusClass = 'status-accepted';
                    break;
                case 'canceled':
                    statusText = 'Отменено';
                    statusClass = 'status-canceled';
                    break;
            }

            statusBadge.className = `status-badge ${statusClass}`;
            statusBadge.innerHTML = statusText;
            statusBadge.style.cursor = 'pointer';
            statusBadge.onclick = (e) => showStatusMenu(e, applicationId, newStatus);

            // Показываем уведомление об успехе
            showNotification('Статус успешно обновлен', 'success');
        } else {
            statusBadge.innerHTML = originalText;
            statusBadge.style.cursor = 'pointer';
            statusBadge.onclick = (e) => showStatusMenu(e, applicationId, currentStatus);
            showNotification('Ошибка при обновлении статуса', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        statusBadge.innerHTML = originalText;
        statusBadge.style.cursor = 'pointer';
        statusBadge.onclick = (e) => showStatusMenu(e, applicationId, currentStatus);
        showNotification('Ошибка при обновлении статуса', 'error');
    });

    // Закрываем меню
    if (activeMenu) {
        activeMenu.remove();
        activeMenu = null;
    }
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function showNotification(message, type) {
    // Элемент уведомления
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '12px 24px';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '9999';
    notification.style.animation = 'slideIn 0.3s ease-out';

    if (type === 'success') {
        notification.style.backgroundColor = '#28a745';
        notification.style.color = 'white';
    } else {
        notification.style.backgroundColor = '#dc3545';
        notification.style.color = 'white';
    }

    document.body.appendChild(notification);

    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Cтили для анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

function showAppointmentStatusMenu(event, appointmentId, currentStatus) {
    event.stopPropagation();

    if (activeMenu) {
        activeMenu.remove();
        activeMenu = null;
    }

    const menu = document.createElement('div');
    menu.className = 'status-menu';
    menu.style.position = 'absolute';

    const rect = event.target.getBoundingClientRect();
    menu.style.top = rect.bottom + window.scrollY + 'px';
    menu.style.left = rect.left + window.scrollX + 'px';

    const statuses = [
        { value: 'waiting', label: 'На рассмотрении', class: 'waiting' },
        { value: 'accepted', label: 'Принято', class: 'accepted' },
        { value: 'delete', label: 'Удалить', class: 'delete' }
    ];

    statuses.forEach(status => {
        const option = document.createElement('div');
        option.className = `status-menu-item ${status.class}`;
        option.textContent = status.label;
        option.onclick = () => {
        if (status.value === 'delete') {
        confirmDeleteAppointment(appointmentId);
        } else {
        updateAppointmentStatus(appointmentId, status.value);
        }
};
        menu.appendChild(option);
    });

    document.body.appendChild(menu);
    activeMenu = menu;

    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && e.target !== event.target) {
                menu.remove();
                activeMenu = null;
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 0);
}

function updateAppointmentStatus(appointmentId, newStatus) {
    if (newStatus === 'delete') return;
    const cell = document.querySelector(`.status-cell[data-appointment-id="${appointmentId}"]`);
    if (!cell) return;

    const statusBadge = cell.querySelector('.status-badge');
    const originalText = statusBadge.innerHTML;
    statusBadge.innerHTML = '<div class="loading-spinner"></div>';
    statusBadge.style.cursor = 'default';
    statusBadge.onclick = null;

    fetch(`/account/appointment/${appointmentId}/update-status/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            let statusText = '';
            let statusClass = '';

            switch(newStatus) {
                case 'waiting': statusText = 'На рассмотрении'; statusClass = 'status-waiting'; break;
                case 'accepted': statusText = 'Принято'; statusClass = 'status-accepted'; break;
                case 'canceled': statusText = 'Отменено'; statusClass = 'status-canceled'; break;
            }

            statusBadge.className = `status-badge ${statusClass}`;
            statusBadge.innerHTML = statusText;
            statusBadge.style.cursor = 'pointer';
            statusBadge.onclick = (e) => showAppointmentStatusMenu(e, appointmentId, newStatus);

            showNotification('Статус успешно обновлен', 'success');
        } else {
            statusBadge.innerHTML = originalText;
            statusBadge.style.cursor = 'pointer';
            statusBadge.onclick = (e) => showAppointmentStatusMenu(e, appointmentId, newStatus);
            showNotification('Ошибка при обновлении статуса', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        statusBadge.innerHTML = originalText;
        statusBadge.style.cursor = 'pointer';
        statusBadge.onclick = (e) => showAppointmentStatusMenu(e, appointmentId, newStatus);
        showNotification('Ошибка при обновлении статуса', 'error');
    });

    if (activeMenu) {
        activeMenu.remove();
        activeMenu = null;
    }
}

function getAppointmentNumber(appointmentId) {
    const cell = document.querySelector(
        `.status-cell[data-appointment-id="${appointmentId}"]`
    );

    if (!cell) return appointmentId;

    return cell.dataset.appointmentNumber || appointmentId;
}

function confirmDeleteAppointment(appointmentId) {
    const confirmBox = document.createElement('div');
    confirmBox.className = 'custom-confirm';
    const number = getAppointmentNumber(appointmentId);

    confirmBox.innerHTML = `
    <div class="confirm-content">
        <p>Вы хотите удалить запись №${number}?</p>
        <div class="confirm-buttons">
            <button id="confirm-yes" class="btn btn-danger">Да</button>
            <button id="confirm-no" class="btn btn-secondary">Нет</button>
        </div>
    </div>
`;

    document.body.appendChild(confirmBox);

    document.getElementById('confirm-yes').onclick = () => {
        deleteAppointment(appointmentId);
        confirmBox.remove();
    };

    document.getElementById('confirm-no').onclick = () => {
        confirmBox.remove();
    };
    if (activeMenu) {
    activeMenu.remove();
    activeMenu = null;
}
}

function deleteAppointment(appointmentId) {
    const number = getAppointmentNumber(appointmentId);
    fetch(`/account/appointment/${appointmentId}/delete/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // удаляем строку из таблицы
            const row = document.querySelector(
                `.status-cell[data-appointment-id="${appointmentId}"]`
            ).closest('tr');

            row.remove();

            showNotification(`Запись №${number} удалена`, 'success');
        } else {
            showNotification(`Ошибка удаления записи №${number}`, 'error');
        }
    })
    .catch(() => {
        showNotification('Ошибка удаления', 'error');
    });
}
// Универсальная функция поиска по таблице
function initTableSearch(searchInputId, tableId, rowClass, countId, getSearchableText) {
    const searchInput = document.getElementById(searchInputId);
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const rows = document.querySelectorAll(`#${tableId} .${rowClass}`);
        let visibleCount = 0;

        rows.forEach(row => {
            const searchableText = getSearchableText(row);
            const matches = searchTerm === '' || searchableText.includes(searchTerm);

            if (matches) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        if (countId) {
            document.getElementById(countId).textContent = visibleCount;
        }
    });
}

// Инициализация поиска для каждой таблицы
document.addEventListener('DOMContentLoaded', function() {
    // Поиск по клиентам
    initTableSearch('search-clients', 'clients-table', 'client-row', 'clients-count', (row) => {
        const email = row.querySelector('.client-email')?.textContent.toLowerCase() || '';
        const fullname = row.querySelector('.client-fullname')?.textContent.toLowerCase() || '';
        const phone = row.querySelector('.client-phone')?.textContent.toLowerCase() || '';
        return `${email} ${fullname} ${phone}`;
    });

    // Поиск по заявкам
    initTableSearch('search-applications', 'applications-table', 'application-row', 'applications-count', (row) => {
        const fio = row.querySelector('.app-fio')?.textContent.toLowerCase() || '';
        const phone = row.querySelector('.app-phone')?.textContent.toLowerCase() || '';
        const detail = row.querySelector('.app-detail')?.textContent.toLowerCase() || '';
        const delivery = row.querySelector('.app-delivery')?.textContent.toLowerCase() || '';
        const payment = row.querySelector('.app-payment')?.textContent.toLowerCase() || '';
        const reservation = row.querySelector('.app-reservation')?.textContent.toLowerCase() || '';
        const comment = row.querySelector('.app-comment')?.textContent.toLowerCase() || '';
        const date = row.querySelector('.app-date')?.textContent.toLowerCase() || '';
        return `${fio} ${phone} ${detail} ${delivery} ${payment} ${reservation} ${comment} ${date}`;
    });

    // Поиск по записям на СТО
    initTableSearch('search-appointments', 'appointments-table', 'appointment-row', 'appointments-count', (row) => {
        const fio = row.querySelector('.appt-fio')?.textContent.toLowerCase() || '';
        const phone = row.querySelector('.appt-phone')?.textContent.toLowerCase() || '';
        const service = row.querySelector('.appt-service')?.textContent.toLowerCase() || '';
        const date = row.querySelector('.appt-date')?.textContent.toLowerCase() || '';
        const time = row.querySelector('.appt-time')?.textContent.toLowerCase() || '';
        const brand = row.querySelector('.appt-brand')?.textContent.toLowerCase() || '';
        const year = row.querySelector('.appt-year')?.textContent.toLowerCase() || '';
        const comment = row.querySelector('.appt-comment')?.textContent.toLowerCase() || '';
        return `${fio} ${phone} ${service} ${date} ${time} ${brand} ${year} ${comment}`;
    });
});
// ============================================
// Сортировка таблиц по дате с галочками
// ============================================

// Функция для обновления галочек
function updateSortChecks(type, order) {
    const asc = document.getElementById(`check-${type}-asc`);
    const desc = document.getElementById(`check-${type}-desc`);

    if (asc) asc.textContent = '';
    if (desc) desc.textContent = '';

    const selected = document.getElementById(`check-${type}-${order}`);
    if (selected) selected.textContent = '✓';
}

// Функция для переключения меню
function toggleSortMenu(event, type) {
    event.stopPropagation();

    const menuId = `sort-menu-${type}`;
    const menu = document.getElementById(menuId);

    // Закрываем другие открытые меню
    document.querySelectorAll('.sort-menu').forEach(m => {
        if (m.id !== menuId) {
            m.classList.add('d-none');
        }
    });

    // Переключаем текущее меню
    menu.classList.toggle('d-none');

    // Закрываем при клике вне
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && !e.target.closest(`[onclick*="toggleSortMenu(event, '${type}')"]`)) {
                menu.classList.add('d-none');
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 0);
}

function parseRussianDate(dateStr) {
    if (!dateStr) return 0;

    const months = {
        'января': 0,
        'февраля': 1,
        'марта': 2,
        'апреля': 3,
        'мая': 4,
        'июня': 5,
        'июля': 6,
        'августа': 7,
        'сентября': 8,
        'октября': 9,
        'ноября': 10,
        'декабря': 11
    };

    // формат: "30 апреля 2026 г."
    const match = dateStr.trim().match(/(\d+)\s+([а-яё]+)\s+(\d{4})/i);

    if (!match) return 0;

    const day = parseInt(match[1], 10);
    const monthName = match[2].toLowerCase();
    const year = parseInt(match[3], 10);

    const month = months[monthName];

    if (month === undefined) return 0;

    return new Date(year, month, day).getTime();
}

// Функция сортировки таблицы
function sortTableByDate(tableId, rowClass, dateClass, order, type) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll(`.${rowClass}`));

    // Фильтруем только видимые строки
    const visibleRows = rows.filter(row => row.style.display !== 'none');
    const hiddenRows = rows.filter(row => row.style.display === 'none');

    // Сортируем видимые строки
    visibleRows.sort((a, b) => {
        let dateA = a.querySelector(`.${dateClass}`)?.textContent || '';
        let dateB = b.querySelector(`.${dateClass}`)?.textContent || '';

        let timeA = 0;
        let timeB = 0;

        // Для заявок (формат: "дд.мм.гггг ЧЧ:ММ")
        if (dateA.includes('.') && dateA.includes(':')) {
            const partsA = dateA.match(/(\d+)\.(\d+)\.(\d+)\s+(\d+):(\d+)/);
            const partsB = dateB.match(/(\d+)\.(\d+)\.(\d+)\s+(\d+):(\d+)/);
            if (partsA && partsB) {
                const [, dayA, monthA, yearA, hourA, minuteA] = partsA;
                const [, dayB, monthB, yearB, hourB, minuteB] = partsB;
                timeA = new Date(yearA, monthA - 1, dayA, hourA, minuteA).getTime();
                timeB = new Date(yearB, monthB - 1, dayB, hourB, minuteB).getTime();
            }
        }
        // Для записей на СТО (формат: "ГГГГ-ММ-ДД")
        else {
            timeA = parseRussianDate(dateA);
            timeB = parseRussianDate(dateB);
        }

        if (order === 'asc') {
            return timeA - timeB;
        } else {
            return timeB - timeA;
        }
    });

    // Переставляем строки в таблице
    visibleRows.forEach(row => tbody.appendChild(row));
    hiddenRows.forEach(row => tbody.appendChild(row));

    // Обновляем галочки
    updateSortChecks(type, order);

    // Закрываем меню
    const menu = document.getElementById(`sort-menu-${type}`);
    if (menu) menu.classList.add('d-none');

    // Обновляем счетчик видимых строк
    const countSpan = document.getElementById(`${type}-count`);
    if (countSpan) {
        countSpan.textContent = visibleRows.length;
    }
}

// Закрытие меню при клике вне
document.addEventListener('click', function() {
    document.querySelectorAll('.sort-menu').forEach(menu => {
        menu.classList.add('d-none');
    });
});
