# Use latest Eclipse Temurin JDK 21 base image
FROM eclipse-temurin:21-jdk

# Set working directory
WORKDIR /app

# Copy the built JAR file into the image
COPY target/demo-0.0.1-SNAPSHOT.jar app.jar

# Install Tesseract OCR
RUN apt-get update && apt-get install -y tesseract-ocr && rm -rf /var/lib/apt/lists/*

ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=100"

# Run the JAR file
ENTRYPOINT ["java", "-jar", "app.jar"]
