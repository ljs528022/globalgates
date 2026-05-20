package com.app.globalgates.mapper;

import com.app.globalgates.dto.PostHashtagDTO;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.annotation.Commit;

import java.util.List;
import java.util.Optional;

@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Commit
@Slf4j
public class PostHashtagMapperTests {
    @Autowired
    private PostHashtagMapper postHashtagMapper;

    @Test
    public void testInsert() {
        PostHashtagDTO postHashtagDTO = new PostHashtagDTO();
        postHashtagDTO.setTagName("글로발");

        postHashtagMapper.insert(postHashtagDTO);
        log.info("--------등록 태그 아이디 {}", postHashtagDTO.getId());
    }

    @Test
    public void testSelectByTagName() {
        Optional<PostHashtagDTO> foundHashtag = postHashtagMapper.selectByTagName("여행");
        log.info("태그명으로 조회하기------- {}", foundHashtag);
    }

    @Test
    public void testSelectAll() {
        List<PostHashtagDTO> hashtags = postHashtagMapper.selectAll();
        log.info("전체 태그 목록--------- {}", hashtags);
    }

    @Test
    public void testInsertRel() {
        postHashtagMapper.insertRel(4L, 1L);
        log.info("게시물이랑 태그 관계 저장이요");
    }

    @Test
    public void testSelectAllByPostId() {
        List<PostHashtagDTO> hashtags = postHashtagMapper.selectAllByPostId(1L);
        log.info("게시글물이랑 태그 목록이요 --------", hashtags);
    }

    @Test
    public void testDeleteRelByPostId() {
        postHashtagMapper.deleteRelByPostId(1L);
        log.info("게시물이랑 태그 관계 전체 삭제 완료");
    }
}
