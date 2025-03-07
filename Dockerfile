FROM node:20.18.3-alpine3.21 AS build

ARG VITE_CASHIO_API_BASE_URL
ENV VITE_CASHIO_API_BASE_URL=${VITE_CASHIO_API_BASE_URL}

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27.4-alpine3.21
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

ENTRYPOINT ["nginx","-g","daemon off;"]
