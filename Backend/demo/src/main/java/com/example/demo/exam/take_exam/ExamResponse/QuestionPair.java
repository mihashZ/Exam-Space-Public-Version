package com.example.demo.exam.take_exam.ExamResponse;

public class QuestionPair {
    private String question;
    private String questionUid;
    
    public QuestionPair() {}
    
    public QuestionPair(String question, String questionUid) {
        this.question = question;
        this.questionUid = questionUid;
    }
    
    public String getQuestion() {
        return question;
    }
    
    public void setQuestion(String question) {
        this.question = question;
    }
    
    public String getQuestionUid() {
        return questionUid;
    }
    
    public void setQuestionUid(String questionUid) {
        this.questionUid = questionUid;
    }
}