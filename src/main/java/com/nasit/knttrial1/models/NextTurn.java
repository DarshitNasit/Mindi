package com.nasit.knttrial1.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NextTurn {
    private MessageType type;
    private int firstPlayer;
    private int indexId;
    private Card card;
}
