package com.app.globalgates.mapper;

import com.app.globalgates.common.enumeration.OAuthProvider;
import com.app.globalgates.domain.OAuthVO;
import com.app.globalgates.dto.MemberDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface OAuthMapper {
    //    회원가입
    public void insert(OAuthVO oAuthVO);
    //    로그인
    public Optional<MemberDTO> selectMemberForLogin(MemberDTO memberDTO);
    //    이메일로 조회
    public Optional<MemberDTO> selectMemberByLoginId(@Param("loginId") String loginId,
                                                         @Param("provider") OAuthProvider provider);
}

