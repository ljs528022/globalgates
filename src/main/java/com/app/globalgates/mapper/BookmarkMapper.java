package com.app.globalgates.mapper;

import com.app.globalgates.dto.BookmarkDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface BookmarkMapper {
    //    북마크 추가
    public void insert(BookmarkDTO bookmarkDTO);

    //    북마크 삭제
    public void delete(Long id);

    //    회원/게시글 기준 북마크 삭제
    public void deleteByMemberIdAndPostId(@Param("memberId") Long memberId, @Param("postId") Long postId);

    //    폴더 삭제 전 folderId 비우기
    public void clearFolderId(Long folderId);

    //    북마크 폴더 이동
    public void updateFolderId(BookmarkDTO bookmarkDTO);

    //    단건 조회
    public Optional<BookmarkDTO> selectById(Long id);

    //    회원/게시글 기준 단건 조회
    public Optional<BookmarkDTO> selectByMemberIdAndPostId(@Param("memberId") Long memberId, @Param("postId") Long postId);

    //    회원 기준 전체 조회
    public List<BookmarkDTO> selectAllByMemberId(Long memberId);

    //    폴더 기준 전체 조회
    public List<BookmarkDTO> selectAllByFolderId(Long folderId);

    //    미분류 북마크 조회
    public List<BookmarkDTO> selectAllUncategorizedByMemberId(Long memberId);

    //    회원 북마크 수 조회
    public int selectCountByMemberId(Long memberId);
}
