package com.nasit.knttrial1.services;

import java.util.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.nasit.knttrial1.models.ConnectionMessage;
import com.nasit.knttrial1.models.MessageType;
import com.nasit.knttrial1.models.Pair;

@Service
public class EventListeners {

	private static final Logger LOGGER = LoggerFactory.getLogger(EventListeners.class);

	@Autowired
	private Map<String, Pair<List<Pair<String, String>>, Boolean>> rooms;

	@Autowired
	private SimpMessagingTemplate simpMessagingTemplate;

	@EventListener
	public void webSocketDisconnectListener(final SessionDisconnectEvent event) {

		final StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
		final String userId = headerAccessor.getSessionAttributes().get("userId").toString();
		final String userName = headerAccessor.getSessionAttributes().get("userName").toString();
		final String roomId = headerAccessor.getSessionAttributes().get("roomId").toString();
		final Pair<List<Pair<String, String>>, Boolean> room = rooms.get(roomId);

		LOGGER.info("WebSocket disconnected of user: " + userName + ", " + userId);
		LOGGER.info("Removing user from room: " + roomId);

		room.getFirst().remove(new Pair<>(userId, userName));
		if (room.getFirst().size() == 0) {
			rooms.remove(roomId);
			LOGGER.info("Deleted room: " + roomId);
		}
		else {	
			LOGGER.info("Publishing: Leaving user");

			final ConnectionMessage message = new ConnectionMessage();
			message.setType(MessageType.LEAVE);
			message.setPlayers(Collections.singletonList(new Pair<>(userId, userName)));
			simpMessagingTemplate.convertAndSend("/topic/" + roomId, message);

			LOGGER.info("Published: Left user");
		}
	}
}
