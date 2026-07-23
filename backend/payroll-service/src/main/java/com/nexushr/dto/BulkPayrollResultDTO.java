package com.nexushr.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class BulkPayrollResultDTO {
    private int processed = 0;
    private int skipped = 0;
    private int failed = 0;
    private List<String> errors = new ArrayList<>();
}
