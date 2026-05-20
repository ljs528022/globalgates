package com.app.globalgates.mapper;

import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.common.enumeration.ProfileImageType;
import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.domain.FileVO;
import com.app.globalgates.dto.*;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.util.Optional;

@SpringBootTest
@Slf4j
public class MemberMapperTests {

    @Autowired
    private MemberMapper memberMapper;
    @Autowired
    private BusinessMemberMapper businessMemberMapper;
    @Autowired
    private MemberProfileFileMapper memberProfileFileMapper;
    @Autowired
    private FileMapper fileMapper;

    @Test
    public void insertTest() {
        MemberDTO memberDTO = new MemberDTO();
        MemberProfileFileDTO memberProfileFileDTO = new MemberProfileFileDTO();
        FileDTO fileDTO = new FileDTO();
        BusinessMemberDTO businessMemberDTO = new BusinessMemberDTO();

        memberDTO.setMemberName("test");
        memberDTO.setMemberEmail("sdfas@123");
        memberDTO.setMemberPassword("1234");
        memberDTO.setMemberHandle("test");
        memberDTO.setMemberPhone("010-1234-5678");
        memberDTO.setMemberRegion("울산광역시 중구 약사로 10");
        memberDTO.setPushEnabled(false);
        memberDTO.setBirthDate("991216");

        memberMapper.insert(memberDTO);

        fileDTO.setOriginalName("test");
        fileDTO.setFileName("test");
        fileDTO.setFilePath("/2026/30/18");
        fileDTO.setFileSize(300L);
        fileDTO.setContentType(FileContentType.IMAGE);

        fileMapper.insert(fileDTO);

        memberProfileFileDTO.setId(fileDTO.getId());
        memberProfileFileDTO.setMemberId(memberDTO.getId());
        memberProfileFileMapper.insert(memberProfileFileDTO);

        businessMemberDTO.setId(memberDTO.getId());
        businessMemberDTO.setBusinessNumber("121-1215-551154");
        businessMemberDTO.setCompanyName("벅벅회사");
        businessMemberDTO.setCeoName("홍성호");
        businessMemberDTO.setBusinessType("제조업");

        businessMemberMapper.insert(businessMemberDTO.toBusinessMemberVO());

        log.info("memberDTO : {}", memberDTO);
        log.info("memberProfileFileDTO : {}", memberProfileFileDTO);
        log.info("fileDTO : {}", fileDTO);
        log.info("businessMemberDTO : {}", businessMemberDTO);

    }

//  이메일로 member 찾는 test
    @Test
    public void emailCheckTest(){
        Optional<MemberDTO> memberDTO = memberMapper.selectMemberByMemberEmail("tjdgh1851@gmail.com");

        log.info("memberDTO : {}", memberDTO);
    }

//  핸드폰번호로 member 찾는 test
    @Test
    public void phoneCheckTest(){
        Optional<MemberDTO> memberDTO = memberMapper.selectMemberByMemberPhone("01012221234");
        log.info("memberDTO : {}", memberDTO);
    }

//  입력받은 loginId와 password로 member조회
    @Test
    public void passwordCheckTest(){
//        Optional<MemberDTO> memberDTO = memberMapper.selec("tjdgh1851@gmail.com","$2a$10$NL8/RH5djgJgtOpAldH/TelefJ22.9lV/4CTCX.TEuPbHQPHHoALG");
//        log.info("memberDTO : {}", memberDTO);
    }

    @Test
    public void testSelectMembersByKeyword() {
        String keyword = "아";
        List<MemberDTO> foundMembers = memberMapper.selectMembersByKeyword(keyword);
        log.info("조회한 회원들: {}", foundMembers);
    }

    @Test
    public void testSelectMembersByKeywordWithFollow() {
        String keyword = "아";
        Long memberId = 40L;
        Criteria criteria = new Criteria(1, memberMapper.selectTotalByKeyword(keyword));
        List<MemberDTO> foundMembers = memberMapper.selectMembersByKeywordWithFollow(memberId ,keyword, criteria);
        log.info("조회한 회원들: {}", foundMembers);
    }

    @Test
    public void testSelectInquiryMembers() {
        Long memberId = 9L;
        Criteria criteria = new Criteria(1, memberMapper.selectInquiryTotal("전체", memberId));

        List<InquiryMemberDTO> foundMembers = memberMapper.selectInquiryMembers(criteria, "전체", memberId);
        log.info("받아온 members : {}", foundMembers);
    }

}
