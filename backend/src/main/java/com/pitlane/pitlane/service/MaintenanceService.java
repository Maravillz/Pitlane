package com.pitlane.pitlane.service;

import com.pitlane.pitlane.dto.*;
import com.pitlane.pitlane.model.*;
import com.pitlane.pitlane.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/** Maintenance Service */
@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;
    private final AlertRepository alertRepository;
    private final MaintenancePhotoRepository maintenancePhotoRepository;
    private final StorageService storageService;
    private final DemoService demoService;

    @Transactional
    public Maintenance createMaintenance(UUID vehicleId, User user, CreateMaintenanceRequestDto maintenanceDto, List<MultipartFile> photos) {

        Vehicle vehicle = vehicleRepository.findByIdAndUser(vehicleId, user)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (maintenanceRepository.findByTypeAndDateAndVehicle(maintenanceDto.getMaintenanceType(), maintenanceDto.getDate(), vehicle).isPresent()) {
            throw new RuntimeException("Maintenance already exists for this type and date");
        }

        Maintenance saved = maintenanceRepository.save(Maintenance.builder()
                .vehicle(vehicle)
                .type(maintenanceDto.getMaintenanceType())
                .date(maintenanceDto.getDate())
                .mileage(maintenanceDto.getMileage())
                .costCents(maintenanceDto.getCostCents())
                .notes(maintenanceDto.getNotes())
                .createdAt(LocalDateTime.now())
                .build());

        uploadPhotos(photos, saved);

        alertRepository.findActiveByVehicleAndType(vehicle, maintenanceDto.getMaintenanceType())
                .ifPresent(existingAlert -> {
                    existingAlert.setResolvedAt(LocalDateTime.now());
                    alertRepository.save(existingAlert);
                });

        if (maintenanceDto.getCreateAlert() &&
                (maintenanceDto.getAlertIntervalKm() != null || maintenanceDto.getAlertIntervalDays() != null)) {
            alertRepository.save(Alert.builder()
                    .maintenance(saved)
                    .intervalKm(maintenanceDto.getAlertIntervalKm())
                    .intervalDays(maintenanceDto.getAlertIntervalDays())
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        // Record demo change
        if (demoService.isDemoUser(user)) {
            demoService.recordChange("MAINTENANCE_CREATED");
        }

        return saved;
    }

    @Transactional
    public MaintenanceDetailResponseDto getMaintenanceDetail(UUID maintenanceId, User user) {
        Maintenance maintenance = findAndValidate(maintenanceId, user);

        List<MaintenanceDetailResponseDto.PhotoDto> photos = maintenancePhotoRepository
                .findAllByMaintenance(maintenance)
                .stream()
                .map(photo -> MaintenanceDetailResponseDto.PhotoDto.builder()
                        .id(photo.getId())
                        .url(storageService.generatePresignedUrl(photo.getUrl()))
                        .build())
                .toList();

        AlertResponseDto alertDto = alertRepository.findByMaintenance(maintenance)
                .map(alert -> AlertResponseDto.builder()
                        .id(alert.getId())
                        .maintenanceType(maintenance.getType())
                        .intervalKm(alert.getIntervalKm())
                        .intervalDays(alert.getIntervalDays())
                        .resolvedAt(alert.getResolvedAt())
                        .createdAt(alert.getCreatedAt())
                        .build())
                .orElse(null);

        return MaintenanceDetailResponseDto.builder()
                .id(maintenance.getId())
                .type(maintenance.getType())
                .date(maintenance.getDate())
                .mileage(maintenance.getMileage())
                .costCents(maintenance.getCostCents())
                .notes(maintenance.getNotes())
                .createdAt(maintenance.getCreatedAt())
                .photos(photos)
                .alert(alertDto)
                .build();
    }

    @Transactional
    public MaintenanceDetailResponseDto updateMaintenance(UUID maintenanceId, User user,
                                                          UpdateMaintenanceRequestDto dto,
                                                          List<MultipartFile> newPhotos) {
        Maintenance maintenance = findAndValidate(maintenanceId, user);

        maintenance.setType(dto.getMaintenanceType());
        maintenance.setDate(dto.getDate());
        maintenance.setMileage(dto.getMileage());
        maintenance.setCostCents(dto.getCostCents());
        maintenance.setNotes(dto.getNotes());
        maintenanceRepository.save(maintenance);

        uploadPhotos(newPhotos, maintenance);

        return getMaintenanceDetail(maintenanceId, user);
    }

    @Transactional
    public void deleteMaintenance(UUID maintenanceId, User user) {
        Maintenance maintenance = findAndValidate(maintenanceId, user);

        maintenancePhotoRepository.findAllByMaintenance(maintenance)
                .forEach(photo -> storageService.delete(photo.getUrl()));
        maintenancePhotoRepository.deleteAllByMaintenance(maintenance);

        alertRepository.findByMaintenance(maintenance)
                .ifPresent(alertRepository::delete);

        maintenanceRepository.delete(maintenance);
    }

    @Transactional
    public void deletePhoto(UUID photoId, User user) {
        MaintenancePhoto photo = maintenancePhotoRepository.findById(photoId)
                .orElseThrow(() -> new RuntimeException("Photo not found"));

        if (!photo.getMaintenance().getVehicle().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        storageService.delete(photo.getUrl());
        maintenancePhotoRepository.delete(photo);
    }

    private Maintenance findAndValidate(UUID maintenanceId, User user) {
        Maintenance maintenance = maintenanceRepository.findById(maintenanceId)
                .orElseThrow(() -> new RuntimeException("Maintenance not found"));

        if (!maintenance.getVehicle().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        return maintenance;
    }

    private void uploadPhotos(List<MultipartFile> photos, Maintenance maintenance) {
        if (photos == null || photos.isEmpty()) return;
        photos.stream()
                .filter(photo -> !photo.isEmpty())
                .forEach(photo -> {
                    String key = storageService.upload(photo, "maintenance/" + maintenance.getId());
                    maintenancePhotoRepository.save(MaintenancePhoto.builder()
                            .maintenance(maintenance)
                            .url(key)
                            .createdAt(LocalDateTime.now())
                            .build());
                });
    }
}
