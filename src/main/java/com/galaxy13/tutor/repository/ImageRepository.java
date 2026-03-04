package com.galaxy13.tutor.repository;

import com.galaxy13.tutor.model.Image;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ImageRepository extends JpaRepository<Image, UUID> {

    Optional<Image> findByUserId(UUID userId);
}
