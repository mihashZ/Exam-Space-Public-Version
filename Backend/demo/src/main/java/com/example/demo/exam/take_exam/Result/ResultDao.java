package com.example.demo.exam.take_exam.Result;
import java.util.List;

public interface ResultDao {
    boolean saveResult(Result result);
    Result getResultByExamAndUser(String examUid, String uid);
    List<Result> getResultsByUid(String uid);
}