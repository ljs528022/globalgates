package com.app.globalgates.common.exception;

public class CategoryNotFoundException extends RuntimeException {
    public CategoryNotFoundException() {}

    public CategoryNotFoundException(String message) {
        super(message);
    }
}
