package com.example.jobtracker.repository;

import com.example.jobtracker.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByCompanyNameContainingIgnoreCase(String companyName);

    List<Job> findByStatusIgnoreCase(String status);
}

