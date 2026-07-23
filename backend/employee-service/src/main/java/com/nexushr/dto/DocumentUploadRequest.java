package com.nexushr.dto;

import lombok.Data;

@Data
public class DocumentUploadRequest {
    private String documentType;
    private String documentName;
    private String documentUrl;
}
