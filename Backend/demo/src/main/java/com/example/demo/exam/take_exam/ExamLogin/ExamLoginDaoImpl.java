package com.example.demo.exam.take_exam.ExamLogin;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class ExamLoginDaoImpl implements ExamLoginDao {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    private static final ZoneId IST_ZONE = ZoneId.of("Asia/Kolkata");
    
    private LocalDateTime getCurrentISTTime() {
        return ZonedDateTime.now(IST_ZONE).toLocalDateTime();
    }
    
    private LocalDateTime convertToIST(LocalDateTime dateTime) {
        if (dateTime == null) return null;
        return ZonedDateTime.of(dateTime, ZoneId.systemDefault())
                .withZoneSameInstant(IST_ZONE)
                .toLocalDateTime();
    }
    
    private final RowMapper<ExamLogin> examLoginRowMapper = (ResultSet rs, int rowNum) -> {
        ExamLogin examLogin = new ExamLogin();
        examLogin.setId(rs.getLong("id"));
        examLogin.setUid(rs.getString("uid"));
        examLogin.setName(rs.getString("name"));
        examLogin.setEmail(rs.getString("email"));
        examLogin.setUsername(rs.getString("username"));
        examLogin.setRoll(rs.getString("roll"));
        examLogin.setExamUid(rs.getString("exam_uid"));
        examLogin.setExamName(rs.getString("exam_name"));
        
        Timestamp submissionTimestamp = rs.getTimestamp("submission_datetime");
        if (submissionTimestamp != null) {
            LocalDateTime submissionDateTime = submissionTimestamp.toLocalDateTime();
            examLogin.setSubmissionDatetime(convertToIST(submissionDateTime));
        }
        
        Timestamp lastLogin = rs.getTimestamp("last_login");
        if (lastLogin != null) {
            LocalDateTime lastLoginDateTime = lastLogin.toLocalDateTime();
            examLogin.setLastLogin(convertToIST(lastLoginDateTime));
        }
        
        return examLogin;
    };
    
    @Override
    public ExamLogin createExamLogin(ExamLogin examLogin) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                "INSERT INTO exam_login (uid, name, email, username, roll, exam_uid, exam_name, submission_datetime, last_login) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                Statement.RETURN_GENERATED_KEYS
            );
            
            ps.setString(1, examLogin.getUid());
            ps.setString(2, examLogin.getName());
            ps.setString(3, examLogin.getEmail());
            
            if (examLogin.getUsername() != null) {
                ps.setString(4, examLogin.getUsername());
            } else {
                ps.setNull(4, java.sql.Types.VARCHAR);
            }
            
            if (examLogin.getRoll() != null) {
                ps.setString(5, examLogin.getRoll());
            } else {
                ps.setNull(5, java.sql.Types.VARCHAR);
            }
            
            ps.setString(6, examLogin.getExamUid());
            ps.setString(7, examLogin.getExamName());
            
            if (examLogin.getSubmissionDatetime() != null) {
                LocalDateTime istSubmissionTime = convertToIST(examLogin.getSubmissionDatetime());
                ps.setTimestamp(8, Timestamp.valueOf(istSubmissionTime));
            } else {
                ps.setNull(8, java.sql.Types.TIMESTAMP);
            }
            
            LocalDateTime istLoginTime = examLogin.getLastLogin() != null ? 
                convertToIST(examLogin.getLastLogin()) : getCurrentISTTime();
            ps.setTimestamp(9, Timestamp.valueOf(istLoginTime));
            
            return ps;
        }, keyHolder);
        
        examLogin.setId(keyHolder.getKey().longValue());
        return examLogin;
    }
    
    @Override
    public ExamLogin getExamLoginByExamAndUser(String examUid, String uid) {
        try {
            String sql = "SELECT * FROM exam_login WHERE exam_uid = ? AND uid = ?";
            List<ExamLogin> results = jdbcTemplate.query(sql, examLoginRowMapper, examUid, uid);
            return results.isEmpty() ? null : results.get(0);
        } catch (DataAccessException e) {
            return null;
        }
    }
    
    @Override
    public boolean updateLastLogin(String examUid, String uid) {
        int rowsAffected = jdbcTemplate.update(
            "UPDATE exam_login SET last_login = ? WHERE exam_uid = ? AND uid = ?",
            Timestamp.valueOf(getCurrentISTTime()), examUid, uid
        );
        return rowsAffected > 0;
    }

    @Override
    public boolean updateSubmissionTime(String examUid, String uid, LocalDateTime submissionTime) {
        String sql = "UPDATE exam_login SET submission_datetime = ? WHERE exam_uid = ? AND uid = ?";
        LocalDateTime istSubmissionTime = convertToIST(submissionTime);
        return jdbcTemplate.update(sql, istSubmissionTime, examUid, uid) > 0;
    }

    @Override
    public boolean issubmitted(String examUid, String uid) {
        String sql = "SELECT submission_datetime FROM exam_login WHERE exam_uid = ? AND uid = ?";
        try {
            LocalDateTime submissionDatetime = jdbcTemplate.queryForObject(
                sql,
                (rs, rowNum) -> {
                    Timestamp ts = rs.getTimestamp("submission_datetime");
                    if (ts != null) {
                        LocalDateTime dateTime = ts.toLocalDateTime();
                        return convertToIST(dateTime);
                    }
                    return null;
                },
                examUid, uid
            );
            return submissionDatetime != null;
        } catch (DataAccessException e) {
            return false;
        }
    }

    @Override
    public boolean deleteExamLogin(String uid, String examUid) {
        String sql = "DELETE FROM exam_login WHERE uid = ? AND exam_uid = ?";
        
        try {
            int rowsAffected = jdbcTemplate.update(sql, uid, examUid);
            return rowsAffected > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}