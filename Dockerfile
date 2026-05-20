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

ARG RABBITMQ_PORT
ENV RABBITMQ_PORT=${RABBITMQ_PORT}

ARG RABBITMQ_USERNAME
ENV RABBITMQ_USERNAME=${RABBITMQ_USERNAME}

ARG RABBITMQ_PASSWORD
ENV RABBITMQ_PASSWORD=${RABBITMQ_PASSWORD}

# ───────────────────────────────── Mail (Gmail SMTP)
ARG MAIL_USERNAME
ENV MAIL_USERNAME=${MAIL_USERNAME}

ARG MAIL_PASSWORD
ENV MAIL_PASSWORD=${MAIL_PASSWORD}

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

# ───────────────────────────────── SMS (Solapi)
ARG SOLAPI_KEY
ENV SOLAPI_KEY=${SOLAPI_KEY}

ARG SOLAPI_SECRET
ENV SOLAPI_SECRET=${SOLAPI_SECRET}

# ───────────────────────────────── 결제 (Bootpay)
ARG BOOTPAY_ID
ENV BOOTPAY_ID=${BOOTPAY_ID}

ARG BOOTPAY_PRIVATEKEY
ENV BOOTPAY_PRIVATEKEY=${BOOTPAY_PRIVATEKEY}

ARG BOOTPAY_APIURL
ENV BOOTPAY_APIURL=${BOOTPAY_APIURL}

# ───────────────────────────────── 내부 AI 서비스
ARG AI_CONTENTS_BASE_URL
ENV AI_CONTENTS_BASE_URL=${AI_CONTENTS_BASE_URL}

ARG INTERNAL_AI_TOKEN
ENV INTERNAL_AI_TOKEN=${INTERNAL_AI_TOKEN}

# FastAPI (욕설 검사 + 광고 회귀 ML 같은 인스턴스에서 동일 포트 공유)
ARG FASTAPI_PORT
ENV FASTAPI_PORT=${FASTAPI_PORT}

# LiveKit
ARG LIVEKIT_PORT
ENV LIVEKIT_PORT=${LIVEKIT_PORT}

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

# ───────────────────────────────── Frontend 지도 SDK 키
ARG GOOGLE_MAPS_API_KEY
ENV GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}

ARG KAKAO_MAPS_JS_KEY
ENV KAKAO_MAPS_JS_KEY=${KAKAO_MAPS_JS_KEY}

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
