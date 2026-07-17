package com.nexushr.dto.performance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceConfigurationDto {
    private Long id;
    private Double attendanceWeight;
    private Double selfWeight;
    private Double peerWeight;
    private Double managerWeight;
    private Integer reviewWindowStartDay;
    private Integer reviewWindowEndDay;
    private Double minimumAttendanceRequired;
    private Boolean performanceEnabled;
}
