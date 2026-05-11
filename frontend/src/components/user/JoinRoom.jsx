import { useState } from 'react';
import { KeyRound, User, Hash, MessageSquare } from 'lucide-react';
import { roomService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/primitives';
import { Label } from '@/components/ui/primitives';

// Generar device_id único y persistente en localStorage
const getDeviceId = () => {
  let id = localStorage.getItem('device_id');
  if (!id) {
    id = `dev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('device_id', id);
  }
  return id;
};

export default function JoinRoom({ onJoined }) {
  const [form, setForm]     = useState({ nombre_real: '', pin: '', sala_id: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.nombre_real.trim().length < 2) { setError('El nombre debe tener al menos 2 caracteres.'); return; }
    if (form.pin.length < 4)                 { setError('El PIN debe tener al menos 4 dígitos.'); return; }
    if (!form.sala_id.trim())                { setError('Ingresa el ID de la sala.'); return; }

    setLoading(true);
    try {
      const device_id = getDeviceId();
      const data = await roomService.unirseSala(
        form.nombre_real.trim(),
        form.pin,
        device_id,
        form.sala_id.trim().toUpperCase()
      );
      onJoined({ ...data.sesion, device_id });
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo unir a la sala. Verifica el ID y el PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center">
            <MessageSquare className="w-7 h-7 text-accent" />
          </div>
          <h1 className="text-2xl font-bold">SecureCollabChat</h1>
          <p className="text-sm text-muted-foreground">Ingresa con el ID y PIN que te proporcionó el administrador</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nombre">Tu nombre</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="nombre"
                    className="pl-9"
                    placeholder="Ej: Kevin Famaguana"
                    value={form.nombre_real}
                    onChange={(e) => setForm({ ...form, nombre_real: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sala_id">ID de la sala</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="sala_id"
                    className="pl-9 font-mono uppercase"
                    placeholder="ROOM-1234"
                    value={form.sala_id}
                    onChange={(e) => setForm({ ...form, sala_id: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pin">PIN de acceso</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="pin"
                    type="password"
                    className="pl-9"
                    placeholder="••••"
                    maxLength={10}
                    value={form.pin}
                    onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, '') })}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2 animate-fade-in">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Verificando PIN...
                  </span>
                ) : 'Unirse a la sala'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          ¿Eres administrador?{' '}
          <a href="/admin" className="text-primary hover:underline underline-offset-2">
            Accede aquí
          </a>
        </p>
      </div>
    </div>
  );
}