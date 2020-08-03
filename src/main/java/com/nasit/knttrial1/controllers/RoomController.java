package com.nasit.knttrial1.controllers;

import com.nasit.knttrial1.models.Pair;
import com.nasit.knttrial1.models.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/rooms")
@CrossOrigin
public class RoomController {

	private static final Logger LOGGER = LoggerFactory.getLogger(RoomController.class);

	@Autowired
	private Map<String, Pair<List<Pair<String, String>>, Boolean>> rooms;

	@GetMapping("/check")
	public Response checkRoom(@RequestParam final String roomId) {
		LOGGER.info("Checking availability of room: " + roomId);

		final Response response = new Response();
		final Pair<List<Pair<String, String>>, Boolean> room = rooms.get(roomId);
		if (room != null) {
			LOGGER.info("Room: " + roomId + ", founded!");
			if (room.getSecond()) response.setStatus("started");
			else response.setStatus("success");
		} else {
			LOGGER.info("Room: " + roomId + ", not found");
			response.setStatus("failure");
		}
		return response;
	}
}
