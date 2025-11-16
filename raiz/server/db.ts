import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  notifications,
  InsertNotification,
  Notification,
  documentTemplates,
  InsertDocumentTemplate,
  documents,
  InsertDocument,
  subscriptions,
  payments,
  auditLogs,
  InsertAuditLog,
  systemAlerts,
  InsertSystemAlert
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USUÁRIOS
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(data).where(eq(users.id, userId));
}

// ============================================================================
// NOTIFICAÇÕES
// ============================================================================

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(notifications).values(notification);
  return result[0].insertId;
}

export async function getNotificationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserNotifications(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function updateNotification(id: number, data: Partial<InsertNotification>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(notifications).set(data).where(eq(notifications.id, id));
}

export async function getScheduledNotifications() {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  return await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.status, "scheduled"),
        sql`${notifications.scheduledFor} <= ${now}`
      )
    );
}

// ============================================================================
// TEMPLATES DE DOCUMENTOS
// ============================================================================

export async function createDocumentTemplate(template: InsertDocumentTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(documentTemplates).values(template);
  return result[0].insertId;
}

export async function getDocumentTemplates(userId?: number, category?: string) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(documentTemplates);

  if (userId) {
    query = query.where(
      sql`${documentTemplates.userId} = ${userId} OR ${documentTemplates.userId} IS NULL OR ${documentTemplates.isPublic} = true`
    ) as any;
  } else {
    query = query.where(
      sql`${documentTemplates.userId} IS NULL OR ${documentTemplates.isPublic} = true`
    ) as any;
  }

  return await query.orderBy(desc(documentTemplates.createdAt));
}

export async function incrementTemplateUsage(templateId: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(documentTemplates)
    .set({ usageCount: sql`${documentTemplates.usageCount} + 1` })
    .where(eq(documentTemplates.id, templateId));
}

// ============================================================================
// DOCUMENTOS
// ============================================================================

export async function createDocument(document: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(documents).values(document);
  return result[0].insertId;
}

export async function getUserDocuments(userId: number, folder?: string) {
  const db = await getDb();
  if (!db) return [];

  if (folder) {
    return await db
      .select()
      .from(documents)
      .where(and(eq(documents.userId, userId), eq(documents.folder, folder)))
      .orderBy(desc(documents.updatedAt));
  }

  return await db
    .select()
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(desc(documents.updatedAt));
}

export async function updateDocument(id: number, data: Partial<InsertDocument>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(documents).set(data).where(eq(documents.id, id));
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(documents).where(eq(documents.id, id));
}

// ============================================================================
// LOGS DE AUDITORIA
// ============================================================================

export async function createAuditLog(log: InsertAuditLog) {
  const db = await getDb();
  if (!db) return;

  try {
    await db.insert(auditLogs).values(log);
  } catch (error) {
    console.error("[Database] Failed to create audit log:", error);
  }
}

export async function getAuditLogs(userId?: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(auditLogs);

  if (userId) {
    query = query.where(eq(auditLogs.userId, userId)) as any;
  }

  return await query.orderBy(desc(auditLogs.createdAt)).limit(limit);
}

// ============================================================================
// ALERTAS DO SISTEMA
// ============================================================================

export async function createSystemAlert(alert: InsertSystemAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(systemAlerts).values(alert);
  return result[0].insertId;
}

export async function getUserAlerts(userId: number, unreadOnly = false) {
  const db = await getDb();
  if (!db) return [];

  if (unreadOnly) {
    return await db
      .select()
      .from(systemAlerts)
      .where(and(eq(systemAlerts.userId, userId), eq(systemAlerts.isRead, false)))
      .orderBy(desc(systemAlerts.createdAt));
  }

  return await db
    .select()
    .from(systemAlerts)
    .where(eq(systemAlerts.userId, userId))
    .orderBy(desc(systemAlerts.createdAt));
}

export async function markAlertAsRead(alertId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(systemAlerts)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(systemAlerts.id, alertId));
}

// ============================================================================
// ESTATÍSTICAS
// ============================================================================

export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const [notificationStats] = await db
    .select({
      total: sql<number>`COUNT(*)`,
      sent: sql<number>`SUM(CASE WHEN ${notifications.status} = 'sent' THEN 1 ELSE 0 END)`,
      read: sql<number>`SUM(CASE WHEN ${notifications.status} = 'read' THEN 1 ELSE 0 END)`,
      scheduled: sql<number>`SUM(CASE WHEN ${notifications.status} = 'scheduled' THEN 1 ELSE 0 END)`,
    })
    .from(notifications)
    .where(eq(notifications.userId, userId));

  const [documentCount] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(documents)
    .where(eq(documents.userId, userId));

  return {
    notifications: notificationStats,
    documents: documentCount?.count || 0,
  };
}
