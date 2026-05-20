package com.app.globalgates.repository;

import com.app.globalgates.domain.BusinessMemberVO;
import com.app.globalgates.dto.BusinessMemberDTO;
import com.app.globalgates.mapper.BusinessMemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class BusinessMemberDAO {
    private final BusinessMemberMapper businessMemberMapper;

//    사업자 정보 등록
    public void save(BusinessMemberVO businessMemberVO) {
        businessMemberMapper.insert(businessMemberVO);
    }

    public boolean existsByCompanyName(String companyName) {
        return businessMemberMapper.countByCompanyName(companyName) > 0;
    }

    public boolean existsByBusinessNumber(String businessNumber) {
        return businessMemberMapper.countByBusinessNumber(businessNumber) > 0;
    }
}
