package com.nasit.knttrial1;

import com.nasit.knttrial1.models.Pair;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.Hashtable;
import java.util.List;
import java.util.Map;

@SpringBootApplication
public class KntTrial1Application {

	@Bean
	public Map<String, Pair<List<Pair<String, String>>, Boolean>> getRooms() {
		final Map<String, Pair<List<Pair<String, String>>, Boolean>> rooms = new Hashtable<>();
		return rooms;
	}

	public static void main(final String[] args) { SpringApplication.run(KntTrial1Application.class, args); }
}