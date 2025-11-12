import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCode2, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Component {
  id: string;
  name: string;
  enabled: boolean;
  charts: {
    name: string;
    version: string;
    repository: string;
  }[];
}

interface ValuesPreviewProps {
  appName: string;
  namespace: string;
  replicas: number;
  platformDeps: Component[];
  components: Component[];
}

export const ValuesPreview = ({
  appName,
  namespace,
  replicas,
  platformDeps,
  components,
}: ValuesPreviewProps) => {
  const { toast } = useToast();
  const [copiedChart, setCopiedChart] = useState(false);
  const [copiedValues, setCopiedValues] = useState(false);
  const [chartOpen, setChartOpen] = useState(true);
  const [valuesOpen, setValuesOpen] = useState(true);

  const generateChartYaml = () => {
    const allDependencies = [
      ...platformDeps.flatMap(dep => dep.charts),
      ...components.filter(c => c.enabled).flatMap(c => c.charts)
    ];

    let yaml = `apiVersion: v2
name: ${appName}
description: A Helm chart for ${appName}
type: application
version: 1.0.0
appVersion: "1.0.0"

dependencies:`;

    allDependencies.forEach(chart => {
      yaml += `
  - name: ${chart.name}
    version: ${chart.version}
    repository: ${chart.repository}`;
    });

    return yaml;
  };

  const generateValuesYaml = () => {
    const enabledComponents = components.filter(c => c.enabled);
    
    let yaml = `# Generated values.yaml for ${appName}
# Namespace: ${namespace}

nameOverride: "${appName}"
fullnameOverride: "${appName}"

replicaCount: ${replicas}

# Platform Dependencies (Required)
common:
  enabled: true
  
certManager:
  enabled: true
  installCRDs: true
  
ingressNginx:
  enabled: true
  controller:
    service:
      type: LoadBalancer`;

    if (enabledComponents.length > 0) {
      yaml += `

# Optional Components`;
      enabledComponents.forEach(comp => {
        yaml += `
${comp.id}:
  enabled: true`;
        if (comp.id === 'postgresql') {
          yaml += `
  auth:
    username: postgres
    password: changeme
    database: ${appName}`;
        } else if (comp.id === 'redis') {
          yaml += `
  auth:
    enabled: true
    password: changeme`;
        } else if (comp.id === 'monitoring') {
          yaml += `
  prometheus:
    enabled: true
  grafana:
    enabled: true
    adminPassword: changeme`;
        } else if (comp.id === 'vault') {
          yaml += `
  server:
    dev:
      enabled: true`;
        }
      });
    }

    yaml += `

# Service Configuration
service:
  type: ClusterIP
  port: 80

# Ingress Configuration
ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
  hosts:
    - host: ${appName}.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: ${appName}-tls
      hosts:
        - ${appName}.example.com

# Resources
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi`;

    return yaml;
  };

  const handleCopyChart = async () => {
    try {
      await navigator.clipboard.writeText(generateChartYaml());
      setCopiedChart(true);
      toast({
        title: "Copied to clipboard",
        description: "Chart.yaml content copied successfully",
      });
      setTimeout(() => setCopiedChart(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleCopyValues = async () => {
    try {
      await navigator.clipboard.writeText(generateValuesYaml());
      setCopiedValues(true);
      toast({
        title: "Copied to clipboard",
        description: "values.yaml content copied successfully",
      });
      setTimeout(() => setCopiedValues(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Chart.yaml Preview */}
      <Card className="shadow-[var(--shadow-elevated)]">
        <CardHeader>
          <Collapsible open={chartOpen} onOpenChange={setChartOpen}>
            <div className="flex items-center justify-between">
              <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                <FileCode2 className="h-5 w-5 text-accent" />
                <CardTitle>Chart.yaml</CardTitle>
                {chartOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyChart}
                className="gap-2"
              >
                {copiedChart ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <CollapsibleContent>
              <CardDescription className="mt-2">Helm chart metadata and dependencies</CardDescription>
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>
        <Collapsible open={chartOpen} onOpenChange={setChartOpen}>
          <CollapsibleContent>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <SyntaxHighlighter
                  language="yaml"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    maxHeight: '400px',
                  }}
                >
                  {generateChartYaml()}
                </SyntaxHighlighter>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* values.yaml Preview */}
      <Card className="shadow-[var(--shadow-elevated)]">
        <CardHeader>
          <Collapsible open={valuesOpen} onOpenChange={setValuesOpen}>
            <div className="flex items-center justify-between">
              <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                <FileCode2 className="h-5 w-5 text-primary" />
                <CardTitle>values.yaml</CardTitle>
                {valuesOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyValues}
                className="gap-2"
              >
                {copiedValues ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <CollapsibleContent>
              <CardDescription className="mt-2">Live preview of generated configuration</CardDescription>
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>
        <Collapsible open={valuesOpen} onOpenChange={setValuesOpen}>
          <CollapsibleContent>
            <CardContent>
              <div className="rounded-lg border border-border overflow-hidden">
                <SyntaxHighlighter
                  language="yaml"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    maxHeight: '600px',
                  }}
                >
                  {generateValuesYaml()}
                </SyntaxHighlighter>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};
