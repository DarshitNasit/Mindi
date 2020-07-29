package com.nasit.knttrial1.models;

import lombok.Data;

import java.util.ArrayList;

@Data
public class Deck {

    private Card[] cards;

    public Deck(final int decks, final int players) {
        final int totalCards = ((52*decks)/players)*players;
        final Card.Suit[] suits = Card.Suit.suits;
        final Card.Rank[] ranks = Card.Rank.ranks;
        cards = new Card[totalCards];

        int index = 0;
        mainLoop: for (Card.Suit suit : suits) {
            for (Card.Rank rank : ranks) {
                for(int i=0; i<decks; i++) {
                    if(index == totalCards) break mainLoop;
                    cards[index] = new Card(suit, rank);
                    index++;
                }
            }
        }
    }
}
