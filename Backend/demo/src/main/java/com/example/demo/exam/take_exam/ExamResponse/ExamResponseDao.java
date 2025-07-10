package com.example.demo.exam.take_exam.ExamResponse;

import java.time.LocalDateTime;
import java.util.List;

import com.example.demo.exam.take_exam.ExamSubmissionRequest;

public interface ExamResponseDao {
    boolean saveResponse(String uid, String examUid, String ExamName, String questionUid, String response, LocalDateTime submissionTime);
    boolean batchSaveResponses(String uid, String examUid, String ExamName, LocalDateTime submissionTime, List<ExamSubmissionRequest.QuestionSubmission> submissions);
    List<QuestionAnswer> getCorrectAnswersForQuestions(List<QuestionPair> questionPairs);
    List<ResponseRequest> getExamResponses(String examUid, String examName);
    List<ResponseRequest> getExamResponsesForUser(String examUid, String examName, String uid);
}