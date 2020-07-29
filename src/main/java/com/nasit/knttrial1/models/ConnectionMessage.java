package com.nasit.knttrial1.models;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConnectionMessage {
    private MessageType type;
    private List<Pair<String, String>> players;
}
