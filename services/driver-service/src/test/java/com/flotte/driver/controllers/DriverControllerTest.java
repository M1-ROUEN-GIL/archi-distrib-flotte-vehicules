package com.flotte.driver.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flotte.driver.dto.*;
import com.flotte.driver.models.enums.DriverStatus;
import com.flotte.driver.services.DriverService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DriverController.class)
@AutoConfigureMockMvc(addFilters = false)
class DriverControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@MockitoBean
	private DriverService driverService;

	@MockitoBean
	private JwtDecoder jwtDecoder;

	@Test
	void getDrivers_ShouldReturnOk() throws Exception {
		when(driverService.getAllDrivers(null)).thenReturn(List.of());
		mockMvc.perform(get("/drivers"))
				.andExpect(status().isOk());
	}

	@Test
	void getDrivers_WithStatus_ShouldReturnOk() throws Exception {
		when(driverService.getAllDrivers(DriverStatus.ACTIVE)).thenReturn(List.of());
		mockMvc.perform(get("/drivers").param("status", "ACTIVE"))
				.andExpect(status().isOk());
	}

	@Test
	void getDriverById_ShouldReturnOk() throws Exception {
		UUID id = UUID.randomUUID();
		when(driverService.getDriverById(id)).thenReturn(
				new DriverResponse(id, null, "A", "B", "e@e.com", "1", "E1", DriverStatus.ACTIVE, null, null));
		mockMvc.perform(get("/drivers/{id}", id))
				.andExpect(status().isOk());
	}

	@Test
	void updateDriverStatus_ShouldReturnOk() throws Exception {
		UUID id = UUID.randomUUID();
		DriverStatusInput body = new DriverStatusInput(DriverStatus.ON_TOUR);
		when(driverService.updateDriverStatus(eq(id), any())).thenReturn(
				new DriverResponse(id, null, "A", "B", "e@e.com", "1", "E1", DriverStatus.ON_TOUR, null, null));
		mockMvc.perform(patch("/drivers/{id}/status", id)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(body)))
				.andExpect(status().isOk());
	}

	@Test
	void deleteDriver_ShouldReturnNoContent() throws Exception {
		UUID id = UUID.randomUUID();
		mockMvc.perform(delete("/drivers/{id}", id))
				.andExpect(status().isNoContent());
		verify(driverService).deleteDriver(id);
	}
}
