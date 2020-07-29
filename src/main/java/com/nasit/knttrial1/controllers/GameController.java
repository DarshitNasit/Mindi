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

import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/game")
public class GameController {

    private static final Logger LOGGER = LoggerFactory.getLogger(GameController.class);

    @Autowired
    private Hashtable<String, ArrayList<Pair<String, String>>> rooms;

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @GetMapping("/start")
    public Response startGame(@RequestParam final String roomId, @RequestParam final int decks) {
        final ArrayList<Pair<String, String>> room = rooms.get(roomId);

        final Deck deck = new Deck(decks, room.size());
        final Card[] deckCards = deck.getCards();
        shuffleArray(deckCards);

        final Response response = new Response();
        response.setStatus("success");

        final StartGameMessage message = new StartGameMessage();
        message.setType(MessageType.START_GAME);
        message.setDecks(decks);

        final int cardsPerPlayer = deck.getCards().length/room.size();
        final Card[] cards = new Card[cardsPerPlayer];

        for(int i=0; i<room.size(); i++) {
            for(int j=0; j<cardsPerPlayer; j++) {
                cards[j] = deckCards[i * cardsPerPlayer + j];
            }
            message.setCards(cards);
            simpMessagingTemplate.convertAndSend("/topic/" + room.get(i).getFirst(), message);
        }

        return response;
    }

    private void shuffleArray(Card[] cards) {
        Random rand = new Random();
        for(int j=0; j<10; j++) {
            for (int i = 0; i < cards.length; i++) {
                int randomIndexToSwap = rand.nextInt(cards.length);
                Card temp = cards[randomIndexToSwap];
                cards[randomIndexToSwap] = cards[i];
                cards[i] = temp;
            }
        }
    }
}
