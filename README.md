# ⚡ Frontend-приложение "Топ энергетиков"

Добро пожаловать в **"Топ энергетиков"** — frontend-приложение на **React**, созданное для оценки и выбора лучших энергетических напитков. Здесь пользователи могут оставлять отзывы, выставлять оценки и анализировать статистику популярных напитков. В нем реализованы поиск, фильтрация, работа с **API Telegram (Telegram Mini App)** и пользовательская аутентификация. 🚀  

## 🛠 Используемые технологии

[![Technologies](https://skillicons.dev/icons?i=js,html,css,react)](https://skillicons.dev)

## 📂 Структура проекта  

```sh
energy-frontend/
│
├── .github/
│   └── workflows/
│       └── docker-deploy.yml         # CI/CD: деплой Docker-контейнера
│
├── public/
│   ├── favicon.ico                   # Иконка вкладки
│   ├── index.html                    # Главный HTML-шаблон
│   ├── logo192.png                   # Логотип для PWA (192x192)
│   ├── logo512.png                   # Логотип для PWA (512x512)
│   ├── manifest.json                 # PWA-манифест
│   └── robots.txt                    # Инструкции для поисковых систем
│
├── src/
│   ├── components/                   # Переиспользуемые UI-компоненты
│   │   ├── BottomNav.jsx
│   │   ├── BottomNav.css
│   │   ├── Card.jsx
│   │   └── ReviewCard.jsx
│   ├── hooks/                        # Кастомные хуки
│   │   ├── useTelegram.js            # Telegram WebApp API
│   │   └── useUserVerification.js    # Верификация пользователя
│   ├── pages/                        # Страницы (роуты)
│   │   ├── ... .jsx
│   │   └── ... .css
│   ├── styles/                       # Общие стили
│   │   └── App.css
│   ├── App.js                        # Главный компонент приложения
│   ├── App.css                       # Основные стили (если отдельно от layout)
│   ├── config.js                     # Конфигурации: URL, ключи и т.д.
│   └── index.js                      # Точка входа, рендер React-приложения
│
├── .dockerignore                    # Исключения для сборки контейнера
├── .env.sample                      # Пример файла переменных окружения
├── .gitignore                       # Git-игнорируемые файлы
├── docker-compose.yml               # Конфигурация Docker
├── Dockerfile                       # Docker-сборка фронта
├── nginx.conf                       # Конфиг Nginx для продакшн-сервера
├── package.json                     # Зависимости, скрипты, мета
└── README.md                        # Документация проекта
```

---

## 🔧 Установка проекта  

### 📋 Настройка .env
Скопируйте `.env.sample`, переименуйте в `.env` и добавьте свои данные.

Укажите свои значения переменных в `.env`.  

### 📥 Установка зависимостей  
```sh
npm install
```

## 🌐 Тестирование Telegram Mini App локально

Для разработки и тестирования mini app на локальном сервере необходим HTTPS. Используйте туннелирование для **порта, на котором запущен backend**:

#### 1️⃣ Установка Tunnelmole

```sh
npm install -g tunnelmole

```

#### 2️⃣ Запуск туннеля (например, для порта 8000):

```sh
tmole 8000

```

Скопируйте выданный HTTPS-URL и установите его в `REACT_APP_BACKEND_URL` в `.env`.

> ⚠️ Убедитесь, что ваш бэкенд (FastAPI) запущен. Инструкция: [репозиторий backend](https://github.com/dimi-try/energy-backend)

---

## 🚀 Запуск проекта

```sh
npm start
```

Приложение будет доступно по адресу:  
📍 `http://localhost:3000`

---

## 🌍 Деплой

Доступны два способа:

### Вариант 1: Docker Compose вручную

1.  Проверьте `.env` и `docker-compose.yml`
    
2.  Выполните сборку и пуш:
    


```sh
docker compose build
```
```sh
docker compose up -d
```
```sh
docker push <your-dockerhub>
```

### Вариант 2: Автоматически через GitHub Actions

1.  В файле `.github/workflows/docker-deploy.yml` уже всё готово
    
2.  Перейдите в:  
    `GitHub → Settings → Secrets and variables → Actions`
    
3.  Добавьте переменные окружения (как `REACT_APP_BACKEND_URL`, `DOCKERHUB_USERNAME` и т.д.)
    
4.  При пуше в `main` ветку произойдёт автоматическая сборка и публикация образа в DockerHub
    

На прод-сервере можете использовать `docker-compose-server.yml` из [репозитория backend](https://github.com/dimi-try/energy-backend). Скопируйте `.env.example`, переименуйте в `.env` и добавьте свои данные.

---

## ⚡ Связь с Backend  

Frontend взаимодействует с backend-приложением **"Топ энергетиков"**, реализованным на **FastAPI** + **PostgreSQL**.  
Для корректной работы убедитесь, что сервер **backend** запущен. Инструкция по установке и запуску доступна [в репозитории backend](https://github.com/dimi-try/energy-backend).

---

## 🔧 Полезные команды  

##### 📌 Установка зависимостей  
```sh
npm install
```
##### 🚀 Запуск в продакшене  
```sh
npm run build
```
##### 🔄 Линтинг кода  
```sh
npm run lint
```
##### 🧹 Очистка кэша  
```sh
npm cache clean --force
```
##### 🗑 Очистка node_modules  
```sh
Get-ChildItem -Path . -Recurse -Directory -Filter "node_modules" | Remove-Item -Recurse -Force #windows
```

---

## 💡 Обратная связь  

Если у вас есть предложения или вопросы, создавайте **issue** в репозитории! 🚀
