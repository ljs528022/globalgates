package com.app.globalgates.mapper;

import com.app.globalgates.dto.PostHashtagDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface PostHashtagMapper {
    //    태그 추가 (없으면 생성, 있으면 무시)
    public void insert(PostHashtagDTO postHashtagDTO);

    //    태그명으로 조회
    public Optional<PostHashtagDTO> selectByTagName(String tagName);

    //    전체 태그 목록 조회 (정해진 태그 선택용)
    public List<PostHashtagDTO> selectAll();

    //    게시글에 연결된 태그 목록 조회
    public List<PostHashtagDTO> selectAllByPostId(Long postId);

    //    게시글-태그 관계 추가
    public void insertRel(@Param("postId") Long postId, @Param("hashtagId") Long hashtagId);

    //    게시글-태그 관계 삭제 (게시글 수정 시)
    public void deleteRelByPostId(Long postId);
}
