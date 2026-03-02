package com.galaxy13.tutor.converter;

import com.galaxy13.tutor.dto.UserDto;
import com.galaxy13.tutor.model.User;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class UserDtoConverter implements Converter<User, UserDto> {
    @Override
    public UserDto convert(User source) {
        return UserDto.builder()
                .id(source.getId())
                .username(source.getUsername())
                .name(source.getName())
                .surname(source.getSurname())
                .contact(source.getContact())
                .role(source.getRole().name())
                .isActive(source.getIsActive())
                .build();
    }
}
