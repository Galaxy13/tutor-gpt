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
                .name(source.getName())
                .surname(source.getSurname())
                .role(source.getRole().name()).build();
    }
}
