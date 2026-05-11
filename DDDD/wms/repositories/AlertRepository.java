package com.example.wms.repositories;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.wms.entities.Alert;
@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findBySeenFalse();

    
}
