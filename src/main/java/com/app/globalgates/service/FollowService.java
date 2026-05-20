package com.app.globalgates.service;

import com.app.globalgates.common.enumeration.NotificationType;
import com.app.globalgates.dto.FollowDTO;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.NotificationDTO;
import com.app.globalgates.repository.BlockDAO;
import com.app.globalgates.repository.FollowDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class FollowService {
    private final FollowDAO followDAO;
    private final BlockDAO blockDAO;
    private final NotificationService notificationService;

    //    팔로우 추가
    @CacheEvict(value = {"member", "post", "post:list", "expert:list"}, allEntries = true)
    public void follow(FollowDTO followDTO) {
        log.info("팔로우 시도 followerId: {}, followingId: {}", followDTO.getFollowerId(), followDTO.getFollowingId());
        if (blockDAO.isBlockedEither(followDTO.getFollowerId(), followDTO.getFollowingId())) {
            log.info("차단 관계라 팔로우 불가");
            return;
        }
        if (followDAO.findByFollowerIdAndFollowingId(followDTO.getFollowerId(), followDTO.getFollowingId()).isPresent()) {
            log.info("이미 팔로우 중");
            return;
        }
        followDAO.save(followDTO);
        log.info("팔로우 저장 완료");

        NotificationDTO noti = new NotificationDTO();
        noti.setRecipientId(followDTO.getFollowingId());
        noti.setSenderId(followDTO.getFollowerId());
        noti.setNotificationType(NotificationType.CONNECT);
        noti.setTitle("팔로우");
        noti.setContent("회원님을 팔로우하기 시작했습니다.");
        noti.setTargetId(followDTO.getFollowerId());
        noti.setTargetType("member");
        notificationService.createNotification(noti);
    }

    //    팔로우 해제
    @CacheEvict(value = {"member", "post", "post:list", "expert:list"}, allEntries = true)
    public void unfollow(Long followerId, Long followingId) {
        followDAO.delete(followerId, followingId);
    }

    //    팔로우 여부 조회
    public Optional<FollowDTO> checkFollow(Long followerId, Long followingId) {
        return followDAO.findByFollowerIdAndFollowingId(followerId, followingId);
    }

    //    팔로워 목록 (나를 팔로우한 사람들)
    public List<FollowDTO> getFollowers(Long followingId) {
        return followDAO.findAllFollowers(followingId);
    }

    //    팔로잉 목록 (내가 팔로우한 사람들)
    public List<FollowDTO> getFollowings(Long followerId) {
        return followDAO.findAllFollowings(followerId);
    }

    //    팔로우하면 좋을 회원 3명 (팔로우 추천)
    public List<MemberDTO> getUnfollowedMembers(Long memberId) {
        return followDAO.findUnfollowedMembers(memberId);
    }
}
