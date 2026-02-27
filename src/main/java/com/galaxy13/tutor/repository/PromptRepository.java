package com.galaxy13.tutor.repository;

import com.galaxy13.tutor.model.Prompt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PromptRepository extends JpaRepository<Prompt, Long> {

    Optional<Prompt> findTopByOrderByIdDesc();

    Optional<Prompt> findById(Long id);
}
