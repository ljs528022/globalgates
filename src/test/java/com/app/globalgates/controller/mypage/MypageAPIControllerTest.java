package com.app.globalgates.controller.mypage;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.PostWithPagingDTO;
import com.app.globalgates.dto.PostProductWithPagingDTO;
import com.app.globalgates.service.PostProductService;
import com.app.globalgates.service.PostService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MypageAPIControllerTest {

    @Mock
    private PostProductService postProductService;
    @Mock
    private PostService postService;

    @InjectMocks
    private MypageAPIController mypageAPIController;

    @Test
    void getMyProducts_returnsPagingDataForAuthenticatedMember() {
        MemberDTO memberDTO = new MemberDTO();
        memberDTO.setId(7L);

        CustomUserDetails userDetails = new CustomUserDetails(memberDTO, "user@example.com");
        PostProductWithPagingDTO pagingDTO = new PostProductWithPagingDTO();

        when(postProductService.getMyProducts(1, 7L)).thenReturn(pagingDTO);

        PostProductWithPagingDTO result = mypageAPIController.getMyProducts(1, userDetails);

        assertSame(pagingDTO, result);
        verify(postProductService).getMyProducts(1, 7L);
    }

    @Test
    void deleteProduct_deletesOnlyAuthenticatedMembersProduct() {
        MemberDTO memberDTO = new MemberDTO();
        memberDTO.setId(7L);

        CustomUserDetails userDetails = new CustomUserDetails(memberDTO, "user@example.com");

        ResponseEntity<?> responseEntity = mypageAPIController.deleteProduct(31L, userDetails);

        assertEquals(Map.of("message", "상품 삭제 성공"), responseEntity.getBody());
        verify(postProductService).delete(31L, 7L);
    }

    @Test
    void getProfileProducts_returnsPagingDataForViewedMember() {
        PostProductWithPagingDTO pagingDTO = new PostProductWithPagingDTO();

        when(postProductService.getMyProducts(2, 15L)).thenReturn(pagingDTO);

        PostProductWithPagingDTO result = mypageAPIController.getProfileProducts(2, 15L);

        assertSame(pagingDTO, result);
        verify(postProductService).getMyProducts(2, 15L);
    }

    @Test
    void getProfilePosts_returnsPagingDataForViewedMember() {
        PostWithPagingDTO pagingDTO = new PostWithPagingDTO();

        when(postService.getMyPosts(3, 21L)).thenReturn(pagingDTO);

        PostWithPagingDTO result = mypageAPIController.getProfilePosts(3, 21L);

        assertSame(pagingDTO, result);
        verify(postService).getMyPosts(3, 21L);
    }
}
