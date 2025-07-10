package com.example.demo.exam.take_exam.ExamResponse;

import java.time.LocalDateTime;

public class ExamResponse {
    private String responseId;
    private String uid;
    private String examUid;
    private String questionUid;
    private String response;
    private LocalDateTime submissionTime;
    
    public String getResponseId() {
        return responseId;
    }
    
    public void setResponseId(String responseId) {
        this.responseId = responseId;
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
    
    public String getQuestionUid() {
        return questionUid;
    }
    
    public void setQuestionUid(String questionUid) {
        this.questionUid = questionUid;
    }
    
    public String getResponse() {
        return response;
    }
    
    public void setResponse(String response) {
        this.response = response;
    }
    
    public LocalDateTime getSubmissionTime() {
        return submissionTime;
    }
    
    public void setSubmissionTime(LocalDateTime submissionTime) {
        this.submissionTime = submissionTime;
    }
}