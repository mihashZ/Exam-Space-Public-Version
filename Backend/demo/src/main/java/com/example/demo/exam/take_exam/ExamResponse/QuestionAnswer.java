package com.example.demo.exam.take_exam.ExamResponse;

public class QuestionAnswer {
    private String questionUid;
    private String correctAns;
    private String examUid;
    private Integer totalMarks;
    
    public QuestionAnswer() {}
    
    public QuestionAnswer(String questionUid, String correctAns, String examUid, Integer totalMarks) {
        this.questionUid = questionUid;
        this.correctAns = correctAns;
        this.examUid = examUid;
        this.totalMarks = totalMarks;
    }
    
    public String getQuestionUid() {
        return questionUid;
    }
    
    public void setQuestionUid(String questionUid) {
        this.questionUid = questionUid;
    }
    
    public String getCorrectAns() {
        return correctAns;
    }
    
    public void setCorrectAns(String correctAns) {
        this.correctAns = correctAns;
    }
    
    public String getExamUid() {
        return examUid;
    }
    
    public void setExamUid(String examUid) {
        this.examUid = examUid;
    }
    
    public Integer getTotalMarks() {
        return totalMarks;
    }
    
    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }
}