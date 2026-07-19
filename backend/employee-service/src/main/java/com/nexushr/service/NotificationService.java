package com.nexushr.service;

import com.nexushr.entity.Notification;
import com.nexushr.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification createNotification(Long recipientId, String type, String title, String message) {
        Notification notification = new Notification();
        notification.setRecipientId(recipientId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        return notificationRepository.save(notification);
    }

    public List<Notification> getMyNotifications(Long employeeId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(employeeId);
    }

    public void markAllAsRead(Long employeeId) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndReadFalse(employeeId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
