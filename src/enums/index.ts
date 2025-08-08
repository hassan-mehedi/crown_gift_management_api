export enum UserRole {
    ADMIN = "admin",
    ISSUER = "issuer",
    APPROVER = "approver",
    RECEIVER = "receiver",
}

export enum ApprovalStatus {
    PENDING = "pending",
    APPROVED = "approved",
    CHANGE_REQUESTED = "change_requested",
    REJECTED = "rejected",
}
