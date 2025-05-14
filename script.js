const starfieldCanvas = document.getElementById('starfield');
const sfCtx = starfieldCanvas.getContext('2d');

function resizeStarfield() {
    starfieldCanvas.width = window.innerWidth;
    starfieldCanvas.height = window.innerHeight;
    initStars();
    initComets();
    // initSupernova(); // Супернова будет редким событием
    initOneC(); 
}
window.addEventListener('resize', resizeStarfield);

// --- ЗВЕЗДЫ ---
const stars = [];
const numStars = 120; 
const starSpeed = 0.15; 
// Переменная для эффекта мерцания звезд
let twinkleFactor = 0;

function initStars() {
    stars.length = 0; 
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * starfieldCanvas.width,
            y: Math.random() * starfieldCanvas.height,
            size: Math.random() * 1.2 + 0.3, 
            baseOpacity: Math.random() * 0.5 + 0.2, // Базовая прозрачность
            opacity: Math.random() * 0.5 + 0.2, 
            speedX: (Math.random() - 0.5) * starSpeed * 0.2, 
            speedY: (Math.random() * 0.2 + 0.05) * starSpeed,
            twinkleSpeed: Math.random() * 0.05 + 0.01, // Скорость мерцания
            phase: Math.random() * Math.PI * 2 // Начальная фаза для мерцания
        });
    }
}

function drawStars() {
    // sfCtx.clearRect(0, 0, starfieldCanvas.width, starfieldCanvas.height); // Очистку делаем один раз в animateStarfield
    stars.forEach(star => {
        sfCtx.beginPath();
        sfCtx.rect(star.x, star.y, star.size, star.size); 
        
        // Мерцание звезд
        star.opacity = star.baseOpacity + Math.sin(star.phase + twinkleFactor) * (star.baseOpacity * 0.5);
        star.opacity = Math.max(0.1, Math.min(1, star.opacity)); // Ограничиваем прозрачность

        const starColorChance = Math.random();
        if (starColorChance < 0.4) { sfCtx.fillStyle = `rgba(100, 255, 218, ${star.opacity * 0.8})`; } 
        else if (starColorChance < 0.7) { sfCtx.fillStyle = `rgba(252, 163, 17, ${star.opacity * 0.6})`; } 
        else { sfCtx.fillStyle = `rgba(136, 146, 176, ${star.opacity})`; }
        sfCtx.fill();
    });
}

function updateStars() {
    twinkleFactor += 0.02; // Обновляем глобальный фактор мерцания
    stars.forEach(star => {
        star.x += star.speedX; star.y += star.speedY;
        star.phase += star.twinkleSpeed; // Обновляем фазу для индивидуального мерцания

        if (star.y > starfieldCanvas.height + star.size) { star.y = -star.size; star.x = Math.random() * starfieldCanvas.width; }
        else if (star.y < -star.size) { star.y = starfieldCanvas.height + star.size; star.x = Math.random() * starfieldCanvas.width; }
        if (star.x > starfieldCanvas.width + star.size) { star.x = -star.size; }
        else if (star.x < -star.size) { star.x = starfieldCanvas.width + star.size; }
    });
}

// --- КОМЕТЫ ---
const comets = [];
const MAX_COMETS = 3; // Максимум комет одновременно
const COMET_SPAWN_CHANCE = 0.005; // Шанс появления кометы в каждом кадре (очень низкий)

function initComets() {
    comets.length = 0; // Очищаем кометы при ресайзе
}

function spawnComet() {
    if (comets.length < MAX_COMETS && Math.random() < COMET_SPAWN_CHANCE) {
        const startEdge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let x, y, vx, vy;
        const speed = Math.random() * 3 + 2; // Скорость кометы
        const angleVariation = (Math.random() - 0.5) * Math.PI / 4; // Небольшое отклонение угла

        switch (startEdge) {
            case 0: // Сверху
                x = Math.random() * starfieldCanvas.width; y = -20;
                vx = Math.sin(Math.PI / 4 + angleVariation) * speed; vy = Math.cos(Math.PI / 4 + angleVariation) * speed;
                break;
            case 1: // Справа
                x = starfieldCanvas.width + 20; y = Math.random() * starfieldCanvas.height;
                vx = -Math.cos(Math.PI / 4 + angleVariation) * speed; vy = Math.sin(Math.PI / 4 + angleVariation) * speed;
                break;
            case 2: // Снизу
                x = Math.random() * starfieldCanvas.width; y = starfieldCanvas.height + 20;
                vx = Math.sin(-Math.PI / 4 + angleVariation) * speed; vy = -Math.cos(-Math.PI / 4 + angleVariation) * speed;
                break;
            case 3: // Слева
                x = -20; y = Math.random() * starfieldCanvas.height;
                vx = Math.cos(Math.PI / 4 + angleVariation) * speed; vy = Math.sin(Math.PI / 4 + angleVariation) * speed;
                break;
        }
        comets.push({
            x, y, vx, vy,
            length: Math.random() * 80 + 50, // Длина хвоста
            opacity: 1,
            life: 1000 // Условное время жизни для постепенного исчезновения (не используется для удаления, только для fade)
        });
    }
}

function drawComets() {
    comets.forEach(comet => {
        sfCtx.beginPath();
        sfCtx.moveTo(comet.x, comet.y);
        // Хвост кометы
        const tailX = comet.x - comet.vx * (comet.length / Math.sqrt(comet.vx**2 + comet.vy**2)); // Нормализуем скорость для длины хвоста
        const tailY = comet.y - comet.vy * (comet.length / Math.sqrt(comet.vx**2 + comet.vy**2));
        sfCtx.lineTo(tailX, tailY);

        const gradient = sfCtx.createLinearGradient(comet.x, comet.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(252, 163, 17, ${comet.opacity * 0.8})`); // Голова кометы - оранжевая
        gradient.addColorStop(0.3, `rgba(100, 255, 218, ${comet.opacity * 0.5})`); // Середина хвоста - бирюзовая
        gradient.addColorStop(1, `rgba(100, 255, 218, 0)`);       // Конец хвоста - прозрачный

        sfCtx.strokeStyle = gradient;
        sfCtx.lineWidth = Math.random() * 2 + 1; // Толщина кометы
        sfCtx.stroke();
    });
}

function updateComets() {
    for (let i = comets.length - 1; i >= 0; i--) {
        const comet = comets[i];
        comet.x += comet.vx;
        comet.y += comet.vy;
        // comet.opacity -= 0.001; // Очень медленное угасание, если нужно

        // Удаляем комету, если она далеко за пределами экрана
        if (comet.x < -comet.length * 2 || comet.x > starfieldCanvas.width + comet.length * 2 ||
            comet.y < -comet.length * 2 || comet.y > starfieldCanvas.height + comet.length * 2 /*|| comet.opacity <=0*/) {
            comets.splice(i, 1);
        }
    }
    spawnComet(); // Пытаемся создать новую комету
}

// --- СВЕРХНОВЫЕ ---
let supernova = null;
const SUPERNOVA_CHANCE = 0.0002;

// function initSupernova() { supernova = null; } // Сброс при ресайзе, если нужно

function spawnSupernova() {
    if (!supernova && Math.random() < SUPERNOVA_CHANCE) {
        supernova = {
            x: Math.random() * (starfieldCanvas.width - 200) + 100, // Не у краев
            y: Math.random() * (starfieldCanvas.height - 200) + 100,
            radius: 0,
            maxRadius: Math.random() * 100 + 80,
            opacity: 1,
            expansionSpeed: Math.random() * 2 + 1,
            fadeSpeed: 0.01 + Math.random() * 0.01
        };
    }
}

function drawSupernova() {
    if (supernova) {
        sfCtx.beginPath();
        const gradient = sfCtx.createRadialGradient(supernova.x, supernova.y, 0, supernova.x, supernova.y, supernova.radius);
        gradient.addColorStop(0, `rgba(255, 255, 220, ${supernova.opacity})`);      // Яркий центр
        gradient.addColorStop(0.2, `rgba(252, 163, 17, ${supernova.opacity * 0.8})`); // Оранжевое свечение
        gradient.addColorStop(0.6, `rgba(100, 255, 218, ${supernova.opacity * 0.5})`); // Бирюзовое дальше
        gradient.addColorStop(1, `rgba(100, 255, 218, 0)`);                // Прозрачные края

        sfCtx.fillStyle = gradient;
        sfCtx.arc(supernova.x, supernova.y, supernova.radius, 0, Math.PI * 2);
        sfCtx.fill();
    }
}

function updateSupernova() {
    if (supernova) {
        supernova.radius += supernova.expansionSpeed;
        supernova.opacity -= supernova.fadeSpeed;
        if (supernova.opacity <= 0 || supernova.radius > supernova.maxRadius * 1.5) {
            supernova = null; // Супернова исчезла
        }
    } else {
        spawnSupernova(); // Пытаемся создать новую
    }
}

// --- ЛЕТАЮЩАЯ 1С (МЕМ) ---
let oneCEntity = null;

function initOneC() { // Функция для инициализации/сброса 1С
    oneCEntity = {
        text: "1C",
        x: Math.random() * (starfieldCanvas.width - 100) + 50,
        y: Math.random() * (starfieldCanvas.height - 100) + 50,
        size: 24, // Размер шрифта
        vx: (Math.random() - 0.5) * 1.5, // Скорость по X
        vy: (Math.random() - 0.5) * 1.5, // Скорость по Y
        angle: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.02
    };
}

function drawOneC() {
    if (oneCEntity) {
        sfCtx.save();
        sfCtx.translate(oneCEntity.x, oneCEntity.y);
        sfCtx.rotate(oneCEntity.angle);
        sfCtx.font = `bold ${oneCEntity.size}px 'Arial Black', Gadget, sans-serif`; // Более "мемный" шрифт
        sfCtx.fillStyle = `rgba(255, 215, 0, 0.9)`; // Золотой цвет, как лого 1С
        sfCtx.textAlign = 'center';
        sfCtx.textBaseline = 'middle';
        sfCtx.fillText(oneCEntity.text, 0, 0);
        sfCtx.strokeStyle = 'rgba(0,0,0,0.7)';
        sfCtx.lineWidth = 2;
        sfCtx.strokeText(oneCEntity.text, 0, 0); // Обводка для читаемости
        sfCtx.restore();
    }
}

function updateOneC() {
    if (oneCEntity) {
        oneCEntity.x += oneCEntity.vx;
        oneCEntity.y += oneCEntity.vy;
        oneCEntity.angle += oneCEntity.rotationSpeed;

        // Отскок от краев
        if (oneCEntity.x - oneCEntity.size / 2 < 0 || oneCEntity.x + oneCEntity.size / 2 > starfieldCanvas.width) {
            oneCEntity.vx *= -1;
            oneCEntity.x = Math.max(oneCEntity.size / 2, Math.min(starfieldCanvas.width - oneCEntity.size / 2, oneCEntity.x)); // Коррекция положения
        }
        if (oneCEntity.y - oneCEntity.size / 2 < 0 || oneCEntity.y + oneCEntity.size / 2 > starfieldCanvas.height) {
            oneCEntity.vy *= -1;
            oneCEntity.y = Math.max(oneCEntity.size / 2, Math.min(starfieldCanvas.height - oneCEntity.size / 2, oneCEntity.y)); // Коррекция положения
        }
    }
}


// --- ОСНОВНОЙ ЦИКЛ АНИМАЦИИ ФОНА ---
function animateStarfield() {
    sfCtx.clearRect(0, 0, starfieldCanvas.width, starfieldCanvas.height); // Очищаем холст один раз

    updateStars();
    drawStars();

    updateComets();
    drawComets();

    updateSupernova();
    drawSupernova();

    updateOneC();
    drawOneC();

    requestAnimationFrame(animateStarfield);
}

document.getElementById('currentYear').textContent = new Date().getFullYear();

// --- SKILL SCROLLS LOGIC ---
const skillsData = [
    {
        category: "ИСТОКИ СИЛЫ: ЯЗЫКИ ПРОГРАММИРОВАНИЯ",
        icon: "fas fa-code", //  📜
        comment: "// Пробуждение Энергии: Основы",
        techniques: [
            { name: "Техника Нефритового Императора (Java)", level: "[Уровень Постижения: Мастер Великого Дао]", details: "// Владение Сущностями и Потоками" },
            { name: "Искусство Тысячи Трансформаций (Kotlin)", level: "[Уровень Постижения: Пробудивший Дух Языка]", details: "// Написание микро-измерений" }
        ]
    },
    {
        category: "КОВКА АРТЕФАКТОВ: ФРЕЙМВОРКИ И БИБЛИОТЕКИ",
        icon: "fas fa-cogs", // 🛠️
        comment: "// Создание Микромиров и Управление Энергиями",
        techniques: [
            { name: "Домен Весеннего Пробуждения (Spring: Framework, Boot, Web, Data, Cloud)", level: "[Мастерство: Закаленный Дух]" },
            { name: "Древние Руны Стойкости (Hibernate, JDBC)", level: "[Мастерство: Хранитель Знаний]" },
            { name: "Эликсиры Сообщений (Apache Kafka)", level: "[Мастерство: Проводник Потоков]" }
        ]
    },
    {
        category: "СОКРОВИЩНИЦЫ МУДРОСТИ: БАЗЫ ДАННЫХ",
        icon: "fas fa-database", // 💎
        comment: "// Хранение Энергии и Мудрости",
        techniques: [
            { name: "Храм Каменного Великана (PostgreSQL)", level: "[Посвящение: Страж Древних Таблиц]" },
            { name: "Пещера Тысячи Ликов (MongoDB)", level: "[Посвящение: Последователь Перемен]" },
            { name: "Источник Молниеносных Отражений (Redis)", level: "[Посвящение: Ловец Мгновений]" },
            { name: "Скрижали Эволюции (Liquibase)", level: "[Инструмент: Освоен]" }
        ]
    },
    {
        category: "НЕБЕСНЫЕ ВРАТА: API И ПРОТОКОЛЫ",
        icon: "fas fa-network-wired", // 🌐
        techniques: [
            { name: "Путь Открытых Врат (REST API)", level: "[Владение: Свободный Полет]" },
            { name: "Тайный Тракт Скорости (gRPC)", level: "[Знакомство: Первые Шаги]" }
        ]
    },
    {
        category: "СТРАЖИ ПОРЯДКА: DEVOPS И CI/CD",
        icon: "fas fa-shield-alt", // 🛡️
        techniques: [
            { name: "Формация Контейнерных Духов (Docker, Kubernetes)", level: "[Применение: Активное Развитие]" },
            { name: "Ритуал Непрерывной Интеграции (Maven, CI/CD)", level: "[Практика: Уверенное Использование]" }
        ]
    },
    {
        category: "ОКО ВСЕЛЕННОЙ: МОНИТОРИНГ",
        icon: "fas fa-eye", // 👁️
        techniques: [
            { name: "Зеркала Истины (Prometheus, Grafana)", level: "[Артефакты: В Арсенале]" },
            { name: "Следопыты Эфира (ELK Stack, Jaeger)", level: "[Артефакты: В Арсенале]" }
        ]
    },
    {
        category: "ИСПЫТАНИЯ ДУХА: ТЕСТИРОВАНИЕ",
        icon: "fas fa-vial", // 🧪
        techniques: [
            { name: "Долина Чистоты Кода (JUnit, Mockito, Testcontainers, ArchUnit)", level: "[Дисциплина: Непоколебимая]" }
        ]
    },
    {
        category: "ИНСТРУМЕНТЫ МУДРЕЦА",
        icon: "fas fa-scroll", // 📜
        techniques: [
            { name: "Хроники Времени (Git)", level: "[Навык: Магистр Ветвей]" },
            { name: "Путь Гармонии (Agile, Scrum)", level: "[Следование: Принципы Усвоены]" }
        ]
    }
];

const scrollContainer = document.getElementById('scrollContainer');
const textTypingSpeed = 50; // Скорость набора текста для техник

function typeTextCharByChar(element, text, callback) {
    let i = 0;
    element.textContent = ''; // Очистить перед набором
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, textTypingSpeed);
        } else {
            if (callback) callback();
        }
    }
    type();
}

function createSkillScrolls() {
    if (!scrollContainer) return;

    skillsData.forEach((skillCategory, index) => {
        const scrollDiv = document.createElement('div');
        scrollDiv.className = 'skill-scroll';
        scrollDiv.style.animationDelay = `${index * 0.15}s`; // Staggered fade-in

        let iconHTML = skillCategory.icon.startsWith("fas fa-") ? 
                       `<i class="${skillCategory.icon} scroll-icon"></i>` : 
                       `<span class="scroll-icon">${skillCategory.icon || '◈'}</span>`;

        let headerHTML = `
            <div class="scroll-header">
                ${iconHTML}
                <h4 class="scroll-category-title">${skillCategory.category}</h4>
            </div>
        `;
        
        let contentHTML = '<div class="scroll-content">';
        if (skillCategory.comment) {
            contentHTML += `<p class="scroll-comment">${skillCategory.comment}</p>`;
        }
        contentHTML += '<ul class="technique-list">';

        skillCategory.techniques.forEach(tech => {
            // ID для элементов, которые будут анимированы
            const nameId = `tech-name-${index}-${skillCategory.techniques.indexOf(tech)}`;
            const levelId = `tech-level-${index}-${skillCategory.techniques.indexOf(tech)}`;
            
            contentHTML += `
                <li>
                    <span class="technique-name" id="${nameId}"></span>
                    <span class="technique-level" id="${levelId}"></span>
                    ${tech.details ? `<p class="technique-details">${tech.details}</p>` : ''}
                </li>
            `;
        });
        contentHTML += '</ul></div>';
        scrollDiv.innerHTML = headerHTML + contentHTML;
        scrollContainer.appendChild(scrollDiv);

        // Анимация набора текста после добавления элемента в DOM
        // Запускаем анимацию последовательно для каждой техники в категории
        let typingDelay = 500 + (index * 200); // Начальная задержка для категории
        skillCategory.techniques.forEach(tech => {
            const nameElement = scrollDiv.querySelector(`#tech-name-${index}-${skillCategory.techniques.indexOf(tech)}`);
            const levelElement = scrollDiv.querySelector(`#tech-level-${index}-${skillCategory.techniques.indexOf(tech)}`);
            
            setTimeout(() => {
                typeTextCharByChar(nameElement, tech.name, () => {
                    if(levelElement && tech.level) {
                         typeTextCharByChar(levelElement, tech.level);
                    }
                });
            }, typingDelay);
            typingDelay += (tech.name.length + (tech.level ? tech.level.length : 0)) * textTypingSpeed + 200; // Задержка до следующей техники
        });

        // Логика для аккордеона (если нужна)
        // const header = scrollDiv.querySelector('.scroll-header');
        // header.addEventListener('click', () => {
        //     scrollDiv.classList.toggle('open');
        // });
    });
}


// --- AVATAR CODE TERMINAL LOGIC ---
const codeAvatarContainer = document.getElementById('codeAvatar');
const avatarCodeLinesElement = document.getElementById('avatarCodeLines');
const GITHUB_USERNAME = 'GitLobanov';
const MAX_AVATAR_LINES = 7;
let currentAvatarLines = [];
let commitMessagesCache = [];
let lastFetchTime = 0;
const FETCH_INTERVAL = 60000 * 30; // 30 минут между запросами к API
const LINE_DISPLAY_INTERVAL = 2000; // 2 секунды на отображение новой строки

async function fetchLatestCommits() {
    // Чтобы не делать слишком частые запросы, если пользователь обновляет страницу
    if (Date.now() - lastFetchTime < FETCH_INTERVAL - 5000 && commitMessagesCache.length > 0) {
        console.log("Using cached GitHub data for avatar.");
        return commitMessagesCache;
    }

    console.log("Fetching new GitHub data for avatar...");
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public`);
        if (!response.ok) {
            if (response.status === 403) {
                console.warn(`GitHub API rate limit likely exceeded. Status: ${response.status}`);
                // Можно попробовать показать "ошибку" в аватаре
                addCodeLineToAvatar(`// API Limit Reached (${response.status})`, true);
                addCodeLineToAvatar(`// Retry in a minute...`, false);

            } else {
                console.error(`Error fetching GitHub events: ${response.status}`);
            }
            lastFetchTime = Date.now(); // Обновляем время, чтобы не спамить при ошибке
            return [];
        }
        const events = await response.json();
        lastFetchTime = Date.now();
        
        const newCommitMessages = [];
        events.forEach(event => {
            if (event.type === 'PushEvent' && event.payload && event.payload.commits) {
                event.payload.commits.forEach(commit => {
                    if (commit.message && !commit.message.startsWith("Merge branch")) { // Фильтруем мерж коммиты
                        // Очищаем сообщение коммита от лишних деталей, если они есть
                        let cleanMessage = commit.message.split('\n')[0]; // Берем только первую строку
                        cleanMessage = cleanMessage.substring(0, 50); // Ограничиваем длину
                        if (cleanMessage) {
                            newCommitMessages.push(`git commit -m "${cleanMessage}..."`);
                        }
                    }
                });
            } else if (event.type === 'CreateEvent' && event.payload.ref_type === 'repository') {
                 newCommitMessages.push(`// Created repo: ${event.repo.name}`);
            } else if (event.type === 'ForkEvent') {
                 newCommitMessages.push(`// Forked: ${event.payload.forkee.full_name}`);
            }
        });
        
        if (newCommitMessages.length > 0) {
            commitMessagesCache = [...new Set(newCommitMessages.reverse())]; // Убираем дубликаты и реверсируем для показа старых коммитов первыми, если нужно
        }
        return commitMessagesCache;

    } catch (error) {
        console.error('Failed to fetch or process GitHub events:', error);
        addCodeLineToAvatar(`// Network Error`, true);
        return [];
    }
}

function addCodeLineToAvatar(text, isNewLine = true) {
    if (!avatarCodeLinesElement) return;

    const codeLine = document.createElement('code');
    codeLine.textContent = text;

    if (isNewLine) {
        // Подсветить старые "новые" строки как обычные
        const currentNewLines = avatarCodeLinesElement.querySelectorAll('code.new-line');
        currentNewLines.forEach(nl => nl.classList.remove('new-line'));
        codeLine.classList.add('new-line');
    }
    
    avatarCodeLinesElement.appendChild(codeLine);
    currentAvatarLines.push(codeLine);

    if (currentAvatarLines.length > MAX_AVATAR_LINES) {
        const lineToRemove = currentAvatarLines.shift(); // Удаляем из массива
        lineToRemove.classList.add('old-line'); // Добавляем класс для анимации исчезновения
        setTimeout(() => {
            if(lineToRemove.parentElement) { // Убедимся, что элемент еще в DOM
                avatarCodeLinesElement.removeChild(lineToRemove);
            }
        }, 500); // Время анимации fadeOutLine
    }
    // Прокрутка вниз, если нужно (хотя flex-end должен справляться)
    // codeAvatarContainer.scrollTop = codeAvatarContainer.scrollHeight;
}

let commitMessageIndex = 0;
async function updateAvatarCode() {
    if (commitMessagesCache.length === 0 || commitMessageIndex >= commitMessagesCache.length) {
        await fetchLatestCommits(); // Обновляем кэш, если он пуст или закончился
        commitMessageIndex = 0; // Сбрасываем индекс
        if (commitMessagesCache.length === 0) { // Если после фетча все еще пусто
            setTimeout(updateAvatarCode, FETCH_INTERVAL); // Повторная попытка позже
            return;
        }
    }

    const message = commitMessagesCache[commitMessageIndex];
    if (message) {
        addCodeLineToAvatar(message, true);
        commitMessageIndex++;
    } else { // Если вдруг сообщение undefined, просто переходим к следующему фетчу
         commitMessageIndex = commitMessagesCache.length; // Чтобы инициировать новый fetch
    }
    
    setTimeout(updateAvatarCode, LINE_DISPLAY_INTERVAL);
}

// --- RANDOM WORDS FOR LANGUAGES LOGIC ---
const words = {
    english: ["serendipity", "ephemeral", "quintessential", "eloquence", "nostalgia", "labyrinth", "epiphany", "cascade", "ethereal", "paradox", "synergy", "zenith"],
    spanish: ["esperanza", "libertad", "mariposa", "sonrisa", "corazón", "sueño", "alegría", "amistad", "estrella", "abrazo", "aventura", "melodía"],
    japanese: ["木漏れ日 (komorebi)", "物の哀れ (mono no aware)", "侘寂 (wabi-sabi)", "改善 (kaizen)", "花見 (hanami)", "頑張って (ganbatte)", "懐かしい (natsukashii)", "一期一会 (ichigo ichie)", "いただきます (itadakimasu)", "可愛い (kawaii)"]
    // Примечание: для японского можно добавить перевод или оставить так для аутентичности
};

const wordElements = {
    english: document.getElementById('randomWordEnglish'),
    spanish: document.getElementById('randomWordSpanish'),
    japanese: document.getElementById('randomWordJapanese')
};

const WORD_UPDATE_INTERVAL = 60000; // 1 минута (60000 мс)

function getRandomWord(language) {
    const langWords = words[language];
    if (langWords && langWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * langWords.length);
        return langWords[randomIndex];
    }
    return "..."; // Fallback
}

function updateRandomWord(language) {
    const element = wordElements[language];
    if (element) {
        // Сначала делаем слово невидимым для анимации
        element.classList.remove('visible');
        
        setTimeout(() => {
            element.textContent = getRandomWord(language);
            // Делаем слово видимым с анимацией
            element.classList.add('visible');
        }, 500); // Задержка совпадает с transition-duration
    }
}

function startWordUpdater() {
    for (const lang in wordElements) {
        if (wordElements[lang]) {
            updateRandomWord(lang); // Первоначальное обновление
            setInterval(() => updateRandomWord(lang), WORD_UPDATE_INTERVAL);
        }
    }
}

// --- PROJECT GIT GRAPH LOGIC ---
const projectGitGraphSVG = document.getElementById('projectGitGraph');
const projectGitNodesContainer = document.getElementById('projectGitNodes');

const projectsDataGit = [
    // Проекты должны быть отсортированы по дате НАЧАЛА (самый ранний вверху)
    // для корректного построения "временной шкалы"
    { 
        id: "gates", 
        name: "Gates of Worlds", 
        description: "Сайт на PHP и десктоп на Java для изучения языков.",
        startYear: "2022", 
        endYear: 2023,
        branchColor: 'var(--text-secondary)', // Цвет для завершенных
        nodeColor: 'var(--text-secondary)'
    },
    { 
        id: "banking", 
        name: "Банковское приложение (Aston Soft)", 
        description: "Разработка модуля профилей клиентов.",
        startYear: "2024",
        endYear: null,
        branchColor: 'var(--accent-orange)',
        nodeColor: 'var(--accent-orange)'
    },
    { 
        id: "timelance", 
        name: "TimeLance", 
        description: "Приложение для трекинга времени и навыков.",
        startYear: "2024.10",
        endYear: null,
        branchColor: 'var(--accent-orange)',
        nodeColor: 'var(--accent-orange)'
    },
    { 
        id: "forgeternoul", 
        name: "Forgeternoul", 
        description: "Приложение для чтения новелл.",
        startYear: "2025.3",
        endYear: null,
        branchColor: 'var(--accent-orange)',
        nodeColor: 'var(--accent-orange)'
    }
];

// Сортируем проекты по году начала
projectsDataGit.sort((a, b) => a.startYear - b.startYear);

let currentlyExpandedAnnotationId = null; // Хранит ID текущей раскрытой аннотации

function drawGitGraph() {
    if (!projectGitGraphSVG || !projectGitNodesContainer) return;
    projectGitGraphSVG.innerHTML = ''; 
    projectGitNodesContainer.innerHTML = ''; 
    currentlyExpandedAnnotationId = null; // Сбрасываем при перерисовке

    const svgWidth = projectGitGraphSVG.clientWidth;
    const svgHeight = projectGitGraphSVG.clientHeight;
    const padding = 40; 
    const nodeRadius = 6;

    const minYear = Math.min(...projectsDataGit.map(p => p.startYear));
    const currentVirtualYear = new Date().getFullYear() + (new Date().getMonth() / 12) + 0.5; 
    const maxYear = Math.max(currentVirtualYear, ...projectsDataGit.map(p => p.endYear || currentVirtualYear));
    const yearSpan = maxYear - minYear || 1;

    const mainBranchX = padding + 30; 
    
    const mainLine = createSvgLine(mainBranchX, padding, mainBranchX, svgHeight - padding, 'var(--accent-teal)', 'main-branch');
    projectGitGraphSVG.appendChild(mainLine);
    animateLineDrawing(mainLine, 1000);

    const branchSlots = [];
    const branchSlotWidth = Math.max(50, (svgWidth - mainBranchX - padding * 2) / 3);


    projectsDataGit.forEach((project, index) => {
        const projectStartY = padding + ((project.startYear - minYear) / yearSpan) * (svgHeight - 2 * padding);
        let projectEndY;
        if (project.endYear) {
            projectEndY = padding + ((project.endYear - minYear) / yearSpan) * (svgHeight - 2 * padding);
        } else {
            projectEndY = svgHeight - padding; 
        }

        let slotIndex = 0;
        while(branchSlots[slotIndex] && project.startYear < branchSlots[slotIndex].end) {
            slotIndex++;
        }
        if (!branchSlots[slotIndex] || slotIndex > 2) { 
             slotIndex = (index % 3); 
             if(!branchSlots[slotIndex]) branchSlots[slotIndex] = { busy: false, end: 0 };
        }
        
        const projectBranchX = mainBranchX + (slotIndex + 1) * branchSlotWidth * 0.8 + 30; 
        branchSlots[slotIndex].end = project.endYear || maxYear +1; 


        const startCommitMain = createSvgCircle(mainBranchX, projectStartY, nodeRadius, 'var(--accent-teal)', 'commit-node main-commit');
        projectGitGraphSVG.appendChild(startCommitMain);

        const branchOffLine = createSvgLine(mainBranchX, projectStartY, projectBranchX, projectStartY + 20, project.branchColor, `project-branch-${project.endYear ? 'completed' : 'active'}`);
        projectGitGraphSVG.appendChild(branchOffLine);
        animateLineDrawing(branchOffLine, 500, index * 300 + 500);


        const projectLine = createSvgLine(projectBranchX, projectStartY + 20, projectBranchX, projectEndY, project.branchColor, `project-branch-${project.endYear ? 'completed' : 'active'}`);
        projectGitGraphSVG.appendChild(projectLine);
        animateLineDrawing(projectLine, 1000, index * 300 + 800);

        const projectCommitY = projectStartY + 40; 
        const projectCommitNode = createSvgCircle(projectBranchX, projectCommitY, nodeRadius + 2, project.nodeColor, `commit-node project-commit-${project.endYear ? 'completed' : 'active'}`);
        projectCommitNode.id = `commit-node-${project.id}`; 
        projectGitGraphSVG.appendChild(projectCommitNode);

        const annotation = document.createElement('div');
        annotation.className = 'project-git-node-info';
        annotation.id = `annotation-${project.id}`; 
        
        let annotationLeft = projectBranchX + nodeRadius * 2 + 15;
        const annotationInitialWidth = 200; 
        if (annotationLeft + annotationInitialWidth > svgWidth - padding) { 
            annotationLeft = projectBranchX - nodeRadius * 2 - 15 - annotationInitialWidth; 
        }

        annotation.style.left = `${annotationLeft}px`;
        annotation.style.top = `${projectCommitY - 15}px`; 
        
        annotation.innerHTML = `
            <div class="node-summary">
                <h4>${project.name}</h4>
                <span class="project-dates">${project.startYear}-${project.endYear ? project.endYear.toFixed(0).replace(".0","") : 'Н.В.'}</span>
            </div>
            <p class="node-description">${project.description}</p>
        `;
        projectGitNodesContainer.appendChild(annotation);
        
        setTimeout(() => {
            annotation.classList.add('visible');
        }, index * 300 + 1200);

        // Обработчик клика на SVG узел (коммит)
        projectCommitNode.addEventListener('click', () => {
            toggleAnnotation(annotation.id, projectCommitNode.id);
        });
        // Обработчик клика на саму аннотацию (на ее видимую часть)
        const summaryPart = annotation.querySelector('.node-summary');
        if (summaryPart) {
            summaryPart.addEventListener('click', () => {
                toggleAnnotation(annotation.id, projectCommitNode.id);
            });
        }


        if (project.endYear) {
            const mergeY = Math.min(projectEndY + 20, svgHeight - padding);
            const mergeLine = createSvgLine(projectBranchX, projectEndY, mainBranchX, mergeY, project.branchColor, `project-branch-${project.endYear ? 'completed' : 'active'}`);
            projectGitGraphSVG.appendChild(mergeLine);
            animateLineDrawing(mergeLine, 500, index * 300 + 1800);

            const endCommitMain = createSvgCircle(mainBranchX, mergeY, nodeRadius, 'var(--accent-teal)', 'commit-node main-commit');
            projectGitGraphSVG.appendChild(endCommitMain);
        }
    });
}

function toggleAnnotation(annotationId, commitNodeId) {
    const annotationToToggle = document.getElementById(annotationId);
    const commitNodeToToggle = document.getElementById(commitNodeId);

    // Сначала убираем класс 'expanded' и 'active-commit-node' у всех, если есть текущий раскрытый
    if (currentlyExpandedAnnotationId && currentlyExpandedAnnotationId !== annotationId) {
        const previouslyExpandedAnnotation = document.getElementById(currentlyExpandedAnnotationId);
        const previouslyActiveCommit = document.getElementById(currentlyExpandedAnnotationId.replace('annotation-', 'commit-node-'));
        if (previouslyExpandedAnnotation) {
            previouslyExpandedAnnotation.classList.remove('expanded');
        }
        if (previouslyActiveCommit) {
            previouslyActiveCommit.classList.remove('active-commit-node');
        }
    }

    // Переключаем состояние для текущего элемента
    if (annotationToToggle) {
        annotationToToggle.classList.toggle('expanded');
        if (commitNodeToToggle) {
            commitNodeToToggle.classList.toggle('active-commit-node');
        }

        if (annotationToToggle.classList.contains('expanded')) {
            currentlyExpandedAnnotationId = annotationId;
        } else {
            currentlyExpandedAnnotationId = null; // Если закрыли текущий
        }
    }
}

function createSvgLine(x1, y1, x2, y2, strokeColor, className) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', strokeColor);
    line.classList.add('branch-line');
    if (className) line.classList.add(...className.split(' '));
    return line;
}

function createSvgCircle(cx, cy, r, fillColor, className) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', fillColor);
    if (className) circle.classList.add(...className.split(' '));
    return circle;
}

function animateLineDrawing(lineElement, duration = 1000, delay = 0) {
    const length = lineElement.getTotalLength ? lineElement.getTotalLength() : Math.sqrt(Math.pow(lineElement.x2.baseVal.value - lineElement.x1.baseVal.value, 2) + Math.pow(lineElement.y2.baseVal.value - lineElement.y1.baseVal.value, 2));
    lineElement.style.strokeDasharray = length;
    lineElement.style.strokeDashoffset = length;
    setTimeout(() => {
        lineElement.style.transition = `stroke-dashoffset ${duration / 1000}s ease-in-out`;
        lineElement.style.strokeDashoffset = '0';
    }, delay);
}


document.addEventListener('DOMContentLoaded', () => {
    resizeStarfield(); 
    animateStarfield(); 
    startWordUpdater();

    const heroTitleElement = document.querySelector('.hero h2.typing-effect-title');
    if (heroTitleElement) {
        const originalText = heroTitleElement.textContent;
        heroTitleElement.textContent = ''; 
        let i = 0;
        function typeHeroTitle() {
            if (i < originalText.length) {
                heroTitleElement.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeHeroTitle, 70); 
            }
        }
        if (window.getComputedStyle(heroTitleElement).animationName !== 'none') {
            typeHeroTitle();
        } else {
            heroTitleElement.textContent = originalText; 
            heroTitleElement.style.borderRight = 'none';
        }
    }
    
    createSkillScrolls(); 

    const codeAvatarContainer = document.getElementById('codeAvatar');
    const avatarCodeLinesElement = document.getElementById('avatarCodeLines');
     if (codeAvatarContainer && avatarCodeLinesElement) {
        const birthDate = new Date(2001, 5, 10); 
        const today = new Date();
        let ageYears = today.getFullYear() - birthDate.getFullYear();
        let ageMonths = today.getMonth() - birthDate.getMonth();
        if (ageMonths < 0 || (ageMonths === 0 && today.getDate() < birthDate.getDate())) {
            ageYears--;
            ageMonths = (12 + ageMonths) % 12; 
        }
        const osVersion = `${ageYears}.${ageMonths}`;
        addCodeLineToAvatar('// Booting Core Systems...', false);
        addCodeLineToAvatar(`// Anton L. OS v${osVersion} Initializing...`, false); 
        setTimeout(updateAvatarCode, LINE_DISPLAY_INTERVAL); 
    } else {
        console.error("Элементы аватара не найдены!");
    }

    drawGitGraph(); 

    let resizeTimerGitGraph;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimerGitGraph);
        resizeTimerGitGraph = setTimeout(() => {
            drawGitGraph(); 
        }, 250);
    });
});