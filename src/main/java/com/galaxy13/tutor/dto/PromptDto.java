package com.galaxy13.tutor.dto;

import lombok.*;

import java.util.Map;

@Builder
@Getter
public class PromptDto {

    private Long version;

    private Map<String, String> content;

    @AllArgsConstructor
    @NoArgsConstructor
    @Setter
    @Getter
    public static class CreatePromptRequest {

        private Map<String, String> content;
    }
}
