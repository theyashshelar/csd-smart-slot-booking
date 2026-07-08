package com.csd.backend.dto;

import lombok.Builder;

@Builder
public record SettingRequest(
        String keyName,
        String settingValue
) {
}