package com.galaxy13.tutor.repository;

import com.galaxy13.tutor.model.Prompt;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromptRepository extends JpaRepository<Prompt, Long> {

    Optional<Prompt> findTopByOrderByIdDesc();

    Optional<Prompt> findById(Long id);
}
