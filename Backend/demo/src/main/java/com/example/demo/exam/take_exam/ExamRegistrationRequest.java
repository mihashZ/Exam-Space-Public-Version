package com.example.demo.exam.take_exam;

public class ExamRegistrationRequest {
    private String uid;
    private String name;
    private String email;
    private String username;
    private String roll;
    private String examUid;
    private String examPasscode;
    private String examName; 
    
    public String getUid() {
        return uid;
    }
    
    public void setUid(String uid) {
        this.uid = uid;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getRoll() {
        return roll;
    }
    
    public void setRoll(String roll) {
        this.roll = roll;
    }
    
    public String getExamUid() {
        return examUid;
    }
    
    public void setExamUid(String examUid) {
        this.examUid = examUid;
    }
    
    public String getExamPasscode() {
        return examPasscode;
    }
    
    public void setExamPasscode(String examPasscode) {
        this.examPasscode = examPasscode;
    }

    public String getExamName() {
        return examName;
    }
    
    public void setExamName(String examName) {
        this.examName = examName;
    }
}