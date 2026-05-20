package com.app.globalgates.mapper;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.PostDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface InquiryActivityMapper {
    List<PostDTO> selectAll(@Param("criteria") Criteria criteria,
                            @Param("memberId") Long memberId,
                            @Param("startDate") String startDate,
                            @Param("endDate") String endDate);

    int selectTotal(@Param("memberId") Long memberId,
                    @Param("startDate") String startDate,
                    @Param("endDate") String endDate);
}
