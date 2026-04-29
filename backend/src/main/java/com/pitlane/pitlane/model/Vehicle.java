package com.pitlane.pitlane.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/** The vehicle a user owns */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@EqualsAndHashCode(exclude = {"user", "maintenances"})
@ToString(exclude = {"user", "maintenances"})
@Table(name = "vehicles")
public class Vehicle {

    /** The vehicle id */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** The user that owns the vehicle */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** The vehicle brand */
    @NotBlank(message = "Brand is required")
    @Column(name = "brand", nullable = false)
    private String brand;

    /** The vehicle model */
    @NotBlank(message = "Model is required")
    @Column(name = "model", nullable = false)
    private String model;

    /** The vehicle year */
    @NotNull(message = "Year is required")
    @Min(value = 1886, message = "Year must be after 1886")
    @Max(value = 2100, message = "Invalid year")
    @Column(name = "vehicle_year", nullable = false)
    private Short year;

    /** The vehicle license plate */
    @Column(name = "plate", unique = true)
    private String plate;

    /** The vehicle current mileage */
    @NotNull(message = "Current mileage is required")
    @Min(value = 0, message = "Mileage cannot be negative")
    @Column(name = "current_mileage", nullable = false)
    private Integer currentMileage;

    /** The vehicle creation date */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /** All maintenances created for the vehicle */
    @JsonIgnore
    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Maintenance> maintenances;

    /** The log of all mileage changes to the vehicle */
    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MileageLog> mileageLogs;

    /**
     * Sets the mileage of the vehicle, confirming the user does not change the value to less than the current one
     * @param newMileage The new mileage to update
     */
    public void setCurrentMileage(Integer newMileage) {
        if (this.currentMileage != null && newMileage < this.currentMileage) {
            throw new IllegalArgumentException("Mileage cannot decrease");
        }
        this.currentMileage = newMileage;
    }
}