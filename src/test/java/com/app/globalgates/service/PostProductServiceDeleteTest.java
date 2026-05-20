package com.app.globalgates.service;

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

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PostProductServiceDeleteTest {

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
    void delete_deletesProductWhenAuthenticatedMemberOwnsIt() {
        when(postProductDAO.findMemberIdByProductId(31L)).thenReturn(7L);

        postProductService.delete(31L, 7L);

        verify(postDAO).delete(31L);
    }
}
