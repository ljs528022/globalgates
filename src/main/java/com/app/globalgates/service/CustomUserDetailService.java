package com.app.globalgates.service;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.repository.MemberDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailService implements UserDetailsService {
    private final MemberDAO memberDAO;

    @Override
    public UserDetails loadUserByUsername(String loginId) throws UsernameNotFoundException {
        MemberDTO memberDTO = memberDAO.findMemberByLoginId(loginId)
                .orElseThrow(() -> new UsernameNotFoundException("소유자를 찾을 수 없습니다."));
        return new CustomUserDetails(memberDTO, loginId);
    }
}

