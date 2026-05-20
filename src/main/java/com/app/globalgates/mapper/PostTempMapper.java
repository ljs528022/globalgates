package com.app.globalgates.mapper;

import com.app.globalgates.dto.PostTempDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface PostTempMapper {
//    임시저장 저장
    public void insert(PostTempDTO postTempDTO);

//    단건 조회
    public Optional<PostTempDTO> selectById(Long id);

//    회원의 임시저장 목록 조회
    public List<PostTempDTO> selectAllByMemberId(Long memberId);

//    개별 삭제
    public void delete(Long id);

//    회원 전체 삭제
    public void deleteAllByMemberId(Long memberId);
}
