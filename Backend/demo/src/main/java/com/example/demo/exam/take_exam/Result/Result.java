package com.example.demo.exam.take_exam.Result;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Result {
    private Long id;
    private String resultUid;
    private String uid;
    private String examUid;
    private String examName;
    private Integer fullMarks;
    private Integer marksObtained;
    private BigDecimal percentage;
    private Integer totalRightAnswers;
    private Integer totalWrongAnswers;
    private LocalDateTime createdAt;
    
    public Result() {}
    
    public Result(String resultUid, String uid, String examUid, String examName, 
                  Integer fullMarks, Integer marksObtained, BigDecimal percentage,
                  Integer totalRightAnswers, Integer totalWrongAnswers) {
        this.resultUid = resultUid;
        this.uid = uid;
        this.examUid = examUid;
        this.examName = examName;
        this.fullMarks = fullMarks;
        this.marksObtained = marksObtained;
        this.percentage = percentage;
        this.totalRightAnswers = totalRightAnswers;
        this.totalWrongAnswers = totalWrongAnswers;
    }
    
    public Long getId(){
        return id;
    }

    public void setId(Long id){
        this.id = id; 
    }
    
    public String getResultUid(){
        return resultUid;
    }
    
    public void setResultUid(String resultUid){
        this.resultUid = resultUid; 
    }
    
    public String getUid(){
        return uid;
    }
    
    public void setUid(String uid){
        this.uid = uid;
    }
    
    public String getExamUid(){
        return examUid; 
    }
    
    public void setExamUid(String examUid){
        this.examUid = examUid; 
    }
    
    public String getExamName(){
        return examName; 
    }
    
    public void setExamName(String examName){
        this.examName = examName; 
    }
    
    public Integer getFullMarks(){
        return fullMarks; 
    }
    
    public void setFullMarks(Integer fullMarks){
        this.fullMarks = fullMarks; 
    }
    
    public Integer getMarksObtained(){
        return marksObtained; 
    }
    
    public void setMarksObtained(Integer marksObtained){
        this.marksObtained = marksObtained; 
    }
    
    public BigDecimal getPercentage(){
        return percentage; 
    }
    
    public void setPercentage(BigDecimal percentage){
        this.percentage = percentage; 
    }
    
    public Integer getTotalRightAnswers(){
        return totalRightAnswers; 
    }
    
    public void setTotalRightAnswers(Integer totalRightAnswers){
        this.totalRightAnswers = totalRightAnswers; 
    }
    
    public Integer getTotalWrongAnswers(){
        return totalWrongAnswers;
    }
    
    public void setTotalWrongAnswers(Integer totalWrongAnswers){
        this.totalWrongAnswers = totalWrongAnswers;
    }
    
    public LocalDateTime getCreatedAt(){
        return createdAt; 
    }
    
    public void setCreatedAt(LocalDateTime createdAt){
        this.createdAt = createdAt; 
    }
}