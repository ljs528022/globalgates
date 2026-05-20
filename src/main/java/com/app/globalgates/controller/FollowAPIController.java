package com.app.globalgates.controller;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.common.exception.FollowNotFoundException;
import com.app.globalgates.dto.FollowDTO;
import com.app.globalgates.repository.FollowDAO;
import com.app.globalgates.service.FollowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/follows/**")
@RequiredArgsConstructor
@Slf4j
public class FollowAPIController {
    private final FollowService followService;

    // 팔로우 했는지 체크하고 없으면 추가, 있으면 제거
    @GetMapping("follow")
    public ResponseEntity<?> follow(Long memberId, @AuthenticationPrincipal CustomUserDetails userDetails) {
        Optional<FollowDTO> followDTO = followService.checkFollow(userDetails.getId(), memberId);
        if(followDTO.isPresent()) {
            followService.unfollow(followDTO.get().getFollowerId(), followDTO.get().getFollowingId());
            return ResponseEntity.ok("해당 유저를 언팔로우 했습니다");
        } else {
            FollowDTO newFollow = new FollowDTO();
            newFollow.setFollowerId(userDetails.getId());
            newFollow.setFollowingId(memberId);
            followService.follow(newFollow);
            return ResponseEntity.ok("해당 유저를 팔로우 했습니다.");
        }
    }
}
