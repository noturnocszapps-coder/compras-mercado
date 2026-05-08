import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, Bell, Shield, LogOut, Heart, Phone, 
  X, Check, ChevronRight, Star, Instagram, 
  Mail, MessageCircle, AlertTriangle, Loader2,
  Layers, Smartphone, Globe, ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';
import { getNowSP } from '../lib/date';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useSubscription } from '../hooks/useSubscription';
import { getPlanLabel } from '../lib/premium';
import { Zap, Crown, CreditCard } from 'lucide-react';

export default function Settings() {
  const { profile, user, signOut, refreshProfile } = useAuth();
  const { subscription, isPremium, plan } = useSubscription();
  const navigate = useNavigate();
  
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
      toast.success('Você saiu da conta');
    } catch (err) {
      toast.error('Erro ao sair');
    }
  };

  const handlePortal = async () => {
    if (!isPremium) {
      navigate('/premium');
      return;
    }

    setPortalLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      });
      const { url, error } = await response.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (err: any) {
      toast.error('Erro ao abrir portal: ' + err.message);
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-xl mx-auto w-full pb-20">
      <h2 className="text-2xl font-black">Configurações</h2>

      <Card className="p-6 flex items-center gap-4">
         <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-primary text-2xl font-black shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              (profile?.full_name || profile?.name || 'U')[0].toUpperCase()
            )}
         </div>
         <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold truncate">{profile?.full_name || profile?.name || 'Usuário'}</h3>
            <p className="text-gray-400 text-sm truncate">{user?.email}</p>
         </div>
         <Button 
           variant="outline"
           size="sm"
           onClick={() => setActiveModal('profile')}
           className="shrink-0"
         >
           <User size={20} />
         </Button>
      </Card>

      <div className="flex flex-col gap-2">
         <h4 className="text-xs font-black uppercase text-gray-400 px-4">Minha Conta</h4>
         <Card className="overflow-hidden p-0">
            <SettingItem icon={User} label="Editar Perfil" onClick={() => setActiveModal('profile')} />
            <SettingItem icon={Bell} label="Notificações" onClick={() => setActiveModal('notifications')} />
            <SettingItem icon={Shield} label="Privacidade" onClick={() => setActiveModal('privacy')} />
         </Card>
      </div>

      <div className="flex flex-col gap-2">
         <h4 className="text-xs font-black uppercase text-gray-400 px-4">Ajuda e Suporte</h4>
         <Card className="overflow-hidden p-0">
            <SettingItem icon={Heart} label="Avaliar App" onClick={() => setActiveModal('feedback')} />
            <SettingItem icon={Phone} label="Falar Conosco" onClick={() => setActiveModal('contact')} />
         </Card>
      </div>

      <Button 
        variant="outline"
        onClick={handleLogout}
        className="mt-4 py-6 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200"
      >
        <LogOut size={20} />
        Sair da Conta
      </Button>

      <div className="text-center text-gray-300 text-[10px] uppercase font-black tracking-widest py-4">
         Versão 2.4.0 (STABLE) • Compra Fácil <span className="text-primary opacity-60 italic">by Roxou</span>
      </div>

      <AnimatePresence>
        {activeModal === 'profile' && (
          <EditProfileModal user={user} profile={profile} onClose={() => setActiveModal(null)} onUpdate={refreshProfile} />
        )}
        {activeModal === 'notifications' && (
          <NotificationsModal onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'privacy' && (
          <PrivacyModal onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'feedback' && (
          <FeedbackModal user={user} onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'contact' && (
          <ContactModal onClose={() => setActiveModal(null)} />
        )}
        {activeModal === 'ecosystem' && (
          <EcosystemModal onClose={() => setActiveModal(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

const SettingItem = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
  >
     <div className="flex items-center gap-4">
        <div className="text-gray-400"><Icon size={20} /></div>
        <span className="font-bold text-gray-700">{label}</span>
     </div>
     <div className="text-gray-300">
        <ChevronRight size={20} />
     </div>
  </button>
);

const EditProfileModal = ({ user, profile, onClose, onUpdate }: any) => {
  const [name, setName] = useState(profile?.full_name || profile?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [accessibility, setAccessibility] = useState(profile?.accessibility_mode || false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('O nome não pode estar vazio');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: name.trim(), // Support the schema provided by user
          avatar_url: avatarUrl.trim() || null,
          accessibility_mode: accessibility
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Perfil atualizado!');
      await onUpdate();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao salvar alterações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Editar Perfil" isOpen={true} onClose={onClose}>
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-black uppercase text-gray-400">Nome Completo</label>
          <input 
            type="text"
            className="bold-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Seu nome"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-black uppercase text-gray-400">Email (Apenas leitura)</label>
          <input 
            type="text"
            className="bold-input opacity-50 bg-gray-50 grayscale cursor-not-allowed"
            value={user?.email || ''}
            readOnly
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-black uppercase text-gray-400">URL do Avatar</label>
          <input 
            type="url"
            className="bold-input"
            value={avatarUrl}
            onChange={e => setAvatarUrl(e.target.value)}
            placeholder="https://exemplo.com/foto.jpg"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <div>
            <p className="font-bold">Modo Acessibilidade</p>
            <p className="text-xs text-gray-400">Textos maiores e alto contraste</p>
          </div>
          <button 
            type="button"
            onClick={() => setAccessibility(!accessibility)}
            className={cn(
              "w-12 h-7 rounded-full transition-colors relative",
              accessibility ? "bg-primary" : "bg-gray-300"
            )}
          >
            <div className={cn(
              "absolute top-1 w-5 h-5 bg-white rounded-full transition-all",
              accessibility ? "right-1" : "left-1"
            )} />
          </button>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="py-6"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Check size={20} />}
          Salvar Alterações
        </Button>
      </form>
    </Modal>
  );
};

const NotificationsModal = ({ onClose }: { onClose: () => void }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('comprafacil_notification_settings');
    return saved ? JSON.parse(saved) : {
      low_stock: true,
      expiring: true,
      monthly: false,
      insights: true
    };
  });

  const toggle = (key: string) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem('comprafacil_notification_settings', JSON.stringify(newSettings));
    toast.success('Preferência salva');
  };

  return (
    <Modal title="Notificações" isOpen={true} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <NotificationToggle 
          label="Estoque Baixo" 
          description="Avise-me quando itens básicos estiverem acabando"
          active={settings.low_stock}
          onToggle={() => toggle('low_stock')}
        />
        <NotificationToggle 
          label="Vencimento" 
          description="Alerta para produtos próximos da validade"
          active={settings.expiring}
          onToggle={() => toggle('expiring')}
        />
        <NotificationToggle 
          label="Compra Mensal" 
          description="Lembrete para fazer a feira do mês"
          active={settings.monthly}
          onToggle={() => toggle('monthly')}
        />
        <NotificationToggle 
          label="Insights de Economia" 
          description="Novas promoções e comparativos de preços"
          active={settings.insights}
          onToggle={() => toggle('insights')}
        />

        <div className="mt-4 p-4 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center gap-3">
          <Bell size={20} />
          <p className="text-xs font-bold uppercase tracking-wider">
            Push Notifications em breve!
          </p>
        </div>
      </div>
    </Modal>
  );
};

const NotificationToggle = ({ label, description, active, onToggle }: any) => (
  <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
    <div className="flex-1">
      <p className="font-bold">{label}</p>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
    <button 
      onClick={onToggle}
      className={cn(
        "w-12 h-7 rounded-full transition-colors relative ml-4",
        active ? "bg-primary" : "bg-gray-300"
      )}
    >
      <div className={cn(
        "absolute top-1 w-5 h-5 bg-white rounded-full transition-all",
        active ? "right-1" : "left-1"
      )} />
    </button>
  </div>
);

const PrivacyModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <Modal title="Privacidade" isOpen={true} onClose={onClose}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
            <Shield className="text-primary mt-1" size={24} />
            <div>
              <p className="font-bold">Seus Dados Estão Seguros</p>
              <p className="text-sm text-gray-500">
                Utilizamos o Supabase com Row Level Security (RLS). Isso significa que apenas você pode ver e editar suas listas e dados pessoais.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
            <MessageCircle className="text-primary mt-1" size={24} />
            <div>
              <p className="font-bold">Uso da IA</p>
              <p className="text-sm text-gray-500">
                Nossa IA processa imagens de etiquetas e textos de comandos de voz apenas para facilitar sua gestão de compras. Não vendemos seus dados para terceiros.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            variant="outline"
            onClick={() => {
              const data = localStorage.getItem('comprafacil_notification_settings');
              const blob = new Blob([JSON.stringify({ settings: data }, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'meus-dados-comprafacil.json';
              a.click();
              toast.success('Relatório gerado!');
            }}
            className="w-full py-6"
          >
            Baixar Meus Dados (Backup)
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => {
              toast('Ação restrita! Entre em contato com o suporte para excluir sua conta.', {
                icon: '⚠️',
                style: { background: '#fff' }
              });
            }}
            className="w-full py-6 border-red-100 text-red-500 hover:bg-red-50"
          >
            <AlertTriangle size={18} />
            Excluir Minha Conta
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const FeedbackModal = ({ user, onClose }: any) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Por favor, selecione uma nota');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('app_feedback')
        .insert({
          user_id: user.id,
          rating,
          comment: comment.trim()
        });

      if (error) throw error;
      
      toast.success('Obrigado pelo seu feedback!', { icon: '💚' });
      onClose();
    } catch (err) {
      const feedbacks = JSON.parse(localStorage.getItem('comprafacil_feedback') || '[]');
      feedbacks.push({ rating, comment, date: getNowSP().toISOString() });
      localStorage.setItem('comprafacil_feedback', JSON.stringify(feedbacks));
      
      toast.success('Feedback salvo localmente! Obrigado.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Avaliar App" isOpen={true} onClose={onClose}>
      <div className="flex flex-col items-center gap-6">
        <p className="text-center text-gray-500">O que você está achando da nossa IA de compras?</p>
        
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button 
              key={star}
              onClick={() => setRating(star)}
              className="transition-transform active:scale-90"
            >
              <Star 
                size={40} 
                className={cn(
                  "transition-colors",
                  rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                )} 
              />
            </button>
          ))}
        </div>

        <div className="w-full flex flex-col gap-2">
          <label className="text-xs font-black uppercase text-gray-400">Sugestões ou Comentários</label>
          <textarea 
            className="bold-input min-h-[100px] py-4"
            placeholder="Conte-nos como podemos melhorar..."
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-6"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Check size={20} />}
          Enviar Avaliação
        </Button>
      </div>
    </Modal>
  );
};

const ContactModal = ({ onClose }: { onClose: () => void }) => {
  const openLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Modal title="Falar Conosco" isOpen={true} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <ContactButton 
          icon={MessageCircle} 
          label="WhatsApp Suporte" 
          color="bg-emerald-500" 
          onClick={() => openLink('https://wa.me/5511999999999')}
        />
        <ContactButton 
          icon={Instagram} 
          label="Instagram @roxou.pp" 
          color="bg-pink-600" 
          onClick={() => openLink('https://instagram.com/roxou.pp')}
        />
        <ContactButton 
          icon={Mail} 
          label="contato@roxou.com.br" 
          color="bg-gray-800" 
          onClick={() => openLink('mailto:contato@roxou.com.br')}
        />
        
        <div className="mt-4 p-6 bg-gray-50 rounded-3xl text-center">
          <p className="text-sm text-gray-400 font-medium">Ficaremos felizes em ouvir suas dúvidas e feedbacks!</p>
        </div>
      </div>
    </Modal>
  );
};

const ContactButton = ({ icon: Icon, label, color, onClick }: any) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 transition-all hover:shadow-md active:scale-[0.98]"
  >
    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white", color)}>
      <Icon size={24} />
    </div>
    <span className="font-bold text-gray-700">{label}</span>
  </button>
);

const EcosystemModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <Modal title="Ecossistema Roxou" isOpen={true} onClose={onClose}>
      <div className="flex flex-col gap-6">
        <p className="text-sm text-gray-500 font-medium">Nossos aplicativos são desenhados para funcionar em perfeita sincronia com seu estilo de vida.</p>
        
        <div className="flex flex-col gap-3">
          <EcosystemAppItem 
            icon={MessageCircle} 
            name="Roxou Eventos" 
            desc="Ingressos e agenda cultural" 
            color="bg-purple-500" 
          />
          <EcosystemAppItem 
            icon={Globe} 
            name="Roxou Transporte" 
            desc="Mobilidade urbana inteligente" 
            color="bg-blue-500" 
          />
          <EcosystemAppItem 
            icon={ShoppingBag} 
            name="Compra Fácil" 
            desc="Sua despensa inteligente (Atual)" 
            color="bg-emerald-500" 
            isCurrent
          />
          <EcosystemAppItem 
            icon={Smartphone} 
            name="Roxou Studio" 
            desc="Ferramentas para criativos" 
            color="bg-pink-500" 
          />
        </div>

        <Button 
          onClick={onClose}
          className="w-full mt-4 py-6"
        >
          CONHECER TODOS OS APPS
        </Button>
      </div>
    </Modal>
  );
};

const EcosystemAppItem = ({ icon: Icon, name, desc, color, isCurrent }: any) => (
  <div className={cn(
    "flex items-center gap-4 p-4 rounded-2xl border transition-all",
    isCurrent ? "bg-emerald-50 border-emerald-100 shadow-sm" : "bg-white border-slate-50 hover:border-slate-100"
  )}>
    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white", color)}>
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <p className="font-bold text-slate-800">{name}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{desc}</p>
    </div>
  </div>
);
