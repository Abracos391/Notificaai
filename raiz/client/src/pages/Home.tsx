import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { 
  Shield, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Scale, 
  Lock,
  Bell,
  FileCheck,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirecionar usuários autenticados para o dashboard
  if (isAuthenticated && !loading) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={APP_LOGO} alt={APP_TITLE} className="h-10 w-10" />
              <h1 className="text-2xl font-bold text-primary">{APP_TITLE}</h1>
            </div>
            <Button asChild>
              <a href={getLoginUrl()}>Entrar</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Certificação Digital ICP-Brasil</span>
            </div>
            
            <h2 className="text-5xl font-bold text-foreground mb-6">
              Notificações Jurídicas com <span className="text-primary">Validade Legal</span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Envie notificações extrajudiciais com certificação digital, carimbo de tempo e comprovante de entrega. 
              Segurança jurídica garantida pela tecnologia ICP-Brasil.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8">
                <a href={getLoginUrl()}>
                  Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Ver Demonstração
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              ✓ Teste grátis por 14 dias &nbsp;&nbsp; ✓ Sem cartão de crédito &nbsp;&nbsp; ✓ Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Tudo que você precisa para notificações jurídicas
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Uma plataforma completa para advogados e escritórios que buscam eficiência e segurança jurídica
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-soft hover:shadow-soft-lg transition-shadow">
              <CardHeader>
                <FileCheck className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Certificação Digital</CardTitle>
                <CardDescription>
                  Três níveis de certificação: Simples, Avançada e Qualificada com ICP-Brasil
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft hover:shadow-soft-lg transition-shadow">
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Carimbo de Tempo</CardTitle>
                <CardDescription>
                  Timestamp RFC 3161 por Autoridade de Carimbo do Tempo credenciada pelo ITI
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft hover:shadow-soft-lg transition-shadow">
              <CardHeader>
                <CheckCircle2 className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Comprovante de Entrega</CardTitle>
                <CardDescription>
                  Certificado de envio com hash único, data/hora de envio e confirmação de leitura
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft hover:shadow-soft-lg transition-shadow">
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Biblioteca de Documentos</CardTitle>
                <CardDescription>
                  Templates prontos de petições, contratos, procurações e notificações
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft hover:shadow-soft-lg transition-shadow">
              <CardHeader>
                <Bell className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Agendamento Inteligente</CardTitle>
                <CardDescription>
                  Agende envios futuros e receba alertas de proximidade de prazos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-soft hover:shadow-soft-lg transition-shadow">
              <CardHeader>
                <Lock className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Conformidade LGPD</CardTitle>
                <CardDescription>
                  Logs de auditoria, gestão de consentimentos e segurança de dados garantida
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Certification Levels */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Níveis de Certificação
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha o nível de segurança jurídica adequado para cada situação
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="shadow-soft">
              <CardHeader>
                <div className="cert-simple px-3 py-1 rounded-full text-sm font-medium inline-block mb-4">
                  Simples
                </div>
                <CardTitle>Notificação Simples</CardTitle>
                <CardDescription className="mt-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Hash SHA-256 do documento</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Registro de envio e leitura</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Comprovante básico</span>
                    </li>
                  </ul>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">R$ 2,90</p>
                <p className="text-sm text-muted-foreground">por notificação</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft-lg border-2 border-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-medium">
                Mais Popular
              </div>
              <CardHeader>
                <div className="cert-advanced px-3 py-1 rounded-full text-sm font-medium inline-block mb-4">
                  Avançada
                </div>
                <CardTitle>Notificação Avançada</CardTitle>
                <CardDescription className="mt-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Tudo do plano Simples</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Carimbo de tempo RFC 3161</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Certificado de envio completo</span>
                    </li>
                  </ul>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">R$ 7,90</p>
                <p className="text-sm text-muted-foreground">por notificação</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <div className="cert-qualified px-3 py-1 rounded-full text-sm font-medium inline-block mb-4">
                  Qualificada
                </div>
                <CardTitle>Notificação Qualificada</CardTitle>
                <CardDescription className="mt-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Tudo do plano Avançada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Integração AR Online</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Máxima validade jurídica</span>
                    </li>
                  </ul>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">R$ 19,90</p>
                <p className="text-sm text-muted-foreground">por notificação</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <Scale className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h3 className="text-4xl font-bold mb-4">
            Pronto para modernizar suas notificações jurídicas?
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Junte-se a centenas de advogados e escritórios que já confiam no Notificaai
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8">
            <a href={getLoginUrl()}>
              Começar Teste Grátis <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
                <span className="font-bold text-foreground">{APP_TITLE}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Notificações jurídicas com validade legal e certificação digital ICP-Brasil.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-primary">Preços</a></li>
                <li><a href="#" className="hover:text-primary">Integrações</a></li>
                <li><a href="#" className="hover:text-primary">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Sobre</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
                <li><a href="#" className="hover:text-primary">Contato</a></li>
                <li><a href="#" className="hover:text-primary">Carreiras</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-primary">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-primary">LGPD</a></li>
                <li><a href="#" className="hover:text-primary">Segurança</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {APP_TITLE}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
