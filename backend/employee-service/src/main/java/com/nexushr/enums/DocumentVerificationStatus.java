package com.nexushr.enums;

public enum DocumentVerificationStatus {
    PENDING_HR_APPROVAL,
    PENDING_ADMIN_APPROVAL,
    DOCUMENT_VERIFIED,
    DOCUMENT_REJECTED,
    PENDING_HR_ADMIN_APPROVAL // Legacy, kept for backwards compatibility in DB
}
