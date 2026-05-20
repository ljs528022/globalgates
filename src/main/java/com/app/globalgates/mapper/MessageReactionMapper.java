package com.app.globalgates.mapper;

import com.app.globalgates.dto.MessageReactionDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface MessageReactionMapper {
//    반응 추가
    void insert(MessageReactionDTO messageReactionDTO);
//    반응 삭제
    void delete(@Param("messageId") Long messageId,
                @Param("memberId") Long memberId,
                @Param("emoji") String emoji);
//    메시지별 반응 조회
    List<MessageReactionDTO> selectAllByMessageId(@Param("messageId") Long messageId);

//    메시지가 속한 대화방 조회
    Optional<Long> selectConversationIdByMessageId(@Param("messageId") Long messageId);
}
