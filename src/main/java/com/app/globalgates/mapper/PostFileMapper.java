
package com.app.globalgates.mapper;

import com.app.globalgates.domain.PostFileVO;
import com.app.globalgates.dto.PostFileDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PostFileMapper {
    //    게시글 첨부파일 등록
    public void insert(PostFileVO postFileVO);

    //    게시글 첨부파일 삭제
    public void delete(Long id);

    //    게시글의 첨부파일 전체 삭제
    public void deleteByPostId(Long id);

    //    게시글 첨부파일 조회
    public List<PostFileDTO> selectAllByPostId(Long id);

    //    여러 게시글의 첨부파일 일괄 조회 (N+1 방지)
    public List<PostFileDTO> selectAllByPostIds(@Param("postIds") List<Long> postIds);
}