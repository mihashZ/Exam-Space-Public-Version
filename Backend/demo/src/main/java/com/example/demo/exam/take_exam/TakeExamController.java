package com.example.demo.exam.take_exam;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.exam.exam_creation.ExamDao;
import com.example.demo.exam.exam_creation.Exams;
import com.example.demo.exam.exam_creation.Question;
import com.example.demo.exam.exam_creation.QuestionDao;
import com.example.demo.exam.take_exam.ExamLogin.ExamLogin;
import com.example.demo.exam.take_exam.ExamLogin.ExamLoginDao;
import com.example.demo.exam.take_exam.ExamResponse.ExamResponseDao;
import com.example.demo.exam.take_exam.ExamResponse.QuestionAnswer;
import com.example.demo.exam.take_exam.ExamResponse.QuestionPair;
import com.example.demo.exam.take_exam.ExamResponse.ResponseRequest;
import com.example.demo.exam.take_exam.Result.Result;
import com.example.demo.exam.take_exam.Result.ResultDao;

@RestController
@RequestMapping("/take-exam")
public class TakeExamController {
    
    @Autowired
    private ExamDao examDao;
    
    @Autowired
    private ExamLoginDao examLoginDao;
    
    @Autowired
    private QuestionDao questionDao;
    
    @Autowired
    private ExamResponseDao examResponseDao;
    
    @Autowired
    private ResultDao resultDao;
    
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerForExam(@RequestBody ExamRegistrationRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (request.getUid() == null || request.getUid().trim().isEmpty() ||
                request.getName() == null || request.getName().trim().isEmpty() ||
                request.getEmail() == null || request.getEmail().trim().isEmpty() ||
                request.getExamUid() == null || request.getExamUid().trim().isEmpty()) {
                
                response.put("status", "error");
                response.put("message", "Required fields are missing");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            Exams exam = examDao.getExamById(request.getExamUid());
            if (exam == null) {
                response.put("status", "error");
                response.put("message", "Exam not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            if (exam.getExamPasscode() != null && !exam.getExamPasscode().isEmpty() && 
                !exam.getExamPasscode().equals(request.getExamPasscode())) {
                response.put("status", "error");
                response.put("message", "Wrong passcode");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            
            if (request.getExamName() != null && !request.getExamName().trim().isEmpty() && 
                !request.getExamName().equals(exam.getExamName())) {
                response.put("status", "error");
                response.put("message", "Exam name doesn't match");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            if (!"ON".equals(exam.getState())) {
                response.put("status", "error");
                response.put("message", "Exam is not accepting responses at this time");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            
            if(examLoginDao.issubmitted(request.getExamUid(), request.getUid())) {
                response.put("status", "error");
                response.put("message", "You have already submitted this exam");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            ExamLogin existingLogin = examLoginDao.getExamLoginByExamAndUser(request.getExamUid(), request.getUid());
            
            if (existingLogin != null) {
                examLoginDao.updateLastLogin(request.getExamUid(), request.getUid());
            } else {
                try {
                    ExamLogin newLogin = new ExamLogin();
                    newLogin.setUid(request.getUid());
                    newLogin.setName(request.getName());
                    newLogin.setEmail(request.getEmail());
                    newLogin.setUsername(request.getUsername());
                    newLogin.setRoll(request.getRoll());
                    newLogin.setExamUid(request.getExamUid());
                    newLogin.setExamName(exam.getExamName());
                    newLogin.setSubmissionDatetime(null);
                    newLogin.setLastLogin(LocalDateTime.now());
                    examLoginDao.createExamLogin(newLogin);
                } catch (Exception dbException) {
                    response.put("status", "error");
                    response.put("message", "Failed to register for exam: " + dbException.getMessage());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
                }
            }
            
            List<Question> questions = questionDao.getQuestionsByExamUid(request.getExamUid());
            
            questions.forEach(q -> q.setCorrectAns(null));
            
            response.put("status", "success");
            response.put("message", "Successfully registered for exam");
            response.put("examName", exam.getExamName());
            response.put("questions", questions);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "An error occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitExam(@RequestBody ExamSubmissionRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (request.getUid() == null || request.getUid().trim().isEmpty() || request.getExamUid() == null || request.getExamUid().trim().isEmpty()) { 
                response.put("status", "error");
                response.put("message", "Required fields (uid, examUid) are missing");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            if (request.getSubmissions() == null || request.getSubmissions().isEmpty()) {
                response.put("status", "error");
                response.put("message", "No question responses submitted");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            Exams exam = examDao.getExamById(request.getExamUid());
            if (exam == null) {
                response.put("status", "error");
                response.put("message", "Exam not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            if (!"ON".equals(exam.getState())) {
                response.put("status", "error");
                response.put("message", "Exam is not accepting responses at this time");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            
            ExamLogin examLogin = examLoginDao.getExamLoginByExamAndUser(request.getExamUid(), request.getUid());
            if (examLogin == null) {
                response.put("status", "error");
                response.put("message", "User not registered for this exam");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            List<QuestionPair> questionPairs = new ArrayList<>();
            for (ExamSubmissionRequest.QuestionSubmission submission : request.getSubmissions()) {
                if (submission.getQuestionUid() != null && submission.getQuestion() != null) {
                    questionPairs.add(new QuestionPair(submission.getQuestion(), submission.getQuestionUid()));
                }
            }
            
            List<QuestionAnswer> correctAnswers = examResponseDao.getCorrectAnswersForQuestions(questionPairs);
            
            Map<String, QuestionAnswer> correctAnswerMap = new HashMap<>();
            for (QuestionAnswer qa : correctAnswers) {
                correctAnswerMap.put(qa.getQuestionUid(), qa);
            }
            
            int totalQuestions = questionPairs.size();
            int answeredQuestions = request.getSubmissions().size();
            int correctQuestions = 0;
            int wrongQuestions = 0;
            int totalMarks = 0;
            int marksObtained = 0;
            
            Integer examTotalMarks = exam.getMarks();
            if (examTotalMarks == null || examTotalMarks <= 0) {
                throw new RuntimeException("Exam total marks not found or invalid");
            }
            
            List<Question> allExamQuestions = questionDao.getQuestionsByExamUid(request.getExamUid());
            int totalExamQuestions = allExamQuestions.size();
            
            if (totalExamQuestions <= 0) {
                throw new RuntimeException("No questions found for this exam");
            }
            
            int marksPerQuestion = examTotalMarks / totalExamQuestions;
            totalMarks = examTotalMarks; 
            
            LocalDateTime submissionTime = LocalDateTime.now();
            for (ExamSubmissionRequest.QuestionSubmission submission : request.getSubmissions()) {
                String questionUid = submission.getQuestionUid();
                String userResponse = submission.getResponse();
                
                if (questionUid == null || userResponse == null) {
                    continue;
                }
                
                QuestionAnswer correctAnswer = correctAnswerMap.get(questionUid);
                if (correctAnswer != null) {
                    if (userResponse.trim().equalsIgnoreCase(correctAnswer.getCorrectAns())) {
                        correctQuestions++;
                        marksObtained += marksPerQuestion;
                    } else {
                        wrongQuestions++;
                    }
                }
            }
            
            BigDecimal percentage = BigDecimal.ZERO;
            if (totalMarks > 0) {
                percentage = BigDecimal.valueOf((double) marksObtained * 100 / totalMarks).setScale(2, RoundingMode.HALF_UP);
            }
            
            boolean responsesSaved = examResponseDao.batchSaveResponses(
                request.getUid(), 
                request.getExamUid(), 
                exam.getExamName(),
                submissionTime, 
                request.getSubmissions()
            );

            if (!responsesSaved) {
                throw new RuntimeException("Failed to save exam responses");
            }
            
            Result result = new Result(
                UUID.randomUUID().toString(),
                request.getUid(),
                request.getExamUid(),
                exam.getExamName(),
                totalMarks,
                marksObtained,
                percentage,
                correctQuestions,
                wrongQuestions
            );
            
            boolean resultSaved = resultDao.saveResult(result);
            if (!resultSaved) {
                throw new RuntimeException("Failed to save exam result");
            }
            
            examLoginDao.updateSubmissionTime(request.getExamUid(), request.getUid(), submissionTime);
            
            response.put("status", "success");
            response.put("message", "Exam submitted successfully");
            response.put("examName", exam.getExamName());
            response.put("totalQuestions", totalQuestions);
            response.put("answeredQuestions", answeredQuestions);
            response.put("correctAnswers", correctQuestions);
            response.put("wrongAnswers", wrongQuestions);
            response.put("totalMarks", totalMarks);
            response.put("marksObtained", marksObtained);
            response.put("percentage", percentage);
            response.put("submissionTime", submissionTime);
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            response.put("status", "error");
            response.put("message", "Invalid argument: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (IllegalStateException e) {
            response.put("status", "error");
            response.put("message", "Illegal state: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (RuntimeException e) {
            response.put("status", "error");
            response.put("message", "Runtime error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/responses")
    public ResponseEntity<Map<String, Object>> getExamResponses(@RequestParam String examUid, @RequestParam String examName) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (examUid == null || examUid.trim().isEmpty() ||
                examName == null || examName.trim().isEmpty()) {
                
                response.put("status", "error");
                response.put("message", "Required fields (examUid, examName) are missing");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            Exams exam = examDao.getExamById(examUid);
            if (exam == null) {
                response.put("status", "error");
                response.put("message", "Exam not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            if (!examName.equals(exam.getExamName())) {
                response.put("status", "error");
                response.put("message", "Exam name doesn't match");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            List<ResponseRequest> examResponses = examResponseDao.getExamResponses(examUid, examName);
            
            response.put("status", "success");
            response.put("message", "Exam responses retrieved successfully");
            response.put("examName", examName);
            response.put("examUid", examUid);
            response.put("totalSubmissions", examResponses.size());
            response.put("responses", examResponses);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "An error occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @DeleteMapping("/delete-login")
    public ResponseEntity<Map<String, Object>> deleteExamLogin(@RequestParam String uid, @RequestParam String name, @RequestParam String examUid) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (uid == null || uid.trim().isEmpty() || name == null || name.trim().isEmpty() || examUid == null || examUid.trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Required fields (uid, name, examUid) are missing");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            Exams exam = examDao.getExamById(examUid);
            if (exam == null) {
                response.put("status", "error");
                response.put("message", "Exam not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            ExamLogin examLogin = examLoginDao.getExamLoginByExamAndUser(examUid, uid);
            if (examLogin == null) {
                response.put("status", "error");
                response.put("message", "Exam login entry not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            if (!name.equals(examLogin.getName())) {
                response.put("status", "error");
                response.put("message", "Name doesn't match the exam login record");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            boolean deleted = examLoginDao.deleteExamLogin(uid, examUid);
            
            if (deleted) {
                response.put("status", "success");
                response.put("message", "Exam login entry deleted successfully");
                response.put("deletedUser", name);
                response.put("examName", exam.getExamName());
                response.put("examUid", examUid);
                response.put("uid", uid);
                
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "error");
                response.put("message", "Failed to delete exam login entry");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "An error occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/user-summary")
    public ResponseEntity<Map<String, Object>> getUserExamSummary(@RequestParam String uid) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (uid == null || uid.trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Required field (uid) is missing");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            List<Result> results = resultDao.getResultsByUid(uid);

            if (results == null || results.isEmpty()) {
                response.put("status", "error");
                response.put("message", "No results found for this user");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            List<Map<String, Object>> examDetails = new ArrayList<>();
            for (Result result : results) {
                List<ResponseRequest> responses = examResponseDao.getExamResponsesForUser(result.getExamUid(), result.getExamName(), uid);
                
                if (!responses.isEmpty()) {
                    ResponseRequest responseData = responses.get(0);
                    
                    Map<String, Object> examMap = new HashMap<>();
                    
                    examMap.put("id", result.getId());
                    examMap.put("resultUid", result.getResultUid());
                    examMap.put("uid", result.getUid());
                    examMap.put("examUid", result.getExamUid());
                    examMap.put("examName", result.getExamName());
                    examMap.put("fullMarks", result.getFullMarks());
                    examMap.put("marksObtained", result.getMarksObtained());
                    examMap.put("percentage", result.getPercentage());
                    examMap.put("totalRightAnswers", result.getTotalRightAnswers());
                    examMap.put("totalWrongAnswers", result.getTotalWrongAnswers());
                    examMap.put("createdAt", result.getCreatedAt());
                    
                    examMap.put("name", responseData.getName());
                    examMap.put("email", responseData.getEmail());
                    examMap.put("username", responseData.getUsername());
                    examMap.put("roll", responseData.getRoll());
                    examMap.put("submissionTime", responseData.getSubmissionTime());
                    examMap.put("responses", responseData.getResponses());
                    
                    examDetails.add(examMap);
                }
            }

            response.put("status", "success");
            response.put("message", "User summary fetched successfully");
            response.put("examDetails", examDetails);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "An error occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}