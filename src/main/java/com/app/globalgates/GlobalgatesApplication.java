package com.app.globalgates;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication
@EnableScheduling // 반드시 작성
public class GlobalgatesApplication {

    public static void main(String[] args) {
        SpringApplication.run(GlobalgatesApplication.class, args);
    }

}
