import { Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LimitsForm } from "@/components/admin/limits-form";
import { CredentialsForm } from "@/components/admin/credentials-form";

export function AdminConfigPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Konfigurasi</h1>
          <p className="text-sm text-muted-foreground">
            Batasan penggunaan default dan kredensial integrasi platform
          </p>
        </div>
      </div>

      <Tabs defaultValue="limits">
        <TabsList>
          <TabsTrigger value="limits">Batasan Default</TabsTrigger>
          <TabsTrigger value="credentials">Kredensial Platform</TabsTrigger>
        </TabsList>
        <TabsContent value="limits">
          <LimitsForm />
        </TabsContent>
        <TabsContent value="credentials">
          <CredentialsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
