package com.app.globalgates.mapper;

import com.app.globalgates.dto.FileDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface CommunityFileMapper {
    public void insert(@Param("id") Long id, @Param("communityId") Long communityId);
    public void delete(Long id);
    public Optional<FileDTO> selectByCommunityId(Long communityId);
    public List<FileDTO> selectByDeletedCommunities();
}
