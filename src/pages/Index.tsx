import { DeploymentForm } from "@/components/DeploymentForm";
import { Boxes } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)]">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Boxes className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Helm Deployment Studio</h1>
              <p className="text-sm text-muted-foreground">
                Self-service platform for deploying your Helm charts
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <DeploymentForm />
      </main>
    </div>
  );
};

export default Index;
