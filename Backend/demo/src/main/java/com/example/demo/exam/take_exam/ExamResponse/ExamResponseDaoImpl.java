package com.example.demo.exam.take_exam.ExamResponse;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.demo.exam.take_exam.ExamSubmissionRequest;

@Repository
public class ExamResponseDaoImpl implements ExamResponseDao {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");
    
    private LocalDateTime convertToIST(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return ZonedDateTime.of(dateTime, ZoneId.systemDefault())
                           .withZoneSameInstant(IST_ZONE)
                           .toLocalDateTime();
    }
    
    private LocalDateTime getCurrentISTTime() {
        return ZonedDateTime.now(IST_ZONE).toLocalDateTime();
    }
    
    @Override
    public boolean saveResponse(String uid, String examUid, String ExamName, String questionUid, String response, LocalDateTime submissionTime) {
        String sql = "INSERT INTO responses (response_uid, uid, exam_uid, question_uid, response, current_datetime) " +
                     "VALUES (?, ?, ?, ?, ?, ?)";
        String responseId = UUID.randomUUID().toString() + "-" + System.nanoTime();
        LocalDateTime istTime = submissionTime != null ? convertToIST(submissionTime) : getCurrentISTTime();
        return jdbcTemplate.update(sql, responseId, uid, examUid, questionUid, response, istTime) > 0;
    }
    
    @Override
    public boolean batchSaveResponses(String uid, String examUid, String ExamName, LocalDateTime submissionTime, List<ExamSubmissionRequest.QuestionSubmission> submissions) {
        String sql = "INSERT INTO responses (response_uid, uid, exam_uid, exam_name, question_uid, question, response, current_datetime) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        Set<String> uuidsInBatch = new HashSet<>();
        LocalDateTime istTime = submissionTime != null ? convertToIST(submissionTime) : getCurrentISTTime();
        
        List<Object[]> batchArgs = submissions.stream()
            .filter(sub -> sub.getQuestionUid() != null && sub.getResponse() != null)
            .map(sub -> {
                String uuid;
                do {
                    uuid = UUID.randomUUID().toString() + "-" + System.nanoTime();
                } while (!uuidsInBatch.add(uuid)); 
                
                return new Object[] {
                    uuid,
                    uid,
                    examUid,
                    ExamName,
                    sub.getQuestionUid(),
                    sub.getQuestion(),
                    sub.getResponse(),
                    istTime
                };
            })
            .toList();
        
        int[] updateCounts = jdbcTemplate.batchUpdate(sql, batchArgs);
        return updateCounts.length > 0;
    }

    @Override
    public List<QuestionAnswer> getCorrectAnswersForQuestions(List<QuestionPair> questionPairs) {
        if (questionPairs == null || questionPairs.isEmpty()) {
            return new ArrayList<>();
        }
        
        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append("SELECT q.question_uid, q.correct_ans, q.exam_uid, e.marks FROM questions q INNER JOIN exam e ON q.exam_uid = e.exam_id WHERE ");
        
        List<Object> parameters = new ArrayList<>();
        
        for (int i = 0; i < questionPairs.size(); i++) {
            if (i > 0) {
                sqlBuilder.append(" OR ");
            }
            sqlBuilder.append("(q.question = ? AND q.question_uid = ?)");
            
            QuestionPair pair = questionPairs.get(i);
            parameters.add(pair.getQuestion());
            parameters.add(pair.getQuestionUid());
        }
        
        String sql = sqlBuilder.toString();
        
        return jdbcTemplate.query(sql, parameters.toArray(), (rs, rowNum) -> 
            new QuestionAnswer(
                rs.getString("question_uid"),
                rs.getString("correct_ans"),
                rs.getString("exam_uid"),
                rs.getInt("marks")
            )
        );
    }

    @Override
    public List<ResponseRequest> getExamResponses(String examUid, String examName) {
        String examLoginSql = "SELECT el.uid, el.name, el.email, el.username, el.roll, el.submission_datetime, r.full_marks, r.marks_obtained " +
                             "FROM exam_login el " +
                             "LEFT JOIN result r ON el.uid = r.uid AND el.exam_uid = r.exam_uid " +
                             "WHERE el.exam_uid = ? AND el.submission_datetime IS NOT NULL " +
                             "ORDER BY el.submission_datetime";
        
        List<ResponseRequest> examResponses = new ArrayList<>();
        
        jdbcTemplate.query(examLoginSql, new Object[]{examUid, examName}, (rs) -> {
            while (rs.next()) {
                String userUid = rs.getString("uid");
                
                String responsesSql = "SELECT r.question_uid, r.question, r.response, " +
                                     "q.correct_ans, q.option_a, q.option_b, q.option_c, q.option_d " +
                                     "FROM responses r " +
                                     "JOIN questions q ON r.question_uid = q.question_uid " +
                                     "WHERE r.uid = ? AND r.exam_uid = ? " +
                                     "ORDER BY r.question_uid";
                
                List<QuestionResponseDTO> questionResponses = jdbcTemplate.query(responsesSql, 
                    new Object[]{userUid, examUid}, (responseRs, rowNum) -> {
                        
                        String correctAns = responseRs.getString("correct_ans");
                        String studentAns = responseRs.getString("response");
                        String optionA = responseRs.getString("option_a");
                        String optionB = responseRs.getString("option_b");
                        String optionC = responseRs.getString("option_c");
                        String optionD = responseRs.getString("option_d");
                        
                        String correctAnswerText = getOptionText(correctAns, optionA, optionB, optionC, optionD);
                        String studentAnswerText = getOptionText(studentAns, optionA, optionB, optionC, optionD);
                        
                        return new QuestionResponseDTO(
                            responseRs.getString("question_uid"),
                            responseRs.getString("question"),
                            correctAns,
                            correctAnswerText,
                            studentAns,
                            studentAnswerText
                        );
                    });
                
                LocalDateTime submissionDateTime = rs.getTimestamp("submission_datetime") != null ? 
                    convertToIST(rs.getTimestamp("submission_datetime").toLocalDateTime()) : null;
                
                ResponseRequest examResponse = new ResponseRequest(
                    rs.getString("name"),
                    rs.getString("email"),
                    rs.getString("username"),
                    rs.getString("roll"),
                    submissionDateTime,
                    questionResponses,
                    rs.getInt("full_marks"),
                    rs.getInt("marks_obtained")
                );
                
                examResponses.add(examResponse);
            }
            return null;
        });
        
        return examResponses;
    }

    @Override
    public List<ResponseRequest> getExamResponsesForUser(String examUid, String examName, String uid) {
        String examLoginSql = "SELECT el.uid, el.name, el.email, el.username, el.roll, el.submission_datetime, r.full_marks, r.marks_obtained " +
                      "FROM exam_login el " +
                      "LEFT JOIN result r ON el.uid = r.uid AND el.exam_uid = r.exam_uid " +
                      "WHERE el.exam_uid = ? AND el.uid = ? AND el.submission_datetime IS NOT NULL " +
                      "ORDER BY el.submission_datetime";

        List<ResponseRequest> examResponses = new ArrayList<>();

        jdbcTemplate.query(examLoginSql, new Object[]{examUid, uid}, (rs) -> {
            while (rs.next()) {
                String userUid = rs.getString("uid");

                String responsesSql = "SELECT r.question_uid, r.question, r.response, " +
                                     "q.correct_ans, q.option_a, q.option_b, q.option_c, q.option_d " +
                                     "FROM responses r " +
                                     "JOIN questions q ON r.question_uid = q.question_uid " +
                                     "WHERE r.uid = ? AND r.exam_uid = ? " +
                                     "ORDER BY r.question_uid";

                List<QuestionResponseDTO> questionResponses = jdbcTemplate.query(responsesSql,
                    new Object[]{userUid, examUid}, (responseRs, rowNum) -> {

                        String correctAns = responseRs.getString("correct_ans");
                        String studentAns = responseRs.getString("response");
                        String optionA = responseRs.getString("option_a");
                        String optionB = responseRs.getString("option_b");
                        String optionC = responseRs.getString("option_c");
                        String optionD = responseRs.getString("option_d");

                        String correctAnswerText = getOptionText(correctAns, optionA, optionB, optionC, optionD);
                        String studentAnswerText = getOptionText(studentAns, optionA, optionB, optionC, optionD);

                        return new QuestionResponseDTO(
                            responseRs.getString("question_uid"),
                            responseRs.getString("question"),
                            correctAns,
                            correctAnswerText,
                            studentAns,
                            studentAnswerText
                        );
                    });

                LocalDateTime submissionDateTime = rs.getTimestamp("submission_datetime") != null ?
                    convertToIST(rs.getTimestamp("submission_datetime").toLocalDateTime()) : null;

                ResponseRequest examResponse = new ResponseRequest(
                    rs.getString("name"),
                    rs.getString("email"),
                    rs.getString("username"),
                    rs.getString("roll"),
                    submissionDateTime,
                    questionResponses,
                    rs.getInt("full_marks"),
                    rs.getInt("marks_obtained")
                );

                examResponses.add(examResponse);
            }
            return null;
        });

        return examResponses;
    }

    private String getOptionText(String optionLetter, String optionA, String optionB, String optionC, String optionD) {
        if (optionLetter == null) {
            return null;
        }
        
        switch (optionLetter.toUpperCase()) {
            case "A":
                return optionA;
            case "B":
                return optionB;
            case "C":
                return optionC;
            case "D":
                return optionD;
            default:
                return optionLetter; 
        }
    }
}