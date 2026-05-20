package com.app.globalgates.service;

import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.dto.FriendsDTO;
import com.app.globalgates.dto.FriendsWithPagingDTO;
import com.app.globalgates.repository.FriendsDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class FriendsService {
    private final FriendsDAO friendsDAO;
    private final S3Service s3Service;

    public FriendsWithPagingDTO getList(int page, Long memberId, Long categoryId) {
        log.info("들어옴1 getList, page: {}, memberId: {}, categoryId: {}", page, memberId, categoryId);
        Criteria criteria = new Criteria(page, friendsDAO.findTotal(memberId, categoryId));
        List<FriendsDTO> friends = friendsDAO.findAll(criteria, memberId, categoryId);

        applyHasMore(criteria, friends);

        friends.forEach(friend -> {
            if (friend.getFollowerIntro() != null) {
                friend.setFollowerIntro(friend.getFollowerIntro() + " 님이 팔로우합니다");
            }
        });
        convertProfileUrls(friends);

        return wrap(friends, criteria);
    }

    public FriendsWithPagingDTO getFollowersList(int page, Long profileId, Long viewerId) {
        log.info("들어옴1 getFollowersList, page: {}, profileId: {}, viewerId: {}", page, profileId, viewerId);
        int total = friendsDAO.findTotalFollowers(profileId, viewerId);
        Criteria criteria = new Criteria(page, total);
        List<FriendsDTO> friends = friendsDAO.findAllFollowers(criteria, profileId, viewerId);

        applyHasMore(criteria, friends);
        convertProfileUrls(friends);

        FriendsWithPagingDTO result = wrap(friends, criteria);
        result.setTotal(total);
        return result;
    }

    public FriendsWithPagingDTO getFollowingsList(int page, Long profileId, Long viewerId) {
        log.info("들어옴1 getFollowingsList, page: {}, profileId: {}, viewerId: {}", page, profileId, viewerId);
        int total = friendsDAO.findTotalFollowings(profileId, viewerId);
        Criteria criteria = new Criteria(page, total);
        List<FriendsDTO> friends = friendsDAO.findAllFollowings(criteria, profileId, viewerId);

        applyHasMore(criteria, friends);
        convertProfileUrls(friends);

        FriendsWithPagingDTO result = wrap(friends, criteria);
        result.setTotal(total);
        return result;
    }

    public int getFollowersCount(Long profileId, Long viewerId) {
        return friendsDAO.findTotalFollowers(profileId, viewerId);
    }

    public int getFollowingsCount(Long profileId, Long viewerId) {
        return friendsDAO.findTotalFollowings(profileId, viewerId);
    }

    private void applyHasMore(Criteria criteria, List<FriendsDTO> friends) {
        criteria.setHasMore(friends.size() > criteria.getRowCount());
        if (criteria.isHasMore()) friends.remove(friends.size() - 1);
    }

    private void convertProfileUrls(List<FriendsDTO> friends) {
        friends.forEach(friend -> {
            if (friend.getMemberProfileFileName() != null
                    && !friend.getMemberProfileFileName().startsWith("http")
                    && !friend.getMemberProfileFileName().startsWith("/uploads/")) {
                try {
                    log.info("들어옴2 presigned URL 변환, filePath: {}", friend.getMemberProfileFileName());
                    friend.setMemberProfileFileName(
                            s3Service.getPresignedUrl(friend.getMemberProfileFileName(), Duration.ofMinutes(10)));
                } catch (IOException e) {
                    log.error("프로필 Presigned URL 생성 실패: {}", friend.getMemberProfileFileName(), e);
                    friend.setMemberProfileFileName(null);
                }
            }
        });
    }

    private FriendsWithPagingDTO wrap(List<FriendsDTO> friends, Criteria criteria) {
        FriendsWithPagingDTO result = new FriendsWithPagingDTO();
        result.setFriends(friends);
        result.setCriteria(criteria);
        return result;
    }
}
