package com.nasit.knttrial1.controllers;

import com.nasit.knttrial1.models.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/game")
public class GameController {

    private static final Logger LOGGER = LoggerFactory.getLogger(GameController.class);

    @Autowired
    private Map<String, Pair<List<Pair<String, String>>, Boolean>> rooms;

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @GetMapping("/start")
    public Response startGame(@RequestParam final String roomId, @RequestParam final int decks) {
        final Pair<List<Pair<String, String>>, Boolean> room = rooms.get(roomId);

        LOGGER.info("Starting new game in room : " + roomId);

        final Deck deck = new Deck(decks, room.getFirst().size());
        final Card[] deckCards = deck.getCards();
        shuffleArray(deckCards);

        final Response response = new Response();
        response.setStatus("success");

        final StartGameMessage message = new StartGameMessage();
        message.setType(MessageType.START_GAME);
        message.setDecks(decks);
        message.setFirstPlayer(ThreadLocalRandom.current().nextInt(0, room.getFirst().size()));

        final int cardsPerPlayer = deck.getCards().length/room.getFirst().size();
        final Card[] cards = new Card[cardsPerPlayer];

        for(int i=0; i<room.getFirst().size(); i++) {
            System.arraycopy(deckCards, i * cardsPerPlayer, cards, 0, cardsPerPlayer);
            message.setCards(cards);
            simpMessagingTemplate.convertAndSend("/topic/" + room.getFirst().get(i).getFirst(), message);
        }

        room.setSecond(true);
        return response;
    }

    @GetMapping("/end")
    public Response endGame(@RequestParam final String roomId) {
        final Response response = new Response();
        final Pair<List<Pair<String, String>>, Boolean> room = rooms.get(roomId);

        if (room.getSecond()) {
            response.setStatus("success");
            room.setSecond(false);
        } else response.setStatus("failure");

        return response;
    }

    private void shuffleArray(Card[] cards) {
        Random rand = new Random();
        for (int j=0; j<10; j++) {
            for (int i = 0; i < cards.length; i++) {
                int randomIndexToSwap = rand.nextInt(cards.length);
                Card temp = cards[randomIndexToSwap];
                cards[randomIndexToSwap] = cards[i];
                cards[i] = temp;
            }
        }
    }
}
