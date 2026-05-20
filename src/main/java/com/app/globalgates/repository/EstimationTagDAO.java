package com.app.globalgates.repository;

import com.app.globalgates.dto.EstimationTagDTO;
import com.app.globalgates.mapper.EstimationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class EstimationTagDAO {
    private final EstimationMapper estimationMapper;

    public void save(EstimationTagDTO estimationTagDTO) {
        estimationMapper.insertTag(estimationTagDTO);
    }

    public Optional<EstimationTagDTO> findByTagName(String tagName) {
        return estimationMapper.selectTagByName(tagName);
    }

    public List<EstimationTagDTO> findAllByEstimationId(Long estimationId) {
        return estimationMapper.selectAllTagsByEstimationId(estimationId);
    }

    public void saveRel(Long estimationId, Long tagId) {
        estimationMapper.insertTagRel(estimationId, tagId);
    }
}
