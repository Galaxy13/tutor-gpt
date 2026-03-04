FROM eclipse-temurin:25-jdk-alpine AS build
WORKDIR /workspace
COPY gradlew ./
COPY gradle ./gradle
COPY settings.gradle.kts build.gradle.kts ./

RUN chmod +x ./gradlew
RUN ./gradlew --no-daemon dependencies || true
COPY src/ src/
RUN ./gradlew --no-daemon clean bootJar

FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=build /workspace/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]