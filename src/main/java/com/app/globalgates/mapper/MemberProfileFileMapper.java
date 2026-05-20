package com.app.globalgates.mapper;

import com.app.globalgates.dto.MemberProfileFileDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MemberProfileFileMapper {

//    프로필 사진 추가
    public void insert(MemberProfileFileDTO memberProfileFileDTO);

//    배너 사진 추가
    // 프로필과 배너를 XML에서 명확히 분리하기 위해 배너 전용 insert를 따로 둔다.
    public void insertBanner(MemberProfileFileDTO memberProfileFileDTO);

//    memberId로 프로필 이미지 조회
    public MemberProfileFileDTO selectById(Long memberId);

//    memberId로 배너 이미지 조회
    // 기존 findByMemberId()는 프로필 이미지 용도로 이미 넓게 사용되고 있으므로,
    // 배너 이미지는 별도 메서드로 분리해서 기존 흐름을 건드리지 않는다.
    public MemberProfileFileDTO selectBannerByMemberId(Long memberId);

//    프로필 이미지 삭제
    public void delete(Long Id);

//    memberId로 삭제
    public void deleteByMemberId(Long memberId);
}
