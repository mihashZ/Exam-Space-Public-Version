# ExamSpace - Online Assessment Platform

<div align="center">
  <img src="./logo.png" alt="ExamSpace Logo">
</div>

---

## 🎯 About The Project

**ExamSpace** is a modern, open-source online assessment platform designed to revolutionize the way educational institutions conduct examinations. Built with scalability, security, and user experience in mind, ExamSpace provides a comprehensive solution for creating, managing, and taking online exams.

### 🌟 Why ExamSpace?

- **🔒 Security First**: Advanced anti-cheating measures and secure authentication
- **🤖 AI-Powered**: Intelligent question generation using Cohere API
- **📱 Responsive Design**: Works seamlessly across all devices
- **🔧 Highly Configurable**: Flexible exam settings and customization options
- **📊 Analytics Ready**: Comprehensive reporting and performance insights

---

## ✨ Features

### 👤 User Management & Security
- **JWT Authentication**: Secure token-based authentication system
- **Multi-Factor Authentication**: OTP verification for registration and password recovery
- **Email Verification**: Secure email confirmation for account activation
- **Profile Management**: Update personal information and preferences
- **Password Security**: Encrypted password storage with reset functionality

### 📝 Exam Creation & Management
- **Intuitive Exam Builder**: Create exams with flexible question types
- **AI Question Generation**: Generate questions using Cohere API integration
- **Passcode Protection**: Secure exams with custom passcodes
- **Sharing System**: Share exams with specific users or groups

### 🖥️ Exam Taking Experience
- **Clean Interface**: Distraction-free exam environment
- **Fullscreen Mode**: Enforced fullscreen for secure testing
- **Anti-Cheating**: Tab or screen switching detection and monitoring

### 📊 Analytics & Reporting
- **Performance Dashboard**: Comprehensive exam statistics
- **Question Analysis**: Identify difficult questions and common mistakes
- **Export Options**: Generate reports in PDF, Excel formats
- **Result Publishing**: Control when and how results are released

---

## 🛠️ Technology Stack

### Backend Technologies
```
Language: Java 21 (LTS)
Framework: Spring Boot 3.5.3
Security: Spring Security with JWT
Database: MariaDB 10.11+
ORM: Spring Data JPA with Hibernate
Email: JavaMail API
AI Integration: Cohere API
OCR: Tesseract 4.x
Build Tool: Maven 3.9+
Testing: JUnit 5, Mockito
Documentation: OpenAPI 3 (Swagger)
```

### Frontend Technologies
```
Framework: React 19.1.0
Build Tool: Vite 7.0.0
Language: JavaScript (ES2022+)
Styling: CSS3 with Flexbox/Grid
HTTP Client: Fetch API
Routing: React Router DOM 6.x
State Management: React Hooks
Testing: React Testing Library, Jest
```

### DevOps & Infrastructure
```
Version Control: Git
CI/CD: GitHub Actions
Containerization: Docker & Docker Compose
Web Server: Embedded Tomcat
Reverse Proxy: Nginx (recommended)
Monitoring: Spring Actuator
Logging: Logback with SLF4J
```

---


## 🌐 Current Deployment Architecture

ExamSpace uses a distributed architecture with several key components:

```
┌─────────────────┐    ┌───────────────────────────┐    ┌─────────────────┐
│   React SPA     │    │      Raspberry Pi         │    │   MariaDB       │
│   (Vercel)      │◄──►│   Dockerized Backend      │◄──►│   Database      │
│                 │    │   (Self-hosted)           │    │   (Native on Pi)│
└─────────────────┘    └───────────────────────────┘    └─────────────────┘
         │                          │                             
         │                          │                             
         ▼                          ▼                             
┌─────────────────┐    ┌─────────────────────────────────────┐   
│ Vercel Platform │    │        Cloudflare Tunnel            │   
│  (Frontend      │    │  (Secure API exposure from home     │   
│   Hosting)      │    │   network without port forwarding)  │   
└─────────────────┘    └─────────────────────────────────────┘   
```

### Backend Deployment (Raspberry Pi)

The Spring Boot backend is containerized using Docker and deployed on a Raspberry Pi in a home network:

- **Containerization**: Using Dockerfile with Eclipse Temurin JDK 21
- **Container Orchestration**: Managed via docker-compose.yml
- **Resource Allocation**: 
  - 2 CPU cores maximum
  - 1.5GB RAM allocation
  - Optimized JVM settings for constrained environment

```dockerfile
FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY target/demo-0.0.1-SNAPSHOT.jar app.jar
RUN apt-get update && apt-get install -y tesseract-ocr && rm -rf /var/lib/apt/lists/*
ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=100"
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### CI/CD Pipeline

Automated deployment is handled through GitHub Actions with a self-hosted runner on the Raspberry Pi:

- **Workflow**: Defined in ci-cd.yml
- **Build Process**: 
  - Maven clean package
  - Docker image building
  - Container deployment
- **Port Management**: Aggressive cleanup of port 8081 before deployment
- **Health Checks**: Verifies successful deployment

The self-hosted runner approach allows deployment directly to the home network Raspberry Pi without exposing SSH credentials.

### Database Configuration

MariaDB database runs natively (not containerized) on the Raspberry Pi:

- **Database Engine**: MariaDB 10.11+
- **Schema**: Defined in schema.sql
- **Tables**: Users, Exams, Questions, Responses, Results, etc.
- **Relationships**: Properly defined foreign keys between entities
- **Optimizations**: Configured for limited resources environment

### API Exposure

The backend API is securely exposed to the internet using Cloudflare Tunnel:

- **Security**: No port forwarding required
- **SSL/TLS**: Automatic HTTPS termination
- **Protection**: Cloudflare WAF and DDoS protection
- **API Authentication**: X-API-Key header authentication

### Frontend Deployment

The React frontend is hosted on Vercel:

- **URL**: [https://exam-space.vercel.app/](https://exam-space.vercel.app/)
- **Build Process**: Automated from GitHub repository
- **Framework**: React with Vite
- **Optimizations**: 
  - Static asset caching
  - Image optimization
  - Edge network delivery

### Configuration

The backend is configured with environment-specific properties:

- **Database Connection**: Points to the local MariaDB instance
- **API Key**: Secure API key for authentication
- **Cohere API**: Integration for AI-powered question generation
- **Email Configuration**: For notifications and account management
- **Timezone**: Set to Asia/Kolkata (IST)
- **Performance Tuning**: Optimized for resource-constrained environment

## 🔄 Deployment Flow

1. Developer pushes changes to GitHub repository
2. GitHub Actions workflow triggers on the self-hosted Raspberry Pi runner
3. Backend is built with Maven and packaged into a Docker container
4. Container is deployed locally on the Raspberry Pi
5. API is exposed through Cloudflare Tunnel
6. Frontend changes are automatically deployed by Vercel
7. New version is immediately available at [https://exam-space.vercel.app/](https://exam-space.vercel.app/)

---

# 📚 API Documentation

## Authentication Endpoints

```http
POST /users/register            # Register a new user
POST /users/login               # User login with credentials
POST /users/refresh-token       # Refresh authentication token
POST /users/otp                 # Generate OTP for signup/password reset
POST /users/reset-password      # Reset user password
PUT  /users/update-profile      # Update user profile information
POST /users/send_mail           # Send contact email to administrators
```

## Exam Management Endpoints

```http
POST   /exam/upload                           # Upload files for content extraction
POST   /exam/create                           # Create a new exam
GET    /exam/my-exams/{userId}                # Get exams created by a user
GET    /exam/{examId}                         # Get exam by ID
PUT    /exam/{examId}                         # Update an exam
DELETE /exam/{examId}                         # Delete an exam
GET    /exam/shared-exams?email={email}       # Get exams shared with a specific email
```

## Question Management Endpoints

```http
POST   /exam/generate-questions                # Generate AI questions for an exam
POST   /exam/generate-questions-from-content   # Generate questions from uploaded content
POST   /exam/add-question                      # Add a question to an exam
PUT    /exam/question/{questionUid}            # Update a question
DELETE /exam/question/{questionUid}            # Delete a question
GET    /exam/{examId}/questions                # Get questions for an exam
```

## Exam Taking Endpoints

```http
POST   /take-exam/register                     # Register for an exam
POST   /take-exam/submit                       # Submit exam responses
GET    /take-exam/responses                    # Get exam responses for an exam
DELETE /take-exam/delete-login                 # Delete exam login entry
GET    /take-exam/user-summary                 # Get user exam summary
```

# 🗄️ Database Schema

The ExamSpace application uses a robust relational database schema with proper constraints and relationships. Below is the detailed schema derived from our schema.sql file:

## Entity Relationships Diagram

<div align="center">
  <img src="./ER.png" alt="ExamSpace Database ER Diagram" width="100%">
</div>

## Database Tables and Relationships

### Users Table
```sql
CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `created_at` datetime DEFAULT current_timestamp(),
  `uid` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` text NOT NULL,
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uid` (`uid`),
  UNIQUE KEY `email` (`email`)
)
```

### Exam Table
```sql
CREATE TABLE `exam` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `exam_id` varchar(255) NOT NULL,
  `creator_uid` varchar(255) NOT NULL,
  `marks` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `state` enum('ON','OFF') DEFAULT 'OFF' COMMENT 'Exam availability state',
  `exam_name` varchar(255) DEFAULT NULL COMMENT 'Name of the exam',
  `exam_passcode` varchar(255) DEFAULT NULL COMMENT 'Optional passcode for the exam',
  `sharing` text DEFAULT NULL,
  `result_publish` enum('YES','NO') DEFAULT 'NO',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_exam_id` (`exam_id`),
  KEY `creator_uid` (`creator_uid`),
  CONSTRAINT `exam_ibfk_1` FOREIGN KEY (`creator_uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE
)
```

### Questions Table
```sql
CREATE TABLE `questions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `question_uid` varchar(255) NOT NULL,
  `creator_uid` varchar(255) NOT NULL,
  `exam_uid` varchar(255) NOT NULL,
  `question` text NOT NULL,
  `option_a` text DEFAULT NULL,
  `option_b` text DEFAULT NULL,
  `option_c` text DEFAULT NULL,
  `option_d` text DEFAULT NULL,
  `correct_ans` enum('A','B','C','D') NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_question_uid` (`question_uid`),
  KEY `fk_questions_creator_uid` (`creator_uid`),
  KEY `fk_questions_exam_uid` (`exam_uid`),
  CONSTRAINT `fk_questions_creator_uid` FOREIGN KEY (`creator_uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_questions_exam_uid` FOREIGN KEY (`exam_uid`) REFERENCES `exam` (`exam_id`) ON DELETE CASCADE ON UPDATE CASCADE
)
```

### Exam Login Table
```sql
CREATE TABLE `exam_login` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `uid` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `roll` text DEFAULT NULL,
  `exam_uid` varchar(255) NOT NULL,
  `exam_name` varchar(255) NOT NULL,
  `submission_datetime` datetime DEFAULT NULL,
  `last_login` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_examlogin_uid_examuid` (`uid`,`exam_uid`),
  KEY `fk_exam_login_user_email` (`email`),
  KEY `fk_examlogin_exam` (`exam_uid`),
  CONSTRAINT `fk_exam_login_user_email` FOREIGN KEY (`email`) REFERENCES `users` (`email`) ON DELETE CASCADE,
  CONSTRAINT `fk_exam_login_user_uid` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE,
  CONSTRAINT `fk_examlogin_exam` FOREIGN KEY (`exam_uid`) REFERENCES `exam` (`exam_id`) ON DELETE CASCADE
)
```

### Responses Table
```sql
CREATE TABLE `responses` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `response_uid` varchar(255) NOT NULL,
  `uid` varchar(255) NOT NULL,
  `exam_uid` varchar(255) NOT NULL,
  `exam_name` varchar(255) NOT NULL,
  `question_uid` varchar(255) NOT NULL,
  `question` text NOT NULL,
  `response` text NOT NULL,
  `current_datetime` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `response_uid` (`response_uid`),
  KEY `fk_response_exam_uid` (`exam_uid`),
  KEY `fk_response_question_uid` (`question_uid`),
  KEY `fk_responses_examlogin` (`uid`,`exam_uid`),
  CONSTRAINT `fk_response_exam_uid` FOREIGN KEY (`exam_uid`) REFERENCES `exam` (`exam_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_response_question_uid` FOREIGN KEY (`question_uid`) REFERENCES `questions` (`question_uid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_response_user_uid` FOREIGN KEY (`uid`) REFERENCES `users` (`uid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_responses_examlogin` FOREIGN KEY (`uid`, `exam_uid`) REFERENCES `exam_login` (`uid`, `exam_uid`) ON DELETE CASCADE
)
```

### Result Table
```sql
CREATE TABLE `result` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `result_uid` varchar(255) NOT NULL,
  `uid` varchar(255) NOT NULL,
  `exam_uid` varchar(255) NOT NULL,
  `exam_name` varchar(255) NOT NULL,
  `full_marks` int(11) NOT NULL,
  `marks_obtained` int(11) NOT NULL,
  `percentage` decimal(5,2) NOT NULL,
  `total_right_answers` int(11) NOT NULL,
  `total_wrong_answers` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `result_uid` (`result_uid`),
  KEY `fk_result_examlogin` (`uid`,`exam_uid`),
  KEY `fk_result_exam` (`exam_uid`),
  CONSTRAINT `fk_result_exam` FOREIGN KEY (`exam_uid`) REFERENCES `exam` (`exam_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_result_examlogin` FOREIGN KEY (`uid`, `exam_uid`) REFERENCES `exam_login` (`uid`, `exam_uid`) ON DELETE CASCADE
)
```

