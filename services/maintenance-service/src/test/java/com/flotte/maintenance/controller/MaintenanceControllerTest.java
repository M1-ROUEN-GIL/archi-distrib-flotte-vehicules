package com.flotte.maintenance.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.flotte.maintenance.dto.MaintenanceCreateRequest;
import com.flotte.maintenance.dto.MaintenanceStatusUpdate;
import com.flotte.maintenance.model.MaintenancePriority;
import com.flotte.maintenance.model.MaintenanceRecord;
import com.flotte.maintenance.model.MaintenanceStatus;
import com.flotte.maintenance.model.MaintenanceType;
import com.flotte.maintenance.service.MaintenanceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MaintenanceController.class)
@AutoConfigureMockMvc(addFilters = false)
class MaintenanceControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@MockitoBean
	private MaintenanceService service;

	@MockitoBean
	private JwtDecoder jwtDecoder;

	@Test
	void getAllRecords_ShouldReturnOk() throws Exception {
		when(service.getAllRecords(null, null, null)).thenReturn(List.of());
		mockMvc.perform(get("/maintenance"))
				.andExpect(status().isOk());
	}

	@Test
	void getVehicleHistory_ShouldReturnOk() throws Exception {
		UUID vid = UUID.randomUUID();
		when(service.getVehicleHistory(vid)).thenReturn(List.of());
		mockMvc.perform(get("/maintenance/vehicle/{vehicleId}", vid))
				.andExpect(status().isOk());
	}

	@Test
	void getRecordById_ShouldReturnOk() throws Exception {
		UUID id = UUID.randomUUID();
		MaintenanceRecord r = new MaintenanceRecord();
		r.setId(id);
		when(service.getRecordById(id)).thenReturn(r);
		mockMvc.perform(get("/maintenance/{id}", id))
				.andExpect(status().isOk());
	}

	@Test
	void updateStatus_ShouldReturnOk() throws Exception {
		UUID id = UUID.randomUUID();
		MaintenanceStatusUpdate body = new MaintenanceStatusUpdate(MaintenanceStatus.IN_PROGRESS, null, null, null, null);
		when(service.updateStatus(eq(id), any())).thenReturn(new MaintenanceRecord());
		mockMvc.perform(patch("/maintenance/{id}/status", id)
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(body)))
				.andExpect(status().isOk());
	}

	@Test
	void createRecord_ShouldReturnCreated() throws Exception {
		MaintenanceCreateRequest req = new MaintenanceCreateRequest(
				UUID.randomUUID(), MaintenanceType.PREVENTIVE, MaintenancePriority.MEDIUM,
				LocalDate.now().plusDays(1), "d");
		MaintenanceRecord saved = new MaintenanceRecord();
		saved.setId(UUID.randomUUID());
		when(service.createRecord(any())).thenReturn(saved);
		mockMvc.perform(post("/maintenance")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(req)))
				.andExpect(status().isCreated());
	}
}
