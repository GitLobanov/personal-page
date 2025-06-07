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
        category: "ЯЗЫКИ ПРОГРАММИРОВАНИЯ", // Убрал "Истоки силы" для краткости
        // icon: "fas fa-code", // Старую иконку категории можно оставить или убрать
        description: "Основные языки, которые я использую для создания цифровых реальностей.",
        techniques: [
            { name: "Java", iconClass: "fab fa-java", color: "var(--accent-orange)" }, // Пример FontAwesome
            { name: "Kotlin", iconClass: "fas fa-code", color: "var(--accent-teal)" }    // Общая иконка, если нет специфичной
        ]
    },
    {
        category: "ФРЕЙМВОРКИ И БИБЛИОТЕКИ",
        description: "Инструменты для ускорения разработки и построения надежных систем.",
        techniques: [
            { name: "Spring Framework", iconClass: "fas fa-leaf", color: "#6DB33F" }, // Примерный цвет Spring
            { name: "Spring Boot", iconClass: "fas fa-rocket", color: "#6DB33F" },
            // { name: "Spring Web" }, // Можно объединить или оставить
            // { name: "Spring Data" },
            // { name: "Spring Cloud" },
            { name: "Hibernate", iconClass: "fas fa-database", color: "#BCAAA4"}, // Пример
            { name: "Apache Kafka", iconClass: "fas fa-stream", color: "#c96bc8" }
        ]
    },
    {
        category: "БАЗЫ ДАННЫХ",
        description: "Хранилища данных, с которыми я работаю.",
        techniques: [
            { name: "PostgreSQL", iconClass: "fas fa-database", color: "#336791" }, // Цвет лого PostgreSQL
            { name: "MongoDB", iconClass: "fas fa-database", color: "#4DB33D" },    // Цвет лого MongoDB
            { name: "Redis", iconClass: "fas fa-database", color: "#D82C20" },       // Цвет лого Redis
            { name: "Liquibase", iconClass: "fas fa-tools", color: "var(--text-secondary)" }
        ]
    },
    {
        category: "API И ПРОТОКОЛЫ",
        description: "Создание и использование интерфейсов для взаимодействия систем.",
        techniques: [
            { name: "REST API", iconClass: "fas fa-exchange-alt", color: "var(--accent-teal)" },
            { name: "gRPC", iconClass: "fas fa-bolt", color: "var(--accent-orange)" }
        ]
    },
    {
        category: "DEVOPS И CI/CD",
        description: "Инструменты для автоматизации развертывания и управления инфраструктурой.",
        techniques: [
            { name: "Docker", iconClass: "fab fa-docker", color: "#0db7ed" },
            { name: "Kubernetes", iconClass: "fas fa-dharmachakra", color: "#326ce5" }, // Пример
            { name: "Maven", iconClass: "fas fa-cogs", color: "#c71a36" },
            { name: "CI/CD", iconClass: "fas fa-sync-alt", color: "var(--text-secondary)" }
        ]
    },
    {
        category: "МОНИТОРИНГ",
        description: "Отслеживание состояния и производительности приложений.",
        techniques: [
            { name: "Prometheus", iconClass: "fas fa-fire", color: "#E6522C" },
            { name: "Grafana", iconClass: "fas fa-chart-bar", color: "#F4B400" }, // Примерный цвет
            { name: "ELK Stack", iconClass: "fas fa-search", color: "#00A98F" }, // Пример
            { name: "Jaeger", iconClass: "fas fa-glasses", color: "#54B6E4" } // Пример
        ]
    },
    {
        category: "ТЕСТИРОВАНИЕ",
        description: "Обеспечение качества и надежности кода.",
        techniques: [
            { name: "JUnit", iconClass: "fas fa-check-circle", color: "#25A162" }, // Пример
            { name: "Mockito", iconClass: "fas fa-user-secret", color: "#E39802" }, // Пример
            { name: "Testcontainers", iconClass: "fas fa-box-open", color: "#0db7ed" },
            { name: "ArchUnit", iconClass: "fas fa-archway", color: "var(--text-secondary)" }
        ]
    },
    {
        category: "ИНСТРУМЕНТЫ И МЕТОДОЛОГИИ",
        description: "Подходы и средства, улучшающие процесс разработки.",
        techniques: [
            { name: "Git", iconClass: "fab fa-git-alt", color: "#F1502F" },
            { name: "Agile", iconClass: "fas fa-users", color: "var(--accent-teal)" }, // Используем текстовые "пилюли"
            { name: "Scrum", iconClass: "fas fa-retweet", color: "var(--accent-orange)" } // Используем текстовые "пилюли"
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
    scrollContainer.innerHTML = '';

    skillsData.forEach((skillCategory, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'skill-card';
        cardDiv.style.animationDelay = `${index * 0.1}s`;

        let techniquesHTML = '<div class="skill-card-tech-list">';
        skillCategory.techniques.forEach(tech => {
            if (tech.iconClass) {
                const styleAttribute = tech.color ? `style="color: ${tech.color}; border-color: ${tech.color};"` : '';
                techniquesHTML += `
                    <span class="tech-item tech-item-icon" ${styleAttribute}>
                        <i class="${tech.iconClass}"></i>
                        <span class="tech-item-name">${tech.name}</span>
                    </span>`;
            } else {
                const styleAttribute = tech.color ? `style="background-color: ${tech.color};"` : '';
                techniquesHTML += `<span class="tech-item tech-item-pill" ${styleAttribute}>${tech.name}</span>`;
            }
        });
        techniquesHTML += '</div>';

        cardDiv.innerHTML = `
            <div class="skill-card-header">
                <h4 class="skill-card-title">${skillCategory.category}</h4>
            </div>
            ${skillCategory.description ? `<p class="skill-card-description">${skillCategory.description}</p>` : ''}
            ${techniquesHTML}
        `;
        scrollContainer.appendChild(cardDiv);
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

// Модальное окно
const projectModal = document.getElementById('projectModal');
const modalCloseButton = projectModal.querySelector('.project-modal-close');
const modalProjectName = document.getElementById('modalProjectName');
const modalProjectDates = document.getElementById('modalProjectDates');
const modalProjectScreenshot = document.getElementById('modalProjectScreenshot');
const modalProjectDescription = document.getElementById('modalProjectDescription');
const modalProjectTechnologies = document.getElementById('modalProjectTechnologies');

const projectsDataGit = [
    {
        id: "gates",
        name: "Gates of Worlds",
        description: "Сайт на PHP и десктоп на Java для изучения языков через интерактивные истории и упражнения.",
        startYear: "2022",
        endYear: 2023,
        branchColor: 'var(--text-secondary)',
        nodeColor: 'var(--text-secondary)',
        technologies: ["PHP", "Java", "Swing", "MySQL", "HTML", "CSS"],
        screenshot: "https://i.ytimg.com/vi/jg8ixdQzrjc/maxresdefault.jpg"
    },
    {
        id: "banking",
        name: "Банковское приложение (Aston Soft)",
        description: "Разработка модуля профилей клиентов с использованием микросервисной архитектуры. Реализация CRUD операций, работа с Kafka для асинхронных уведомлений.",
        startYear: "2024",
        endYear: null,
        branchColor: 'var(--accent-orange)',
        nodeColor: 'var(--accent-orange)',
        technologies: ["Java", "Spring Boot", "Spring Cloud", "PostgreSQL", "Kafka", "Docker"],
        screenshot: "https://i.pinimg.com/originals/e4/21/50/e4215008df6962d94248502bed11a113.jpg" 
    },
    {
        id: "timelance",
        name: "TimeLance",
        description: "Pet-проект: приложение для трекинга времени, затраченного на различные проекты и навыки, с аналитикой и постановкой целей.",
        startYear: "2024.10", // Год.месяц (число)
        endYear: null,
        branchColor: 'var(--accent-orange)',
        nodeColor: 'var(--accent-orange)',
        technologies: ["Kotlin", "Spring Boot", "React", "PostgreSQL", "MongoDB"],
        screenshot: "https://avatars.mds.yandex.net/i?id=5c81d040a45718b64112cbb8dc183fb4_l-4079727-images-thumbs&n=13"
    },
    {
        id: "forgeternoul",
        name: "Forgeternoul",
        description: "Pet-проект: платформа для чтения и публикации интерактивных новелл с возможностью выбора сюжетных веток.",
        startYear: "2025.3",
        endYear: null,
        branchColor: 'var(--accent-orange)',
        nodeColor: 'var(--accent-orange)',
        technologies: ["Java", "Spring Boot", "Vue.js", "PostgreSQL", "WebSocket"],
        screenshot: "https://avatars.mds.yandex.net/i?id=a1faccdbb295ee91aec164afc252c02c_l-10471591-images-thumbs&n=13"
    }
];

// Сортируем проекты по году начала
projectsDataGit.sort((a, b) => parseFloat(String(a.startYear).replace(",", ".")) - parseFloat(String(b.startYear).replace(",", ".")));

let currentlyExpandedAnnotationId = null; // Хранит ID текущей раскрытой аннотации

function openProjectModal(project) {
    modalProjectName.textContent = project.name;
    modalProjectDates.textContent = `${String(project.startYear).replace(".0", "")}-${project.endYear ? String(project.endYear).replace(".0", "") : 'Н.В.'}`;
    
    // Убедимся, что screenshot не null и не пустая строка
    if (project.screenshot && project.screenshot.trim() !== "" && project.screenshot !== "path/to/your_screenshot.jpg") { // Added check for placeholder
        modalProjectScreenshot.src = project.screenshot;
        modalProjectScreenshot.style.display = 'block'; // Показываем, если есть
        modalProjectScreenshot.alt = `Скриншот проекта ${project.name}`;
    } else {
        modalProjectScreenshot.style.display = 'none'; // Скрываем, если нет или это плейсхолдер
        modalProjectScreenshot.src = ""; // Очищаем src
        modalProjectScreenshot.alt = "";
    }

    modalProjectDescription.textContent = project.description;

    modalProjectTechnologies.innerHTML = ''; // Очищаем предыдущие технологии
    if (project.technologies && project.technologies.length > 0) {
        project.technologies.forEach(tech => {
            const techPill = document.createElement('span');
            techPill.className = 'tech-pill';
            techPill.textContent = tech;
            modalProjectTechnologies.appendChild(techPill);
        });
    }
    projectModal.style.display = 'flex'; // Показываем модальное окно
    document.body.style.overflow = 'hidden'; // Блокируем прокрутку фона
}

function closeProjectModal() {
    projectModal.style.display = 'none';
    document.body.style.overflow = ''; // Восстанавливаем прокрутку
}

modalCloseButton.addEventListener('click', closeProjectModal);
projectModal.addEventListener('click', (event) => { // Закрытие по клику на фон
    if (event.target === projectModal) {
        closeProjectModal();
    }
});

function drawGitGraph() {
    if (!projectGitGraphSVG) return;
    projectGitGraphSVG.innerHTML = '';

    const svgWidth = projectGitGraphSVG.clientWidth;
    let svgHeight = projectGitGraphSVG.clientHeight; // Изначальная высота

    // Адаптация для мобильных
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        svgHeight = Math.max(400, svgHeight * 0.7); // Уменьшаем высоту на мобильных, но не меньше 400px
        projectGitGraphSVG.setAttribute('height', `${svgHeight}px`);
    } else {
        // Ensure height is explicitly set for desktop if it relies on CSS that might change
        projectGitGraphSVG.setAttribute('height', `600px`); 
    }


    const padding = isMobile ? 25 : 40;
    const nodeRadius = isMobile ? 4 : 6;

    // Преобразуем startYear и endYear в числовые значения для расчетов
    const projects = projectsDataGit.map(p => ({
        ...p,
        numericStartYear: parseFloat(String(p.startYear).replace(",", ".")),
        numericEndYear: p.endYear ? parseFloat(String(p.endYear).replace(",", ".")) : null
    }));

    const minYear = Math.min(...projects.map(p => p.numericStartYear));
    const currentVirtualYear = new Date().getFullYear() + (new Date().getMonth() / 12) + 0.5;
    const maxYear = Math.max(currentVirtualYear, ...projects.map(p => p.numericEndYear || currentVirtualYear));
    const yearSpan = maxYear - minYear || 1;

    const mainBranchX = padding + (isMobile ? 15 : 30);

    const mainLine = createSvgLine(mainBranchX, padding, mainBranchX, svgHeight - padding, 'var(--accent-teal)', 'main-branch');
    projectGitGraphSVG.appendChild(mainLine);
    animateLineDrawing(mainLine, 1000);

    const branchSlots = [];
    const numSlots = isMobile ? 2 : 3; // Меньше слотов на мобильных
    const branchSlotWidth = Math.max(isMobile ? 35 : 50, (svgWidth - mainBranchX - padding * 2) / numSlots);


    projects.forEach((project, index) => {
        const projectStartY = padding + ((project.numericStartYear - minYear) / yearSpan) * (svgHeight - 2 * padding);
        let projectEndY;
        if (project.numericEndYear) {
            projectEndY = padding + ((project.numericEndYear - minYear) / yearSpan) * (svgHeight - 2 * padding);
        } else {
            projectEndY = svgHeight - padding;
        }

        let slotIndex = 0;
        while (branchSlots[slotIndex] && project.numericStartYear < branchSlots[slotIndex].end) {
            slotIndex++;
        }
        if (!branchSlots[slotIndex] || slotIndex >= numSlots) {
            slotIndex = (index % numSlots);
            if (!branchSlots[slotIndex]) branchSlots[slotIndex] = { busy: false, end: 0 };
        }

        const projectBranchX = mainBranchX + (slotIndex + 1) * branchSlotWidth * (isMobile ? 0.9 : 0.8) + (isMobile ? 15 : 30);
        branchSlots[slotIndex].end = project.numericEndYear || maxYear + 1;


        const startCommitMain = createSvgCircle(mainBranchX, projectStartY, nodeRadius, 'var(--accent-teal)', 'commit-node main-commit');
        projectGitGraphSVG.appendChild(startCommitMain);

        const branchOffLine = createSvgLine(mainBranchX, projectStartY, projectBranchX, projectStartY + (isMobile ? 15 : 20), project.branchColor, `project-branch-${project.endYear ? 'completed' : 'active'}`);
        projectGitGraphSVG.appendChild(branchOffLine);
        animateLineDrawing(branchOffLine, 500, index * 300 + 500);


        const projectLine = createSvgLine(projectBranchX, projectStartY + (isMobile ? 15 : 20), projectBranchX, projectEndY, project.branchColor, `project-branch-${project.endYear ? 'completed' : 'active'}`);
        projectGitGraphSVG.appendChild(projectLine);
        animateLineDrawing(projectLine, 1000, index * 300 + 800);

        const projectCommitY = projectStartY + (isMobile ? 25 : 40);
        const projectCommitNode = createSvgCircle(projectBranchX, projectCommitY, nodeRadius + (isMobile ? 1 : 2), project.nodeColor, `commit-node project-commit-${project.endYear ? 'completed' : 'active'}`);
        projectCommitNode.id = `commit-node-${project.id}`;
        projectGitGraphSVG.appendChild(projectCommitNode);

        projectCommitNode.addEventListener('click', () => {
            openProjectModal(project); // Открываем модальное окно с данными этого проекта
        });


        if (project.endYear) {
            const mergeY = Math.min(projectEndY + (isMobile ? 15 : 20), svgHeight - padding);
            const mergeLine = createSvgLine(projectBranchX, projectEndY, mainBranchX, mergeY, project.branchColor, `project-branch-${project.endYear ? 'completed' : 'active'}`);
            projectGitGraphSVG.appendChild(mergeLine);
            animateLineDrawing(mergeLine, 500, index * 300 + 1800);

            const endCommitMain = createSvgCircle(mainBranchX, mergeY, nodeRadius, 'var(--accent-teal)', 'commit-node main-commit');
            projectGitGraphSVG.appendChild(endCommitMain);
        }
    });
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
        // Check if animation is 'none' which might happen if styles are not fully loaded
        // or if prefers-reduced-motion is active and handled this way.
        // A more robust check might be needed if animation can be dynamically disabled.
        if (window.getComputedStyle(heroTitleElement).animationName && window.getComputedStyle(heroTitleElement).animationName !== 'none') {
            // Only start typing if blinkCaret animation is active
             // Ensure animation 'typingTitle' will also run by not setting text content immediately
        } else {
            // If animations are off (e.g. prefers-reduced-motion or style issue), just set the text
            heroTitleElement.textContent = originalText; 
            heroTitleElement.style.borderRight = 'none'; // Hide caret if not animating
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
            // Re-check clientHeight for SVG as it might be dynamically set
            // or ensure it's correctly handled within drawGitGraph
            projectGitGraphSVG.clientHeight; // Reading to ensure reflow if needed
            drawGitGraph();
        }, 250);
    });
});