package com.sap.cap.sflight.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;

@Configuration
@ConditionalOnWebApplication
@EnableWebSecurity
public class WebSecurityConfig {

	@Bean
    @Order(1)
	public SecurityFilterChain configure(HttpSecurity http) throws Exception {
		return http.securityMatchers(s -> s.requestMatchers(PathPatternRequestMatcher.withDefaults().matcher("/actuator/health"))) //
				.csrf(c -> c.disable()).authorizeHttpRequests(a -> a.anyRequest().permitAll())
				.build();
	}

}
