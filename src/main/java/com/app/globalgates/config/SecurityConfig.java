package com.app.globalgates.config;

import com.app.globalgates.auth.AuthenticationFilter;
import com.app.globalgates.auth.AuthenticationHandler;
import com.app.globalgates.auth.AuthorizationHandler;
import com.app.globalgates.auth.OAuth2SuccessHandler;
import com.app.globalgates.common.enumeration.MemberRole;
import jakarta.servlet.DispatcherType;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final AuthenticationHandler authenticationHandler;
    private final AuthorizationHandler authorizationHandler;
    private final AuthenticationFilter authenticationFilter;
    private final OAuth2UserService oAuth2UserService;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
//                주로 REST API 서버에서는 세션 없이 JWT를 쓰기 때문에 CSRF가 필요 없어서 비활성화 설정
//                Cross-Site Request Forgery, 사이트 간 요청 위조
//                공격의 한 종류로, 공격자가 사용자의 인증된 상태(로그인 세션 등)를 이용해서
//                사용자가 의도하지 않은 요청을 특정 웹사이트에 보내게 만드는 공격
                .csrf(AbstractHttpConfigurer::disable)
//                세션 정책을 무상태(stateless) 로 설정, 서버에 세션을 저장하지 않기 때문
//                상태 존재: 서버가 클라이언트의 상태를 기억하는 경우
//                상태 없음: 서버가 클라이언트의 상태를 저장하지 않는 경우
//                JWT 기반 인증은 무상태(stateless) 인증 방식
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // SSE/reactive(Flux) 응답은 AsyncContext.complete() 후 ASYNC 디스패치로 필터체인을 재진입한다.
                        // 그 스레드엔 SecurityContext(ThreadLocal) 가 전파되지 않아 익명으로 보고 403 → 응답이 이미
                        // committed 라 에러 페이지도 못 그린다. 최초 REQUEST 단계에서 이미 인가했으므로 ASYNC/ERROR
                        // 디스패치는 통과시킨다.
                        .dispatcherTypeMatchers(DispatcherType.ASYNC, DispatcherType.ERROR).permitAll()
                        .requestMatchers(
//                                필터 체인(인증)을 제외할 경로
                                "/api/auth/**",
                                "/api/member/**",
                                "/api/messages/**",
                                "/api/mail/**",
                                "/api/v1/chat/profanity-check",
                                "/member/join",
                                "/member/login",
                                "/error",
                                "/css/**",
                                "/js/**",
                                "/images/**",
                                "/static/**",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/image/**",
                                "/video/**").permitAll()
                        .requestMatchers("/admin/**", "/api/admin/**").hasRole(MemberRole.ADMIN.name())
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exceptions ->
                        exceptions.authenticationEntryPoint(authenticationHandler)
                                    .accessDeniedHandler(authorizationHandler)
                )
                .oauth2Login(
                        oauth -> oauth.userInfoEndpoint(
                                userInfo -> userInfo.userService(oAuth2UserService))
                                .successHandler(oAuth2SuccessHandler)
                )
                .formLogin(AbstractHttpConfigurer::disable)

                .addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

}













