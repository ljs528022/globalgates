package com.app.globalgates.mapper;

import com.app.globalgates.domain.chat.ChatRoomVO;
import com.app.globalgates.domain.video_chat.VideoChatVO;
import com.app.globalgates.dto.chat.ChatRoomDTO;
import com.app.globalgates.dto.video_chat.VideoChatDTO;
import com.app.globalgates.mapper.chat.ChatRoomMapper;
import com.app.globalgates.mapper.video_chat.VideoChatMapper;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;

@SpringBootTest
@Slf4j
public class VideoChatMapperTests {

    @Autowired
    private ChatRoomMapper chatRoomMapper;
    @Autowired
    private VideoChatMapper videoChatMapper;

    @Test
    public void testInsertVideoSession() {
        ChatRoomDTO chatRoomDTO = new ChatRoomDTO();
        chatRoomDTO.setTitle(null);
        chatRoomDTO.setSenderId(1L);
        chatRoomDTO.setInvitedId(4L);
        chatRoomMapper.insertConversation(chatRoomDTO);

        VideoChatDTO videoChatDTO = new VideoChatDTO();
        videoChatDTO.setConversationId(chatRoomDTO.getId());
        videoChatDTO.setCallerId(chatRoomDTO.getSenderId());
        videoChatDTO.setReceiverId(chatRoomDTO.getInvitedId());
        videoChatMapper.insertVideoSession(videoChatDTO.toVO());
    }

    @Test
    public void testSelectSession() {
        Long id = 1L;
        Optional<VideoChatVO> foundChat = videoChatMapper.selectSession(id);
        log.info("찾은 대화방 : {}", foundChat);
    }
}
