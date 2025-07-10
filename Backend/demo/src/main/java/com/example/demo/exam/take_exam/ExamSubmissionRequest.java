package com.example.demo.exam.take_exam;
import java.util.List;

public class ExamSubmissionRequest {
    private String uid;
    private String examUid;
    private String examName;
    private List<QuestionSubmission> submissions;
    
    public static class QuestionSubmission {
        private String questionUid;
        private String question;
        private String response;
        
        public String getQuestionUid() {
            return questionUid;
        }
        
        public void setQuestionUid(String questionUid) {
            this.questionUid = questionUid;
        }
        
        public String getQuestion() {
            return question;
        }
        
        public void setQuestion(String question) {
            this.question = question;
        }
        
        public String getResponse() {
            return response;
        }
        
        public void setResponse(String response) {
            this.response = response;
        }
    }
    
    public String getUid() {
        return uid;
    }
    
    public void setUid(String uid) {
        this.uid = uid;
    }
    
    public String getExamUid() {
        return examUid;
    }
    
    public void setExamUid(String examUid) {
        this.examUid = examUid;
    }
    
    public String getExamName() {
        return examName;
    }
    
    public void setExamName(String examName) {
        this.examName = examName;
    }
    
    public List<QuestionSubmission> getSubmissions() {
        return submissions;
    }
    
    public void setSubmissions(List<QuestionSubmission> submissions) {
        this.submissions = submissions;
    }
}