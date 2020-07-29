package com.nasit.knttrial1.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

	private String userId;
	private String userName;
	private String roomId;

	public String getUserDetails() {
		return userName + ", " + userId;
	}
	
}
