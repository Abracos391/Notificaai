import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";

// ============================================================================
// SCHEMAS DE VALIDAÇÃO
// ============================================================================

const updateProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  oabNumber: z.string().optional(),
  oabState: z.string().length(2).optional(),
  lawFirm: z.string().optional(),
  cpf: z.string().optional(),
});

const createNotificationSchema = z.object({
  recipientName: z.string().min(1),
  recipientEmail: z.string().email(),
  recipientPhone: z.string().optional(),
  recipientAddress: z.string().optional(),
  subject: z.string().min(1),
  content: z.string().min(1),
  certificationLevel: z.enum(["simple", "advanced", "qualified"]).default("simple"),
  scheduledFor: z.date().optional(),
});

const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(["petition", "contract", "power_of_attorney", "notification", "other"]),
  content: z.string().min(1),
  isPublic: z.boolean().default(false),
});

const createDocumentSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.enum(["petition", "contract", "power_of_attorney", "notification", "other"]),
  folder: z.string().optional(),
  templateId: z.number().optional(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateDocumentHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}

// ============================================================================
// ROUTERS
// ============================================================================

export const appRouter = router({
  system: systemRouter,

  // ==========================================================================
  // AUTENTICAÇÃO
  // ==========================================================================
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ==========================================================================
  // PERFIL DE USUÁRIO
  // ==========================================================================
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }
      return user;
    }),

    update: protectedProcedure
      .input(updateProfileSchema)
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        
        // Log de auditoria
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "profile.update",
          entityType: "user",
          entityId: ctx.user.id,
          details: JSON.stringify(input),
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.get("user-agent"),
        });

        return { success: true };
      }),

    stats: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserStats(ctx.user.id);
    }),
  }),

  // ==========================================================================
  // NOTIFICAÇÕES JURÍDICAS
  // ==========================================================================
  notifications: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getUserNotifications(ctx.user.id, input?.limit);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const notification = await db.getNotificationById(input.id);
        
        if (!notification) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Notificação não encontrada" });
        }

        if (notification.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }

        return notification;
      }),

    create: protectedProcedure
      .input(createNotificationSchema)
      .mutation(async ({ ctx, input }) => {
        // Gerar hash do documento
        const documentHash = generateDocumentHash(input.content);

        const notificationId = await db.createNotification({
          userId: ctx.user.id,
          ...input,
          documentHash,
          status: input.scheduledFor ? "scheduled" : "draft",
        });

        // Log de auditoria
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "notification.create",
          entityType: "notification",
          entityId: notificationId,
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.get("user-agent"),
        });

        return { id: notificationId, success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: createNotificationSchema.partial(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const notification = await db.getNotificationById(input.id);

        if (!notification) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Notificação não encontrada" });
        }

        if (notification.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }

        // Não permitir edição de notificações já enviadas
        if (notification.status === "sent" || notification.status === "read") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Não é possível editar notificações já enviadas",
          });
        }

        // Atualizar hash se o conteúdo foi modificado
        const updateData: any = { ...input.data };
        if (input.data.content) {
          updateData.documentHash = generateDocumentHash(input.data.content);
        }

        await db.updateNotification(input.id, updateData);

        // Log de auditoria
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "notification.update",
          entityType: "notification",
          entityId: input.id,
          details: JSON.stringify(input.data),
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.get("user-agent"),
        });

        return { success: true };
      }),

    send: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const notification = await db.getNotificationById(input.id);

        if (!notification) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Notificação não encontrada" });
        }

        if (notification.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }

        // TODO: Implementar lógica de envio real
        // - Gerar timestamp com ACT
        // - Enviar via e-mail/AR Online
        // - Gerar certificado de envio

        await db.updateNotification(input.id, {
          status: "sending",
          sentAt: new Date(),
        });

        // Log de auditoria
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "notification.send",
          entityType: "notification",
          entityId: input.id,
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.get("user-agent"),
        });

        return { success: true };
      }),
  }),

  // ==========================================================================
  // TEMPLATES DE DOCUMENTOS
  // ==========================================================================
  templates: router({
    list: protectedProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getDocumentTemplates(ctx.user.id, input?.category);
      }),

    create: protectedProcedure
      .input(createTemplateSchema)
      .mutation(async ({ ctx, input }) => {
        const templateId = await db.createDocumentTemplate({
          userId: ctx.user.id,
          ...input,
        });

        // Log de auditoria
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "template.create",
          entityType: "template",
          entityId: templateId,
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.get("user-agent"),
        });

        return { id: templateId, success: true };
      }),

    use: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.incrementTemplateUsage(input.id);
        return { success: true };
      }),
  }),

  // ==========================================================================
  // DOCUMENTOS
  // ==========================================================================
  documents: router({
    list: protectedProcedure
      .input(z.object({ folder: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getUserDocuments(ctx.user.id, input?.folder);
      }),

    create: protectedProcedure
      .input(createDocumentSchema)
      .mutation(async ({ ctx, input }) => {
        const documentId = await db.createDocument({
          userId: ctx.user.id,
          ...input,
        });

        // Se foi criado a partir de template, incrementar contador
        if (input.templateId) {
          await db.incrementTemplateUsage(input.templateId);
        }

        // Log de auditoria
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "document.create",
          entityType: "document",
          entityId: documentId,
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.get("user-agent"),
        });

        return { id: documentId, success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: createDocumentSchema.partial(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // TODO: Verificar ownership
        await db.updateDocument(input.id, input.data as any);

        // Log de auditoria
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "document.update",
          entityType: "document",
          entityId: input.id,
          details: JSON.stringify(input.data),
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.get("user-agent"),
        });

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // TODO: Verificar ownership
        await db.deleteDocument(input.id);

        // Log de auditoria
        await db.createAuditLog({
          userId: ctx.user.id,
          action: "document.delete",
          entityType: "document",
          entityId: input.id,
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.get("user-agent"),
        });

        return { success: true };
      }),
  }),

  // ==========================================================================
  // ALERTAS
  // ==========================================================================
  alerts: router({
    list: protectedProcedure
      .input(z.object({ unreadOnly: z.boolean().default(false) }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getUserAlerts(ctx.user.id, input?.unreadOnly);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markAlertAsRead(input.id);
        return { success: true };
      }),
  }),

  // ==========================================================================
  // LOGS DE AUDITORIA (LGPD)
  // ==========================================================================
  audit: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(100) }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getAuditLogs(ctx.user.id, input?.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
