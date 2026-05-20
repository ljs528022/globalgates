package com.app.globalgates.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI().components(new Components()).info(info());
    }

    private Info info() {
        return new Info()
                .title("app") // API 제목
                .description("Let`s practice Swagger UI") // API 설명
                .version("1.0");
    }
}














