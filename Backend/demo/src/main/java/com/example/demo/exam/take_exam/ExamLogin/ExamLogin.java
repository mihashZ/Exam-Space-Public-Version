package com.example.demo.exam.take_exam.ExamLogin;
import java.time.LocalDateTime;

public class ExamLogin {
    private Long id;
    private String uid;
    private String name;
    private String email;
    private String username;
    private String roll;
    private String examUid;
    private String examName;
    private LocalDateTime submissionDatetime;
    private LocalDateTime lastLogin;
    
    public ExamLogin() {
        this.submissionDatetime = null;
        this.lastLogin = LocalDateTime.now();
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
    
    public String getExamName() {
        return examName;
    }

    public void setExamName(String examName) {
        this.examName = examName;
    }

    public LocalDateTime getSubmissionDatetime() {
        return submissionDatetime;
    }

    public void setSubmissionDatetime(LocalDateTime submissionDatetime) {
        this.submissionDatetime = submissionDatetime;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }
    
    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }
}