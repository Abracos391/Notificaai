import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  AlertCircle,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: stats, isLoading: statsLoading } = trpc.profile.stats.useQuery();
  const { data: recentNotifications, isLoading: notificationsLoading } = trpc.notifications.list.useQuery({ limit: 5 });
  const { data: alerts } = trpc.alerts.list.useQuery({ unreadOnly: true });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {getGreeting()}, {user?.name?.split(" ")[0] || "Advogado"}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Aqui está um resumo das suas atividades recentes
        </p>
      </div>

      {/* Alertas não lidos */}
      {alerts && alerts.length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-warning" />
              <CardTitle className="text-warning">Alertas Pendentes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-muted-foreground">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de Estatísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Notificações</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.notifications?.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.documents || 0} documentos salvos
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviadas</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.notifications?.sent || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.notifications?.read || 0} lidas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Leitura</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.notifications?.sent 
                    ? Math.round((stats.notifications.read / stats.notifications.sent) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  das notificações enviadas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-8 bg-muted animate-pulse rounded" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.notifications?.scheduled || 0}</div>
                <p className="text-xs text-muted-foreground">
                  aguardando envio
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesse as funcionalidades mais utilizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              className="h-auto py-6 flex flex-col gap-2"
              onClick={() => setLocation("/notifications/new")}
            >
              <Send className="h-6 w-6" />
              <span>Nova Notificação</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col gap-2"
              onClick={() => setLocation("/documents")}
            >
              <FileText className="h-6 w-6" />
              <span>Biblioteca de Documentos</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-6 flex flex-col gap-2"
              onClick={() => setLocation("/reports")}
            >
              <TrendingUp className="h-6 w-6" />
              <span>Relatórios</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notificações Recentes */}
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notificações Recentes</CardTitle>
              <CardDescription>Últimas 5 notificações enviadas</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setLocation("/notifications")}>
              Ver Todas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {notificationsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : recentNotifications && recentNotifications.length > 0 ? (
            <div className="space-y-4">
              {recentNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setLocation(`/notifications/${notification.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{notification.recipientName}</p>
                      <span className={`status-badge status-${notification.status}`}>
                        {notification.status === "draft" && "Rascunho"}
                        {notification.status === "scheduled" && "Agendado"}
                        {notification.status === "sending" && "Enviando"}
                        {notification.status === "sent" && "Enviado"}
                        {notification.status === "read" && "Lido"}
                        {notification.status === "failed" && "Falha"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString("pt-BR") : ""}
                    </p>
                  </div>
                  <div className={`cert-${notification.certificationLevel} px-3 py-1 rounded-full text-xs font-medium`}>
                    {notification.certificationLevel === "simple" && "Simples"}
                    {notification.certificationLevel === "advanced" && "Avançada"}
                    {notification.certificationLevel === "qualified" && "Qualificada"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma notificação enviada ainda</p>
              <Button className="mt-4" onClick={() => setLocation("/notifications/new")}>
                Criar Primeira Notificação
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
