package com.app.globalgates.service;

import com.app.globalgates.common.enumeration.Status;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.NotificationPreferenceDTO;
import com.app.globalgates.repository.BusinessMemberDAO;
import com.app.globalgates.repository.CategoryDAO;
import com.app.globalgates.repository.CategoryMemberDAO;
import com.app.globalgates.repository.FileDAO;
import com.app.globalgates.repository.MemberDAO;
import com.app.globalgates.repository.MemberProfileFileDAO;
import com.app.globalgates.repository.NotificationPreferenceDAO;
import com.app.globalgates.repository.OAuthDAO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
//
//@ExtendWith(MockitoExtension.class)
//class MemberServicePasswordTest {
//
//    @Mock
//    private MemberDAO memberDAO;
//
//    @Mock
//    private MemberProfileFileDAO memberProfileFileDAO;
//
//    @Mock
//    private BusinessMemberDAO businessMemberDAO;
//
//    @Mock
//    private FileDAO fileDAO;
//
//    @Mock
//    private CategoryMemberDAO categoryMemberDAO;
//
//    @Mock
//    private CategoryDAO categoryDAO;
//
//    @Mock
//    private OAuthDAO oAuthDAO;
//
//    @Mock
//    private NotificationPreferenceDAO notificationPreferenceDAO;
//
//    @Mock
//    private PasswordEncoder passwordEncoder;
//
//    @InjectMocks
//    private MemberService memberService;
//
//    @Test
//    void checkPassword_returnsTrueWhenRawPasswordMatchesEncodedPassword() {
//        MemberDTO member = new MemberDTO();
//        member.setMemberPassword("$2a$10$encodedPassword");
//
//        when(memberDAO.findMemberByLoginId("tester@example.com")).thenReturn(Optional.of(member));
//        when(passwordEncoder.matches("plain-password", "$2a$10$encodedPassword")).thenReturn(true);
//
//        boolean result = memberService.checkPassword("tester@example.com", "plain-password");
//
//        assertTrue(result);
//    }
//
//    @Test
//    void checkPassword_returnsFalseWhenRawPasswordDoesNotMatchEncodedPassword() {
//        MemberDTO member = new MemberDTO();
//        member.setMemberPassword("$2a$10$encodedPassword");
//
//        when(memberDAO.findMemberByLoginId("tester@example.com")).thenReturn(Optional.of(member));
//        when(passwordEncoder.matches("wrong-password", "$2a$10$encodedPassword")).thenReturn(false);
//
//        boolean result = memberService.checkPassword("tester@example.com", "wrong-password");
//
//        assertFalse(result);
//    }
//
//    @Test
//    void updatePassword_encodesNextPasswordAndPersistsItWhenCurrentPasswordMatches() {
//        MemberDTO member = new MemberDTO();
//        member.setId(7L);
//        member.setMemberPassword("$2a$10$currentEncoded");
//
//        when(memberDAO.findMemberByLoginId("tester@example.com")).thenReturn(Optional.of(member));
//        when(passwordEncoder.matches("current-password", "$2a$10$currentEncoded")).thenReturn(true);
//        when(passwordEncoder.encode("next-password")).thenReturn("$2a$10$nextEncoded");
//
//        memberService.updatePassword("tester@example.com", "current-password", "next-password");
//
//        verify(memberDAO).updatePassword(7L, "$2a$10$nextEncoded");
//    }
//
//    @Test
//    void updateHandle_prefixesAtSymbolAndPersistsNormalizedHandle() {
//        MemberDTO member = new MemberDTO();
//        member.setId(7L);
//        member.setMemberHandle("@old_handle");
//
//        when(memberDAO.findMemberByLoginId("tester@example.com")).thenReturn(Optional.of(member));
//        when(memberDAO.findMemberByMemberHandle("@new_handle")).thenReturn(Optional.empty());
//
//        memberService.updateHandle("tester@example.com", "new_handle");
//
//        verify(memberDAO).updateHandle(7L, "@new_handle");
//    }
//
//    @Test
//    void updatePhone_normalizesDigitsAndPersistsPhoneNumber() {
//        MemberDTO member = new MemberDTO();
//        member.setId(7L);
//        member.setMemberPhone("01011112222");
//
//        when(memberDAO.findMemberByLoginId("tester@example.com")).thenReturn(Optional.of(member));
//        when(memberDAO.findMemberByMemberPhone("01033334444")).thenReturn(Optional.empty());
//
//        memberService.updatePhone("tester@example.com", "010-3333-4444");
//
//        verify(memberDAO).updatePhone(7L, "01033334444");
//    }
//
//    @Test
//    void updateEmail_trimsAndLowercasesEmailBeforePersisting() {
//        MemberDTO member = new MemberDTO();
//        member.setId(7L);
//        member.setMemberEmail("old@example.com");
//
//        when(memberDAO.findMemberByLoginId("tester@example.com")).thenReturn(Optional.of(member));
//        when(memberDAO.findMemberByMemberEmail("new@example.com")).thenReturn(Optional.empty());
//
//        memberService.updateEmail("tester@example.com", "  New@Example.com ");
//
//        verify(memberDAO).updateEmail(7L, "new@example.com");
//    }
//
//    @Test
//    void updateLanguage_trimsLabelAndPersistsIt() {
//        MemberDTO member = new MemberDTO();
//        member.setId(7L);
//        member.setMemberLanguage("한국어");
//
//        when(memberDAO.findMemberByLoginId("tester@example.com")).thenReturn(Optional.of(member));
//
//        memberService.updateLanguage("tester@example.com", "  영어 ");
//
//        verify(memberDAO).updateLanguage(7L, "영어");
//    }
//
//    @Test
//    void deactivateMember_softDeletesMemberWhenPasswordMatches() {
//        MemberDTO member = new MemberDTO();
//        member.setId(7L);
//        member.setMemberPassword("$2a$10$encodedPassword");
//
//        when(memberDAO.findMemberByLoginId("tester@example.com")).thenReturn(Optional.of(member));
//        when(passwordEncoder.matches("plain-password", "$2a$10$encodedPassword")).thenReturn(true);
//
//        memberService.deactivateMember("tester@example.com", "plain-password");
//
//        verify(memberDAO).softDelete(7L);
//    }
//
//    @Test
//    void reactivateMember_restoresInactiveMemberWhenPasswordMatches() {
//        MemberDTO member = new MemberDTO();
//        member.setId(7L);
//        member.setMemberPassword("$2a$10$encodedPassword");
//        member.setMemberStatus(Status.INACTIVE);
//
//        when(memberDAO.findMemberByLoginIdAnyStatus("tester@example.com")).thenReturn(Optional.of(member));
//        when(passwordEncoder.matches("plain-password", "$2a$10$encodedPassword")).thenReturn(true);
//
//        memberService.reactivateMember("tester@example.com", "plain-password");
//
//        verify(memberDAO).reactivate(7L);
//    }
//
//    @Test
//    void getNotificationPreference_returnsDefaultPushPreferencesFromJoinSelection() {
//        MemberDTO member = new MemberDTO();
//        member.setId(7L);
//        member.setPushEnabled(false);
//
//        when(memberDAO.findMemberByLoginId("tester@example.com")).thenReturn(Optional.of(member));
//        when(notificationPreferenceDAO.findByMemberId(7L)).thenReturn(Optional.empty());
//
//        NotificationPreferenceDTO result =
//                memberService.getNotificationPreference("tester@example.com");
//
//        assertTrue(result.isQualityFilterEnabled());
//        assertFalse(result.isMutedNonFollowing());
//        assertFalse(result.isPushConnect());
//        assertFalse(result.isPushMentions());
//    }
//
//    @Test
//    void updatePushEnabled_persistsBooleanForCurrentMember() {
//        MemberDTO member = new MemberDTO();
//        member.setId(7L);
//        member.setPushEnabled(true);
//
//        NotificationPreferenceDTO savedPreference = new NotificationPreferenceDTO();
//        savedPreference.setId(9L);
//        savedPreference.setMemberId(7L);
//
//        when(memberDAO.findMemberByLoginId("tester@example.com")).thenReturn(Optional.of(member));
//        when(notificationPreferenceDAO.findByMemberId(7L)).thenReturn(Optional.of(savedPreference));
//
//        memberService.updatePushEnabled("tester@example.com", true);
//
//        verify(memberDAO).updatePushEnabled(7L, true);
//        verify(notificationPreferenceDAO).save(savedPreference);
//        assertTrue(savedPreference.isPushConnect());
//        assertTrue(savedPreference.isPushMentions());
//    }
//
//    @Test
//    void updatePushEnabled_disablesAllDetailedPushPreferencesWhenMasterToggleIsTurnedOff() {
//        MemberDTO member = new MemberDTO();
//        member.setId(7L);
//        member.setPushEnabled(true);
//
//        NotificationPreferenceDTO savedPreference = new NotificationPreferenceDTO();
//        savedPreference.setId(9L);
//        savedPreference.setMemberId(7L);
//        savedPreference.setPushConnect(true);
//        savedPreference.setPushExpert(true);
//        savedPreference.setPushLikes(true);
//        savedPreference.setPushPosts(true);
//        savedPreference.setPushComments(true);
//        savedPreference.setPushChatMessages(true);
//        savedPreference.setPushQuotes(true);
//        savedPreference.setPushSystem(true);
//        savedPreference.setPushMentions(true);
//
//        when(memberDAO.findMemberByLoginId("tester@example.com")).thenReturn(Optional.of(member));
//        when(notificationPreferenceDAO.findByMemberId(7L)).thenReturn(Optional.of(savedPreference));
//
//        memberService.updatePushEnabled("tester@example.com", false);
//
//        verify(memberDAO).updatePushEnabled(7L, false);
//        verify(notificationPreferenceDAO).save(savedPreference);
//        assertFalse(savedPreference.isPushConnect());
//        assertFalse(savedPreference.isPushExpert());
//        assertFalse(savedPreference.isPushLikes());
//        assertFalse(savedPreference.isPushPosts());
//        assertFalse(savedPreference.isPushComments());
//        assertFalse(savedPreference.isPushChatMessages());
//        assertFalse(savedPreference.isPushQuotes());
//        assertFalse(savedPreference.isPushSystem());
//        assertFalse(savedPreference.isPushMentions());
//    }
//
//    @Test
//    void updateNotificationPushPreference_keepsMasterEnabledWhenAtLeastOneDetailedPushAlertIsEnabled() {
//        MemberDTO member = new MemberDTO();
//        member.setId(7L);
//        member.setPushEnabled(true);
//
//        NotificationPreferenceDTO savedPreference = new NotificationPreferenceDTO();
//        savedPreference.setId(9L);
//        savedPreference.setMemberId(7L);
//
//        NotificationPreferenceDTO request = new NotificationPreferenceDTO();
//        request.setPushConnect(true);
//        request.setPushExpert(false);
//        request.setPushLikes(false);
//        request.setPushPosts(false);
//        request.setPushComments(false);
//        request.setPushChatMessages(false);
//        request.setPushQuotes(false);
//        request.setPushSystem(false);
//        request.setPushMentions(false);
//
//        when(memberDAO.findMemberByLoginId("tester@example.com")).thenReturn(Optional.of(member));
//        when(notificationPreferenceDAO.findByMemberId(7L)).thenReturn(Optional.of(savedPreference));
//
//        memberService.updateNotificationPushPreference("tester@example.com", request);
//
//        verify(memberDAO).updatePushEnabled(7L, true);
//        verify(notificationPreferenceDAO).save(savedPreference);
//        assertTrue(savedPreference.isPushConnect());
//        assertFalse(savedPreference.isPushMentions());
//    }
//
//    @Test
//    void updateNotificationFilter_updatesOnlyFilterFields() {
//        MemberDTO member = new MemberDTO();
//        member.setId(7L);
//        member.setPushEnabled(true);
//
//        NotificationPreferenceDTO savedPreference = new NotificationPreferenceDTO();
//        savedPreference.setId(9L);
//        savedPreference.setMemberId(7L);
//        savedPreference.setPushConnect(true);
//        savedPreference.setPushMentions(true);
//
//        NotificationPreferenceDTO request = new NotificationPreferenceDTO();
//        request.setQualityFilterEnabled(false);
//        request.setMutedNonFollowing(true);
//        request.setMutedNotFollowingYou(true);
//        request.setMutedNewAccount(true);
//        request.setMutedDefaultProfile(true);
//        request.setMutedUnverifiedEmail(true);
//        request.setMutedUnverifiedPhone(true);
//
//        when(memberDAO.findMemberByLoginId("tester@example.com")).thenReturn(Optional.of(member));
//        when(notificationPreferenceDAO.findByMemberId(7L)).thenReturn(Optional.of(savedPreference));
//
//        memberService.updateNotificationFilter("tester@example.com", request);
//
//        verify(notificationPreferenceDAO).save(savedPreference);
//        assertFalse(savedPreference.isQualityFilterEnabled());
//        assertTrue(savedPreference.isMutedNonFollowing());
//        assertTrue(savedPreference.isMutedNotFollowingYou());
//        assertTrue(savedPreference.isMutedNewAccount());
//        assertTrue(savedPreference.isMutedDefaultProfile());
//        assertTrue(savedPreference.isMutedUnverifiedEmail());
//        assertTrue(savedPreference.isMutedUnverifiedPhone());
//        assertTrue(savedPreference.isPushConnect());
//        assertTrue(savedPreference.isPushMentions());
//    }
//
//    @Test
//    void updateNotificationPushPreference_updatesOnlyPushFields() {
//        MemberDTO member = new MemberDTO();
//        member.setId(7L);
//        member.setPushEnabled(true);
//
//        NotificationPreferenceDTO savedPreference = new NotificationPreferenceDTO();
//        savedPreference.setId(9L);
//        savedPreference.setMemberId(7L);
//        savedPreference.setQualityFilterEnabled(true);
//        savedPreference.setMutedNonFollowing(true);
//
//        NotificationPreferenceDTO request = new NotificationPreferenceDTO();
//        request.setPushConnect(false);
//        request.setPushExpert(false);
//        request.setPushLikes(false);
//        request.setPushPosts(false);
//        request.setPushComments(false);
//        request.setPushChatMessages(false);
//        request.setPushQuotes(false);
//        request.setPushSystem(false);
//        request.setPushMentions(false);
//
//        when(memberDAO.findMemberByLoginId("tester@example.com")).thenReturn(Optional.of(member));
//        when(notificationPreferenceDAO.findByMemberId(7L)).thenReturn(Optional.of(savedPreference));
//
//        memberService.updateNotificationPushPreference("tester@example.com", request);
//
//        verify(memberDAO).updatePushEnabled(7L, false);
//        verify(notificationPreferenceDAO).save(savedPreference);
//        assertTrue(savedPreference.isQualityFilterEnabled());
//        assertTrue(savedPreference.isMutedNonFollowing());
//        assertFalse(savedPreference.isPushConnect());
//        assertFalse(savedPreference.isPushExpert());
//        assertFalse(savedPreference.isPushLikes());
//        assertFalse(savedPreference.isPushPosts());
//        assertFalse(savedPreference.isPushComments());
//        assertFalse(savedPreference.isPushChatMessages());
//        assertFalse(savedPreference.isPushQuotes());
//        assertFalse(savedPreference.isPushSystem());
//        assertFalse(savedPreference.isPushMentions());
//    }
//}
