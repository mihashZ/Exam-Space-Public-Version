/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.13-MariaDB, for debian-linux-gnu (aarch64)
--
-- Host: localhost    Database: exam_system
-- ------------------------------------------------------
-- Server version	10.11.13-MariaDB-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `exam`
--

DROP TABLE IF EXISTS `exam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `exam_login`
--

DROP TABLE IF EXISTS `exam_login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=410 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `responses`
--

DROP TABLE IF EXISTS `responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `result`
--

DROP TABLE IF EXISTS `result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-07  8:10:39
