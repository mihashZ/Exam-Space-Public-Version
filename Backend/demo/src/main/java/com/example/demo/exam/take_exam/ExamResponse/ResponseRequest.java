package com.example.demo.exam.take_exam.ExamResponse;

import java.time.LocalDateTime;
import java.util.List;

public class ResponseRequest {
    private String name;
    private String email;
    private String username;
    private String roll;
    private LocalDateTime submissionTime;
    private List<QuestionResponseDTO> responses;
    private int fullMarks;
    private int marksObtained;
    
    public ResponseRequest() {}
    
    public ResponseRequest(String name, String email, String username, String roll, 
                          LocalDateTime submissionTime, List<QuestionResponseDTO> responses, 
                          int fullMarks, int marksObtained) {
        this.name = name;
        this.email = email;
        this.username = username;
        this.roll = roll;
        this.submissionTime = submissionTime;
        this.responses = responses;
        this.fullMarks = fullMarks;
        this.marksObtained = marksObtained;
    }
    
    public String getName(){
        return name; 
    }

    public void setName(String name){
        this.name = name;
    }
    
    public String getEmail(){
        return email; 
    }

    public void setEmail(String email){
        this.email = email; 
    }
    
    public String getUsername(){
        return username; 
    }

    public void setUsername(String username){
        this.username = username;
    }
    
    public String getRoll(){
        return roll;
    }

    public void setRoll(String roll){
        this.roll = roll;
    }
    
    public LocalDateTime getSubmissionTime(){
        return submissionTime;
    }

    public void setSubmissionTime(LocalDateTime submissionTime){
        this.submissionTime = submissionTime;
    }
    
    public List<QuestionResponseDTO> getResponses(){
        return responses;
    }

    public void setResponses(List<QuestionResponseDTO> responses){
        this.responses = responses;
    }
    
    public int getFullMarks(){
        return fullMarks;
    }

    public void setFullMarks(int fullMarks){
        this.fullMarks = fullMarks;
    }
    
    public int getMarksObtained(){
        return marksObtained;
    }

    public void setMarksObtained(int marksObtained){
        this.marksObtained = marksObtained; 
    }
}