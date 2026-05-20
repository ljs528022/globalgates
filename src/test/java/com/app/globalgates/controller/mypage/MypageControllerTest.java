package com.app.globalgates.controller.mypage;

import com.app.globalgates.auth.JwtTokenProvider;
import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.dto.FollowDTO;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.repository.MemberProfileFileDAO;
import com.app.globalgates.service.FollowService;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.PostService;
import com.app.globalgates.service.S3Service;
import com.app.globalgates.service.SubscriptionService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ui.Model;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MypageControllerTest {

    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private MemberService memberService;
    @Mock
    private MemberProfileFileDAO memberProfileFileDAO;
    @Mock
    private S3Service s3Service;
    @Mock
    private FollowService followService;
    @Mock
    private PostService postService;
    @Mock
    private SubscriptionService subscriptionService;
    @Mock
    private HttpServletRequest request;
    @Mock
    private Model model;

    @InjectMocks
    private MypageController mypageController;

    @Test
    void goToMypage_usesLoginMemberWhenNoMemberIdIsProvided() {
        MemberDTO loginMember = new MemberDTO();
        loginMember.setId(7L);
        loginMember.setMemberRole(MemberRole.BUSINESS);

        when(jwtTokenProvider.parseTokenFromHeader(request)).thenReturn("token");
        when(jwtTokenProvider.getUsername("token")).thenReturn("user@example.com");
        when(memberService.getMember("user@example.com")).thenReturn(loginMember);
        when(followService.getFollowings(7L)).thenReturn(List.of());
        when(followService.getFollowers(7L)).thenReturn(List.of());
        when(postService.getMyPostCount(7L)).thenReturn(0);
        when(subscriptionService.findByMemberId(7L)).thenReturn(Optional.empty());

        String viewName = mypageController.goToMypage(null, request, model);

        assertEquals("mypage/mypage", viewName);
        verify(model).addAttribute("member", loginMember);
        verify(model).addAttribute("isOwner", true);
        verify(model).addAttribute("isFollowing", false);
        verify(model).addAttribute("loginMemberId", 7L);
        verify(model).addAttribute("subscriptionTier", "free");
        verify(memberService, never()).getMemberById(any());
    }

    @Test
    void goToMypage_usesViewedMemberWhenMemberIdIsProvided() {
        MemberDTO loginMember = new MemberDTO();
        loginMember.setId(7L);

        MemberDTO viewedMember = new MemberDTO();
        viewedMember.setId(11L);
        viewedMember.setMemberRole(MemberRole.EXPERT);

        FollowDTO followDTO = new FollowDTO();
        followDTO.setFollowingId(11L);

        when(jwtTokenProvider.parseTokenFromHeader(request)).thenReturn("token");
        when(jwtTokenProvider.getUsername("token")).thenReturn("user@example.com");
        when(memberService.getMember("user@example.com")).thenReturn(loginMember);
        when(memberService.getMemberById(11L)).thenReturn(viewedMember);
        when(followService.getFollowings(7L)).thenReturn(List.of(followDTO));
        when(followService.getFollowings(11L)).thenReturn(List.of());
        when(followService.getFollowers(11L)).thenReturn(List.of());
        when(postService.getMyPostCount(11L)).thenReturn(0);
        when(subscriptionService.findByMemberId(11L)).thenReturn(Optional.empty());

        String viewName = mypageController.goToMypage(11L, request, model);

        assertEquals("mypage/mypage", viewName);
        verify(model).addAttribute("member", viewedMember);
        verify(model).addAttribute("isOwner", false);
        verify(model).addAttribute("isFollowing", true);
        verify(model).addAttribute("loginMemberId", 7L);
        verify(model).addAttribute("subscriptionTier", "free");
        verify(memberService).getMemberById(11L);
    }
}
