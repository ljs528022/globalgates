# syntax=docker/dockerfile:1.7

# 빌드 할 때에는 jdk 17버전을 사용하겠다.
FROM eclipse-temurin:17-jdk AS build

# ───────────────────────────────── 인프라
ARG EC2_HOST
ENV EC2_HOST=${EC2_HOST}

ARG SERVER_PORT
ENV SERVER_PORT=${SERVER_PORT}

# ───────────────────────────────── PostgreSQL
ARG PSQL_PORT
ENV PSQL_PORT=${PSQL_PORT}

ARG PSQL_DATABASE
ENV PSQL_DATABASE=${PSQL_DATABASE}

ARG PSQL_USERNAME
ENV PSQL_USERNAME=${PSQL_USERNAME}

ARG PSQL_PASSWORD
ENV PSQL_PASSWORD=${PSQL_PASSWORD}

# ───────────────────────────────── Redis / RabbitMQ
ARG REDIS_PORT
ENV REDIS_PORT=${REDIS_PORT}

ARG REDIS_PORT
ENV REDIS_PORT=${REDIS_PORT}

# ───────────────────────────────── Mail
ARG MAIL_API_URL
ENV MAIL_API_URL=${MAIL_API_URL}

ARG MAIL_API_PORT
ENV MAIL_API_PORT=${MAIL_API_PORT}

ARG MAIL_API_USERNAME
ENV MAIL_API_USERNAME=${MAIL_API_USERNAME}

ARG MAIL_API_PASSWORD
ENV MAIL_API_PASSWORD=${MAIL_API_PASSWORD}

# ───────────────────────────────── JWT
ARG JWT_SECRET
ENV JWT_SECRET=${JWT_SECRET}

# ───────────────────────────────── AWS
ARG AWS_ACCESS_KEY
ENV AWS_ACCESS_KEY=${AWS_ACCESS_KEY}

ARG AWS_SECRET_KEY
ENV AWS_SECRET_KEY=${AWS_SECRET_KEY}

ARG AWS_BUCKET_NAME
ENV AWS_BUCKET_NAME=${AWS_BUCKET_NAME}

ARG AWS_REGION
ENV AWS_REGION=${AWS_REGION}

# ───────────────────────────────── SMS
ARG MESSAGE_API_KEY
ENV MESSAGE_API_KEY=${MESSAGE_API_KEY}

ARG MESSAGE_API_SECRET
ENV MESSAGE_API_SECRET=${MESSAGE_API_SECRET}

# ───────────────────────────────── 결제 (Bootpay)
ARG BOOTPAY_ID
ENV BOOTPAY_ID=${BOOTPAY_ID}

ARG BOOTPAY_KEY
ENV BOOTPAY_KEY=${BOOTPAY_KEY}

ARG BOOTPAY_URL
ENV BOOTPAY_URL=${BOOTPAY_URL}

# ───────────────────────────────── LiveKit
ARG LIVEKIT_URL
ENV LIVEKIT_URL=${LIVEKIT_URL}

# ───────────────────────────────── OAuth (Kakao)
ARG KAKAO_CLIENT_ID
ENV KAKAO_CLIENT_ID=${KAKAO_CLIENT_ID}

ARG KAKAO_CLIENT_SECRET
ENV KAKAO_CLIENT_SECRET=${KAKAO_CLIENT_SECRET}

# ───────────────────────────────── OAuth (Naver)
ARG NAVER_CLIENT_ID
ENV NAVER_CLIENT_ID=${NAVER_CLIENT_ID}

ARG NAVER_CLIENT_SECRET
ENV NAVER_CLIENT_SECRET=${NAVER_CLIENT_SECRET}

# ───────────────────────────────── OAuth (Google)
ARG GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}

ARG GOOGLE_CLIENT_SECRET
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

# ───────────────────────────────── OAuth (Facebook)
ARG FACEBOOK_CLIENT_ID
ENV FACEBOOK_CLIENT_ID=${FACEBOOK_CLIENT_ID}

ARG FACEBOOK_CLIENT_SECRET
ENV FACEBOOK_CLIENT_SECRET=${FACEBOOK_CLIENT_SECRET}

# ───────────────────────────────── 지도
ARG GOOGLE_MAP_KEY
ENV GOOGLE_MAP_KEY=${GOOGLE_MAP_KEY}

# 작업 디렉토리 설정
WORKDIR /app

# Gradle wrapper와 빌드 정의를 먼저 복사해서 의존성 캐시 재사용률을 높인다.
COPY gradlew build.gradle settings.gradle ./
COPY gradle ./gradle
RUN chmod +x ./gradlew

# 프로젝트 소스 복사 후 빌드 (테스트 비활성화는 build.gradle 의 test task 에서 처리)
COPY src ./src

# Gradle 캐시는 이미지 레이어가 아니라 BuildKit 캐시에만 둔다.
RUN chmod +x ./gradlew && ./gradlew build

# 실행만 담당하는 jre 환경으로 설정한다.
FROM eclipse-temurin:17-jre

ENV TZ=Asia/Seoul

# JAR 파일 복사 (settings.gradle 의 rootProject.name='back' → 결과물은 back-*.jar)
COPY --from=build /app/build/libs/back-0.0.1-SNAPSHOT.jar app.jar

# 포트 오픈
ARG SERVER_PORT=10000
ENV SERVER_PORT=${SERVER_PORT}
EXPOSE ${SERVER_PORT}

# 실행 명령어
ENTRYPOINT ["java", "-jar", "app.jar"]
