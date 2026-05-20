package com.app.globalgates.repository;

import com.app.globalgates.dto.MemberProfileFileDTO;
import com.app.globalgates.mapper.MemberProfileFileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class MemberProfileFileDAO {
    private final MemberProfileFileMapper memberProfileFileMapper;

    //    사진추가
    public void save(MemberProfileFileDTO memberProfileFileDTO) {
        memberProfileFileMapper.insert(memberProfileFileDTO);
    }

    //    배너 사진추가
    // 프로필 이미지 저장 로직과 이름을 맞추되, 배너는 전용 mapper를 타게 분리한다.
    public void saveBanner(MemberProfileFileDTO memberProfileFileDTO) {
        memberProfileFileMapper.insertBanner(memberProfileFileDTO);
    }
    //    memberId로 프로필 이미지 조회
    public MemberProfileFileDTO findByMemberId(Long memberId) {
       return memberProfileFileMapper.selectById(memberId);
    }

    //    memberId로 배너 이미지 조회
    public MemberProfileFileDTO findBannerByMemberId(Long memberId) {
        return memberProfileFileMapper.selectBannerByMemberId(memberId);
    }

    //  프로필 이미지 삭제
    public void delete(Long Id) {
        memberProfileFileMapper.delete(Id);
    }

    //  memberId로 이미지 삭제
    public void deleteByMemberId(Long memberId) {
        memberProfileFileMapper.deleteByMemberId(memberId);
    }
}
