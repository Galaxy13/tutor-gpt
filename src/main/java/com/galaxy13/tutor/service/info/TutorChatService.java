package com.galaxy13.tutor.service.info;

import com.galaxy13.tutor.converter.ChatResponseConverter;
import com.galaxy13.tutor.dto.ChatCreateRequest;
import com.galaxy13.tutor.dto.ChatDto;
import com.galaxy13.tutor.exception.ResourceNotFoundException;
import com.galaxy13.tutor.model.Chat;
import com.galaxy13.tutor.model.Prompt;
import com.galaxy13.tutor.model.User;
import com.galaxy13.tutor.repository.ChatRepository;
import com.galaxy13.tutor.repository.PromptRepository;
import com.galaxy13.tutor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TutorChatService implements ChatService {

    private final ChatRepository chatRepository;

    private final ChatResponseConverter chatConverter;

    private final UserRepository userRepository;

    private final PromptRepository promptRepository;

    @Override
    public List<ChatDto> getAllChats() {
        return chatRepository.findAll()
                .stream()
                .map(chatConverter::convert).toList();
    }

    @Override
    public List<ChatDto> getChatsByUserId(UUID userId) {
        return chatRepository.findChatsByUserId(userId)
                .stream()
                .map(chatConverter::convert).toList();
    }

    @Override
    public ChatDto getChatById(UUID id) {
        return chatRepository.findChatById(id)
                .map(chatConverter::convert)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found with id: " + id));
    }

    @Override
    public ChatDto createChat(UUID userId, ChatCreateRequest request) {
        User user = userRepository.getUserById(userId).orElseThrow(() ->
                new ResourceNotFoundException("User with id: " + userId + " not found"));

        Chat chat = new Chat();
        chat.setUser(user);

        Prompt prompt = promptRepository.findTopByOrderByIdDesc().orElseThrow(() ->
                new ResourceNotFoundException("No prompts available"));
        chat.setPrompt(prompt);
        chat.setName(request.getMessage().strip().substring(0, 20) + "...");
        chat = chatRepository.save(chat);
        return chatConverter.convert(chat);
    }

    @Override
    public void deleteChat(UUID id) {
        if (!chatRepository.existsById(id)) {
            throw new ResourceNotFoundException("Chat not found with id: " + id);
        }
        chatRepository.deleteById(id);
    }
}
