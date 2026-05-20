
package com.app.globalgates.repository;

import com.app.globalgates.domain.PostFileVO;
import com.app.globalgates.dto.PostFileDTO;
import com.app.globalgates.mapper.PostFileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PostFileDAO {
    private final PostFileMapper postFileMapper;

    //    게시글 첨부파일 등록
    public void save(PostFileVO postFileVO) {
        postFileMapper.insert(postFileVO);
    }

    //    게시글 첨부파일 삭제
    public void delete(Long id) {
        postFileMapper.delete(id);
    }

    //    게시글의 첨부파일 전체 삭제
    public void deleteByPostId(Long id) {
        postFileMapper.deleteByPostId(id);
    }

    //    게시글 첨부파일 조회
    public List<PostFileDTO> findAllByPostId(Long id) {
        return postFileMapper.selectAllByPostId(id);
    }

    //    여러 게시글의 첨부파일 일괄 조회 (N+1 방지)
    public List<PostFileDTO> findAllByPostIds(List<Long> postIds) {
        if (postIds == null || postIds.isEmpty()) {
            return List.of();
        }
        return postFileMapper.selectAllByPostIds(postIds);
    }
}
