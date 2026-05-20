package com.app.globalgates.mapper;

import com.app.globalgates.domain.PostFileVO;
import com.app.globalgates.dto.PostFileDTO;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.annotation.Commit;

import java.util.List;

@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Commit
@Slf4j
public class PostFileMapperTests {
    @Autowired
    private PostFileMapper postFileMapper;

    @Test
    public void testInsert() {
        PostFileVO postFileVO = PostFileVO.builder()
                .postId(4L)
                .fileId(1L)
                .build();

        postFileMapper.insert(postFileVO);
    }

    @Test
    public void testDelete() {
        postFileMapper.delete(1L);
    }

    @Test
    public void testDeleteByPostId() {
        postFileMapper.deleteByPostId(1L);
    }

    @Test
    public void testSelectAllByPostId() {
        List<PostFileDTO> postFiles = postFileMapper.selectAllByPostId(1L);
        log.info("게시글 첨부파일 목록: {}", postFiles);
    }
}
