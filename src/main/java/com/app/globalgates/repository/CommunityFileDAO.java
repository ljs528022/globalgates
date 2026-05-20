package com.app.globalgates.repository;

import com.app.globalgates.dto.FileDTO;
import com.app.globalgates.mapper.CommunityFileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CommunityFileDAO {
    private final CommunityFileMapper communityFileMapper;

    public void save(Long fileId, Long communityId) {
        communityFileMapper.insert(fileId, communityId);
    }

    public void delete(Long id) {
        communityFileMapper.delete(id);
    }

    public Optional<FileDTO> findByCommunityId(Long communityId) {
        return communityFileMapper.selectByCommunityId(communityId);
    }

    public List<FileDTO> findByDeletedCommunities() {
        return communityFileMapper.selectByDeletedCommunities();
    }
}
