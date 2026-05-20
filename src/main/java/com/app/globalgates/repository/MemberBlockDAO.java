package com.app.globalgates.repository;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.BlockDTO;
import com.app.globalgates.dto.BlockWithPagingDTO;
import com.app.globalgates.mapper.MemberBlockMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class MemberBlockDAO {
    private final MemberBlockMapper memberBlockMapper;

    public List<BlockDTO> findAllByMemberIdWithPaging(Criteria criteria, Long memberId) {
        return memberBlockMapper.selectAllByMemberIdWithPaging(criteria, memberId);
    }

    public int getTotalByMemberId(Long id) {
        return memberBlockMapper.selectTotalByMemberId(id);
    }
}
