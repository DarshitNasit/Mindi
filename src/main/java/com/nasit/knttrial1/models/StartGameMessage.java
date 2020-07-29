package com.nasit.knttrial1.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StartGameMessage {
    private MessageType type;
    private int decks;
    private Card[] cards;
}
