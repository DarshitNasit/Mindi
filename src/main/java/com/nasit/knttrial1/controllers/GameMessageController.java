package com.nasit.knttrial1.controllers;

import com.nasit.knttrial1.models.StartGameMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@MessageMapping("/game")
public class GameMessageController {

    private static final Logger LOGGER = LoggerFactory.getLogger(GameMessageController.class);

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

}
