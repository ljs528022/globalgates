package com.app.globalgates.common.exception;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public class FollowNotFoundException extends RuntimeException {
    public FollowNotFoundException(String message) {
        super(message);
    }
}
