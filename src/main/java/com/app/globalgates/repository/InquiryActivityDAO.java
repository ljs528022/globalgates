package com.app.globalgates.repository;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.PostDTO;
import com.app.globalgates.mapper.InquiryActivityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class InquiryActivityDAO {
    private final InquiryActivityMapper inquiryActivityMapper;

    public List<PostDTO> findAll(Criteria criteria, Long memberId, String startDate, String endDate) {
        return inquiryActivityMapper.selectAll(criteria, memberId, startDate, endDate);
    }

    public int findTotal(Long memberId, String startDate, String endDate) {
        return inquiryActivityMapper.selectTotal(memberId, startDate, endDate);
    }
}
