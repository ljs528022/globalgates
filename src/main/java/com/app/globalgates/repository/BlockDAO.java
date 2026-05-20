package com.app.globalgates.repository;

import com.app.globalgates.dto.BlockDTO;
import com.app.globalgates.mapper.BlockMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class BlockDAO {
    private final BlockMapper blockMapper;

    //    차단 추가
    public void save(BlockDTO blockDTO) {
        blockMapper.insert(blockDTO);
    }

    //    차단 해제
    public void delete(Long blockerId, Long blockedId) {
        blockMapper.delete(blockerId, blockedId);
    }

    //    차단 여부 조회
    public Optional<BlockDTO> findByBlockerIdAndBlockedId(Long blockerId, Long blockedId) {
        return blockMapper.selectByBlockerIdAndBlockedId(blockerId, blockedId);
    }

    //    차단 목록 조회
    public List<BlockDTO> findAllByBlockerId(Long blockerId) {
        return blockMapper.selectAllByBlockerId(blockerId);
    }

//    양방향 차단 여부 조회
    public boolean isBlockedEither(Long memberId1, Long memberId2) {
        return blockMapper.selectIsBlockedEither(memberId1, memberId2);
    }
}
