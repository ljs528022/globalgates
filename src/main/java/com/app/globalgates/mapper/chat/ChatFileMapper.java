package com.app.globalgates.mapper.chat;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ChatFileMapper {
    void insert(@Param("fileId") Long fileId, @Param("messageId") Long messageId);

//    파일이 회원이 참여한 대화방에 속하는지 검증 (다운로드/미리보기 권한)
    boolean selectIsFileAccessible(@Param("fileId") Long fileId,
                                   @Param("memberId") Long memberId);
}
