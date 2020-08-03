package com.nasit.knttrial1.controllers;

import com.nasit.knttrial1.models.ConnectionMessage;
import com.nasit.knttrial1.models.MessageType;
import com.nasit.knttrial1.models.Pair;
import com.nasit.knttrial1.models.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.groovy.GroovyMarkupConfig;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@MessageMapping("/rooms")
public class RoomMessageController {

	private static final Logger LOGGER = LoggerFactory.getLogger(RoomMessageController.class);

	@Autowired
	private Map<String, Pair<List<Pair<String, String>>, Boolean>> rooms;

	@Autowired
	private SimpMessagingTemplate simpMessagingTemplate;

	@MessageMapping("/create")
	public void createRoom(@RequestBody final User user, final SimpMessageHeaderAccessor headerAccessor) {

		final String userId = user.getUserId();
		final String userName = user.getUserName();
		final String roomId = user.getRoomId();

		LOGGER.info("Create room request from user: " + user.getUserDetails());

		final Pair<List<Pair<String, String>>, Boolean> room = new Pair<>();
		room.setFirst(new ArrayList<>());
		room.getFirst().add(new Pair<>(userId, userName));
		room.setSecond(false);
		rooms.put(roomId, room);

		LOGGER.info("New room created: " + roomId);

		headerAccessor.getSessionAttributes().put("userId", userId);
		headerAccessor.getSessionAttributes().put("userName", userName);
		headerAccessor.getSessionAttributes().put("roomId", roomId);
	}

	@MessageMapping("/join")
	public void joinRoom(@RequestBody final User user, final SimpMessageHeaderAccessor headerAccessor) {

		final String userId = user.getUserId();
		final String userName = user.getUserName();
		final String roomId = user.getRoomId();
		final Pair<List<Pair<String, String>>, Boolean> room = rooms.get(roomId);

		LOGGER.info("Joining room request from user: " + user.getUserDetails());
		LOGGER.info("Joining room: " + roomId);

		room.getFirst().add(new Pair<>(userId, userName));

		headerAccessor.getSessionAttributes().put("userId", userId);
		headerAccessor.getSessionAttributes().put("userName", userName);
		headerAccessor.getSessionAttributes().put("roomId", roomId);

		LOGGER.info("User: " + user.getUserDetails() + ", added into room: " + roomId);
		LOGGER.info("Publishing user joining information to other users...");

		final ConnectionMessage message = new ConnectionMessage();
		message.setType(MessageType.JOIN);
		message.setPlayers(new ArrayList<>(room.getFirst()));

		simpMessagingTemplate.convertAndSend("/topic/" + roomId, message);
		LOGGER.info("Joining user published");
	}
}
