package com.app.globalgates.mapper;

import com.app.globalgates.dto.NewsDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface NewsMapper {
    //    뉴스 전체 조회 (최신순)
    public List<NewsDTO> selectAll();

    //    뉴스 단건 조회
    public Optional<NewsDTO> selectById(Long id);

    //    [메인]에서 쓰임 뉴스 2개 조회
    public List<NewsDTO> selectLatestInMain();

}
