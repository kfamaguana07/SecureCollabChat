import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, LogOut, MessageSquare, Image, RefreshCw,
  Copy, Check, ShieldCheck, Users, Hash
} from 'lucide-react';
import { roomService, adminService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Separator } from '@/components/ui/primitives';
import { Label } from '@/components/ui/primitives';
import { useToast } from '@/hooks/useToast';

function CreateRoomModal({ onCreated, onClose }) {
  const [pin, setPin]   = useState('');
  const [tipo, setTipo] = useState('texto');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { toast } = useToast();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (pin.length < 4) { setError('El PIN debe tener al menos 4 dígitos.'); return; }
    setLoading(true);
    try {
      const data = await roomService.crearSala(pin, tipo);
      toast({ title: '✅ Sala creada', description: `ID: ${data.id}`, variant: 'success' });
      onCreated(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la sala.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-sm animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Nueva sala</CardTitle>
          <CardDescription>Configura el acceso y tipo de sala</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>PIN de acceso (mín. 4 dígitos)</Label>
              <Input
                type="password"
                placeholder="••••"
                maxLength={10}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Tipo de sala</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'texto',      icon: MessageSquare, label: 'Texto' },
                  { value: 'multimedia', icon: Image,         label: 'Multimedia' },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTipo(value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      tipo === value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-secondary/50 text-muted-foreground hover:border-border/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
            )}

            <div className="flex gap-2 pt-1">
              <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancelar</Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Creando...' : 'Crear sala'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function RoomCard({ sala, onDelete }) {
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(sala.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="group hover:border-border/80 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={sala.tipo === 'multimedia' ? 'accent' : 'success'}>
                {sala.tipo === 'multimedia' ? <Image className="w-3 h-3 mr-1" /> : <MessageSquare className="w-3 h-3 mr-1" />}
                {sala.tipo}
              </Badge>
            </div>

            <button
              onClick={copyId}
              className="flex items-center gap-1.5 text-sm font-mono text-muted-foreground hover:text-primary transition-colors group/copy"
            >
              <Hash className="w-3.5 h-3.5" />
              <span>{sala.id}</span>
              {copied
                ? <Check className="w-3.5 h-3.5 text-primary" />
                : <Copy className="w-3.5 h-3.5 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
              }
            </button>

            <p className="text-xs text-muted-foreground mt-1">
              {new Date(sala.created_at || sala.createdAt).toLocaleString('es-EC')}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 hover:text-destructive transition-all shrink-0"
            onClick={() => onDelete(sala.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard({ onLogout }) {
  const [salas, setSalas]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  const fetchSalas = useCallback(async () => {
    try {
      const data = await roomService.listarSalas();
      setSalas(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: 'Error', description: 'No se pudieron cargar las salas.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSalas(); }, [fetchSalas]);

  const handleDelete = async (id) => {
    try {
      await roomService.eliminarSala(id);
      setSalas((prev) => prev.filter((s) => s.id !== id));
      toast({ title: 'Sala eliminada', variant: 'default' });
    } catch {
      toast({ title: 'Error al eliminar', variant: 'destructive' });
    }
  };

  const handleCreated = (sala) => setSalas((prev) => [sala, ...prev]);

  const handleLogout = () => { adminService.logout(); onLogout(); };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">SecureCollabChat</span>
            <Badge variant="outline" className="text-xs">Admin</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={fetchSalas} title="Actualizar">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
              <LogOut className="w-4 h-4 mr-1.5" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Salas activas',    value: salas.length,                                          icon: MessageSquare },
            { label: 'Salas multimedia', value: salas.filter((s) => s.tipo === 'multimedia').length,    icon: Image },
            { label: 'Solo texto',       value: salas.filter((s) => s.tipo === 'texto').length,         icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Salas */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Salas de chat</h2>
          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Nueva sala
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : salas.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No hay salas creadas.</p>
              <Button size="sm" className="mt-4" onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-1" /> Crear primera sala
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {salas.map((sala) => (
              <RoomCard key={sala.id} sala={sala} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <CreateRoomModal onCreated={handleCreated} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}