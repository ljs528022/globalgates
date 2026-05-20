package com.app.globalgates.repository;

import com.app.globalgates.dto.NewsDTO;
import com.app.globalgates.mapper.AdminNewsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class AdminNewsDAO {
    private final AdminNewsMapper adminNewsMapper;

    public List<NewsDTO> findAll() {
        return adminNewsMapper.selectAdminNews();
    }

    public Long findPostIdById(Long id) {
        return adminNewsMapper.selectPostIdById(id);
    }

    public void save(NewsDTO newsDTO) {
        adminNewsMapper.insertAdminNews(newsDTO);
    }

    public int update(NewsDTO newsDTO) {
        return adminNewsMapper.updateAdminNews(newsDTO);
    }

    public int delete(Long id) {
        return adminNewsMapper.deleteAdminNews(id);
    }
}
