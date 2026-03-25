package com.flotte.vehicle.controller;

import com.flotte.vehicle.dto.*;
import com.flotte.vehicle.services.VehicleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/vehicles") // C'est la route de base définie dans ton OpenAPI
public class VehicleController {

    private final VehicleService service;

    // Injection par constructeur
    public VehicleController(VehicleService service) {
        this.service = service;
    }

    // 1. LISTER TOUS LES VÉHICULES
    @GetMapping
    public List<VehicleResponse> getAllVehicles() {
        return service.getAllVehicles();
    }

    // 2. RÉCUPÉRER UN VÉHICULE PAR ID
    @GetMapping("/{id}")
    public VehicleResponse getVehicleById(@PathVariable UUID id) {
        return service.getVehicleById(id);
    }

    // 3. CRÉER UN VÉHICULE
    // Le @Valid active les vérifications (@NotNull, @Positive, etc.) du DTO
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED) // Renvoie 201 Created au lieu de 200 OK
    public VehicleResponse createVehicle(@Valid @RequestBody VehicleInput input) {
        return service.createVehicle(input);
    }

    // 4. METTRE À JOUR LES INFOS
    @PutMapping("/{id}")
    public VehicleResponse updateVehicle(
            @PathVariable UUID id,
            @Valid @RequestBody VehicleUpdate update) {
        return service.updateVehicle(id, update);
    }

    // 5. CHANGER LE STATUT
    @PatchMapping("/{id}/status")
    public VehicleResponse updateVehicleStatus(
            @PathVariable UUID id,
            @Valid @RequestBody VehicleStatusInput statusInput) {
        return service.updateVehicleStatus(id, statusInput.status());
    }

    // 6. SUPPRIMER UN VÉHICULE (Soft Delete)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT) // Renvoie 204 No Content
    public void deleteVehicle(@PathVariable UUID id) {
        service.deleteVehicle(id);
    }

    // GET /vehicles/{id}/assignments
    @GetMapping("/{id}/assignments")
    public List<AssignmentResponse> getAssignments(@PathVariable UUID id) {
        return service.getAssignments(id);
    }

    // POST /vehicles/{id}/assignments
    @PostMapping("/{id}/assignments")
    @ResponseStatus(HttpStatus.CREATED)
    public AssignmentResponse createAssignment(
            @PathVariable UUID id,
            @Valid @RequestBody AssignmentInput input) {
        return service.createAssignment(id, input);
    }

    // DELETE /vehicles/{id}/assignments/current
    @DeleteMapping("/{id}/assignments/current")
    public AssignmentResponse endCurrentAssignment(@PathVariable UUID id) {
        return service.endCurrentAssignment(id);
    }
}