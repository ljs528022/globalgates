
package com.app.globalgates.mapper;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.chat.ChatExpertDTO;
import com.app.globalgates.dto.ExpertDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ExpertMapper {
    //    전문가 목록 조회
    public List<ExpertDTO> selectAll(@Param("criteria") Criteria criteria, @Param("memberId") Long memberId);

    //    전문가 명수
    public int selectTotal();

    //    채팅 연결된 전문가 목록 조회
    List<ChatExpertDTO> selectConnectedForChat(@Param("memberId") Long memberId, @Param("keyword") String keyword);
}