package com.app.globalgates.controller.main;

import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.auth.JwtTokenProvider;
import com.app.globalgates.dto.BlockDTO;
import com.app.globalgates.dto.MemberDTO;
import com.app.globalgates.dto.MemberProfileFileDTO;
import com.app.globalgates.dto.PostDTO;
import com.app.globalgates.dto.ReportDTO;
import com.app.globalgates.dto.SubscriptionDTO;
import com.app.globalgates.service.BlockService;
import com.app.globalgates.service.MemberService;
import com.app.globalgates.service.PostService;
import com.app.globalgates.service.ReportService;
import com.app.globalgates.service.S3Service;
import com.app.globalgates.service.SubscriptionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/main")
@RequiredArgsConstructor
public class MainController {
    private final PostService postService;
    private final S3Service s3Service;
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberService memberService;
    private final BlockService blockService;
    private final ReportService reportService;
    private final SubscriptionService subscriptionService;

//    메인 페이지
    @GetMapping("/main")
    public String goToMain(HttpServletRequest request, Model model) {
        String token = jwtTokenProvider.parseTokenFromHeader(request);
        String loginId = jwtTokenProvider.getUsername(token);
        MemberDTO member = memberService.getMember(loginId);

        // 프로필 이미지조회
        MemberProfileFileDTO profileFile = memberService.getProfileFile(member.getId());
        if (profileFile != null && profileFile.getFileName() != null) {
            try {
                member.setFileName(s3Service.getPresignedUrl(profileFile.getFileName(), Duration.ofMinutes(10)));
            } catch (IOException e) {
                member.setFileName(null);
            }
        }

        // 구독 tier 조회 (광고 빈도 제어용)
        String tier = "free";
        SubscriptionDTO subscription = subscriptionService.findByMemberId(member.getId()).orElse(null);
        if (subscription != null) {
            tier = subscription.getTier().getValue();
        }

        model.addAttribute("member", member);
        model.addAttribute("tier", tier);
        return "main/main";
    }

//    게시글 상세 페이지
    @GetMapping("/post/detail/{id}")
    public String goToPostDetail(@PathVariable Long id, @RequestParam(required = false) Long memberId, HttpServletRequest request, Model model) {
        MemberDTO loginMember = getLoginMemberWithProfile(request);
        if (memberId == null) {
            memberId = loginMember.getId();
        }

        PostDTO postDTO = postService.getDetail(id, memberId);
        convertPostFilesUrl(postDTO);
        convertProfileUrl(postDTO);
        convertProductImageUrl(postDTO);

        model.addAttribute("post", postDTO);
        model.addAttribute("memberId", memberId);
        model.addAttribute("loginMember", loginMember);
        model.addAttribute("member", loginMember);
        return "post-detailed/post-detailed";
    }

//    상세에서 차단하면 메인으로
    @PostMapping("/post/detail/block")
    public RedirectView blockFromDetail(BlockDTO blockDTO) {
        blockService.block(blockDTO);
        return new RedirectView("/main/main");
    }

//    상세에서 신고하면 메인으로
    @PostMapping("/post/detail/report")
    public RedirectView reportFromDetail(ReportDTO reportDTO) {
        reportService.report(reportDTO);
        return new RedirectView("/main/main");
    }

//    상세에서 삭제하면 메인으로
    @PostMapping("/post/detail/delete/{id}")
    public RedirectView deleteFromDetail(@PathVariable Long id,
                                         @AuthenticationPrincipal CustomUserDetails userDetails) {
        postService.delete(id, userDetails.getId());
        return new RedirectView("/main/main");
    }

//    JWT에서 로그인 멤버를 꺼내고 프로필 이미지 presigned URL까지 세팅
    private MemberDTO getLoginMemberWithProfile(HttpServletRequest request) {
        String token = jwtTokenProvider.parseTokenFromHeader(request);
        String loginId = jwtTokenProvider.getUsername(token);
        MemberDTO member = memberService.getMember(loginId);

        MemberProfileFileDTO profileFile = memberService.getProfileFile(member.getId());
        if (profileFile != null && profileFile.getFileName() != null) {
            try {
                member.setFileName(s3Service.getPresignedUrl(profileFile.getFileName(), Duration.ofMinutes(10)));
            } catch (IOException e) {
                member.setFileName(null);
            }
        }
        return member;
    }

//    게시물 첨부파일 presigned URL 변환
    private void convertPostFilesUrl(PostDTO post) {
        if (post.getPostFiles() != null) {
            post.getPostFiles().forEach(pf -> {
                try {
                    pf.setFilePath(s3Service.getPresignedUrl(pf.getFilePath(), Duration.ofMinutes(10)));
                } catch (IOException e) {
                    throw new RuntimeException("Presigned URL 생성 실패", e);
                }
            });
        }
    }

//    첨부 상품 이미지 presigned URL 변환
    private void convertProductImageUrl(PostDTO post) {
        if (post.getProductImage() != null) {
            try {
                post.setProductImage(s3Service.getPresignedUrl(post.getProductImage(), Duration.ofMinutes(10)));
            } catch (IOException e) {
                post.setProductImage(null);
            }
        }
    }

//    게시물 작성자 프로필 presigned URL 변환
    private void convertProfileUrl(PostDTO post) {
        if (post.getMemberProfileFileName() != null) {
            try {
                post.setMemberProfileFileName(s3Service.getPresignedUrl(post.getMemberProfileFileName(), Duration.ofMinutes(10)));
            } catch (IOException e) {
                post.setMemberProfileFileName(null);
            }
        }
    }

//    S3 Presigned URL 변환
    private List<String> convertToPresignedUrl(List<String> s3Keys) {
        if (s3Keys == null || s3Keys.isEmpty()) return List.of();
        return s3Keys.stream()
                .map(key -> {
                    try {
                        return s3Service.getPresignedUrl(key, Duration.ofMinutes(10));
                    } catch (IOException e) {
                        throw new RuntimeException("Presigned URL 생성 실패", e);
                    }
                })
                .collect(Collectors.toList());
    }
}
