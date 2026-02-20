package com.galaxy13.tutor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "contacts")
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class Contact {

    @Id
    private UUID userId;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "telegram", length = 100)
    private String telegram;
}
