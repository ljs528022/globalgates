package com.app.globalgates.controller.member;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.auth.JwtTokenProvider;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.S3Service;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MemberAPIControllerProfileUpdateTest {

    @Mock
    private MemberService memberService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private HttpServletResponse response;

    @Mock
    private S3Service s3Service;

    @InjectMocks
    private MemberAPIController memberAPIController;

    @Test
    void updateProfile_setsAuthenticatedMemberIdAndUpdatesTextOnlyWhenFilesAreMissing() throws Exception {
        MemberDTO requestMember = new MemberDTO();
        requestMember.setMemberNickname("수정된 이름");
        requestMember.setMemberBio("수정된 소개");
        requestMember.setBirthDate("19970718");

        MemberDTO loginMember = new MemberDTO();
        loginMember.setId(7L);

        CustomUserDetails userDetails = new CustomUserDetails(loginMember, "user@example.com");

        ResponseEntity<?> responseEntity = memberAPIController.updateProfile(requestMember, null, null, userDetails);

        assertEquals(7L, requestMember.getId());
        assertEquals(Map.of("message", "프로필 수정 성공"), responseEntity.getBody());
        verify(memberService).update(requestMember);
    }
}
