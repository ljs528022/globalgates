package com.app.globalgates.repository;

import com.app.globalgates.common.enumeration.OAuthProvider;
import com.app.globalgates.domain.OAuthVO;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.mapper.OAuthMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class OAuthDAO {
    private final OAuthMapper oAuthMapper;

    //    회원가입
    public void save(OAuthVO oAuthVO){
        oAuthMapper.insert(oAuthVO);
    }
    //    로그인
    public Optional<MemberDTO> findMemberForLogin(MemberDTO memberDTO){
        return oAuthMapper.selectMemberForLogin(memberDTO);
    }
    //    이메일로 조회
    public Optional<MemberDTO> findMemberByMemberLoginId(String loginId, OAuthProvider provider){
        return oAuthMapper.selectMemberByLoginId(loginId, provider);
    }
}

