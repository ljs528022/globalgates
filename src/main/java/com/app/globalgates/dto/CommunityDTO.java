package com.app.globalgates.dto;

import com.app.globalgates.domain.CommunityVO;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
public class CommunityDTO implements Serializable {

    private Long id;
    private Long creatorId;
    @Size(min = 3, max = 30, message = "커뮤니티 이름은 3~30자여야 합니다.")
    private String communityName;
    @Size(max = 500, message = "설명은 500자 이하여야 합니다.")
    private String description;
    private String communityStatus;
    private Long categoryId;
    private String categoryName;
    @Size(max = 200, message = "태그는 200자 이하여야 합니다.")
    private String tags;
    private int memberCount;
    private int postCount;
    private String coverFilePath;
    private String createdDatetime;
    private String updatedDatetime;
    private boolean isJoined;
    private String myRole;

    // Lombok @Setter 를 명시적 setter 로 override.
    // tags 는 공백만 들어오는 경우를 한 군데에서 정규화해 다운스트림(mapper, vectorizer)이
    // "필드 누락" 과 "빈 문자열" 을 구분하지 않아도 되게 한다. 양쪽 모두 null 로 수렴.
    public void setTags(String tags) {
        if (tags == null) {
            this.tags = null;
            return;
        }
        String trimmed = tags.trim();
        this.tags = trimmed.isEmpty() ? null : trimmed;
    }

    public CommunityVO toCommunityVO() {
        return CommunityVO.builder()
                .id(id)
                .creatorId(creatorId)
                .communityName(communityName)
                .description(description)
                .communityStatus(communityStatus)
                .categoryId(categoryId)
                .tags(tags)
                .build();
    }
}
