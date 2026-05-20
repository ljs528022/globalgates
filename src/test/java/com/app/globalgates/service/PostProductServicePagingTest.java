package com.app.globalgates.service;

import com.app.globalgates.dto.PostProductDTO;
import com.app.globalgates.dto.PostProductWithPagingDTO;
import com.app.globalgates.repository.CategoryDAO;
import com.app.globalgates.repository.PostDAO;
import com.app.globalgates.repository.PostFileDAO;
import com.app.globalgates.repository.PostHashtagDAO;
import com.app.globalgates.repository.PostProductDAO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostProductServicePagingTest {

    @Mock
    private PostProductDAO postProductDAO;

    @Mock
    private PostFileDAO postFileDAO;

    @Mock
    private PostHashtagDAO postHashtagDAO;

    @Mock
    private PostDAO postDAO;

    @Mock
    private CategoryDAO categoryDAO;

    @Mock
    private PostService postService;

    @InjectMocks
    private PostProductService postProductService;

    @Test
    void getMyProducts_returnsOnlyRowCountAndMarksHasMoreWhenExtraRowExists() {
        List<PostProductDTO> products = new ArrayList<>();

        // Criteria는 rowCount + 1개를 조회해서 hasMore 여부를 계산하므로,
        // 총 11개를 돌려주면 서비스는 마지막 1개를 잘라내고 10개만 반환해야 한다.
        for (long i = 1; i <= 11; i++) {
            PostProductDTO productDTO = new PostProductDTO();
            productDTO.setId(i);
            productDTO.setPostTitle("상품 " + i);
            productDTO.setCreatedDatetime("2026-03-27 10:00:00");
            products.add(productDTO);
        }

        when(postProductDAO.getTotalByMemberId(7L)).thenReturn(11);
        when(postProductDAO.findAllByMemberIdWithPaging(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.eq(7L)))
                .thenReturn(products);
        when(postFileDAO.findAllByPostId(anyLong())).thenReturn(Collections.emptyList());
        when(postHashtagDAO.findAllByPostId(anyLong())).thenReturn(Collections.emptyList());

        PostProductWithPagingDTO result = postProductService.getMyProducts(1, 7L);

        assertEquals(10, result.getPosts().size());
        assertTrue(result.getCriteria().isHasMore());
        assertEquals(1, result.getCriteria().getPage());

        verify(postProductDAO).getTotalByMemberId(7L);
    }
}
