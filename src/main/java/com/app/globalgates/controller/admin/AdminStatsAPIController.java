package com.app.globalgates.controller.admin;

import com.app.globalgates.dto.AdminStatsDashboardDTO;
import com.app.globalgates.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class AdminStatsAPIController {
    private final AdminStatsService adminStatsService;

    @GetMapping("/dashboard")
    public ResponseEntity<AdminStatsDashboardDTO> getDashboard() {
        return ResponseEntity.ok(adminStatsService.getDashboard());
    }
}
