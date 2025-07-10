package com.example.demo.exam.take_exam.ExamLogin;
import java.time.LocalDateTime;

public interface ExamLoginDao {
    ExamLogin createExamLogin(ExamLogin examLogin);
    ExamLogin getExamLoginByExamAndUser(String examUid, String uid);
    boolean issubmitted(String examUid, String uid);
    boolean updateLastLogin(String examUid, String uid);
    boolean updateSubmissionTime(String examUid, String uid, LocalDateTime submissionTime);
    boolean deleteExamLogin(String uid, String examUid);
}