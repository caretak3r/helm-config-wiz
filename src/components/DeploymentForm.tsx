import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Cpu, Database, Network, Lock, FileCode2, Rocket, Shield, Key, ArrowRight } from "lucide-react";
import { ValuesPreview } from "./ValuesPreview";
import { useToast } from "@/hooks/use-toast";

interface HelmComponent {
  id: string;
  name: string;
  description: string;
  icon: any;
  enabled: boolean;
  required?: boolean;
  charts: {
    name: string;
    version: string;
    repository: string;
  }[];
}

interface TLSConfig {
  istioAmbientMesh: boolean;
  ingressTLS: 'cert-manager' | 'self-signed' | 'none';
  appContainerTLS: boolean;
}

export const DeploymentForm = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [appName, setAppName] = useState("my-app");
  const [namespace, setNamespace] = useState("default");
  const [replicas, setReplicas] = useState("1");
  const [tlsConfig, setTLSConfig] = useState<TLSConfig>({
    istioAmbientMesh: false,
    ingressTLS: 'cert-manager',
    appContainerTLS: false,
  });
  
  const [platformDeps] = useState<HelmComponent[]>([
    {
      id: "common",
      name: "Common Library",
      description: "Base library chart with shared templates",
      icon: Package,
      enabled: true,
      required: true,
      charts: [
        {
          name: "common",
          version: "1.2.3",
          repository: "https://charts.bitnami.com/bitnami",
        },
      ],
    },
    {
      id: "platform",
      name: "Platform Services",
      description: "cert-manager + ingress-nginx with dev defaults",
      icon: Network,
      enabled: true,
      required: true,
      charts: [
        {
          name: "cert-manager",
          version: "v1.13.2",
          repository: "https://charts.jetstack.io",
        },
        {
          name: "ingress-nginx",
          version: "4.8.3",
          repository: "https://kubernetes.github.io/ingress-nginx",
        },
      ],
    },
  ]);

  const [helmComponents, setHelmComponents] = useState<HelmComponent[]>([
    {
      id: "postgresql",
      name: "PostgreSQL",
      description: "Relational database",
      icon: Database,
      enabled: false,
      charts: [
        {
          name: "postgresql",
          version: "13.2.24",
          repository: "https://charts.bitnami.com/bitnami",
        },
      ],
    },
    {
      id: "redis",
      name: "Redis",
      description: "In-memory data store",
      icon: Cpu,
      enabled: false,
      charts: [
        {
          name: "redis",
          version: "18.4.0",
          repository: "https://charts.bitnami.com/bitnami",
        },
      ],
    },
    {
      id: "monitoring",
      name: "Monitoring Stack",
      description: "Prometheus + Grafana",
      icon: FileCode2,
      enabled: false,
      charts: [
        {
          name: "kube-prometheus-stack",
          version: "55.5.0",
          repository: "https://prometheus-community.github.io/helm-charts",
        },
        {
          name: "grafana",
          version: "7.0.19",
          repository: "https://grafana.github.io/helm-charts",
        },
      ],
    },
    {
      id: "vault",
      name: "HashiCorp Vault",
      description: "Secrets management",
      icon: Lock,
      enabled: false,
      charts: [
        {
          name: "vault",
          version: "0.27.0",
          repository: "https://helm.releases.hashicorp.com",
        },
      ],
    },
  ]);

  const toggleComponent = (id: string) => {
    setHelmComponents(prev =>
      prev.map(comp =>
        comp.id === id ? { ...comp, enabled: !comp.enabled } : comp
      )
    );
  };

  const enabledCount = platformDeps.length + helmComponents.filter(c => c.enabled).length;

  const handleDeploy = () => {
    toast({
      title: "Deployment Initiated",
      description: `Deploying ${appName} to ${namespace} namespace with ${enabledCount} components`,
    });
  };

  const handleNextTab = (currentTab: string) => {
    const tabs = ["basic", "platform", "components", "security", "preview"];
    const currentIndex = tabs.indexOf(currentTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5" />
            Deploy Helm Chart
          </CardTitle>
          <CardDescription>
            Configure your application deployment step-by-step
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">1. Basic</TabsTrigger>
              <TabsTrigger value="platform">2. Platform</TabsTrigger>
              <TabsTrigger value="components">3. Components</TabsTrigger>
              <TabsTrigger value="security">4. Security</TabsTrigger>
              <TabsTrigger value="preview">5. Preview</TabsTrigger>
            </TabsList>

            {/* Step 1: Basic Configuration */}
            <TabsContent value="basic" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Application Details</h3>
                  <p className="text-sm text-muted-foreground">
                    Start by defining your application's basic configuration
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appName">Application Name</Label>
                    <Input
                      id="appName"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="my-app"
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be used as the release name in Kubernetes
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="namespace">Target Namespace</Label>
                    <Input
                      id="namespace"
                      value={namespace}
                      onChange={(e) => setNamespace(e.target.value)}
                      placeholder="default"
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      The Kubernetes namespace where resources will be deployed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="replicas">Replica Count</Label>
                    <Input
                      id="replicas"
                      type="number"
                      min="1"
                      value={replicas}
                      onChange={(e) => setReplicas(e.target.value)}
                      placeholder="1"
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of pod replicas for high availability
                    </p>
                  </div>
                </div>
              </div>
              <Button onClick={() => handleNextTab("basic")} className="w-full">
                Continue to Platform Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </TabsContent>

            {/* Step 2: Platform Dependencies */}
            <TabsContent value="platform" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Platform Dependencies</h3>
                  <p className="text-sm text-muted-foreground">
                    These required components provide core platform functionality
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {platformDeps.map((dep) => {
                    const Icon = dep.icon;
                    return (
                      <Card key={dep.id} className="relative border-primary/20 bg-primary/5">
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-base flex items-center gap-2">
                                {dep.name}
                                <Badge variant="secondary" className="text-xs">Required</Badge>
                              </CardTitle>
                              <CardDescription className="text-sm mt-1">
                                {dep.description}
                              </CardDescription>
                              <div className="mt-3 space-y-1">
                                {dep.charts.map((chart, idx) => (
                                  <div key={idx} className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                                    <Package className="w-3 h-3" />
                                    <span>{chart.name}@{chart.version}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>
              <Button onClick={() => handleNextTab("platform")} className="w-full">
                Continue to Component Selection
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </TabsContent>

            {/* Step 3: Additional Components */}
            <TabsContent value="components" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Helmet Library Components</h3>
                  <p className="text-sm text-muted-foreground">
                    Select optional components to enhance your application
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {helmComponents.map((comp) => {
                    const Icon = comp.icon;
                    return (
                      <Card
                        key={comp.id}
                        className={`cursor-pointer transition-all ${
                          comp.enabled
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  comp.enabled ? "bg-primary/20" : "bg-muted"
                                }`}
                              >
                                <Icon
                                  className={`w-5 h-5 ${
                                    comp.enabled ? "text-primary" : "text-muted-foreground"
                                  }`}
                                />
                              </div>
                              <div>
                                <CardTitle className="text-base">{comp.name}</CardTitle>
                                <CardDescription className="text-sm mt-1">
                                  {comp.description}
                                </CardDescription>
                              </div>
                            </div>
                            <Switch
                              checked={comp.enabled}
                              onCheckedChange={() => toggleComponent(comp.id)}
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-1">
                            {comp.charts.map((chart, idx) => (
                              <div key={idx} className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                                <Package className="w-3 h-3" />
                                <span>{chart.name}@{chart.version}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
              <Button onClick={() => handleNextTab("components")} className="w-full">
                Continue to Security Configuration
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </TabsContent>

            {/* Step 4: Security & TLS Configuration */}
            <TabsContent value="security" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">TLS & Security Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure TLS certificates and security settings
                  </p>
                </div>

                {/* ISTIO Ambient Mesh */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Network className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">ISTIO Ambient Mesh</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            Enable service mesh with mTLS for service-to-service communication
                          </CardDescription>
                        </div>
                      </div>
                      <Switch
                        checked={tlsConfig.istioAmbientMesh}
                        onCheckedChange={(checked) =>
                          setTLSConfig({ ...tlsConfig, istioAmbientMesh: checked })
                        }
                      />
                    </div>
                  </CardHeader>
                  {tlsConfig.istioAmbientMesh && (
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        <Shield className="w-4 h-4 inline mr-2" />
                        Automatic mTLS between services with zero-trust networking
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Ingress TLS */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Lock className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">Ingress TLS Configuration</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          Choose how to handle TLS certificates for external traffic
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border hover:bg-accent">
                        <input
                          type="radio"
                          name="ingressTLS"
                          value="cert-manager"
                          checked={tlsConfig.ingressTLS === 'cert-manager'}
                          onChange={(e) =>
                            setTLSConfig({ ...tlsConfig, ingressTLS: e.target.value as any })
                          }
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="font-medium">cert-manager (Recommended)</div>
                          <div className="text-xs text-muted-foreground">
                            Automatic certificate provisioning from Let's Encrypt
                          </div>
                        </div>
                      </Label>
                      <Label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border hover:bg-accent">
                        <input
                          type="radio"
                          name="ingressTLS"
                          value="self-signed"
                          checked={tlsConfig.ingressTLS === 'self-signed'}
                          onChange={(e) =>
                            setTLSConfig({ ...tlsConfig, ingressTLS: e.target.value as any })
                          }
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="font-medium">Self-Signed Certificate</div>
                          <div className="text-xs text-muted-foreground">
                            Generate self-signed certificates for development/testing
                          </div>
                        </div>
                      </Label>
                      <Label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border hover:bg-accent">
                        <input
                          type="radio"
                          name="ingressTLS"
                          value="none"
                          checked={tlsConfig.ingressTLS === 'none'}
                          onChange={(e) =>
                            setTLSConfig({ ...tlsConfig, ingressTLS: e.target.value as any })
                          }
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="font-medium">No TLS</div>
                          <div className="text-xs text-muted-foreground">
                            Disable TLS (HTTP only - not recommended for production)
                          </div>
                        </div>
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Application Container TLS */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Key className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">Application Container TLS</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            Mount TLS certificates directly in application containers
                          </CardDescription>
                        </div>
                      </div>
                      <Switch
                        checked={tlsConfig.appContainerTLS}
                        onCheckedChange={(checked) =>
                          setTLSConfig({ ...tlsConfig, appContainerTLS: checked })
                        }
                      />
                    </div>
                  </CardHeader>
                  {tlsConfig.appContainerTLS && (
                    <CardContent>
                      <div className="text-sm text-muted-foreground space-y-2">
                        <div>Certificates will be mounted at:</div>
                        <div className="font-mono text-xs bg-muted p-2 rounded">
                          /etc/tls/certs/tls.crt<br />
                          /etc/tls/certs/tls.key
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
              <Button onClick={() => handleNextTab("security")} className="w-full">
                Continue to Preview & Deploy
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </TabsContent>

            {/* Step 5: Preview */}
            <TabsContent value="preview" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Review Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Preview your generated Helm chart configuration
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="text-xs text-muted-foreground">Application</div>
                    <div className="font-mono font-semibold">{appName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Namespace</div>
                    <div className="font-mono font-semibold">{namespace}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Components</div>
                    <div className="font-semibold">{enabledCount} enabled</div>
                  </div>
                </div>
              </div>
              <Button onClick={handleDeploy} className="w-full" size="lg">
                <Rocket className="w-4 h-4 mr-2" />
                Deploy Helm Chart
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ValuesPreview
        appName={appName}
        namespace={namespace}
        replicas={parseInt(replicas)}
        platformDeps={platformDeps}
        components={helmComponents}
        tlsConfig={tlsConfig}
      />
    </div>
  );
};
