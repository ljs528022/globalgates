package com.app.globalgates.auth;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
@Component
@Slf4j
public class AuthenticationHandler implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        log.error("Authentication Failed: {}", authException.getMessage());
        if(request.getRequestURI().startsWith("/api/")){
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, authException.getMessage());
        }else{
            response.sendRedirect("/member/join");
        }
    }
}
