import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, Paperclip, LogOut, Users, Hash, Image,
  MessageSquare, File, X, ChevronRight, Trash2
} from 'lucide-react';
import {
  initSocket, emitJoinRoom, emitSendMessage, emitDeleteMessage,
  emitTyping, emitStopTyping, onNewMessage, onNewFile,
  onUsuarioEntro, onUsuarioSalio, onListaUsuarios, onErrorEvento, onSesionCerrada,
  onUsuarioEscribiendo, onUsuarioDejEscribir, onMessageDeleted, closeSocket
} from '@/services/socket';
import { roomService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, Separator } from '@/components/ui/primitives';
import { API_URL } from '@/config/constants';

// ─── Burbuja de mensaje ──────────────────────────────────
function MessageBubble({ msg, isOwn, onDelete }) {
  const isFile = msg.archivo || msg.tipo === 'file';

  return (
    <div className={`flex flex-col gap-0.5 max-w-[75%] animate-fade-in ${isOwn ? 'ml-auto items-end' : 'items-start'}`}>
      {!isOwn && (
        <span className="text-xs text-muted-foreground px-1 font-medium">
          {msg.nickname || msg.autor?.nickname}
        </span>
      )}

      <div className={`group relative px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isOwn
          ? 'bg-primary text-primary-foreground rounded-br-sm'
          : 'bg-secondary text-foreground rounded-bl-sm border border-border'
      }`}>
        {isFile ? (
          <FileMessage archivo={msg.archivo} nombre={msg.contenido} />
        ) : (
          <span className="whitespace-pre-wrap break-words">{msg.contenido}</span>
        )}

        {isOwn && onDelete && (
          <button
            onClick={() => onDelete(msg.id)}
            className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive/80 hover:bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            title="Eliminar mensaje"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      <span className="text-[10px] text-muted-foreground/60 px-1">
        {new Date(msg.timestamp || msg.created_at || msg.fecha_envio).toLocaleTimeString('es-EC', {
          hour: '2-digit', minute: '2-digit'
        })}
      </span>
    </div>
  );
}

function FileMessage({ archivo, nombre }) {
  if (!archivo) return <span className="italic opacity-70">{nombre}</span>;
  const isImage = archivo.mimetype?.startsWith('image/');
  const url     = `${API_URL}${archivo.url}`;

  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="block">
        <img src={url} alt="imagen" className="max-w-[220px] rounded-lg object-cover" />
      </a>
    );
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <File className="w-5 h-5 shrink-0" />
      <span className="underline underline-offset-2 break-all text-xs">{archivo.url?.split('/').pop()}</span>
    </a>
  );
}

// ─── Panel de usuarios ───────────────────────────────────
function UsersPanel({ usuarios, onClose }) {
  return (
    <aside className="w-60 border-l border-border bg-card flex flex-col shrink-0 animate-slide-in">
      <div className="flex items-center justify-between px-4 h-14 border-b border-border">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Users className="w-4 h-4 text-primary" />
          Usuarios ({usuarios.length})
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {usuarios.map((u) => (
          <div key={u.id || u.nickname} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-secondary/50 transition-colors">
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                {(u.nickname || '?')[0].toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-primary rounded-full border border-card" />
            </div>
            <span className="text-sm truncate">{u.nickname}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

// ─── ChatRoom principal ──────────────────────────────────
export default function ChatRoom({ sesion, onLeave }) {
  const [messages,  setMessages]  = useState([]);
  const [usuarios,  setUsuarios]  = useState([]);
  const [input,     setInput]     = useState('');
  const [file,      setFile]      = useState(null);
  const [uploading, setUploading] = useState(false);
  const [typing,    setTyping]    = useState('');
  const [showUsers, setShowUsers] = useState(false);
  const [connected, setConnected] = useState(false);

  const bottomRef  = useRef(null);
  const typingTimer = useRef(null);
  const fileRef    = useRef(null);

  const { sala_id, sesion_id = sesion?.id, nickname, tipo } = sesion;
  const isMultimedia = tipo === 'multimedia';

  // Scroll al fondo
  const scrollBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  // Inicializar socket y cargar historial
  useEffect(() => {
    const socket = initSocket();

    // Cargar historial
    roomService.obtenerMensajes(sala_id).then((data) => {
      const normalizados = Array.isArray(data)
        ? data.map((m) => ({
          ...m,
          archivo: m.archivo || m.adjunto || null,
          tipo: (m.archivo || m.adjunto) ? 'file' : 'text'
        }))
        : [];
      setMessages(normalizados);
      scrollBottom();
    }).catch(() => {});

    // Conectar a la sala
    socket.on('connect', () => {
      setConnected(true);
      emitJoinRoom(sesion_id, sala_id);
    });
    if (socket.connected) {
      setConnected(true);
      emitJoinRoom(sesion_id, sala_id);
    }
    socket.on('disconnect', () => setConnected(false));

    // Listeners
    const offs = [
      onNewMessage((msg) => {
        setMessages((prev) => [...prev, { ...msg, tipo: 'text' }]);
        scrollBottom();
      }),
      onNewFile((msg) => {
        const normalized = {
          ...msg,
          id: msg.id || msg.mensaje_id,
          archivo: msg.archivo || msg.adjunto || null,
          tipo: 'file'
        };
        setMessages((prev) => {
          const exists = prev.some((m) => (m.id || m.mensaje_id) === normalized.id);
          return exists ? prev : [...prev, normalized];
        });
        scrollBottom();
      }),
      onListaUsuarios(({ usuarios }) => setUsuarios(usuarios)),
      onUsuarioEntro((data) => {
        setUsuarios((prev) => [...prev.filter((u) => u.nickname !== data.nickname), { nickname: data.nickname, id: data.nickname }]);
      }),
      onUsuarioSalio((data) => {
        setUsuarios((prev) => prev.filter((u) => u.nickname !== data.nickname));
      }),
      onUsuarioEscribiendo(({ nickname: n }) => {
        if (n !== nickname) setTyping(`${n} está escribiendo...`);
      }),
      onUsuarioDejEscribir(() => setTyping('')),
      onSesionCerrada(() => {
        closeSocket();
        onLeave();
      }),
      onErrorEvento(({ error }) => console.error('Socket error:', error)),
      onMessageDeleted(({ mensaje_id }) => {
        setMessages((prev) => prev.filter((m) => (m.id || m.mensaje_id) !== mensaje_id));
      }),
    ];

    return () => {
      offs.forEach((off) => off());
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [sala_id, sesion_id]);

  // Typing indicator
  const handleInputChange = (e) => {
    setInput(e.target.value);
    emitTyping(sala_id);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitStopTyping(sala_id), 1500);
  };

  // Enviar mensaje
  const handleSend = (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text && !file) return;

    if (file) {
      handleFileUpload();
      return;
    }

    emitSendMessage(text, sala_id, sesion_id);
    setInput('');
    emitStopTyping(sala_id);
  };

  // Subir archivo
  const handleFileUpload = async () => {
    if (!file) return;
    const  MAX_SIZE = 10 * 1024 * 1024;
    if(file.size > MAX_SIZE){
      alert("El archivo excede el límite de 10MB permitido.");
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    setUploading(true);
    try {
      const data = await roomService.subirArchivo(sala_id, file, sesion_id);
      const nuevo = {
        id: data.mensaje_id,
        contenido: `[Archivo: ${file.name}]`,
        archivo: data.archivo,
        sesion_id,
        nickname,
        timestamp: new Date().toISOString(),
        tipo: 'file'
      };
      setMessages((prev) => {
        const exists = prev.some((m) => (m.id || m.mensaje_id) === nuevo.id);
        return exists ? prev : [...prev, nuevo];
      });
      scrollBottom();
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      alert(err.response?.data?.error || "Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLeave = () => {
    closeSocket();
    onLeave();
  };

  const handleDeleteMessage = (mensaje_id) => {
    emitDeleteMessage(mensaje_id, sala_id, sesion_id);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b border-border bg-card/70 backdrop-blur-sm shrink-0">
        <div className="h-14 px-4 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              {isMultimedia ? <Image className="w-4 h-4 text-primary" /> : <MessageSquare className="w-4 h-4 text-primary" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-sm">{sala_id}</span>
                <Badge variant={isMultimedia ? 'accent' : 'success'} className="hidden sm:inline-flex">
                  {tipo}
                </Badge>
                <span className={`w-2 h-2 rounded-full shrink-0 ${connected ? 'bg-primary' : 'bg-destructive'}`} />
              </div>
              <p className="text-xs text-muted-foreground truncate">Conectado como <b>{nickname}</b></p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setShowUsers((v) => !v)} title="Usuarios">
              <Users className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleLeave} title="Salir">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mensajes */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 gap-2">
                <MessageSquare className="w-10 h-10" />
                <p className="text-sm">No hay mensajes aún. ¡Di hola!</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id || i}
                msg={msg}
                isOwn={msg.sesion_id === sesion_id || msg.nickname === nickname}
                onDelete={handleDeleteMessage}
              />
            ))}

            {typing && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground animate-fade-in">
                <span className="flex gap-0.5">
                  {[0, 0.2, 0.4].map((d, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-pulse-dot" style={{ animationDelay: `${d}s` }} />
                  ))}
                </span>
                {typing}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <Separator />

          {/* Archivo seleccionado */}
          {file && (
            <div className="px-4 py-2 flex items-center gap-2 bg-accent/5 border-t border-accent/20 animate-fade-in">
              <File className="w-4 h-4 text-accent shrink-0" />
              <span className="text-xs text-accent truncate flex-1">{file.name}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFile(null)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="p-3 shrink-0">
            <form onSubmit={handleSend} className="flex items-end gap-2 bg-card border border-border rounded-xl p-2">
              {isMultimedia && (
                <label className="cursor-pointer shrink-0">
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={(e) => setFile(e.target.files[0] || null)}
                  />
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent" asChild>
                    <span><Paperclip className="w-4 h-4" /></span>
                  </Button>
                </label>
              )}

              <Input
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm resize-none p-1"
                placeholder={file ? 'Enviar archivo...' : 'Escribe un mensaje...'}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={uploading}
              />

              <Button
                type="submit"
                size="icon"
                className="h-8 w-8 shrink-0"
                disabled={(!input.trim() && !file) || uploading}
              >
                {uploading
                  ? <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  : <Send className="w-4 h-4" />
                }
              </Button>
            </form>
          </div>
        </main>

        {/* Panel lateral de usuarios */}
        {showUsers && (
          <UsersPanel usuarios={usuarios} onClose={() => setShowUsers(false)} />
        )}
      </div>
    </div>
  );
}