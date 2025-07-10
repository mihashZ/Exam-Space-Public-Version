package com.example.demo.exam.exam_creation;
import java.util.List;

public interface ExamDao {
    Exams createExam(Exams exam);
    Exams getExamById(String examId);
    List<Exams> getExamsByCreator(String creatorUid);
    boolean updateExam(Exams exam);
    boolean deleteExam(String examId);
    List<Exams> getExamsSharedWithEmail(String email);
}
