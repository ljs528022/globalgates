package com.app.globalgates.repository;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.domain.PostProductVO;
import com.app.globalgates.dto.PostProductDTO;
import com.app.globalgates.mapper.PostProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PostProductDAO {
    private final PostProductMapper postProductMapper;

    // 상품 전용 테이블 저장
    public void save(PostProductVO postProductVO) {
        postProductMapper.insert(postProductVO);
    }

//    특정 회원의 판매품목 목록 조회
    public List<PostProductDTO> findAllByMemberId(Long memberId) {
        return postProductMapper.selectAllByMemberId(memberId);
    }

//    특정 회원의 판매품목 목록 조회 (페이징)
    public List<PostProductDTO> findAllByMemberIdWithPaging(Criteria criteria, Long memberId) {
        return postProductMapper.selectAllByMemberIdWithPaging(criteria, memberId);
    }

//    추천 상품 조회
    public List<PostProductDTO> findRecommendProducts(Criteria criteria, Long memberId) {
        return postProductMapper.selectRecommendProducts(criteria, memberId);
    }

//    특정 회원의 상품 총 개수
    public int getTotalByMemberId(Long memberId) {
        return postProductMapper.selectTotalByMemberId(memberId);
    }

//    상품 작성자 조회
    // 컨트롤러는 인증 사용자 id만 알고 있으므로,
    // 실제 삭제 가능 여부 판단에 필요한 작성자 id 조회는 DAO가 맡는다.
    public Long findMemberIdByProductId(Long productId) {
        return postProductMapper.selectMemberIdByProductId(productId);
    }

//    조회된 상품 총 개수
    public int getTotal() {
        return postProductMapper.selectTotal();
    }
}
