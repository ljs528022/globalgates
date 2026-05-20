package com.app.globalgates.controller.news;

import com.app.globalgates.aop.annotation.LogStatusWithReturn;
import com.app.globalgates.auth.CustomUserDetails;
import com.app.globalgates.dto.NewsDTO;
import com.app.globalgates.service.NewsBookmarkService;
import com.app.globalgates.service.NewsLikeService;
import com.app.globalgates.service.NewsReplyService;
import com.app.globalgates.service.NewsService;
import com.app.globalgates.util.DateUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Optional;

@Controller
@RequiredArgsConstructor
@RequestMapping("/news")
@Slf4j
public class NewsController {

    private final NewsService newsService;
    private final NewsLikeService newsLikeService;
    private final NewsBookmarkService newsBookmarkService;
    private final NewsReplyService newsReplyService;

    //    뉴스 상세 페이지
    @LogStatusWithReturn
    @GetMapping("/detail/{id}")
    public String goToNewsDetailPage(@PathVariable Long id,
                                     @AuthenticationPrincipal CustomUserDetails userDetails,
                                     Model model) {
        Optional<NewsDTO> result = newsService.getNews(id);
        if (result.isEmpty()) {
            return "redirect:/explore?tab=news";
        }

        NewsDTO news = result.get();
        String baseTime = news.getPublishedAt() != null && !news.getPublishedAt().isEmpty()
                ? news.getPublishedAt()
                : news.getCreatedDatetime();

        Long memberId = userDetails != null ? userDetails.getId() : null;
        boolean liked = memberId != null && newsLikeService.getLike(memberId, id).isPresent();
        boolean bookmarked = memberId != null && newsBookmarkService.getBookmark(memberId, id).isPresent();
        int likeCount = newsLikeService.getLikeCount(id);
        int bookmarkCount = newsBookmarkService.getBookmarkCount(id);
        int replyCount = newsReplyService.getReplyCount(id);

        model.addAttribute("news", news);
        model.addAttribute("createdRelative", DateUtils.toRelativeTime(baseTime));
        model.addAttribute("liked", liked);
        model.addAttribute("bookmarked", bookmarked);
        model.addAttribute("likeCount", likeCount);
        model.addAttribute("bookmarkCount", bookmarkCount);
        model.addAttribute("replyCount", replyCount);
        model.addAttribute("memberId", memberId);
        return "news/news";
    }
}
