package com.nasit.knttrial1;

import java.util.ArrayList;
import java.util.Hashtable;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.nasit.knttrial1.models.Pair;

@SpringBootApplication
public class KntTrial1Application {

	@Bean
	public Hashtable<String, ArrayList<Pair<String, String>>> getRooms() {
		final Hashtable<String, ArrayList<Pair<String, String>>> rooms = new Hashtable<>();
		return rooms;
	}

	public static void main(final String[] args) {
		SpringApplication.run(KntTrial1Application.class, args);
	}
}