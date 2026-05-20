package com.app.globalgates.common.exception;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public class AdvertisementNotFoundException extends RuntimeException {
    public AdvertisementNotFoundException(String message) {
        super(message);
    }
}
