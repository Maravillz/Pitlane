package com.pitlane.pitlane.repository;

import com.pitlane.pitlane.model.User;
import com.pitlane.pitlane.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** Vehicle Repository */
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    /**
     * Finds a vehicle by its id and the user its associated with. It uses the extra user validation to guarantee the user that made the request owns the car
     * @param id The vehicle id
     * @param user The logged user
     * @return The vehicle if there is any with the id and associated to the user
     */
    Optional<Vehicle> findByIdAndUser(UUID id, User user);

    /**
     * Finds all vehicles the user owns
     * @param user The given user
     * @return A list of vehicles, empty if there is no vehicle associated
     */
    List<Vehicle> findAllByUser(User user);

    void deleteAllByUser(User user);
}
