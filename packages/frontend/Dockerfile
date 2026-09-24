FROM node:24.20.0-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci

FROM deps AS dev

COPY . .
RUN chown -R node:node /app

USER node

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM deps AS build

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
