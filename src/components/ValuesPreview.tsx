import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileCode2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Component {
  id: string;
  name: string;
  enabled: boolean;
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
  const [copied, setCopied] = useState(false);

  const generateYaml = () => {
    const enabledComponents = components.filter(c => c.enabled);
    
    let yaml = `# Generated values.yaml for ${appName}
# Namespace: ${namespace}

nameOverride: "${appName}"
fullnameOverride: "${appName}"

replicaCount: ${replicas}

# Platform Dependencies (Required)
dependencies:`;

    platformDeps.forEach(dep => {
      yaml += `
  - name: ${dep.id}
    enabled: true
    repository: "https://charts.example.com"`;
    });

    if (enabledComponents.length > 0) {
      yaml += `

# Optional Components`;
      enabledComponents.forEach(comp => {
        yaml += `
${comp.id}:
  enabled: true
  # Add ${comp.name} specific configuration here`;
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateYaml());
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "values.yaml content copied successfully",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-[var(--shadow-elevated)]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 className="h-5 w-5 text-primary" />
            <CardTitle>values.yaml</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
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
        <CardDescription>Live preview of generated configuration</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] w-full rounded-lg border border-border bg-code-bg p-4">
          <pre className="text-sm font-mono text-primary-foreground leading-relaxed">
            {generateYaml()}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
