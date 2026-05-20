package com.app.globalgates.repository;

import com.app.globalgates.dto.BookmarkDTO;
import com.app.globalgates.mapper.BookmarkMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class BookmarkDAO {
    private final BookmarkMapper bookmarkMapper;

    //    저장
    public void save(BookmarkDTO bookmarkDTO) {
        bookmarkMapper.insert(bookmarkDTO);
    }

    //    삭제
    public void delete(Long id) {
        bookmarkMapper.delete(id);
    }

    //    회원/게시글 기준 삭제
    public void deleteByMemberIdAndPostId(Long memberId, Long postId) {
        bookmarkMapper.deleteByMemberIdAndPostId(memberId, postId);
    }

    //    폴더 삭제 전 비우기
    public void clearFolderId(Long folderId) {
        bookmarkMapper.clearFolderId(folderId);
    }

    //    폴더 이동
    public void updateFolderId(BookmarkDTO bookmarkDTO) {
        bookmarkMapper.updateFolderId(bookmarkDTO);
    }

    //    단건 조회
    public Optional<BookmarkDTO> findById(Long id) {
        return bookmarkMapper.selectById(id);
    }

    //    회원/게시글 기준 단건 조회
    public Optional<BookmarkDTO> findByMemberIdAndPostId(Long memberId, Long postId) {
        return bookmarkMapper.selectByMemberIdAndPostId(memberId, postId);
    }

    //    회원 전체 조회
    public List<BookmarkDTO> findAllByMemberId(Long memberId) {
        return bookmarkMapper.selectAllByMemberId(memberId);
    }

    //    폴더 전체 조회
    public List<BookmarkDTO> findAllByFolderId(Long folderId) {
        return bookmarkMapper.selectAllByFolderId(folderId);
    }

    //    미분류 조회
    public List<BookmarkDTO> findAllUncategorizedByMemberId(Long memberId) {
        return bookmarkMapper.selectAllUncategorizedByMemberId(memberId);
    }

    //    개수 조회
    public int countByMemberId(Long memberId) {
        return bookmarkMapper.selectCountByMemberId(memberId);
    }
}
