package com.nasit.knttrial1.controllers;

import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.nasit.knttrial1.models.ConnectionMessage;
import com.nasit.knttrial1.models.MessageType;
import com.nasit.knttrial1.models.Pair;
import com.nasit.knttrial1.models.User;

@RestController
@MessageMapping("/rooms")
public class RoomMessageController {

	private static final Logger LOGGER = LoggerFactory.getLogger(RoomMessageController.class);

	@Autowired
	private Hashtable<String, ArrayList<Pair<String, String>>> rooms;

	@Autowired
	private SimpMessagingTemplate simpMessagingTemplate;

	@MessageMapping("/create")
	public void createRoom(@RequestBody final User user, final SimpMessageHeaderAccessor headerAccessor) {

		final String userId = user.getUserId();
		final String userName = user.getUserName();
		final String roomId = user.getRoomId();

		LOGGER.info("Create room request from user: " + user.getUserDetails());

		rooms.put(roomId, new ArrayList<>());
		rooms.get(roomId).add(new Pair<String, String>(userId, userName));

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

		LOGGER.info("Joining room request from user: " + user.getUserDetails());
		LOGGER.info("Joining room: " + roomId);

		rooms.get(roomId).add(new Pair<String, String>(userId, userName));

		headerAccessor.getSessionAttributes().put("userId", userId);
		headerAccessor.getSessionAttributes().put("userName", userName);
		headerAccessor.getSessionAttributes().put("roomId", roomId);

		LOGGER.info("User: " + user.getUserDetails() + ", added into room: " + roomId);
		LOGGER.info("Publishing user joining information to other users...");

		final List<Pair<String, String>> players = new ArrayList<>();
		rooms.get(roomId).forEach(player -> {
			players.add(player);
		});

		final ConnectionMessage message = new ConnectionMessage();
		message.setType(MessageType.JOIN);
		message.setPlayers(players);

		simpMessagingTemplate.convertAndSend("/topic/" + roomId, message);
		LOGGER.info("Joining user published");
	}
}
