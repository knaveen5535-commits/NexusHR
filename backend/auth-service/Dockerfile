FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy the parent POM and all module directories to satisfy Maven reactor
COPY pom.xml .
COPY api-gateway ./api-gateway
COPY auth-service ./auth-service
COPY employee-service ./employee-service
COPY payroll-service ./payroll-service
COPY common ./common

# Build only the required service and its dependencies
RUN mvn clean package -pl auth-service -am -DskipTests

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/auth-service/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
