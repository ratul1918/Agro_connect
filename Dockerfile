# Build stage
FROM eclipse-temurin:25-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN apk add --no-cache maven
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
