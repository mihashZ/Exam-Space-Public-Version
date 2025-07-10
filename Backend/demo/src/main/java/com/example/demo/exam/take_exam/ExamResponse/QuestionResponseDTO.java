package com.example.demo.exam.take_exam.ExamResponse;

public class QuestionResponseDTO {
    private String questionUid;
    private String question;
    private String correctAnswer;
    private String correctAnswerText;
    private String studentAnswer;
    private String studentAnswerText;
    
    public QuestionResponseDTO() {}
    
    public QuestionResponseDTO(String questionUid, String question, String correctAnswer, 
                              String correctAnswerText, String studentAnswer, String studentAnswerText) {
        this.questionUid = questionUid;
        this.question = question;
        this.correctAnswer = correctAnswer;
        this.correctAnswerText = correctAnswerText;
        this.studentAnswer = studentAnswer;
        this.studentAnswerText = studentAnswerText;
    }
    
    public String getQuestionUid(){
        return questionUid;
    }

    public void setQuestionUid(String questionUid){
        this.questionUid = questionUid;
    }
    
    public String getQuestion(){
        return question;
    }

    public void setQuestion(String question){
        this.question = question;
    }
    
    public String getCorrectAnswer(){
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer){
        this.correctAnswer = correctAnswer;
    }
    
    public String getCorrectAnswerText(){
        return correctAnswerText;
    }

    public void setCorrectAnswerText(String correctAnswerText){
        this.correctAnswerText = correctAnswerText;
    }
    
    public String getStudentAnswer(){
        return studentAnswer;
    }
    
    public void setStudentAnswer(String studentAnswer){
        this.studentAnswer = studentAnswer; 
    }
    
    public String getStudentAnswerText(){
        return studentAnswerText;
    }
    
    public void setStudentAnswerText(String studentAnswerText){
        this.studentAnswerText = studentAnswerText;
    }
}