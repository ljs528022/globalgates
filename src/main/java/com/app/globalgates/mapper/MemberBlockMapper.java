package com.app.globalgates.mapper;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.BlockDTO;
import com.app.globalgates.dto.BlockWithPagingDTO;
import com.app.globalgates.dto.MemberDTO;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MemberBlockMapper {
    //  차단된 member 조회
    public List<BlockDTO>  selectAllByMemberIdWithPaging(@Param("criteria") Criteria criteria, @Param("memberId") Long memberId);

    //  member의 차단한 member 수
    public int selectTotalByMemberId(@Param("id") Long id);

}
