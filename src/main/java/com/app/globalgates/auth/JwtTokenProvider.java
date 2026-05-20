package com.app.globalgates.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.util.DigestUtils;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtTokenProvider {
    private final UserDetailsService userDetailsService;
    @Value("${jwt.secret}")
    private String secretKey;
    private Key key;
    private final HttpServletResponse response;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String REFRESH_TOKEN_PREFIX = "refresh:";
    private static final String BLACKLIST_PREFIX = "blacklist:";

    @PostConstruct
    protected void init(){
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        key = Keys.hmacShaKeyFor(keyBytes);
    }

    //    액세스 토큰 생성
    public String createAccessToken(String username) {
        final long ACCESS_TOKEN_VALIDITY = 1000L * 60 * 60;
        String accessToken = Jwts.builder()
                .setSubject(username)
                .claim("memberEmail", username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_VALIDITY))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        Cookie accessTokenCookie = new Cookie("accessToken", accessToken);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(60 * 60 * 24 * 1);
        response.addCookie(accessTokenCookie);

        return accessToken;
    }

    public String createAccessToken(String username, String provider) {
        final long ACCESS_TOKEN_VALIDITY = 1000L * 60 * 60;
        String accessToken = Jwts.builder()
                .setSubject(username)
                .claim("memberEmail", username)
                .claim("provider", provider)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_VALIDITY))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        Cookie accessTokenCookie = new Cookie("accessToken", accessToken);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(60 * 60 * 24 * 1);
        response.addCookie(accessTokenCookie);

        return accessToken;
    }

    //    JWT 토큰 유효성 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
//            ExpiredJwtException: 토큰 만료
//            UnsupportedJwtException: 지원하지 않는 JWT 형식
//            MalformedJwtException: JWT 형식이 잘못되었을 때
//            SignatureException: 서명이 일치하지 않을 때(위조된 토큰)
//            IllegalArgumentException: null, 빈 문자열 등 잘못된 파라미터일 때
            return false;
        }
    }

    //    인증 정보 객체 생성
    public Authentication getAuthentication(String token) {

        String username = getUsername(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

//        JWT 인증에서는 이미 토큰 자체가 인증 수단이기 때문에 비밀번호를 ""로 전달해도 아무 문제 없다.
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }

    //    토큰 소유자 추출
    public String getUsername(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token)
                .getBody().getSubject();
    }

    //    리프레시 토큰 생성
    public String createRefreshToken(String username){
        final long REFRESH_TOKEN_VALIDITY = 1000L * 60 * 60 * 24 * 1;
        String refreshToken = Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_VALIDITY))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        redisTemplate.opsForValue().set(
                REFRESH_TOKEN_PREFIX + username,
                refreshToken,
                REFRESH_TOKEN_VALIDITY,
                TimeUnit.MILLISECONDS
        );

        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(60 * 60 * 24 * 1);
        response.addCookie(refreshTokenCookie);

        return refreshToken;
    }

    public String createRefreshToken(String username, String provider){
        final long REFRESH_TOKEN_VALIDITY = 1000L * 60 * 60 * 24 * 1;
        String refreshToken = Jwts.builder()
                .setSubject(username)
                .claim("provider", provider)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_TOKEN_VALIDITY))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        redisTemplate.opsForValue().set(
                REFRESH_TOKEN_PREFIX + provider + "_" + username,
                refreshToken,
                REFRESH_TOKEN_VALIDITY,
                TimeUnit.MILLISECONDS
        );

        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(60 * 60 * 24 * 1);
        response.addCookie(refreshTokenCookie);

        return refreshToken;
    }

    //    쿠키와 Redis에서 각 RefreshToken을 가져와서 비교
    public boolean checkRefreshTokenBetweenCookieAndRedis(String username, String cookieRefreshToken){
        String redisRefreshToken = getRefreshTokenFromRedis(username);
        return redisRefreshToken.equals(cookieRefreshToken);
    }

    //    Redis에서 RefreshToken 조회
    public String getRefreshTokenFromRedis(String username){
        return (String) redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + username);
    }

    //    클라이언트 요청에서 액세스 토큰 추출
    public String parseTokenFromHeader(HttpServletRequest request){
        String bearerToken = request.getHeader("Authorization");
        if(bearerToken != null && bearerToken.startsWith("Bearer ")){
            return bearerToken.substring(7);
        }

        if(request.getCookies() != null){
            for(Cookie cookie : request.getCookies()){
                if("accessToken".equals(cookie.getName())){
                    return cookie.getValue();
                }
            }
        }

        return null;
    }

    //    로그아웃 블랙 리스트 추가
    public void addToBlacklist(String token) {
        try {
            String blacklistToken = getBlacklistTokenKey(token);
            Claims claims = getClaims(token);
            long gap = claims.getExpiration().getTime() - System.currentTimeMillis();
            if (gap > 0) {
                String blacklistKey = BLACKLIST_PREFIX + blacklistToken;
                redisTemplate.opsForValue().set(
                        blacklistKey,
                        "blacklisted",
                        gap,
                        TimeUnit.MILLISECONDS
                );
            }
        } catch (Exception e){
            throw new RuntimeException("토큰을 블랙리스트에 추가하는데에 실패했습니다.");
        }
    }

    //    블랙리스트 조회
    public boolean isTokenInBlacklist(String token) {
        try {
            String blacklistToken = getBlacklistTokenKey(token);
            String blacklistKey = BLACKLIST_PREFIX + blacklistToken;
            Boolean hasKey = redisTemplate.hasKey(blacklistKey);
            return hasKey;
        } catch (Exception e){
            log.info("블랙리스트 확인 중 오류 발생: {}", e.getMessage());
            return true;
        }
    }

    public String getBlacklistTokenKey(String token){
//        긴 토큰 문자열을 짧고 고유한 키로 관리 가능(메모리 효율)
        return DigestUtils.md5DigestAsHex(token.getBytes());
    }

    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token).getBody();
    }

    //    리프레시 토큰 삭제
    public void deleteRefreshToken(String username) {
        log.info("refresh token deleted: {}", redisTemplate.delete(REFRESH_TOKEN_PREFIX + username));
    }
}





















