package com.nasit.knttrial1.controllers;

import java.util.ArrayList;
import java.util.Hashtable;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nasit.knttrial1.models.Pair;
import com.nasit.knttrial1.models.Response;

@RestController
@RequestMapping("/rooms")
@CrossOrigin
public class RoomController {

	private static final Logger LOGGER = LoggerFactory.getLogger(RoomController.class);

	@Autowired
	private Hashtable<String, ArrayList<Pair<String, String>>> rooms;

	@GetMapping("/check")
	public Response checkRoom(@RequestParam final String roomId) {
		LOGGER.info("Checking availibility of room: " + roomId);

		final Response response = new Response();
		if (rooms.containsKey(roomId)) {
			LOGGER.info("Room: " + roomId + ", found");
			response.setStatus("success");
		} else {
			LOGGER.info("Room: " + roomId + ", not found");
			response.setStatus("failure");
		}
		return response;
	}
}
