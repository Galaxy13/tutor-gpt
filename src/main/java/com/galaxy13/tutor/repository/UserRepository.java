package com.galaxy13.tutor.repository;

import com.galaxy13.tutor.model.Role;
import com.galaxy13.tutor.model.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> getUserById(UUID id);

    List<User> getUserByNameLikeAndSurnameLike(String name, String surname);

    boolean existsByUsername(String username);

    Optional<User> findUserByUsername(String username);

    boolean existsByUsernameAndIdNot(String username, UUID userId);

    long countByRole(Role role);
}
