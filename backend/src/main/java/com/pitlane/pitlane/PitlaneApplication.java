package com.pitlane.pitlane;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Main class for the project */
@SpringBootApplication
@EnableScheduling
public class PitlaneApplication {

	/**
	 * Project start method
	 * @param args arguments for the execution
	 */
	public static void main(String[] args) {
		SpringApplication.run(PitlaneApplication.class, args);
	}

}
