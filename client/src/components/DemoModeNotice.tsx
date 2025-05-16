import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function DemoModeNotice() {
  return (
    <Alert className="my-4 bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-700">Modo de Demonstração</AlertTitle>
      <AlertDescription className="text-amber-600">
        Esta aplicação está rodando em modo de demonstração. Os dados não serão salvos permanentemente.
      </AlertDescription>
    </Alert>
  );
}