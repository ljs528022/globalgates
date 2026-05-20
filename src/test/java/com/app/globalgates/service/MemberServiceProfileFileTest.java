package com.app.globalgates.service;

import com.app.globalgates.common.enumeration.ProfileImageType;
import com.app.globalgates.dto.MemberProfileFileDTO;
import com.app.globalgates.repository.BusinessMemberDAO;
import com.app.globalgates.repository.CategoryDAO;
import com.app.globalgates.repository.CategoryMemberDAO;
import com.app.globalgates.repository.FileDAO;
import com.app.globalgates.repository.MemberDAO;
import com.app.globalgates.repository.MemberProfileFileDAO;
import com.app.globalgates.repository.OAuthDAO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MemberServiceProfileFileTest {

    @Mock
    private MemberDAO memberDAO;

    @Mock
    private MemberProfileFileDAO memberProfileFileDAO;

    @Mock
    private BusinessMemberDAO businessMemberDAO;

    @Mock
    private FileDAO fileDAO;

    @Mock
    private CategoryMemberDAO categoryMemberDAO;

    @Mock
    private CategoryDAO categoryDAO;

    @Mock
    private OAuthDAO oAuthDAO;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private MemberService memberService;

    @Test
    void saveBannerFile_savesBannerRelationWithBannerType() {
        MockMultipartFile bannerImage = new MockMultipartFile(
                "bannerImage",
                "banner.png",
                "image/png",
                "banner".getBytes()
        );

        memberService.saveBannerFile(7L, bannerImage, "2026/03/29/banner.png");

        ArgumentCaptor<MemberProfileFileDTO> captor = ArgumentCaptor.forClass(MemberProfileFileDTO.class);
        verify(memberProfileFileDAO).saveBanner(captor.capture());

        assertEquals(7L, captor.getValue().getMemberId());
        assertEquals(ProfileImageType.BANNER, captor.getValue().getProfileImageType());
    }
}
