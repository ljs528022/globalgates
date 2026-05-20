package com.app.globalgates.mapper;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.EstimationDTO;
import com.app.globalgates.dto.EstimationExpertDTO;
import com.app.globalgates.dto.EstimationTagDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface EstimationMapper {
    void insert(EstimationDTO estimationDTO);

    int selectTotal(@Param("receiverId") Long receiverId);

    List<EstimationDTO> selectAll(@Param("criteria") Criteria criteria, @Param("receiverId") Long receiverId);

    int selectRequestedTotal(@Param("requesterId") Long requesterId);

    List<EstimationDTO> selectRequestedAll(@Param("criteria") Criteria criteria, @Param("requesterId") Long requesterId);

    Optional<EstimationDTO> selectById(Long id);

    int updateStatus(@Param("id") Long id,
                     @Param("receiverId") Long receiverId,
                     @Param("status") String status);

    List<EstimationExpertDTO> selectExpertsForRequest(@Param("memberId") Long memberId,
                                                      @Param("keyword") String keyword,
                                                      @Param("offset") int offset);

    void insertTag(EstimationTagDTO estimationTagDTO);

    Optional<EstimationTagDTO> selectTagByName(String tagName);

    List<EstimationTagDTO> selectAllTagsByEstimationId(Long estimationId);

    void insertTagRel(@Param("estimationId") Long estimationId, @Param("tagId") Long tagId);
}
