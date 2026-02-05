// Конфигурация - замените на ваш URL из formcarry.com или slapform.com
// Получите бесплатный URL на formcarry.com (регистрация бесплатна)
const FORM_SUBMIT_URL = 'Zu-t_yEni3U'; // ЗАМЕНИТЕ на ваш URL
const STORAGE_KEY = 'feedbackFormData';
const FORM_STATE_KEY = 'formOpenState';

// Элементы DOM
const openFormBtn = document.getElementById('openFormBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const modal = document.getElementById('feedbackModal');
const feedbackForm = document.getElementById('feedbackForm');
const resetFormBtn = document.getElementById('resetFormBtn');
const messageContainer = document.getElementById('messageContainer');

// Форма открыта или нет
let isFormOpen = false;

// Открытие формы
openFormBtn.addEventListener('click', openForm);

// Закрытие формы
closeModalBtn.addEventListener('click', closeForm);

// Обработка закрытия по клику вне формы
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeForm();
    }
});

// Обработка нажатия клавиши Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isFormOpen) {
        closeForm();
    }
});

// История браузера - отслеживание кнопки "Назад"
window.addEventListener('popstate', (e) => {
    if (isFormOpen) {
        closeForm();
    }
});

// Загрузка сохраненных данных при открытии страницы
window.addEventListener('load', () => {
    // Проверяем, была ли форма открыта при предыдущем посещении
    const wasFormOpen = localStorage.getItem(FORM_STATE_KEY) === 'true';

    // Если форма была открыта, открываем ее снова
    if (wasFormOpen) {
        openForm();
    }

    // Загружаем сохраненные данные формы
    loadFormData();
});

// Отправка формы
feedbackForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Показываем индикатор загрузки
    const submitBtn = feedbackForm.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    submitBtn.disabled = true;

    try {
        // Собираем данные формы
        const formData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            organization: document.getElementById('organization').value,
            message: document.getElementById('message').value,
            privacyPolicy: document.getElementById('privacyPolicy').checked,
            submittedAt: new Date().toISOString()
        };

        // Отправляем данные на сервер
        const response = await fetch(FORM_SUBMIT_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            // Показываем сообщение об успехе
            showMessage('Ваше сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.', 'success');

            // Очищаем LocalStorage и форму
            localStorage.removeItem(STORAGE_KEY);
            feedbackForm.reset();

            // Закрываем форму через 3 секунды
            setTimeout(() => {
                closeForm();
            }, 3000);
        } else {
            throw new Error('Ошибка при отправке формы');
        }
    } catch (error) {
        console.error('Ошибка отправки формы:', error);
        showMessage('Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.', 'error');
    } finally {
        // Восстанавливаем кнопку
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Очистка формы
resetFormBtn.addEventListener('click', () => {
    if (confirm('Вы уверены, что хотите очистить все поля формы?')) {
        feedbackForm.reset();
        localStorage.removeItem(STORAGE_KEY);
        showMessage('Форма очищена', 'success');
        setTimeout(() => {
            clearMessage();
        }, 2000);
    }
});

// Автосохранение данных формы
feedbackForm.addEventListener('input', debounce(saveFormData, 500));

// Функция открытия формы
function openForm() {
    modal.classList.add('show');
    isFormOpen = true;

    // Добавляем запись в историю браузера
    history.pushState({ formOpen: true }, '', '#feedback');

    // Сохраняем состояние формы
    localStorage.setItem(FORM_STATE_KEY, 'true');

    // Фокусируемся на первом поле
    document.getElementById('fullName').focus();
}

// Функция закрытия формы
function closeForm() {
    modal.classList.remove('show');
    isFormOpen = false;

    // Возвращаемся в предыдущее состояние истории
    if (window.location.hash === '#feedback') {
        history.back();
    }

    // Обновляем состояние формы
    localStorage.setItem(FORM_STATE_KEY, 'false');

    // Очищаем сообщения
    clearMessage();
}

// Функция сохранения данных формы в LocalStorage
function saveFormData() {
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        organization: document.getElementById('organization').value,
        message: document.getElementById('message').value,
        privacyPolicy: document.getElementById('privacyPolicy').checked
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
}

// Функция загрузки данных формы из LocalStorage
function loadFormData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            const formData = JSON.parse(savedData);

            document.getElementById('fullName').value = formData.fullName || '';
            document.getElementById('email').value = formData.email || '';
            document.getElementById('phone').value = formData.phone || '';
            document.getElementById('organization').value = formData.organization || '';
            document.getElementById('message').value = formData.message || '';
            document.getElementById('privacyPolicy').checked = formData.privacyPolicy || false;
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных из LocalStorage:', error);
    }
}

// Функция для показа сообщений
function showMessage(text, type) {
    clearMessage();

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;

    messageContainer.appendChild(messageDiv);

    // Автоматически скрываем сообщение об ошибке через 5 секунд
    if (type === 'error') {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.opacity = '0';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }, 300);
            }
        }, 5000);
    }
}

// Функция для очистки сообщений
function clearMessage() {
    while (messageContainer.firstChild) {
        messageContainer.removeChild(messageContainer.firstChild);
    }
}

// Вспомогательная функция для дебаунса (задержки)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Валидация телефона в реальном времени
const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length > 0) {
        if (value[0] === '7' || value[0] === '8') {
            value = '+7' + value.substring(1);
        } else if (value[0] === '9') {
            value = '+7' + value;
        }

        // Форматирование номера
        let formattedValue = value;
        if (value.length > 2) {
            formattedValue = value.substring(0, 2) + ' (' + value.substring(2, 5);
        }
        if (value.length > 5) {
            formattedValue += ') ' + value.substring(5, 8);
        }
        if (value.length > 8) {
            formattedValue += '-' + value.substring(8, 10);
        }
        if (value.length > 10) {
            formattedValue += '-' + value.substring(10, 12);
        }

        e.target.value = formattedValue;
    }
});

// Проверяем, была ли форма открыта через хэш в URL
if (window.location.hash === '#feedback') {
    openForm();
}
