package com.app.globalgates.mapper;

import com.app.globalgates.dto.BookmarkFolderDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface BookmarkFolderMapper {
    //    폴더 생성
    public void insert(BookmarkFolderDTO bookmarkFolderDTO);

    //    폴더명 수정
    public void update(BookmarkFolderDTO bookmarkFolderDTO);

    //    폴더 삭제
    public void delete(Long id);

    //    폴더 단건 조회
    public Optional<BookmarkFolderDTO> selectById(Long id);

    //    회원의 폴더 목록 조회
    public List<BookmarkFolderDTO> selectAllByMemberId(Long memberId);
}
