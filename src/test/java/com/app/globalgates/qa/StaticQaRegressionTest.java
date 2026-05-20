package com.app.globalgates.qa;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class StaticQaRegressionTest {

    private static String read(String path) throws IOException {
        return Files.readString(Path.of(path));
    }

    @Test
    void communityMainReportSendsReportDtoShapeAndAwaitsResponse() throws IOException {
        String script = read("src/main/resources/static/js/community/event.js");

        assertThat(script).contains("reporterId");
        assertThat(script).contains("targetId");
        assertThat(script).contains("targetType: \"post\"");
        assertThat(script).contains("if (!res.ok)");
    }

    @Test
    void chatServiceAcceptsEmptySuccessfulResponses() throws IOException {
        String script = read("src/main/resources/static/js/chat/service.js");

        assertThat(script).contains("const text = await response.text()");
        assertThat(script).contains("text ? JSON.parse(text) : null");
    }

    @Test
    void exploreNewsListRendersAllAdminNewsFields() throws IOException {
        String script = read("src/main/resources/static/js/explore/layout.js");

        assertThat(script).contains("news.newsCategory");
        assertThat(script).contains("news.newsType");
        assertThat(script).contains("news.newsContent");
        assertThat(script).contains("news.newsSourceUrl");
    }

    @Test
    void bookmarkPageCanMoveNewsBookmarksToFolders() throws IOException {
        String service = read("src/main/resources/static/js/bookmark/service.js");
        String event = read("src/main/resources/static/js/bookmark/event.js");

        assertThat(service).contains("getByMemberAndNews");
        assertThat(service).contains("addNews");
        assertThat(service).contains("moveNewsFolder");
        assertThat(event).contains("activeShareBookmarkType");
        assertThat(event).contains("BookmarkService.moveNewsFolder");
    }
}
