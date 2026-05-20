package com.app.globalgates.mapper;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.common.enumeration.MemberRole;
import com.app.globalgates.domain.MemberVO;
import com.app.globalgates.dto.InquiryMemberDTO;
import com.app.globalgates.dto.MemberDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface MemberMapper {
    //  회원가입
    public void insert(MemberDTO memberDTO);
    //  로그인
    public Optional<MemberDTO> selectMemberForLogin(MemberVO memberVO);
    //  입력받은 이메일 혹은 핸드폰번호를 조회
    Optional<MemberDTO> selectMemberByLoginId(String loginId);
    //  상태와 무관하게 입력받은 이메일 혹은 핸드폰번호를 조회
    Optional<MemberDTO> selectMemberByLoginIdAnyStatus(String loginId);
    //  이메일로 조회
    public Optional<MemberDTO> selectMemberByMemberEmail(String memberEmail);
    //  핸드폰 번호로 조회
    public Optional<MemberDTO> selectMemberByMemberPhone(String memberPhone);
    //  닉네임 또는 핸들로 검색한 회원수
    public int selectTotalByKeyword(String keyword);
    //  닉네임 또는 핸들로 회원 검색
    public List<MemberDTO> selectMembersByKeyword(String keyword);
    //  닉네임 또는 핸들로 회원 검색(팔로우 여부 포함)
    public List<MemberDTO> selectMembersByKeywordWithFollow(Long memberId, String keyword, Criteria criteria);
    //  Handle로 조회
    public Optional<MemberDTO> selectMemberByMemberHandle(String memberHandle);
    //  memberId로 조회
    public Optional<MemberDTO> selectById(Long memberId);
    //  memberId로 삭제
    public void delete(Long memberId);
    //  memberId로 soft delete
    public void softDelete(Long memberId);
    //  memberId로 active 복구
    public void reactivate(Long memberId);
    //  프로필 수정
    public void update(MemberDTO memberDTO);
    //  비밀번호 변경
    public void updatePassword(@Param("id") Long id, @Param("memberPassword") String memberPassword);
    //  handle 변경
    public void updateHandle(@Param("id") Long id, @Param("memberHandle") String memberHandle);
    //  휴대폰 번호 변경
    public void updatePhone(@Param("id") Long id, @Param("memberPhone") String memberPhone);
    //  이메일 변경
    public void updateEmail(@Param("id") Long id, @Param("memberEmail") String memberEmail);
    //  언어 변경
    public void updateLanguage(@Param("id") Long id, @Param("memberLanguage") String memberLanguage);
    //  국가 변경
    public void updateCountry(@Param("id") Long id, @Param("memberCountry") String memberCountry);
    //  푸시 알림 master on/off 변경
    public void updatePushEnabled(@Param("id") Long id, @Param("pushEnabled") boolean pushEnabled);
    //  Handle로 조회 (간소화)
    public Optional<MemberDTO> selectMemberByHandle(String memberHandle);
    //  채팅 유저 검색 (차단 사용자 제외)
    public List<MemberDTO> searchByKeyword(@Param("keyword") String keyword,
                                           @Param("memberId") Long memberId);

    // 전문가 페이지 - 조회된 회원 수
    public int selectInquiryTotal(@Param("categoryName") String categoryName,
                                  @Param("memberId") Long memberId);

    // 전문가 페이지 - 거래처 회원 목록(카테고리 검색)
    public List<InquiryMemberDTO> selectInquiryMembers(@Param("criteria") Criteria criteria,
                                                       @Param("categoryName") String categoryName,
                                                       @Param("memberId") Long memberId);

    //  회원 역할 변경
    public void updateMemberRole(@Param("id") Long id, @Param("memberRole") MemberRole memberRole);
}
