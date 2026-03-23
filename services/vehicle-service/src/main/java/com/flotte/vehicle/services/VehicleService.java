package com.flotte.vehicle.services;

import com.flotte.vehicle.dto.VehicleInput;
import com.flotte.vehicle.dto.VehicleResponse;
import com.flotte.vehicle.dto.VehicleUpdate;
import com.flotte.vehicle.models.Vehicle;
import com.flotte.vehicle.models.enums.VehicleStatus;
import com.flotte.vehicle.repositories.VehicleRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    private final VehicleRepository repository;

    // Injection du Repository via le constructeur
    public VehicleService(VehicleRepository repository) {
        this.repository = repository;
    }

    // ==========================================
    // 1. LIRE (Tous les véhicules)
    // ==========================================
    public List<VehicleResponse> getAllVehicles() {
        // On récupère uniquement ceux qui ne sont pas supprimés (deletedAt IS NULL)
        return repository.findAllActive()
                .stream()
                .map(this::mapToResponse) // On transforme chaque Entité en DTO
                .collect(Collectors.toList());
    }

    // ==========================================
    // 2. LIRE (Un seul véhicule)
    // ==========================================
    public VehicleResponse getVehicleById(UUID id) {
        Vehicle vehicle = repository.findByIdActive(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Véhicule introuvable"));

        return mapToResponse(vehicle);
    }

    // ==========================================
    // 3. CRÉER
    // ==========================================
    public VehicleResponse createVehicle(VehicleInput input) {
        Vehicle vehicle = new Vehicle();
        vehicle.setPlateNumber(input.plateNumber());
        vehicle.setBrand(input.brand());
        vehicle.setModel(input.model());
        vehicle.setFuelType(input.fuelType());
        vehicle.setMileageKm(input.mileageKm());
        vehicle.setVin(input.vin());
        vehicle.setPayloadCapacityKg(input.payloadCapacityKg());
        vehicle.setCargoVolumeM3(input.cargoVolumeM3());

        // Le status par défaut est géré par l'entité (available)
        Vehicle savedVehicle = repository.save(vehicle);
        return mapToResponse(savedVehicle);
    }

    // ==========================================
    // 4. METTRE À JOUR (Infos générales)
    // ==========================================
    public VehicleResponse updateVehicle(UUID id, VehicleUpdate update) {
        Vehicle vehicle = repository.findByIdActive(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Véhicule introuvable"));

        // On met à jour uniquement si la valeur est fournie
        if (update.brand() != null) vehicle.setBrand(update.brand());
        if (update.model() != null) vehicle.setModel(update.model());
        if (update.mileageKm() != null) vehicle.setMileageKm(update.mileageKm());

        Vehicle updatedVehicle = repository.save(vehicle);
        return mapToResponse(updatedVehicle);
    }

    // ==========================================
    // 5. METTRE À JOUR (Le Statut uniquement)
    // ==========================================
    public VehicleResponse updateVehicleStatus(UUID id, VehicleStatus newStatus) {
        Vehicle vehicle = repository.findByIdActive(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Véhicule introuvable"));

        vehicle.setStatus(newStatus);
        Vehicle updatedVehicle = repository.save(vehicle);
        return mapToResponse(updatedVehicle);
    }

    // ==========================================
    // 6. SUPPRIMER (Soft Delete)
    // ==========================================
    public void deleteVehicle(UUID id) {
        Vehicle vehicle = repository.findByIdActive(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Véhicule introuvable"));

        // Au lieu de faire repository.delete(vehicle), on renseigne la date de suppression
        vehicle.setDeletedAt(OffsetDateTime.now());
        repository.save(vehicle);
    }

    // ==========================================
    // FONCTION UTILITAIRE (Mapping)
    // ==========================================
    private VehicleResponse mapToResponse(Vehicle entity) {
        return new VehicleResponse(
                entity.getId(),
                entity.getPlateNumber(),
                entity.getBrand(),
                entity.getModel(),
                entity.getFuelType(),
                entity.getStatus(),
                entity.getMileageKm(),
                entity.getVin(),
                entity.getPayloadCapacityKg(),
                entity.getCargoVolumeM3(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}