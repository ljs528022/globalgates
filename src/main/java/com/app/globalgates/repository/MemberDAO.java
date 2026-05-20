package com.app.globalgates.repository;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.domain.MemberVO;
import com.app.globalgates.dto.InquiryMemberDTO;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MemberDAO {
    private final MemberMapper memberMapper;

    //  회원가입
    public void save(MemberDTO memberDTO){
        memberMapper.insert(memberDTO);
    }
    //  로그인
    public Optional<MemberDTO> findMemberForLogin(MemberVO memberVO){
        return memberMapper.selectMemberForLogin(memberVO);
    }
    //  이메일 혹은 핸드폰 조회
    public Optional<MemberDTO> findMemberByLoginId(String loginId){
        return memberMapper.selectMemberByLoginId(loginId);
    }
    //  상태와 무관하게 이메일 혹은 핸드폰 조회
    public Optional<MemberDTO> findMemberByLoginIdAnyStatus(String loginId){
        return memberMapper.selectMemberByLoginIdAnyStatus(loginId);
    }
    //  이메일 유효성 검사
    public Optional<MemberDTO> findMemberByMemberEmail(String memberEmail){
        return memberMapper.selectMemberByMemberEmail(memberEmail);
    }
    //  핸드폰 유효성 검사
    public Optional<MemberDTO> findMemberByMemberPhone(String memberPhone){
        return memberMapper.selectMemberByMemberPhone(memberPhone);
    }
    //  닉네임 또는 핸들로 검색한 회원 수
    public int findTotalByKeyword(String keyword) {
        return memberMapper.selectTotalByKeyword(keyword);
    }
    //  닉네임 또는 핸들로 회원 검색
    public List<MemberDTO> findMembersByKeyword(String keyword) {
        return memberMapper.selectMembersByKeyword(keyword);
    }
    //  닉네임 또는 핸들로 회원 검색 (팔로우 여부 포함)
    public List<MemberDTO> findMembersByKeywordWithFollow(Long memberId, String keyword, Criteria criteria) {
        return memberMapper.selectMembersByKeywordWithFollow(memberId, keyword, criteria);
    }
    //  Handle로 조회
    public Optional<MemberDTO> findMemberByMemberHandle(String memberHandle){
        return memberMapper.selectMemberByMemberHandle(memberHandle);
    }
    //  memberId로 조회
    public Optional<MemberDTO> findByMemberId(Long memberId){
        return memberMapper.selectById(memberId);
    }
    //  memberId로 삭제
    public void delete(Long memberId){
        memberMapper.delete(memberId);
    }
    //  memberId로 soft delete
    public void softDelete(Long memberId){
        memberMapper.softDelete(memberId);
    }
    //  memberId로 re-activate
    public void reactivate(Long memberId){
        memberMapper.reactivate(memberId);
    }
    //  프로필 수정
    public void update(MemberDTO memberDTO){
        memberMapper.update(memberDTO);
    }
    //  비밀번호 변경
    public void updatePassword(Long memberId, String memberPassword) {
        memberMapper.updatePassword(memberId, memberPassword);
    }
    //  handle 변경
    public void updateHandle(Long memberId, String memberHandle) {
        memberMapper.updateHandle(memberId, memberHandle);
    }
    //  휴대폰 번호 변경
    public void updatePhone(Long memberId, String memberPhone) {
        memberMapper.updatePhone(memberId, memberPhone);
    }
    //  이메일 변경
    public void updateEmail(Long memberId, String memberEmail) {
        memberMapper.updateEmail(memberId, memberEmail);
    }
    //  언어 변경
    public void updateLanguage(Long memberId, String memberLanguage) {
        memberMapper.updateLanguage(memberId, memberLanguage);
    }
    //  국가 변경
    public void updateCountry(Long memberId, String memberCountry) {
        memberMapper.updateCountry(memberId, memberCountry);
    }
    //  푸시 알림 master on/off 변경
    public void updatePushEnabled(Long memberId, boolean pushEnabled) {
        memberMapper.updatePushEnabled(memberId, pushEnabled);
    }
    //  Handle로 조회 (간소화 - 차단용)
    public Optional<MemberDTO> findByHandle(String memberHandle) {
        return memberMapper.selectMemberByHandle(memberHandle);
    }
    //  채팅 유저 검색 (차단 사용자 제외)
    public List<MemberDTO> searchByKeyword(String keyword, Long memberId){
        return memberMapper.searchByKeyword(keyword, memberId);
    }

    // 전문가 페이지 - 조회된 회원 수
    public int findInquiryTotal(String categoryName, Long memberId) {
        return memberMapper.selectInquiryTotal(categoryName, memberId);
    };

    // 전문가 페이지 - 거래처 등록 목록 조회
    public List<InquiryMemberDTO> findInquiryMembers(Criteria criteria, String categoryName, Long memberId) {
        return memberMapper.selectInquiryMembers(criteria, categoryName, memberId);
    }
    //  회원 역할 변경
    public void setMemberRole(Long id, MemberRole memberRole) {
        memberMapper.updateMemberRole(id, memberRole);
    }
}
