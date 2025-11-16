import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index } from "drizzle-orm/mysql-core";

/**
 * Schema do banco de dados do Notificaai
 * Plataforma jurídica para envio de notificações com validade legal
 */

// ============================================================================
// USUÁRIOS E AUTENTICAÇÃO
// ============================================================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "advogado", "assistente"]).default("user").notNull(),
  
  // Dados profissionais
  oabNumber: varchar("oabNumber", { length: 20 }), // Número da OAB
  oabState: varchar("oabState", { length: 2 }), // UF da OAB
  lawFirm: text("lawFirm"), // Nome do escritório
  cpf: varchar("cpf", { length: 14 }), // CPF para emissão de NF
  phone: varchar("phone", { length: 20 }),
  
  // Plano e créditos
  subscriptionPlan: mysqlEnum("subscriptionPlan", ["free", "basic", "professional", "enterprise"]).default("free").notNull(),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "canceled", "suspended", "trial"]).default("trial").notNull(),
  subscriptionExpiresAt: timestamp("subscriptionExpiresAt"),
  credits: int("credits").default(0).notNull(), // Créditos avulsos
  
  // MFA
  mfaEnabled: boolean("mfaEnabled").default(false).notNull(),
  mfaSecret: varchar("mfaSecret", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  oabIdx: index("oab_idx").on(table.oabNumber),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// NOTIFICAÇÕES JURÍDICAS
// ============================================================================

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Quem criou a notificação
  
  // Dados da notificação
  recipientName: text("recipientName").notNull(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  recipientPhone: varchar("recipientPhone", { length: 20 }),
  recipientAddress: text("recipientAddress"),
  subject: text("subject").notNull(),
  content: text("content").notNull(), // Conteúdo HTML
  
  // Certificação e segurança
  certificationLevel: mysqlEnum("certificationLevel", ["simple", "advanced", "qualified"]).default("simple").notNull(),
  documentHash: varchar("documentHash", { length: 128 }), // SHA-256 hash
  timestampToken: text("timestampToken"), // Token RFC 3161
  timestampUrl: text("timestampUrl"), // URL do carimbo de tempo
  certificateUrl: text("certificateUrl"), // URL do certificado de envio
  
  // Status e rastreamento
  status: mysqlEnum("status", ["draft", "scheduled", "sending", "sent", "read", "failed"]).default("draft").notNull(),
  scheduledFor: timestamp("scheduledFor"),
  sentAt: timestamp("sentAt"),
  readAt: timestamp("readAt"),
  failureReason: text("failureReason"),
  
  // Metadados de leitura
  readIp: varchar("readIp", { length: 45 }),
  readUserAgent: text("readUserAgent"),
  readLocation: text("readLocation"), // Geolocalização aproximada
  
  // Integração externa
  externalServiceId: varchar("externalServiceId", { length: 255 }), // ID no AR Online ou similar
  externalServiceName: varchar("externalServiceName", { length: 100 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
  scheduledIdx: index("scheduled_idx").on(table.scheduledFor),
  recipientEmailIdx: index("recipient_email_idx").on(table.recipientEmail),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ============================================================================
// ANEXOS DE NOTIFICAÇÕES
// ============================================================================

export const notificationAttachments = mysqlTable("notificationAttachments", {
  id: int("id").autoincrement().primaryKey(),
  notificationId: int("notificationId").notNull(),
  
  filename: text("filename").notNull(),
  fileKey: text("fileKey").notNull(), // Chave no S3
  fileUrl: text("fileUrl").notNull(), // URL pública
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"), // Tamanho em bytes
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  notificationIdx: index("notification_idx").on(table.notificationId),
}));

export type NotificationAttachment = typeof notificationAttachments.$inferSelect;
export type InsertNotificationAttachment = typeof notificationAttachments.$inferInsert;

// ============================================================================
// TEMPLATES DE DOCUMENTOS
// ============================================================================

export const documentTemplates = mysqlTable("documentTemplates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // null = template global/sistema
  
  name: text("name").notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["petition", "contract", "power_of_attorney", "notification", "other"]).notNull(),
  content: text("content").notNull(), // Conteúdo HTML com placeholders
  
  // Metadados
  isPublic: boolean("isPublic").default(false).notNull(), // Compartilhável com outros usuários
  usageCount: int("usageCount").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  categoryIdx: index("category_idx").on(table.category),
  publicIdx: index("public_idx").on(table.isPublic),
}));

export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = typeof documentTemplates.$inferInsert;

// ============================================================================
// BIBLIOTECA DE DOCUMENTOS
// ============================================================================

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  templateId: int("templateId"), // null se não foi criado a partir de template
  
  title: text("title").notNull(),
  content: text("content").notNull(), // Conteúdo HTML
  category: mysqlEnum("category", ["petition", "contract", "power_of_attorney", "notification", "other"]).notNull(),
  folder: varchar("folder", { length: 255 }), // Caminho da pasta (ex: "Contratos/2024")
  
  // Versionamento
  version: int("version").default(1).notNull(),
  parentDocumentId: int("parentDocumentId"), // Documento original (para versões)
  
  // Arquivos gerados
  pdfUrl: text("pdfUrl"),
  docxUrl: text("docxUrl"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  categoryIdx: index("category_idx").on(table.category),
}));

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// ============================================================================
// PAGAMENTOS E ASSINATURAS
// ============================================================================

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  
  // Dados do Asaas
  asaasCustomerId: varchar("asaasCustomerId", { length: 255 }),
  asaasSubscriptionId: varchar("asaasSubscriptionId", { length: 255 }),
  
  plan: mysqlEnum("plan", ["basic", "professional", "enterprise"]).notNull(),
  status: mysqlEnum("status", ["active", "canceled", "suspended", "pending"]).notNull(),
  
  // Valores
  amount: int("amount").notNull(), // Valor em centavos
  billingCycle: mysqlEnum("billingCycle", ["monthly", "yearly"]).default("monthly").notNull(),
  
  // Datas
  startDate: timestamp("startDate").notNull(),
  nextBillingDate: timestamp("nextBillingDate"),
  canceledAt: timestamp("canceledAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  asaasSubscriptionIdx: index("asaas_subscription_idx").on(table.asaasSubscriptionId),
}));

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subscriptionId: int("subscriptionId"),
  
  // Dados do Asaas
  asaasPaymentId: varchar("asaasPaymentId", { length: 255 }).notNull(),
  asaasInvoiceUrl: text("asaasInvoiceUrl"),
  
  // Detalhes do pagamento
  amount: int("amount").notNull(), // Valor em centavos
  paymentMethod: mysqlEnum("paymentMethod", ["credit_card", "pix", "boleto"]).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "received", "overdue", "refunded", "canceled"]).notNull(),
  
  description: text("description"),
  dueDate: timestamp("dueDate"),
  paymentDate: timestamp("paymentDate"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  subscriptionIdx: index("subscription_idx").on(table.subscriptionId),
  asaasPaymentIdx: index("asaas_payment_idx").on(table.asaasPaymentId),
  statusIdx: index("status_idx").on(table.status),
}));

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// ============================================================================
// COMPRA DE CRÉDITOS
// ============================================================================

export const creditPurchases = mysqlTable("creditPurchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  paymentId: int("paymentId"),
  
  creditsAmount: int("creditsAmount").notNull(),
  totalAmount: int("totalAmount").notNull(), // Valor pago em centavos
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
}));

export type CreditPurchase = typeof creditPurchases.$inferSelect;
export type InsertCreditPurchase = typeof creditPurchases.$inferInsert;

// ============================================================================
// LOGS DE AUDITORIA (LGPD)
// ============================================================================

export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  
  action: varchar("action", { length: 100 }).notNull(), // Ex: "notification.create", "user.login", "document.delete"
  entityType: varchar("entityType", { length: 50 }), // Ex: "notification", "document", "user"
  entityId: int("entityId"),
  
  details: text("details"), // JSON com detalhes adicionais
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  actionIdx: index("action_idx").on(table.action),
  entityIdx: index("entity_idx").on(table.entityType, table.entityId),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ============================================================================
// CONSENTIMENTOS LGPD
// ============================================================================

export const consents = mysqlTable("consents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  consentType: varchar("consentType", { length: 100 }).notNull(), // Ex: "data_processing", "marketing", "third_party_sharing"
  granted: boolean("granted").notNull(),
  
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  
  grantedAt: timestamp("grantedAt"),
  revokedAt: timestamp("revokedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  typeIdx: index("type_idx").on(table.consentType),
}));

export type Consent = typeof consents.$inferSelect;
export type InsertConsent = typeof consents.$inferInsert;

// ============================================================================
// ALERTAS E NOTIFICAÇÕES DO SISTEMA
// ============================================================================

export const systemAlerts = mysqlTable("systemAlerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  type: mysqlEnum("type", ["scheduled_notification", "payment_due", "payment_failed", "subscription_expiring", "credit_low"]).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  
  relatedEntityType: varchar("relatedEntityType", { length: 50 }),
  relatedEntityId: int("relatedEntityId"),
  
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_idx").on(table.userId),
  isReadIdx: index("is_read_idx").on(table.isRead),
}));

export type SystemAlert = typeof systemAlerts.$inferSelect;
export type InsertSystemAlert = typeof systemAlerts.$inferInsert;

// ============================================================================
// CONFIGURAÇÕES DO SISTEMA
// ============================================================================

export const systemSettings = mysqlTable("systemSettings", {
  id: int("id").autoincrement().primaryKey(),
  
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;
