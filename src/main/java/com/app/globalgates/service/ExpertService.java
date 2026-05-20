package com.app.globalgates.service;

import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.chat.ChatExpertDTO;
import com.app.globalgates.dto.ExpertDTO;
import com.app.globalgates.dto.ExpertWithPagingDTO;
import com.app.globalgates.repository.ExpertDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class ExpertService {
    private final ExpertDAO expertDAO;

    //    전문가 목록 조회
    @Cacheable(value="expert:list", key="'page:'+#page+':member:'+#memberId")
    @LogStatusWithReturn
    public ExpertWithPagingDTO getList(int page, Long memberId) {
        Criteria criteria = new Criteria(page, expertDAO.findTotal());
        List<ExpertDTO> experts = expertDAO.findAll(criteria, memberId);

        criteria.setHasMore(experts.size() > criteria.getRowCount());
        if (criteria.isHasMore()) experts.remove(experts.size() - 1);

        experts.forEach(expert -> {
            if (expert.getFollowerIntro() != null) {
                expert.setFollowerIntro(expert.getFollowerIntro() + " 님이 팔로우합니다");
            }
        });

        ExpertWithPagingDTO expertWithPagingDTO = new ExpertWithPagingDTO();
        expertWithPagingDTO.setExperts(experts);
        expertWithPagingDTO.setCriteria(criteria);
        return expertWithPagingDTO;
    }

    //    채팅 연결된 전문가 목록 조회
    @LogStatusWithReturn
    public List<ChatExpertDTO> getConnectedExpertsForChat(Long memberId, String keyword) {
        String normalizedKeyword = keyword == null ? null : keyword.trim();
        if (normalizedKeyword != null && normalizedKeyword.isEmpty()) {
            normalizedKeyword = null;
        }
        return expertDAO.findConnectedForChat(memberId, normalizedKeyword);
    }
}