FROM node:22-alpine

WORKDIR /app

# Chứng chỉ SSL cho các kết nối HTTPS ra ngoài (MongoDB Atlas, Gemini API, SMTP, Edge TTS)
RUN apk add --no-cache ca-certificates

# Cài dependencies production từ package-lock.json
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy mã nguồn ứng dụng
COPY server.js ./
COPY src ./src

# Tạo thư mục uploads và cấp quyền cho user node
RUN mkdir -p /app/uploads/avatars && chown -R node:node /app

USER node

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 5000) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]

