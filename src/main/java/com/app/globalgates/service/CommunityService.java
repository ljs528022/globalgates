package com.app.globalgates.service;

import com.app.globalgates.aop.annotation.LogStatus;
import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.common.enumeration.FileContentType;
import com.app.globalgates.common.pagination.Criteria;
import com.app.globalgates.domain.CommunityVO;
import com.app.globalgates.dto.*;
import com.app.globalgates.mapper.CommunityFeaturesMapper;
import com.app.globalgates.repository.*;
import com.app.globalgates.util.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
@Slf4j
public class CommunityService {
    private final CommunityDAO communityDAO;
    private final CommunityMemberDAO communityMemberDAO;
    private final CommunityFileDAO communityFileDAO;
    private final FileDAO fileDAO;
    private final S3Service s3Service;
    private final PostDAO postDAO;
    private final PostFileDAO postFileDAO;
    private final PostHashtagDAO postHashtagDAO;
    private final ReplyProductRelDAO replyProductRelDAO;
    private final CommunityFeaturesMapper communityFeaturesMapper;
    private final WebClient ragWebClient;

    // reload 호출 합치기(coalesce) — 짧은 시간에 여러 번 트리거되어도 "진행 중 1건 + 대기 1건"
    // 으로 압축. 진행 중일 때 들어온 모든 추가 트리거는 pending 으로 모이고, 진행이 끝난 직후
    // 한 번만 더 호출돼 가장 최신 DB 상태를 반영한다.
    private final AtomicBoolean reloadInFlight = new AtomicBoolean(false);
    private final AtomicBoolean reloadPending = new AtomicBoolean(false);

    // ──────────────────────────────────────
    // 커뮤니티 CRUD
    // ──────────────────────────────────────


    @CacheEvict(value = "community:list", allEntries = true)
    @LogStatus
    public void createCommunity(CommunityDTO dto, MultipartFile coverImage) throws IOException {
        communityDAO.save(dto);

        String uploadedS3Key = null;
        try {
            if (coverImage != null && !coverImage.isEmpty()) {
                uploadedS3Key = saveCoverImageAndReturnKey(dto.getId(), coverImage);
            }

            // 생성자를 일반 멤버로 등록 (커뮤니티 관리 권한은 creator_id로 판별)
            CommunityMemberDTO creatorMember = new CommunityMemberDTO();
            creatorMember.setCommunityId(dto.getId());
            creatorMember.setMemberId(dto.getCreatorId());
            creatorMember.setMemberRole("member");
            communityMemberDAO.save(creatorMember);

            // AI 추천 보강 데이터 upsert — 신규 커뮤니티가 추천 데이터셋에 포함되도록
            communityFeaturesMapper.upsertTags(dto.getId(), dto.getTags());
        } catch (Exception e) {
            // DB 롤백은 @Transactional이 처리. S3 파일만 수동 삭제 (보상 패턴)
            if (uploadedS3Key != null) {
                try { s3Service.deleteFile(uploadedS3Key); } catch (Exception s3e) { log.error("S3 보상 삭제 실패: {}", uploadedS3Key, s3e); }
            }
            throw e;
        }

        // 트랜잭션 커밋 후 FastAPI 데이터셋 hot reload — 다음 추천 요청부터 신규 커뮤니티 반영
        scheduleRecommendReloadAfterCommit();
    }

    @Caching(evict = {
            @CacheEvict(value = "community", allEntries = true),
            @CacheEvict(value = "community:list", allEntries = true),
            @CacheEvict(value = "community:post:list", allEntries = true),
            @CacheEvict(value = "community:member:list", allEntries = true)
    })
    public void updateCommunity(Long communityId, CommunityVO vo, MultipartFile coverImage, Long requesterId) throws IOException {
        CommunityDTO community = communityDAO.findById(communityId, requesterId)
                .orElseThrow(() -> new IllegalStateException("커뮤니티를 찾을 수 없습니다."));

        if (!requesterId.equals(community.getCreatorId())) {
            throw new IllegalStateException("커뮤니티 생성자만 수정할 수 있습니다.");
        }

        // 이름/설명 등 필드가 있을 때만 UPDATE 실행
        if (vo.getCommunityName() != null) {
            CommunityVO updateVo = CommunityVO.builder()
                    .id(communityId)
                    .communityName(vo.getCommunityName())
                    .description(vo.getDescription())
                    .categoryId(vo.getCategoryId())
                    .build();
            communityDAO.update(updateVo);
        }

        if (coverImage != null && !coverImage.isEmpty()) {
            communityFileDAO.findByCommunityId(communityId).ifPresent(existingFile -> {
                s3Service.deleteFile(existingFile.getFilePath());
                communityFileDAO.delete(existingFile.getId());
                fileDAO.delete(existingFile.getId());
            });
            saveCoverImage(communityId, coverImage);
        }

        // 태그가 함께 전달된 경우에만 features upsert + reload — 커버만 교체하는 케이스는 추천에 영향 없음
        if (vo.getTags() != null) {
            communityFeaturesMapper.upsertTags(communityId, vo.getTags());
            scheduleRecommendReloadAfterCommit();
        } else if (vo.getCommunityName() != null || vo.getDescription() != null) {
            // 이름/설명이 변경된 경우에도 추천 텍스트가 바뀌므로 reload 만 트리거
            scheduleRecommendReloadAfterCommit();
        }
    }

    @Caching(evict = {
            @CacheEvict(value = "community", allEntries = true),
            @CacheEvict(value = "community:list", allEntries = true),
            @CacheEvict(value = "community:member:list", allEntries = true),
            @CacheEvict(value = "community:post:list", allEntries = true)
    })
    @LogStatus
    public void deleteCommunity(Long communityId, Long requesterId) {
        CommunityDTO community = communityDAO.findById(communityId, requesterId)
                .orElseThrow(() -> new IllegalStateException("커뮤니티를 찾을 수 없습니다."));

        if (!requesterId.equals(community.getCreatorId())) {
            throw new IllegalStateException("커뮤니티 생성자만 삭제할 수 있습니다.");
        }

        communityDAO.softDelete(communityId);

        // softDelete → community_status='inactive' 이므로 다음 reload 때 데이터셋에서 자동 제외
        scheduleRecommendReloadAfterCommit();
    }

    @Cacheable(value = "community", key = "'detail:' + #communityId + ':member:' + #memberId")
    public CommunityDTO getCommunityDetail(Long communityId, Long memberId) throws IOException {
        CommunityDTO result = communityDAO.findById(communityId, memberId)
                .orElseThrow(() -> new IllegalStateException("커뮤니티를 찾을 수 없습니다."));

        if (result.getCoverFilePath() != null && !result.getCoverFilePath().startsWith("/uploads/")) {
            result.setCoverFilePath(s3Service.getPresignedUrl(result.getCoverFilePath(), Duration.ofMinutes(10)));
        }

        return result;
    }

    @Cacheable(value = "community:list", key = "'my:page:' + #page + ':member:' + #memberId")
    public CommunityWithPagingDTO getMyCommunities(int page, Long memberId) throws IOException {
        int total = communityDAO.getCountByMemberId(memberId);
        Criteria criteria = new Criteria(page, total);
        List<CommunityDTO> list = communityDAO.findByMemberId(memberId, criteria);

        criteria.setHasMore(list.size() > criteria.getRowCount());
        if (criteria.isHasMore()) list.remove(list.size() - 1);

        convertCoverUrls(list);

        CommunityWithPagingDTO result = new CommunityWithPagingDTO();
        result.setCommunities(list);
        result.setCriteria(criteria);
        return result;
    }

    @Cacheable(value = "community:list", key = "'explore:page:' + #page + ':member:' + #memberId")
    public CommunityWithPagingDTO getExploreCommunities(int page, Long memberId) throws IOException {
        log.info("[탐색 커뮤니티 목록 조회] page={}, memberId={} (캐시 미스 → DB 조회)", page, memberId);
        int total = memberId != null ? communityDAO.getCountExcludeJoined(memberId) : communityDAO.getCount();
        log.info("[탐색 커뮤니티 목록] 미가입 커뮤니티 총 {}개", total);
        Criteria criteria = new Criteria(page, total);
        List<CommunityDTO> list = memberId != null ? communityDAO.findAllExcludeJoined(memberId, criteria) : communityDAO.findAll(criteria);

        criteria.setHasMore(list.size() > criteria.getRowCount());
        if (criteria.isHasMore()) list.remove(list.size() - 1);

        convertCoverUrls(list);
        log.info("[탐색 커뮤니티 목록] 반환 {}건, hasMore={}", list.size(), criteria.isHasMore());

        CommunityWithPagingDTO result = new CommunityWithPagingDTO();
        result.setCommunities(list);
        result.setCriteria(criteria);
        return result;
    }

    @Cacheable(value = "community:list", key = "'category:' + #categoryId + ':page:' + #page")
    public CommunityWithPagingDTO getCommunitiesByCategory(Long categoryId, int page) throws IOException {
        int total = communityDAO.getCountByCategory(categoryId);
        Criteria criteria = new Criteria(page, total);
        List<CommunityDTO> list = communityDAO.findByCategory(categoryId, criteria);

        criteria.setHasMore(list.size() > criteria.getRowCount());
        if (criteria.isHasMore()) list.remove(list.size() - 1);

        convertCoverUrls(list);

        CommunityWithPagingDTO result = new CommunityWithPagingDTO();
        result.setCommunities(list);
        result.setCriteria(criteria);
        return result;
    }

    // ──────────────────────────────────────
    // 커뮤니티 검색
    // ──────────────────────────────────────

    // 검색은 키워드 조합이 무한하여 캐시 무한 증가 위험 — 캐싱 비적용
    public CommunityWithPagingDTO searchCommunities(String keyword, int page) throws IOException {
        int total = communityDAO.getCountByKeyword(keyword);
        Criteria criteria = new Criteria(page, total);
        List<CommunityDTO> list = communityDAO.findByKeyword(keyword, criteria);

        criteria.setHasMore(list.size() > criteria.getRowCount());
        if (criteria.isHasMore()) list.remove(list.size() - 1);

        convertCoverUrls(list);

        CommunityWithPagingDTO result = new CommunityWithPagingDTO();
        result.setCommunities(list);
        result.setCriteria(criteria);
        return result;
    }

    // ──────────────────────────────────────
    // 멤버십
    // ──────────────────────────────────────

    @Caching(evict = {
            @CacheEvict(value = "community", allEntries = true),
            @CacheEvict(value = "community:member:list", allEntries = true),
            @CacheEvict(value = "community:list", allEntries = true),
            @CacheEvict(value = "community:post:list", allEntries = true)
    })
    @LogStatus
    public void joinCommunity(Long communityId, Long memberId) {
        log.info("[커뮤니티 가입 시작] communityId={}, memberId={}", communityId, memberId);

        communityMemberDAO.findByIds(communityId, memberId).ifPresent(m -> {
            log.warn("[커뮤니티 가입 실패] 이미 가입됨 communityId={}, memberId={}", communityId, memberId);
            throw new IllegalStateException("이미 가입한 커뮤니티입니다.");
        });

        CommunityMemberDTO dto = new CommunityMemberDTO();
        dto.setCommunityId(communityId);
        dto.setMemberId(memberId);
        dto.setMemberRole("member");
        communityMemberDAO.save(dto);
        log.info("[커뮤니티 가입 완료] communityId={}, memberId={}, role=member → DB INSERT 성공", communityId, memberId);
    }

    @Caching(evict = {
            @CacheEvict(value = "community", allEntries = true),
            @CacheEvict(value = "community:member:list", allEntries = true),
            @CacheEvict(value = "community:list", allEntries = true),
            @CacheEvict(value = "community:post:list", allEntries = true)
    })
    @LogStatus
    public void leaveCommunity(Long communityId, Long memberId) {
        log.info("[커뮤니티 탈퇴 시작] communityId={}, memberId={}", communityId, memberId);

        communityMemberDAO.findByIds(communityId, memberId)
                .orElseThrow(() -> {
                    log.warn("[커뮤니티 탈퇴 실패] 가입하지 않음 communityId={}, memberId={}", communityId, memberId);
                    return new IllegalStateException("가입하지 않은 커뮤니티입니다.");
                });

        CommunityDTO community = communityDAO.findById(communityId, memberId)
                .orElseThrow(() -> new IllegalStateException("커뮤니티를 찾을 수 없습니다."));

        if (memberId.equals(community.getCreatorId())) {
            log.warn("[커뮤니티 탈퇴 실패] 생성자 탈퇴 시도 communityId={}, memberId={}", communityId, memberId);
            throw new IllegalStateException("커뮤니티 생성자는 탈퇴할 수 없습니다. 커뮤니티를 삭제해주세요.");
        }

        communityMemberDAO.delete(communityId, memberId);
        log.info("[커뮤니티 탈퇴 완료] communityId={}, memberId={} → DB DELETE 성공", communityId, memberId);
    }

    @Cacheable(value = "community:member:list", key = "'community:' + #communityId + ':page:' + #page")
    public CommunityMemberWithPagingDTO getCommunityMembers(Long communityId, int page) throws IOException {
        int total = communityMemberDAO.getCountByCommunityId(communityId);
        Criteria criteria = new Criteria(page, total);
        List<CommunityMemberDTO> list = communityMemberDAO.findByCommunityId(communityId, criteria);

        criteria.setHasMore(list.size() > criteria.getRowCount());
        if (criteria.isHasMore()) {
            list.remove(list.size() - 1);
        }

        for (CommunityMemberDTO member : list) {
            if (member.getMemberProfileFilePath() != null && !member.getMemberProfileFilePath().startsWith("/uploads/")) {
                member.setMemberProfileFilePath(
                        s3Service.getPresignedUrl(member.getMemberProfileFilePath(), Duration.ofMinutes(10))
                );
            }
        }

        CommunityMemberWithPagingDTO result = new CommunityMemberWithPagingDTO();
        result.setMembers(list);
        result.setCriteria(criteria);
        return result;
    }

    @CacheEvict(value = {"community", "community:member:list", "community:list"}, allEntries = true)
    public void updateMemberRole(Long communityId, Long targetMemberId, String role, Long requesterId) {
        if (role == null || !List.of("admin", "moderator", "member").contains(role)) {
            throw new IllegalStateException("유효하지 않은 역할입니다: " + role);
        }

        CommunityDTO community = communityDAO.findById(communityId, requesterId)
                .orElseThrow(() -> new IllegalStateException("커뮤니티를 찾을 수 없습니다."));

        if (!requesterId.equals(community.getCreatorId())) {
            throw new IllegalStateException("커뮤니티 생성자만 역할을 변경할 수 있습니다.");
        }

        communityMemberDAO.updateRole(communityId, targetMemberId, role);
    }

    @CacheEvict(value = {"community", "community:member:list", "community:list", "community:post:list"}, allEntries = true)
    public void kickMember(Long communityId, Long targetMemberId, Long requesterId) {
        CommunityDTO community = communityDAO.findById(communityId, requesterId)
                .orElseThrow(() -> new IllegalStateException("커뮤니티를 찾을 수 없습니다."));

        if (!requesterId.equals(community.getCreatorId())) {
            throw new IllegalStateException("커뮤니티 생성자만 추방할 수 있습니다.");
        }

        if (targetMemberId.equals(community.getCreatorId())) {
            throw new IllegalStateException("생성자는 추방할 수 없습니다.");
        }

        communityMemberDAO.delete(communityId, targetMemberId);
    }

    // ──────────────────────────────────────
    // 커뮤니티 게시글
    // ──────────────────────────────────────

    @CacheEvict(value = {"post:list", "post", "page:search", "community:post:list", "community"}, allEntries = true)
    @LogStatus
    public void writeCommunityPost(PostDTO postDTO, List<MultipartFile> files, Long communityId) throws IOException {
        communityMemberDAO.findByIds(communityId, postDTO.getMemberId())
                .orElseThrow(() -> new IllegalStateException("커뮤니티 멤버만 게시글을 작성할 수 있습니다."));

        postDTO.setCommunityId(communityId);
        postDAO.save(postDTO);

        if (files != null) {
            String todayPath = "community/" + LocalDate.now();
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String s3Key = s3Service.uploadFile(file, todayPath);

                    FileDTO fileDTO = new FileDTO();
                    fileDTO.setOriginalName(file.getOriginalFilename());
                    fileDTO.setFileName(s3Key.substring(s3Key.lastIndexOf("/") + 1));
                    fileDTO.setFilePath(s3Key);
                    fileDTO.setFileSize(file.getSize());
                    String ct = file.getContentType();
                    fileDTO.setContentType(ct != null && ct.contains("image") ? FileContentType.IMAGE
                            : ct != null && ct.contains("video") ? FileContentType.VIDEO : FileContentType.ETC);
                    fileDAO.save(fileDTO);

                    PostFileDTO postFileDTO = new PostFileDTO();
                    postFileDTO.setFileId(fileDTO.getId());
                    postFileDTO.setPostId(postDTO.getId());
                    postFileDAO.save(postFileDTO.toPostFileVO());
                }
            }
        }

        if (postDTO.getHashtags() != null) {
            postDTO.getHashtags().forEach(hashtagDTO -> {
                postHashtagDAO.save(hashtagDTO);
                if (hashtagDTO.getId() == null) {
                    hashtagDTO.setId(postHashtagDAO.findByTagName(hashtagDTO.getTagName())
                            .orElseThrow().getId());
                }
                postHashtagDAO.saveRel(postDTO.getId(), hashtagDTO.getId());
            });
        }

        // 판매글 첨부: 클라이언트가 productPostId를 전달한 경우 매핑 저장
        if (postDTO.getProductPostId() != null) {
            ReplyProductRelDTO rel = new ReplyProductRelDTO();
            rel.setReplyPostId(postDTO.getId());
            rel.setProductPostId(postDTO.getProductPostId());
            replyProductRelDAO.save(rel);
        }
    }

    // 홈 피드: 내 커뮤니티 게시글
    @Cacheable(value = "community:post:list", key = "'myFeed:page:' + #page + ':member:' + #memberId")
    public PostWithPagingDTO getMyCommunitiesFeed(int page, Long memberId) {
        int total = communityDAO.getMyCommunitiesPostsCount(memberId);
        Criteria criteria = new Criteria(page, total);
        List<PostDTO> list = communityDAO.findMyCommunitiesPosts(memberId, criteria);

        criteria.setHasMore(list.size() > criteria.getRowCount());
        if (criteria.isHasMore()) list.remove(list.size() - 1);

        enrichPostFiles(list);

        PostWithPagingDTO result = new PostWithPagingDTO();
        result.setPosts(list);
        result.setCriteria(criteria);
        return result;
    }

    // 탐색 피드: 미가입 커뮤니티 생성자 게시글 (카테고리 필터 지원)
    @Cacheable(value = "community:post:list", key = "'explore:page:' + #page + ':member:' + #memberId + ':cat:' + #categoryId")
    public PostWithPagingDTO getExploreFeed(int page, Long memberId, Long categoryId) {
        log.info("[탐색 피드 조회] page={}, memberId={}, categoryId={} (캐시 미스 → DB 조회)", page, memberId, categoryId);
        int total = communityDAO.getExplorePostsCount(memberId, categoryId);
        log.info("[탐색 피드] 미가입 커뮤니티 게시글 총 {}개", total);
        Criteria criteria = new Criteria(page, total);
        List<PostDTO> list = communityDAO.findExplorePosts(memberId, categoryId, criteria);

        criteria.setHasMore(list.size() > criteria.getRowCount());
        if (criteria.isHasMore()) list.remove(list.size() - 1);

        enrichPostFiles(list);
        log.info("[탐색 피드] 반환 {}건, hasMore={}", list.size(), criteria.isHasMore());

        PostWithPagingDTO result = new PostWithPagingDTO();
        result.setPosts(list);
        result.setCriteria(criteria);
        return result;
    }

    @Cacheable(value = "community:post:list", key = "'community:' + #communityId + ':page:' + #page + ':member:' + #memberId + ':type:' + #type")
    public PostWithPagingDTO getCommunityPosts(Long communityId, int page, Long memberId, String type) {
        int total = communityDAO.getPostsCountByCommunityId(communityId);
        Criteria criteria = new Criteria(page, total);
        List<PostDTO> list = communityDAO.findPostsByCommunityId(communityId, memberId, criteria, type);

        criteria.setHasMore(list.size() > criteria.getRowCount());
        if (criteria.isHasMore()) list.remove(list.size() - 1);

        enrichPostFiles(list);

        PostWithPagingDTO result = new PostWithPagingDTO();
        result.setPosts(list);
        result.setCriteria(criteria);
        return result;
    }

    // ──────────────────────────────────────
    // 검색
    // ──────────────────────────────────────

    // 검색은 키워드 조합이 무한하여 캐시 무한 증가 위험 — 캐싱 비적용
    public PostWithPagingDTO searchCommunityPosts(Long communityId, String keyword, String type, int page, Long memberId) {
        int total = communityDAO.getPostsCountBySearch(communityId, keyword);
        Criteria criteria = new Criteria(page, total);
        List<PostDTO> list = communityDAO.findPostsBySearch(communityId, keyword, type, memberId, criteria);

        criteria.setHasMore(list.size() > criteria.getRowCount());
        if (criteria.isHasMore()) list.remove(list.size() - 1);

        enrichPostFiles(list);

        PostWithPagingDTO result = new PostWithPagingDTO();
        result.setPosts(list);
        result.setCriteria(criteria);
        return result;
    }

    // ──────────────────────────────────────
    // 미디어 탭
    // ──────────────────────────────────────

    @Cacheable(value = "community:post:list", key = "'media:' + #communityId + ':page:' + #page")
    public CommunityMediaWithPagingDTO getCommunityMedia(Long communityId, int page) throws IOException {
        int total = communityDAO.getMediaCountByCommunityId(communityId);
        Criteria criteria = new Criteria(page, total);
        List<PostFileDTO> list = communityDAO.findMediaByCommunityId(communityId, criteria);

        criteria.setHasMore(list.size() > criteria.getRowCount());
        if (criteria.isHasMore()) {
            list.remove(list.size() - 1);
        }

        for (PostFileDTO file : list) {
            if (file.getFilePath() != null && !file.getFilePath().startsWith("/uploads/")) {
                file.setFilePath(s3Service.getPresignedUrl(file.getFilePath(), Duration.ofMinutes(10)));
            }
        }

        CommunityMediaWithPagingDTO result = new CommunityMediaWithPagingDTO();
        result.setFiles(list);
        result.setCriteria(criteria);
        return result;
    }

    // ──────────────────────────────────────
    // 내부 유틸
    // ──────────────────────────────────────

    // 트랜잭션 커밋 후 FastAPI /reload 를 fire-and-forget 으로 호출.
    // 실패해도 사용자 흐름(생성/수정/삭제 완료) 은 절대 막지 않는다 — 다음 reload 호출 또는
    // 부팅 시점 재로드 때 자동으로 데이터셋이 갱신된다.
    private void scheduleRecommendReloadAfterCommit() {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            // 트랜잭션 밖에서 호출된 경우 — 즉시 비동기 실행
            triggerRecommendReload();
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                triggerRecommendReload();
            }
        });
    }

    private void triggerRecommendReload() {
        // 이미 진행 중인 reload 가 있으면 "끝나면 한 번 더 돌려달라" 는 표시만 남기고 즉시 종료.
        // 동시 트리거를 모두 1건의 후속 호출로 합쳐 reload 폭주를 막는다.
        if (!reloadInFlight.compareAndSet(false, true)) {
            reloadPending.set(true);
            return;
        }
        // WebClient subscribe 는 reactor-netty EventLoop 가 처리 — boundedElastic 으로 따로
        // 넘길 필요 없음 (blocking 작업이 아님). disposable 은 fire-and-forget 이라 보관하지 않는다.
        ragWebClient.post()
                .uri("/api/community/reload")
                .retrieve()
                .bodyToMono(Void.class)
                .timeout(Duration.ofSeconds(3))
                .doOnError(e -> log.warn("[추천 reload 실패] cause={}", e.getMessage()))
                .onErrorResume(e -> Mono.empty())
                .doFinally(signal -> {
                    reloadInFlight.set(false);
                    // 진행 중에 새로 들어온 트리거가 있었다면 한 번만 추가 호출 — 최신 DB 반영.
                    if (reloadPending.compareAndSet(true, false)) {
                        triggerRecommendReload();
                    }
                })
                .subscribe();
    }

    private void saveCoverImage(Long communityId, MultipartFile coverImage) throws IOException {
        saveCoverImageAndReturnKey(communityId, coverImage);
    }

    private String saveCoverImageAndReturnKey(Long communityId, MultipartFile coverImage) throws IOException {
        String todayPath = "community/" + LocalDate.now();
        String s3Key = s3Service.uploadFile(coverImage, todayPath);

        FileDTO fileDTO = new FileDTO();
        fileDTO.setOriginalName(coverImage.getOriginalFilename());
        fileDTO.setFileName(s3Key.substring(s3Key.lastIndexOf("/") + 1));
        fileDTO.setFilePath(s3Key);
        fileDTO.setFileSize(coverImage.getSize());
        String coverCt = coverImage.getContentType();
        fileDTO.setContentType(coverCt != null && coverCt.contains("image") ? FileContentType.IMAGE
                : FileContentType.ETC);
        fileDAO.save(fileDTO);

        communityFileDAO.save(fileDTO.getId(), communityId);
        return s3Key;
    }

    private void convertCoverUrls(List<CommunityDTO> list) throws IOException {
        for (CommunityDTO dto : list) {
            if (dto.getCoverFilePath() != null && !dto.getCoverFilePath().startsWith("/uploads/")) {
                dto.setCoverFilePath(s3Service.getPresignedUrl(dto.getCoverFilePath(), Duration.ofMinutes(10)));
            }
        }
    }

    // 게시글 목록의 첨부파일을 S3 presigned URL로 변환 + 날짜 상대시간 변환 (batch 조회로 N+1 방지)
    private void enrichPostFiles(List<PostDTO> posts) {
        if (posts.isEmpty()) return;

        // 1. 날짜 상대시간 변환
        posts.forEach(p -> p.setCreatedDatetime(DateUtils.toRelativeTime(p.getCreatedDatetime())));

        // 2. 첨부파일 일괄 조회 (N+1 방지)
        List<Long> postIds = posts.stream().map(PostDTO::getId).collect(Collectors.toList());
        List<PostFileDTO> allFiles = postFileDAO.findAllByPostIds(postIds);

        // 3. postId별로 그룹핑
        Map<Long, List<PostFileDTO>> fileMap = allFiles.stream()
                .collect(Collectors.groupingBy(PostFileDTO::getPostId));

        // 4. 각 게시글에 파일 세팅 + presigned URL 변환 + 프로필 이미지 URL 변환
        posts.forEach(postDTO -> {
            // 프로필 이미지 presigned URL 변환 (로컬 경로는 변환 생략)
            if (postDTO.getMemberProfileFileName() != null
                    && !postDTO.getMemberProfileFileName().startsWith("http")
                    && !postDTO.getMemberProfileFileName().startsWith("/uploads/")) {
                try {
                    postDTO.setMemberProfileFileName(
                            s3Service.getPresignedUrl(postDTO.getMemberProfileFileName(), Duration.ofMinutes(10)));
                } catch (IOException e) {
                    log.error("프로필 Presigned URL 생성 실패: {}", postDTO.getMemberProfileFileName(), e);
                }
            }

            List<PostFileDTO> files = fileMap.getOrDefault(postDTO.getId(), List.of());
            files.forEach(pf -> {
                if (pf.getFilePath() != null && !pf.getFilePath().startsWith("/uploads/")) {
                    try {
                        pf.setFilePath(s3Service.getPresignedUrl(pf.getFilePath(), Duration.ofMinutes(10)));
                    } catch (IOException e) {
                        log.error("Presigned URL 생성 실패: {}", pf.getFilePath(), e);
                    }
                }
            });
            postDTO.setPostFiles(files);
            postDTO.setFileUrls(files.stream().map(PostFileDTO::getFilePath).collect(Collectors.toList()));
        });
    }
}
