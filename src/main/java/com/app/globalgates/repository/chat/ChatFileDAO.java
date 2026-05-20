package com.app.globalgates.repository.chat;

import com.app.globalgates.mapper.chat.ChatFileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ChatFileDAO {
    private final ChatFileMapper chatFileMapper;

    public void save(Long fileId, Long messageId) {
        chatFileMapper.insert(fileId, messageId);
    }

//    파일이 회원이 참여한 대화방에 속하는지 (다운로드/미리보기 권한 검증)
    public boolean isAccessibleByMember(Long fileId, Long memberId) {
        return chatFileMapper.selectIsFileAccessible(fileId, memberId);
    }
}
