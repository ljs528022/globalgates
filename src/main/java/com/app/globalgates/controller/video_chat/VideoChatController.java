package com.app.globalgates.controller.video_chat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequiredArgsConstructor
@RequestMapping("/video-chat/**")
@Slf4j
public class VideoChatController {

    @GetMapping("/join")
    public String goToVideoChatPage() {
        return "video/video";
    }

}
