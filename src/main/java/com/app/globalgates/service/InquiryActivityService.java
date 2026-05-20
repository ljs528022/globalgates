package com.app.globalgates.service;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.PostDTO;
import com.app.globalgates.dto.PostFileDTO;
import com.app.globalgates.dto.PostWithPagingDTO;
import com.app.globalgates.repository.InquiryActivityDAO;
import com.app.globalgates.repository.PostFileDAO;
import com.app.globalgates.repository.PostHashtagDAO;
import com.app.globalgates.util.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class InquiryActivityService {
    private final InquiryActivityDAO inquiryActivityDAO;
    private final PostHashtagDAO postHashtagDAO;
    private final PostFileDAO postFileDAO;

    public PostWithPagingDTO getList(int page, Long memberId, String startDate, String endDate) {
        Criteria criteria = new Criteria(page, inquiryActivityDAO.findTotal(memberId, startDate, endDate));
        List<PostDTO> posts = inquiryActivityDAO.findAll(criteria, memberId, startDate, endDate);

        criteria.setHasMore(posts.size() > criteria.getRowCount());
        if (criteria.isHasMore()) {
            posts.remove(posts.size() - 1);
        }

        posts.forEach(postDTO -> {
            postDTO.setHashtags(postHashtagDAO.findAllByPostId(postDTO.getId()));
            postDTO.setPostFiles(postFileDAO.findAllByPostId(postDTO.getId()));
            List<String> fileUrls = postDTO.getPostFiles().stream()
                    .map(PostFileDTO::getFilePath)
                    .collect(Collectors.toList());
            postDTO.setFileUrls(fileUrls);
            postDTO.setCreatedDatetime(DateUtils.toRelativeTime(postDTO.getCreatedDatetime()));
        });

        PostWithPagingDTO postWithPagingDTO = new PostWithPagingDTO();
        postWithPagingDTO.setPosts(posts);
        postWithPagingDTO.setCriteria(criteria);
        return postWithPagingDTO;
    }
}
