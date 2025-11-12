import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Package, Cpu, Database, Network, Lock, FileCode2, Rocket } from "lucide-react";
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

export const DeploymentForm = () => {
  const { toast } = useToast();
  const [appName, setAppName] = useState("my-app");
  const [namespace, setNamespace] = useState("default");
  const [replicas, setReplicas] = useState("1");
  
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

  const handleDeploy = () => {
    toast({
      title: "Deployment initiated",
      description: `Deploying ${appName} to ${namespace} namespace...`,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* Basic Configuration */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Basic Configuration</CardTitle>
            <CardDescription>Configure your application deployment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appName">Application Name</Label>
              <Input
                id="appName"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="my-app"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="namespace">Namespace</Label>
              <Input
                id="namespace"
                value={namespace}
                onChange={(e) => setNamespace(e.target.value)}
                placeholder="default"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="replicas">Replicas</Label>
              <Input
                id="replicas"
                type="number"
                value={replicas}
                onChange={(e) => setReplicas(e.target.value)}
                min="1"
                max="10"
                className="font-mono"
              />
            </div>
          </CardContent>
        </Card>

        {/* Platform Dependencies */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Platform Dependencies</CardTitle>
            <CardDescription>Required infrastructure components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {platformDeps.map((dep) => {
              const Icon = dep.icon;
              return (
                <div
                  key={dep.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border"
                >
                  <div className="p-2 rounded-md bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{dep.name}</h4>
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{dep.description}</p>
                    <div className="space-y-1">
                      {dep.charts.map((chart) => (
                        <div key={chart.name} className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                          <span className="text-primary">•</span>
                          <span className="font-medium">{chart.name}</span>
                          <span className="text-muted-foreground/60">v{chart.version}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Switch checked={dep.enabled} disabled />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Helmet Library Components */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle>Additional Components</CardTitle>
            <CardDescription>Optional services from Helmet library</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {helmComponents.map((comp) => {
              const Icon = comp.icon;
              return (
                <div
                  key={comp.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className={`p-2 rounded-md ${comp.enabled ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Icon className={`h-5 w-5 ${comp.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">{comp.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{comp.description}</p>
                    <div className="space-y-1">
                      {comp.charts.map((chart) => (
                        <div key={chart.name} className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                          <span className="text-primary">•</span>
                          <span className="font-medium">{chart.name}</span>
                          <span className="text-muted-foreground/60">v{chart.version}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Switch
                    checked={comp.enabled}
                    onCheckedChange={() => toggleComponent(comp.id)}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Separator />

        <Button onClick={handleDeploy} size="lg" className="w-full">
          <Rocket className="mr-2 h-5 w-5" />
          Deploy Helm Chart
        </Button>
      </div>

      {/* Values Preview */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <ValuesPreview
          appName={appName}
          namespace={namespace}
          replicas={parseInt(replicas)}
          platformDeps={platformDeps}
          components={helmComponents}
        />
      </div>
    </div>
  );
};
