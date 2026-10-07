package com.alumni.platform.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LikeResponse {
    private boolean liked;
    private long likeCount;
}
