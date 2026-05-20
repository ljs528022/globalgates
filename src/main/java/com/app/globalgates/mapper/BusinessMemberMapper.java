package com.app.globalgates.mapper;

import com.app.globalgates.domain.BusinessMemberVO;
import com.app.globalgates.dto.BusinessMemberDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface BusinessMemberMapper {

    // 사업자 정보 등록
    public void insert(BusinessMemberVO businessMemberVO);

    // 업체명(상호명) 중복 검사 - 동일 회사명이 등록된 건수
    int countByCompanyName(String companyName);

    // 사업자 등록번호 중복 검사 - 동일 등록번호가 등록된 건수
    int countByBusinessNumber(String businessNumber);
}
