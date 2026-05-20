package com.app.globalgates.controller.setting;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.service.MemberService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ui.ConcurrentModel;
import org.springframework.ui.Model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SettingControllerTest {

    @Mock
    private MemberService memberService;

    @InjectMocks
    private SettingController settingController;

    @Test
    void goToSetting_addsAuthenticatedMemberToModel() {
        MemberDTO loginMember = new MemberDTO();
        loginMember.setId(7L);
        loginMember.setMemberEmail("user@example.com");
        loginMember.setMemberPhone("01012345678");
        loginMember.setMemberName("테스트 사용자");
        loginMember.setMemberHandle("@tester");
        loginMember.setMemberLanguage("한국어");

        CustomUserDetails userDetails = new CustomUserDetails(loginMember, "user@example.com");

        MemberDTO foundMember = new MemberDTO();
        foundMember.setId(7L);
        foundMember.setMemberEmail("user@example.com");
        foundMember.setMemberPhone("01012345678");
        foundMember.setMemberName("테스트 사용자");
        foundMember.setMemberHandle("@tester");
        foundMember.setMemberLanguage("한국어");

        when(memberService.getMember("user@example.com")).thenReturn(foundMember);

        Model model = new ConcurrentModel();
        String viewName = settingController.goToSetting(userDetails, model);

        assertEquals("setting/setting", viewName);
        assertSame(foundMember, model.getAttribute("member"));
        verify(memberService).getMember("user@example.com");
    }
}
