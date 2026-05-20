package com.app.globalgates.mapper;

import com.app.globalgates.common.enumeration.Status;
import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.common.search.PostSearch;
import com.app.globalgates.domain.PostVO;
import com.app.globalgates.dto.PostDTO;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Commit;

import java.util.List;
import java.util.Optional;

@MybatisTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Commit
@Slf4j
public class PostMapperTests {
    @Autowired
    private PostMapper postMapper;

    @Test
    public void testInsert() {
        PostDTO postDTO = new PostDTO();
        postDTO.setMemberId(1L);
        postDTO.setPostStatus(Status.ACTIVE);
        postDTO.setPostTitle("글제목3333");
        postDTO.setPostContent("글내용이에요.");
        postDTO.setLocation("송파구 가락동");

        postMapper.insert(postDTO);
        log.info("등록된 게시글 ID: {}", postDTO.getId());
    }

    @Test
    public void testUpdate() {
        PostVO postVO = PostVO.builder()
                .id(2L)
                .postTitle("수정된 제목")
                .postContent("수정된 내용입니다.")
                .location("송파 문정")
                .build();

        postMapper.update(postVO);
    }

    @Test
    public void testDelete() {
        postMapper.delete(2L);
    }

    @Test
    public void testSelectById() {
        Optional<PostDTO> foundPost = postMapper.selectById(4L, null);
        log.info("게시글 단일로 조회하기: {}", foundPost);
    }

    @Test
    public void testSelectAll() {
        Criteria criteria = new Criteria(1, postMapper.selectTotal());
        List<PostDTO> posts = postMapper.selectAll(criteria, null);
        log.info("게시글 목록: {}", posts);
    }

    @Test
    public void testSelectTotal() {
        int total = postMapper.selectTotal();
        log.info("게시글 전체 개수: {}", total);
    }

    @Test
    public void testSelectBySearch() {
        PostSearch search = new PostSearch();
        search.setMemberId(9L);
        search.setKeyword("산업용");
        search.setType("popular");
        Criteria criteria = new Criteria(1, postMapper.selectTotalBySearch(search));

        List<PostDTO> foundPosts = postMapper.selectBySearch(criteria, search);
        log.info("조회한 게시물 : {}", foundPosts);
    }

    @Test
    public void testSelectALLByMemberId() {
        Criteria criteria = new Criteria(1, postMapper.selectTotalByMemberId(46L));
        List<PostDTO> foundPosts = postMapper.selectAllByMemberId(criteria,46L);
        log.info("memberId로 조회한 게시물 : {}", foundPosts);
    }
}
