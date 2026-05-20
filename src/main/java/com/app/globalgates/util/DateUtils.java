package com.app.globalgates.util;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoField;

public class DateUtils {
    public static String toRelativeTime(String date){
        if(date == null || date.isEmpty()){
            return "";
        }

        DateTimeFormatter formatter = new DateTimeFormatterBuilder()
                .appendPattern("yyyy-MM-dd HH:mm:ss")
                .optionalStart()
                .appendFraction(ChronoField.MICRO_OF_SECOND, 0, 6, true)
                .optionalEnd()
                .toFormatter();
        LocalDateTime localDateTime = LocalDateTime.parse(date, formatter);
        LocalDateTime now = LocalDateTime.now();

        Duration duration = Duration.between(localDateTime, now);

        long seconds = duration.getSeconds();
        if(seconds < 60) {
            return "방금 전";
        }
        long minutes = seconds / 60;
        if(minutes < 60) {
            return minutes + "분 전";
        }
        long hours = minutes / 60;
        if (hours < 24) {
            return hours + "시간 전";
        }

        long days = hours / 24;
        if (days < 30) {
            return days + "일 전";
        }

        long months = days / 30;
        if (months < 12) {
            return months + "개월 전";
        }

        long years = months / 12;
        return years + "년 전";
    }

    /**
     * 1일 이내는 toRelativeTime, 그 이후는 yyyy.MM.dd 로 표기.
     * 댓글/뉴스 카드 등 가까운 과거의 자연스러운 시간 표기에 사용한다.
     */
    public static String toRelativeOrDate(String date) {
        if (date == null || date.isEmpty()) return "";

        DateTimeFormatter parser = new DateTimeFormatterBuilder()
                .appendPattern("yyyy-MM-dd HH:mm:ss")
                .optionalStart()
                .appendFraction(ChronoField.MICRO_OF_SECOND, 0, 6, true)
                .optionalEnd()
                .toFormatter();
        LocalDateTime dt = LocalDateTime.parse(date, parser);
        Duration diff = Duration.between(dt, LocalDateTime.now());
        if (diff.toHours() < 24) return toRelativeTime(date);

        return dt.format(DateTimeFormatter.ofPattern("yyyy.MM.dd"));
    }
}
