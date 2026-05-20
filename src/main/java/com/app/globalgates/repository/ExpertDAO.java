
package com.app.globalgates.repository;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.chat.ChatExpertDTO;
import com.app.globalgates.dto.ExpertDTO;
import com.app.globalgates.mapper.ExpertMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class ExpertDAO {
    private final ExpertMapper expertMapper;

    //    메인에 중앙탭에서 전문가 목록
    public List<ExpertDTO> findAll(Criteria criteria, Long memberId) {
        return expertMapper.selectAll(criteria, memberId);
    }

    //    전문가 명수
    public int findTotal() {
        return expertMapper.selectTotal();
    }

    //    채팅 연결된 전문가 목록 조회
    public List<ChatExpertDTO> findConnectedForChat(Long memberId, String keyword) {
        return expertMapper.selectConnectedForChat(memberId, keyword);
    }
}