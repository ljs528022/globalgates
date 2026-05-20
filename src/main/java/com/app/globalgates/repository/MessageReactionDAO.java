package com.app.globalgates.repository;

import com.app.globalgates.dto.MessageReactionDTO;
import com.app.globalgates.mapper.MessageReactionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MessageReactionDAO {
    private final MessageReactionMapper messageReactionMapper;

//    반응 추가
    public MessageReactionDTO save(MessageReactionDTO messageReactionDTO) {
        messageReactionMapper.insert(messageReactionDTO);
        return messageReactionDTO;
    }

//    반응 삭제
    public void delete(Long messageId, Long memberId, String emoji) {
        messageReactionMapper.delete(messageId, memberId, emoji);
    }

//    메시지별 반응 조회
    public List<MessageReactionDTO> findAllByMessageId(Long messageId) {
        return messageReactionMapper.selectAllByMessageId(messageId);
    }

//    메시지가 속한 대화방 조회
    public Optional<Long> findConversationIdByMessageId(Long messageId) {
        return messageReactionMapper.selectConversationIdByMessageId(messageId);
    }
}
