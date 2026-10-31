import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              Página não encontrada
            </h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            O endereço não existe ou foi alterado.
          </p>
          <a href={import.meta.env.BASE_URL} className="mt-4 inline-flex min-h-11 items-center font-semibold text-[#2B59FF] underline">Voltar ao início</a>
        </CardContent>
      </Card>
    </div>
  );
}
