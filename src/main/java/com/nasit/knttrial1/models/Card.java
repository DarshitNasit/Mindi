package com.nasit.knttrial1.models;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Card {

    private final Suit suit;
    private final Rank rank;

    public enum Suit {
        HEARTS, SPADES, CLUBS, DIAMONDS;
        public static final Suit[] suits = {HEARTS, SPADES, CLUBS, DIAMONDS};
    }

    public enum Rank {
        TWO(2), THREE(3), FOUR(4), FIVE(5),
        SIX(6), SEVEN(7), EIGHT(8), NINE(9), TEN(10),
        JACK(11), QUEEN(12), KING(13), ACE(14);

        public static final Rank[] ranks = {ACE, KING, QUEEN, JACK, TEN, NINE, EIGHT,
                                               SEVEN, SIX, FIVE, FOUR, THREE, TWO};

        private final int value;
        private Rank(final int value){
            this.value = value;
        }
        
        public int getValue() {
        	return this.value;
        }
    }
}
