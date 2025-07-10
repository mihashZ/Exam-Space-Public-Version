package com.example.demo.exam.take_exam.Result;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ResultDaoImpl implements ResultDao {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");
    
    @Override
    public boolean saveResult(Result result) {
        String sql = "INSERT INTO result (result_uid, uid, exam_uid, exam_name, full_marks, " +
                    "marks_obtained, percentage, total_right_answers, total_wrong_answers) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        String resultUid = UUID.randomUUID().toString();
        result.setResultUid(resultUid);
        
        return jdbcTemplate.update(sql, 
            result.getResultUid(),
            result.getUid(),
            result.getExamUid(),
            result.getExamName(),
            result.getFullMarks(),
            result.getMarksObtained(),
            result.getPercentage(),
            result.getTotalRightAnswers(),
            result.getTotalWrongAnswers()
        ) > 0;
    }
    
    @Override
    public Result getResultByExamAndUser(String examUid, String uid) {
        String sql = "SELECT * FROM result WHERE exam_uid = ? AND uid = ?";
        
        return jdbcTemplate.query(sql, new Object[]{examUid, uid}, (rs) -> {
            if (rs.next()) {
                Result result = new Result();
                result.setId(rs.getLong("id"));
                result.setResultUid(rs.getString("result_uid"));
                result.setUid(rs.getString("uid"));
                result.setExamUid(rs.getString("exam_uid"));
                result.setExamName(rs.getString("exam_name"));
                result.setFullMarks(rs.getInt("full_marks"));
                result.setMarksObtained(rs.getInt("marks_obtained"));
                result.setPercentage(rs.getBigDecimal("percentage"));
                result.setTotalRightAnswers(rs.getInt("total_right_answers"));
                result.setTotalWrongAnswers(rs.getInt("total_wrong_answers"));
                
                if (rs.getTimestamp("created_at") != null) {
                    ZonedDateTime istDateTime = rs.getTimestamp("created_at")
                        .toInstant()
                        .atZone(IST);
                    result.setCreatedAt(istDateTime.toLocalDateTime());
                }
                
                return result;
            }
            return null;
        });
    }

    @Override
    public List<Result> getResultsByUid(String uid) {
        String sql = "SELECT r.* FROM result r " +
                    "INNER JOIN exam e ON r.exam_uid = e.exam_id " +
                    "WHERE r.uid = ? AND e.result_publish = 'YES' " +
                    "ORDER BY r.created_at DESC";
        
        return jdbcTemplate.query(sql, new Object[]{uid}, (rs) -> {
            List<Result> results = new ArrayList<>();
            while (rs.next()) {
                Result result = new Result();
                result.setId(rs.getLong("id"));
                result.setResultUid(rs.getString("result_uid"));
                result.setUid(rs.getString("uid"));
                result.setExamUid(rs.getString("exam_uid"));
                result.setExamName(rs.getString("exam_name"));
                result.setFullMarks(rs.getInt("full_marks"));
                result.setMarksObtained(rs.getInt("marks_obtained"));
                result.setPercentage(rs.getBigDecimal("percentage"));
                result.setTotalRightAnswers(rs.getInt("total_right_answers"));
                result.setTotalWrongAnswers(rs.getInt("total_wrong_answers"));
                
                if (rs.getTimestamp("created_at") != null) {
                    ZonedDateTime istDateTime = rs.getTimestamp("created_at")
                        .toInstant()
                        .atZone(IST);
                    result.setCreatedAt(istDateTime.toLocalDateTime());
                }
                
                results.add(result);
            }
            return results;
        });
    }
}