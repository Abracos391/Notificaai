import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { 
  Shield, 
  Send, 
  Save, 
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CertificationLevel = "simple" | "advanced" | "qualified";

export default function NewNotification() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("form");
  
  // Form state
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [certificationLevel, setCertificationLevel] = useState<CertificationLevel>("simple");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const createMutation = trpc.notifications.create.useMutation({
    onSuccess: (data) => {
      toast.success("Notificação criada com sucesso!");
      setLocation(`/notifications/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Erro ao criar notificação: ${error.message}`);
    },
  });

  const handleSaveDraft = () => {
    if (!recipientName || !recipientEmail || !subject || !content) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    createMutation.mutate({
      recipientName,
      recipientEmail,
      recipientPhone: recipientPhone || undefined,
      recipientAddress: recipientAddress || undefined,
      subject,
      content,
      certificationLevel,
    });
  };

  const handleSchedule = () => {
    if (!recipientName || !recipientEmail || !subject || !content) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast.error("Selecione data e hora para agendamento");
      return;
    }

    const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`);
    
    createMutation.mutate({
      recipientName,
      recipientEmail,
      recipientPhone: recipientPhone || undefined,
      recipientAddress: recipientAddress || undefined,
      subject,
      content,
      certificationLevel,
      scheduledFor,
    });
  };

  const handleSendNow = () => {
    if (!recipientName || !recipientEmail || !subject || !content) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    // TODO: Implementar envio imediato
    toast.info("Funcionalidade de envio imediato em desenvolvimento");
  };

  const getCertificationInfo = (level: CertificationLevel) => {
    switch (level) {
      case "simple":
        return {
          title: "Certificação Simples",
          description: "Hash SHA-256 + Registro de envio e leitura",
          price: "R$ 2,90",
          features: ["Hash criptográfico", "Comprovante básico", "Registro de leitura"],
        };
      case "advanced":
        return {
          title: "Certificação Avançada",
          description: "Carimbo de tempo RFC 3161 + Certificado completo",
          price: "R$ 7,90",
          features: ["Tudo do Simples", "Carimbo de tempo ICP-Brasil", "Certificado detalhado"],
        };
      case "qualified":
        return {
          title: "Certificação Qualificada",
          description: "Integração AR Online + Máxima validade jurídica",
          price: "R$ 19,90",
          features: ["Tudo do Avançada", "AR Online", "Máxima validade legal"],
        };
    }
  };

  const certInfo = getCertificationInfo(certificationLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Nova Notificação</h1>
        <p className="text-muted-foreground mt-2">
          Crie uma notificação jurídica com validade legal
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="form">
            <FileText className="h-4 w-4 mr-2" />
            Formulário
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Shield className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6">
          {/* Nível de Certificação */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Nível de Certificação
              </CardTitle>
              <CardDescription>
                Escolha o nível de segurança jurídica para esta notificação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setCertificationLevel("simple")}
                  className={`p-4 border-2 rounded-lg text-left transition-all hover:border-primary ${
                    certificationLevel === "simple" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="cert-simple px-3 py-1 rounded-full text-xs font-medium inline-block mb-2">
                    Simples
                  </div>
                  <p className="font-semibold mb-1">R$ 2,90</p>
                  <p className="text-sm text-muted-foreground">Hash + Comprovante</p>
                </button>

                <button
                  type="button"
                  onClick={() => setCertificationLevel("advanced")}
                  className={`p-4 border-2 rounded-lg text-left transition-all hover:border-primary ${
                    certificationLevel === "advanced" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="cert-advanced px-3 py-1 rounded-full text-xs font-medium inline-block mb-2">
                    Avançada
                  </div>
                  <p className="font-semibold mb-1">R$ 7,90</p>
                  <p className="text-sm text-muted-foreground">+ Carimbo de tempo</p>
                </button>

                <button
                  type="button"
                  onClick={() => setCertificationLevel("qualified")}
                  className={`p-4 border-2 rounded-lg text-left transition-all hover:border-primary ${
                    certificationLevel === "qualified" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="cert-qualified px-3 py-1 rounded-full text-xs font-medium inline-block mb-2">
                    Qualificada
                  </div>
                  <p className="font-semibold mb-1">R$ 19,90</p>
                  <p className="text-sm text-muted-foreground">+ AR Online</p>
                </button>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">{certInfo.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{certInfo.description}</p>
                <ul className="space-y-1">
                  {certInfo.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Dados do Destinatário */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Dados do Destinatário</CardTitle>
              <CardDescription>Informações de quem receberá a notificação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">
                    Nome Completo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="recipientName"
                    placeholder="João da Silva"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">
                    E-mail <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="recipientEmail"
                    type="email"
                    placeholder="joao@exemplo.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="recipientPhone">Telefone</Label>
                  <Input
                    id="recipientPhone"
                    placeholder="(11) 99999-9999"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientAddress">Endereço</Label>
                  <Input
                    id="recipientAddress"
                    placeholder="Rua Exemplo, 123 - São Paulo/SP"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conteúdo da Notificação */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Conteúdo da Notificação</CardTitle>
              <CardDescription>Assunto e corpo da notificação jurídica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">
                  Assunto <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="subject"
                  placeholder="Ex: Notificação Extrajudicial - Cobrança de Débito"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">
                  Conteúdo <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="Digite o conteúdo da notificação..."
                  className="min-h-[300px] font-mono text-sm"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Dica: Use templates prontos para agilizar o processo
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Agendamento */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Agendamento (Opcional)
              </CardTitle>
              <CardDescription>
                Agende o envio para uma data e hora específica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Data</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Hora</Label>
                  <Input
                    id="scheduledTime"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={() => setLocation("/notifications")}>
              Cancelar
            </Button>
            <Button variant="outline" onClick={handleSaveDraft} disabled={createMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Rascunho
            </Button>
            {scheduledDate && scheduledTime ? (
              <Button onClick={handleSchedule} disabled={createMutation.isPending}>
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Envio
              </Button>
            ) : (
              <Button onClick={handleSendNow} disabled={createMutation.isPending}>
                <Send className="h-4 w-4 mr-2" />
                Enviar Agora
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Preview da Notificação</CardTitle>
              <CardDescription>
                Visualize como a notificação será apresentada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Certificação */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Nível de Certificação</p>
                  <p className="font-semibold">{certInfo.title}</p>
                </div>
                <div className={`cert-${certificationLevel} px-3 py-1 rounded-full text-sm font-medium`}>
                  {certInfo.price}
                </div>
              </div>

              {/* Destinatário */}
              <div>
                <h4 className="font-semibold mb-3">Destinatário</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Nome:</strong> {recipientName || "—"}</p>
                  <p><strong>E-mail:</strong> {recipientEmail || "—"}</p>
                  {recipientPhone && <p><strong>Telefone:</strong> {recipientPhone}</p>}
                  {recipientAddress && <p><strong>Endereço:</strong> {recipientAddress}</p>}
                </div>
              </div>

              {/* Conteúdo */}
              <div>
                <h4 className="font-semibold mb-3">Conteúdo</h4>
                <div className="border border-border rounded-lg p-6 bg-card">
                  <h3 className="text-xl font-bold mb-4">{subject || "Sem assunto"}</h3>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {content || "Sem conteúdo"}
                  </div>
                </div>
              </div>

              {/* Agendamento */}
              {scheduledDate && scheduledTime && (
                <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Envio Agendado</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
