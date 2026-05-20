package com.app.globalgates.controller.mypage;

import com.app.globalgates.auth.JwtTokenProvider;
import com.app.globalgates.dto.FollowDTO;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.MemberProfileFileDTO;
import com.app.globalgates.repository.MemberProfileFileDAO;
import com.app.globalgates.service.FollowService;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.PostService;
import com.app.globalgates.service.S3Service;
import com.app.globalgates.service.SubscriptionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Controller
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/mypage/**")
public class MypageController {
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberService memberService;
    private final MemberProfileFileDAO memberProfileFileDAO;
    private final S3Service s3Service;
    private final FollowService followService;
    private final PostService postService;
    private final SubscriptionService subscriptionService;

    @Value("${google.maps.api-key:}")
    private String googleMapsApiKey;

    @GetMapping("/mypage")
    public String goToMypage(@RequestParam(required = false) Long memberId, HttpServletRequest request, Model model) {
        // 메인 페이지와 같은 방식으로 로그인 토큰에서 사용자 식별자를 꺼낸다.
        // 이렇게 해야 현재 로그인 사용자를 기준으로 내 페이지/상대 페이지를 구분할 수 있다.
        String token = jwtTokenProvider.parseTokenFromHeader(request);
        String loginId = jwtTokenProvider.getUsername(token);
        MemberDTO loginMember = memberService.getMember(loginId);

        // memberId가 없으면 내 페이지, 있으면 해당 회원의 페이지를 본다.
        Long pageMemberId = memberId != null ? memberId : loginMember.getId();
        boolean isOwner = loginMember.getId().equals(pageMemberId);

        // 템플릿은 항상 "현재 보고 있는 페이지 주인" 정보를 기준으로 렌더링해야 하므로
        // 상대 프로필에서는 로그인 사용자 대신 조회 대상을 바꿔 끼운다.
        MemberDTO member = isOwner
                ? loginMember
                : memberService.getMemberById(pageMemberId);

        if (!isOwner && (member.getMemberStatus() == null || !"active".equals(member.getMemberStatus().getValue()))) {
            return "redirect:/main/main";
        }

        // 상대 페이지의 상단 Approve 버튼은 첫 렌더에서 현재 팔로우 상태를 알아야
        // JS 연결 전에도 Approve/Approved 문구가 실제 상태와 어긋나지 않는다.
        boolean isFollowing = !isOwner && followService.getFollowings(loginMember.getId()).stream()
                .anyMatch(following -> following.getFollowingId().equals(pageMemberId));

        // 뱃지는 owner 여부와 무관하게 페이지 주인의 role + subscription tier 기준으로만 구분한다.
        // 활성 구독 row가 없으면 free로 보고 뱃지를 숨긴다.
        String subscriptionTier = subscriptionService.findByMemberId(member.getId())
                .map(subscription -> subscription.getTier().getValue())
                .orElse("free");

        // 프로필/배너 파일이 없을 때도 화면이 깨지지 않도록 기본 이미지를 먼저 둔다.
        String profileImageUrl = "/images/profile/default_image.png";
        String bannerImageUrl = "/images/profile/basic-banner.png";

        MemberProfileFileDTO profileFile = memberProfileFileDAO.findByMemberId(member.getId());
        MemberProfileFileDTO bannerFile = memberProfileFileDAO.findBannerByMemberId(member.getId());

        try {
            // DB에는 S3 key가 저장되어 있으므로 화면에서는 presigned url로 바꿔서 내려준다.
            if (profileFile != null && profileFile.getFileName() != null && !profileFile.getFileName().isEmpty()) {
                profileImageUrl = s3Service.getPresignedUrl(profileFile.getFileName(), Duration.ofMinutes(10));
            }

            if (bannerFile != null && bannerFile.getFileName() != null && !bannerFile.getFileName().isEmpty()) {
                bannerImageUrl = s3Service.getPresignedUrl(bannerFile.getFileName(), Duration.ofMinutes(10));
            }
        } catch (java.io.IOException e) {
            // presigned url 생성 실패 시에는 기본 이미지를 그대로 사용한다.
            member.setFileName(null);

        }

        // 마이페이지 상단의 커넥팅/커넥터 수는 현재 보고 있는 페이지 주인 기준으로 렌더링해야 한다.
        // follow 도메인에는 이미 팔로잉/팔로워 목록 조회가 있으므로,
        // 이번 단계에서는 count 전용 쿼리를 새로 만들지 않고 목록 크기만 사용해서 가장 가볍게 연결한다.
        int connectingCount = followService.getFollowings(member.getId()).size();
        int connectorCount = followService.getFollowers(member.getId()).size();
        int myPostCount = postService.getMyPostCount(member.getId());

        // 사이드바의 "내가 팔로우한 사업자들"은 전체 팔로잉 화면이 아니라 요약 영역이다.
        // 따라서 새 API나 별도 페이징 로직을 만들지 않고, 기존 follow 도메인의 팔로잉 목록을
        // 그대로 재사용하되 현재 더미 카드 개수와 맞춰 최근 2명만 잘라서 전달한다.
        List<FollowDTO> myFollowings = new ArrayList<>(
                followService.getFollowings(member.getId())
                        .stream()
                        .limit(2)
                        .toList()
        );

        // followMapper는 프로필 파일명을 raw S3 key 형태로 내려주므로,
        // mypage의 다른 이미지 처리와 동일하게 컨트롤러에서 presigned URL로 바꿔서 템플릿에 전달한다.
        // 이 가공은 화면 표현 전용이며 follow 저장/조회 로직 자체는 바꾸지 않는다.
        myFollowings.forEach(following -> {
            String profileFileName = following.getMemberProfileFileName();

            if (profileFileName == null || profileFileName.isBlank()) {
                following.setMemberProfileFileName("/images/profile/default_image.png");
                return;
            }

            try {
                following.setMemberProfileFileName(
                        s3Service.getPresignedUrl(profileFileName, Duration.ofMinutes(10))
                );
            } catch (java.io.IOException e) {
                // presigned URL 생성 실패가 mypage 전체 진입 실패로 이어지지 않도록
                // 해당 사용자 이미지에만 기본 이미지를 적용한다.
                following.setMemberProfileFileName("/images/profile/default_image.png");
            }
        });

        // 견적요청 모달의 작성자 아바타에 쓰일 로그인 사용자 프로필 이미지.
        // page 주인의 profileImageUrl과는 별개. 방문자(=작성자) 본인을 표시하기 위함이다.
        String loginMemberProfileImageUrl = "/images/profile/default_image.png";
        MemberProfileFileDTO loginProfileFile = memberProfileFileDAO.findByMemberId(loginMember.getId());
        if (loginProfileFile != null) {
            try {
                loginMemberProfileImageUrl = s3Service.getPresignedUrl(
                        loginProfileFile.getFileName(), Duration.ofMinutes(10));
            } catch (Exception ignored) {
                // 변환 실패 시 default_image.png 그대로 둠.
            }
        }
        // 헤더 사이드바가 loginMember.fileName 으로 프로필 이미지를 읽으므로 같이 박아둔다.
        loginMember.setFileName(loginMemberProfileImageUrl);

        // mypage 템플릿에서는 member + 이미지 url 모델을 같이 사용한다.
        model.addAttribute("member", member);
        model.addAttribute("isOwner", isOwner);
        model.addAttribute("isFollowing", isFollowing);
        model.addAttribute("loginMember", loginMember);
        model.addAttribute("loginMemberId", loginMember.getId());
        model.addAttribute("loginMemberProfileImageUrl", loginMemberProfileImageUrl);
        model.addAttribute("subscriptionTier", subscriptionTier);
        model.addAttribute("profileImageUrl", profileImageUrl);
        model.addAttribute("bannerImageUrl", bannerImageUrl);
        model.addAttribute("connectingCount", connectingCount);
        model.addAttribute("connectorCount", connectorCount);
        model.addAttribute("myPostCount", myPostCount);
        model.addAttribute("myFollowings", myFollowings);
        model.addAttribute("googleMapsApiKey", googleMapsApiKey);
        return "mypage/mypage";
    }
}
