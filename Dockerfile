# Указываем Docker, чтобы использовать Node.js для фронтенда
FROM node:22.14.0

# Устанавливаем рабочую директорию
WORKDIR /src

# Копируем package.json и устанавливаем зависимости
COPY package.json package-lock.json /src/
RUN npm install

# Копируем весь код
COPY . /src

# Собираем проект
RUN npm run build

# Открываем порт 3000 для фронтенда
EXPOSE 3000

# Запускаем фронтенд
CMD ["npm", "start"]
