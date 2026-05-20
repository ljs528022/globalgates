package com.app.globalgates.controller.friends;

import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.dto.CategoryDTO;
import com.app.globalgates.dto.FriendsWithPagingDTO;
import com.app.globalgates.repository.CategoryDAO;
import com.app.globalgates.service.FriendsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
@Slf4j
public class FriendsAPIController implements FriendsAPIControllerDocs {
    private final FriendsService friendsService;
    private final CategoryDAO categoryDAO;

    @GetMapping("/list/{page}")
    @LogStatusWithReturn
    public FriendsWithPagingDTO getList(@PathVariable int page, @RequestParam Long memberId, @RequestParam(required = false) Long categoryId) {
        log.info("친구 추천 목록 조회 — page: {}, memberId: {}, categoryId: {}", page, memberId, categoryId);
        return friendsService.getList(page, memberId, categoryId);
    }

    @GetMapping("/categories")
    @LogStatusWithReturn
    public List<CategoryDTO> getCategories() {
        log.info("카테고리 목록 조회");
        return categoryDAO.findAll();
    }

    @GetMapping("/followers/{page}")
    @LogStatusWithReturn
    public FriendsWithPagingDTO getFollowers(@PathVariable int page,
                                             @RequestParam Long profileId,
                                             @RequestParam Long viewerId) {
        log.info("커넥터 목록 조회 — page: {}, profileId: {}, viewerId: {}", page, profileId, viewerId);
        return friendsService.getFollowersList(page, profileId, viewerId);
    }

    @GetMapping("/followings/{page}")
    @LogStatusWithReturn
    public FriendsWithPagingDTO getFollowings(@PathVariable int page,
                                              @RequestParam Long profileId,
                                              @RequestParam Long viewerId) {
        log.info("커넥팅 목록 조회 — page: {}, profileId: {}, viewerId: {}", page, profileId, viewerId);
        return friendsService.getFollowingsList(page, profileId, viewerId);
    }
}
