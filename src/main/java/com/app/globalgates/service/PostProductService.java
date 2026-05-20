package com.app.globalgates.service;

import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.*;
import com.app.globalgates.repository.CategoryDAO;
import com.app.globalgates.repository.PostDAO;
import com.app.globalgates.repository.PostFileDAO;
import com.app.globalgates.repository.PostHashtagDAO;
import com.app.globalgates.repository.PostProductDAO;
import com.app.globalgates.util.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class PostProductService {
    private final PostProductDAO postProductDAO;
    private final PostFileDAO postFileDAO;
    private final PostHashtagDAO postHashtagDAO;
    private final PostDAO postDAO;
    private final CategoryDAO categoryDAO;
    private final PostService postService;

    // 상품 등록 본체 저장
    public void save(PostProductDTO postProductDTO) {
        // categoryName으로 category id를 찾는다.
        postProductDTO.setProductCategoryId(resolveCategoryId(postProductDTO.getCategoryName()));

        // 1. 먼저 tbl_post 저장
        // memberId는 여기서만 사용되고 tbl_post_product에는 저장되지 않는다.
        PostDTO postDTO = postProductDTO.toPostDTO();
        postDAO.save(postDTO);

        // 생성된 post id를 상품 id로 그대로 사용한다.
        postProductDTO.setId(postDTO.getId());

        // 2. 같은 id로 tbl_post_product 저장
        postProductDAO.save(postProductDTO.toPostProductVO());

        // 3. 태그가 있으면 관계를 저장한다.
        saveTags(postProductDTO);
    }

    // 파일 저장은 기존 PostService.saveFile() 흐름을 그대로 재사용한다.
    public void saveFile(Long postId, MultipartFile image, String s3Key) {
        postService.saveFile(postId, image, s3Key);
    }

    // 실패 시 기존 삭제 흐름처럼 tbl_post 상태를 inactive로 바꾼다.
    public void delete(Long id) {
        postDAO.delete(id);
    }

    // 상품 삭제
    public void delete(Long productId, Long memberId) {
        // 삭제 요청이 들어온 상품의 실제 작성자 id를 먼저 조회한다.
        // 조회 결과가 없으면:
        // 1. 존재하지 않는 상품이거나
        // 2. 이미 inactive 처리된 상품이므로
        // 삭제 요청을 계속 진행하지 않는다.
        Long foundMemberId = postProductDAO.findMemberIdByProductId(productId);

        if (foundMemberId == null) {
            throw new IllegalArgumentException("삭제할 상품이 존재하지 않습니다.");
        }

        // 프론트에서 productId를 임의로 바꿔 보내더라도
        // 여기서 현재 로그인 사용자와 실제 작성자를 다시 비교해
        // 본인 상품 삭제만 허용한다.
        if (!foundMemberId.equals(memberId)) {
            throw new IllegalArgumentException("본인 상품만 삭제할 수 있습니다.");
        }

        // 실제 삭제는 기존 게시글 삭제 로직과 동일하게 soft delete 로 처리한다.
        // 즉 tbl_post_product row를 직접 지우지 않고,
        // tbl_post.post_status 를 inactive 로 바꿔
        // 현재 목록 조회 쿼리에서 자동으로 제외되게 만든다.
        postDAO.delete(productId);
    }

    public String getTodayPath() {
        return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
    }

    private Long resolveCategoryId(String categoryName) {
        if (categoryName == null || categoryName.isBlank()) {
            return null;
        }

        CategoryDTO categoryDTO = categoryDAO.findByCategoryName(categoryName.trim())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다."));

        return categoryDTO.getId();
    }

    private void saveTags(PostProductDTO postProductDTO) {
        if (postProductDTO.getPostTag() == null || postProductDTO.getPostTag().isBlank()) {
            return;
        }

        Arrays.stream(postProductDTO.getPostTag().split(","))
                .map(String::trim)
                .filter(tag -> !tag.isBlank())
                .distinct()
                .forEach(tag -> {
                    PostHashtagDTO hashtagDTO = postHashtagDAO.findByTagName(tag)
                            .orElseGet(() -> {
                                PostHashtagDTO newTag = new PostHashtagDTO();
                                newTag.setTagName(tag);
                                postHashtagDAO.save(newTag);
                                return postHashtagDAO.findByTagName(tag).orElseThrow();
                            });

                    postHashtagDAO.saveRel(postProductDTO.getId(), hashtagDTO.getId());
                });
    }

//    자신의 판매품목 목록 조회 (페이징)
    public PostProductWithPagingDTO getMyProducts(int page, Long memberId) {
        PostProductWithPagingDTO postProductWithPagingDTO = new PostProductWithPagingDTO();
        Criteria criteria = new Criteria(page, postProductDAO.getTotalByMemberId(memberId));

        // 기존 추천상품 페이징과 같은 방식으로 rowCount + 1개를 먼저 조회한다.
        // 마지막 1개는 "다음 페이지 존재 여부"를 판단하는 용도라서, hasMore가 true면 제거한다.
        List<PostProductDTO> products = postProductDAO.findAllByMemberIdWithPaging(criteria, memberId).stream()
                .map(productDTO -> {
                    List<PostFileDTO> images = new ArrayList<>(postFileDAO.findAllByPostId(productDTO.getId()));
                    if(!images.isEmpty()) {
                        productDTO.setPostFiles(
                                images.stream()
                                        .map(PostFileDTO::getFilePath)
                                        .collect(Collectors.toList())
                        );
                    }
                    productDTO.setHashtags(postHashtagDAO.findAllByPostId(productDTO.getId()));
                    return productDTO;
                }).collect(Collectors.toList());

        criteria.setHasMore(products.size() > criteria.getRowCount());
        postProductWithPagingDTO.setCriteria(criteria);

        if(criteria.isHasMore()) {
            products.remove(products.size() - 1);
        }

        products.forEach(product -> {
            product.setCreatedDatetime(DateUtils.toRelativeTime(product.getCreatedDatetime()));
        });

        postProductWithPagingDTO.setPosts(products);
        return postProductWithPagingDTO;
    }

//    자신의 판매품목 목록 조회
    public List<PostProductDTO> getMyProducts(Long memberId) {
        List<PostProductDTO> products = postProductDAO.findAllByMemberId(memberId);

        products.forEach(product -> {
            product.setPostFiles(postFileDAO.findAllByPostId(product.getId())
                            .stream()
                            .map(PostFileDTO::getFilePath)
                            .collect(Collectors.toList())
            );
            product.setHashtags(postHashtagDAO.findAllByPostId(product.getId()));
        });

        return products;
    }

//    추천 상품 목록 조회
    @LogStatusWithReturn
    public PostProductWithPagingDTO getRecommendProducts(int page, Long memberId) {
        PostProductWithPagingDTO postProductWithPagingDTO = new PostProductWithPagingDTO();
        Criteria criteria = new Criteria(page, postProductDAO.getTotal());

        List<PostProductDTO> products = postProductDAO.findRecommendProducts(criteria, memberId).stream()
                .map(productDTO -> {
                    List<PostFileDTO> images = new ArrayList<>(postFileDAO.findAllByPostId(productDTO.getId()));
                    if(!images.isEmpty()) {
                        productDTO.setPostFiles(
                                images.stream()
                                        .map(PostFileDTO::getFilePath)
                                        .collect(Collectors.toList())

                        );
                    }
                    return productDTO;
                }).collect(Collectors.toList());

        criteria.setHasMore(products.size() > criteria.getRowCount());
        postProductWithPagingDTO.setCriteria(criteria);

        if(criteria.isHasMore()) {
            products.remove(products.size() - 1);
        }

        products.forEach(product -> {
            product.setCreatedDatetime(DateUtils.toRelativeTime(product.getCreatedDatetime()));
        });
        postProductWithPagingDTO.setPosts(products);

        return postProductWithPagingDTO;
    }
}
