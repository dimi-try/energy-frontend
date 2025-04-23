# ⚡ Frontend-приложение "Топ энергетиков"

Добро пожаловать в **"Топ энергетиков"** — frontend-приложение на **React**, созданное для оценки и выбора лучших энергетических напитков. Здесь пользователи могут оставлять отзывы, выставлять оценки и анализировать статистику популярных напитков. В нем реализованы поиск, фильтрация, работа с API Telegram (Telegram Mini App) и пользовательская аутентификация. 🚀  

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
│
│   ├── pages/                        # Страницы (роуты)
│   │   ├── EnergyDrinkPage.jsx
│   │   ├── EnergyDrinkPage.css
│   │   ├── Favorites.jsx
│   │   ├── Profile.jsx
│   │   ├── Search.jsx
│   │   ├── Top100.jsx
│   │   └── Top100.css
│
│   ├── hooks/                        # Кастомные хуки
│   │   ├── useTelegram.js            # Telegram WebApp API
│   │   └── useUserVerification.js    # Верификация пользователя
│
│   ├── styles/                       # Общие стили
│   │   └── App.css
│
│   ├── App.js                        # Главный компонент приложения
│   ├── App.css                       # Основные стили (если отдельно от layout)
│   ├── config.js                     # Конфигурации: URL, ключи и т.д.
│   └── index.js                      # Точка входа, рендер React-приложения
│
├── .dockerignore                    # Исключения для сборки контейнера
├── .env.sample                      # Пример файла переменных окружения
├── .gitignore                       # Git-игнорируемые файлы
├── Dockerfile                       # Docker-сборка фронта
├── nginx.conf                       # Конфиг Nginx для продакшн-сервера
├── package.json                     # Зависимости, скрипты, мета
└── README.md                        # Документация проекта
```

---

## 🔧 Установка проекта  

### 📋 Настройка .env
Скопируйте `.env.sample`, переименуйте в `.env` и добавьте свои данные.

Заполните `.env` в соответствии с вашими параметрами API и конфигурацией сервера.  

### 📥 Установка зависимостей  
```sh
npm install
```

---

## 🚀 Запуск проекта  
```sh
npm start
```
После запуска приложение будет доступно по адресу:  
📍 **http://localhost:3000/**  

---

## ⚡ Связь с Backend  

Frontend взаимодействует с backend-приложением **"Топ энергетиков"**, реализованным на **FastAPI** + **PostgreSQL**.  
Для корректной работы убедитесь, что сервер **backend** запущен. Инструкция по установке и запуску доступна [в репозитории backend](https://github.com/nuafirytiasewo/energy-backend).

---

## 📡 Работа с Telegram API  

Telegram требует **HTTPS-соединение**, поэтому для тестирования доступны два варианта:  

🔹 **Деплой на Netlify**  
Простой способ развернуть frontend с HTTPS — загрузить его в [Netlify](https://www.netlify.com/).  

### 🔹 Использование ngrok  
Для локального тестирования API Telegram можно создать временный HTTPS-туннель с помощью [ngrok](https://ngrok.com/):  

#### 1️⃣ Установите ngrok  
Скачайте и установите **ngrok** с [официального сайта](https://ngrok.com/).  

#### 2️⃣ Запустите туннель для локального сервера  
```sh
ngrok http 3000
```
После запуска ngrok выдаст публичный **HTTPS-URL**, который можно использовать в Telegram API.  

---

## 🔧 Полезные команды  

### 📌 Установка зависимостей  
```sh
npm install
```
### 🚀 Запуск в продакшене  
```sh
npm run build
```
### 🔄 Линтинг кода  
```sh
npm run lint
```
### 🧹 Очистка кэша  
```sh
npm cache clean --force
```

---

## 💡 Обратная связь  

Если у вас есть предложения или вопросы, создавайте **issue** в репозитории! 🚀
