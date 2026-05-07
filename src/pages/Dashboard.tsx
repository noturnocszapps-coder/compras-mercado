import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, ChevronRight, TrendingUp, Package, Clock, Plus, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { getGreetingSP, getMonthRangeSP } from '../lib/date';
// import InstallPWAButton from '../components/InstallPWAButton';
import { Card, Skeleton } from '../components/ui/Card';
import { trackEvent, AnalyticsEvent } from '../lib/analytics';
import { SAFE_MODE } from '../config/features';

export default function Dashboard() {
  const { user } = useAuth();
  const [activeLists, setActiveLists] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [economyScore, setEconomyScore] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [inventoryStats, setInventoryStats] = useState({ total: 0, low: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!user) return;

    if (SAFE_MODE) {
      console.log("[BOOT_STAGE] Dashboard: Simplified fetch (SAFE_MODE)");
    }

    // Fetch Month Total and Savings
    const fetchMonthStats = async () => {
      if (SAFE_MODE) return; // Skip in safe mode
      try {
        const { start, end } = getMonthRangeSP();
        const { data, error } = await supabase
          .from('shopping_lists')
          .select('real_total, savings_total, economy_score')
          .eq('user_id', user.id)
          .eq('status', 'finished')
          .gte('finished_at', start.toISOString())
          .lte('finished_at', end.toISOString());
        
        if (!isMounted) return;

        if (error) {
          console.error('[DASHBOARD] Error fetching month stats:', error);
          return;
        }

        if (data) {
          const total = data.reduce((acc, l) => acc + (Number(l.real_total) || 0), 0);
          const savings = data.reduce((acc, l) => acc + (Number(l.savings_total) || 0), 0);
          const avgScore = data.length > 0 ? data.reduce((acc, l) => acc + (Number(l.economy_score) || 0), 0) / data.length : 0;
          
          setMonthTotal(total);
          setTotalSavings(savings);
          setEconomyScore(Math.round(avgScore));
        }
      } catch (err) {
        console.error('[DASHBOARD] Critical error in month stats:', err);
      }
    };

    // Fetch Active Lists
    const fetchActiveLists = async () => {
      console.log("[BOOT_STAGE] Dashboard: Fetching Active Lists...");
      try {
        const { data, error } = await supabase
          .from('shopping_lists')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(SAFE_MODE ? 5 : 3);
        
        if (!isMounted) return;

        if (error) {
          console.error('[DASHBOARD] Error fetching active lists:', error);
          setActiveLists([]);
        } else {
          setActiveLists(data || []);
        }
      } catch (err) {
        console.error('[DASHBOARD] Critical error in active lists:', err);
        setActiveLists([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // Fetch History
    const fetchHistory = async () => {
      if (SAFE_MODE) return; // Skip in safe mode
      try {
        const { data, error } = await supabase
          .from('shopping_lists')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'finished')
          .order('finished_at', { ascending: false })
          .limit(5);
        
        if (!isMounted) return;

        if (error) {
          console.error('[DASHBOARD] Error fetching history:', error);
          setHistory([]);
        } else {
          setHistory(data || []);
        }
      } catch (err) {
        console.error('[DASHBOARD] Critical error in history:', err);
        setHistory([]);
      }
    };

    // Fetch Inventory
    const fetchInventory = async () => {
      if (SAFE_MODE) return; // Skip in safe mode
      try {
        const { data, error } = await supabase
          .from('home_inventory')
          .select('current_quantity, minimum_quantity') 
          .eq('user_id', user.id);
        
        if (!isMounted) return;

        if (error) {
          console.error('[DASHBOARD] Error fetching inventory:', error);
          setInventoryStats({ total: 0, low: 0 });
        } else if (data) {
          setInventoryStats({
            total: data.length,
            low: data.filter(i => (Number(i.current_quantity) || 0) <= (Number(i.minimum_quantity) || 0)).length
          });
        }
      } catch (err) {
        console.error('[DASHBOARD] Critical error in inventory:', err);
      }
    };

    fetchMonthStats();
    fetchActiveLists();
    fetchHistory();
    fetchInventory();

    trackEvent(AnalyticsEvent.ECONOMY_SCORE_CHECK, { score: economyScore });

    // Set up real-time subscription for active lists
    if (!SAFE_MODE) {
      const listsChannel = supabase.channel(`dashboard_${user.id}`);
      
      listsChannel
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'shopping_lists',
          filter: `user_id=eq.${user.id}`
        }, () => {
          if (isMounted) {
            fetchActiveLists();
            fetchHistory();
            fetchMonthStats();
          }
        })
        .subscribe();

      return () => {
        isMounted = false;
        supabase.removeChannel(listsChannel);
      };
    } else {
       return () => { isMounted = false; };
    }
  }, [user]);

  const chartData = (history || []).slice().reverse().map(list => ({
    name: (list.name || '').length > 8 ? list.name.substring(0, 8) + '...' : (list.name || 'Lista'),
    gasto: Number(list.real_total) || 0,
    previsto: Number(list.estimated_total) || 0
  }));

  if (SAFE_MODE) {
     return (
       <div className="flex flex-col gap-8 pb-10">
         <div className="flex flex-col gap-1">
           <h2 className="text-2xl font-black text-gray-900">{getGreetingSP()}</h2>
           <p className="text-gray-500">[SAFE_MODE] Painel Simplificado de Diagnóstico</p>
         </div>

         <section className="flex flex-col gap-6">
           <div className="flex items-center gap-4">
             <div className="w-2 h-8 bg-primary rounded-full"></div>
             <h3 className="text-2xl font-black">Suas Listas Dinâmicas</h3>
           </div>
           
           <div className="flex flex-col gap-4">
              {activeLists.length === 0 && !loading ? (
                 <p className="text-slate-400 font-bold p-8 bg-white rounded-3xl border border-slate-100 italic">Nenhuma lista encontrada.</p>
              ) : activeLists.map(list => (
                 <Link key={list.id} to={`/listas/${list.id}`}>
                    <Card className="p-6 flex items-center justify-between">
                       <h4 className="text-lg font-black text-slate-900">{list.name}</h4>
                       <ChevronRight size={20} className="text-slate-300" />
                    </Card>
                 </Link>
              ))}
           </div>
           <Link to="/listas" className="bold-button-primary self-start">VER TODAS AS LISTAS</Link>
         </section>

         <div className="p-8 bg-slate-900 rounded-[40px] text-white">
            <h4 className="text-xl font-black mb-4 uppercase italic">Sistema Logged</h4>
            <div className="font-mono text-xs text-emerald-400 space-y-1">
               <p>&gt; Supabase: OK</p>
               <p>&gt; Auth: {user?.email}</p>
               <p>&gt; ID: {user?.id}</p>
               <p>&gt; Modo: Diagnóstico</p>
            </div>
         </div>
       </div>
     );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-gray-900">{getGreetingSP()}</h2>
          <p className="text-gray-500">O que vamos comprar hoje?</p>
        </div>
        {economyScore > 0 && (
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-2xl shadow-lg shadow-emerald-500/20">
              <Zap size={16} fill="white" />
              <span className="font-black text-lg">{economyScore}</span>
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">Score de Economia</span>
          </div>
        )}
      </div>

      {/* <InstallPWAButton /> */}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <Skeleton className="h-40 rounded-[40px]" />
            <Skeleton className="h-40 rounded-[40px]" />
            <Skeleton className="h-40 rounded-[40px]" />
            <Skeleton className="h-40 rounded-[40px]" />
          </>
        ) : (
          <>
            <StatCard 
              icon={TrendingUp} 
              label="Total este mês" 
              value={formatCurrency(monthTotal)} 
              color="bg-emerald-50 text-emerald-600"
              trend={`${formatCurrency(totalSavings)} economizados`}
            />
            <StatCard 
              icon={ShoppingBag} 
              label="Listas Ativas" 
              value={activeLists.length.toString()} 
              color="bg-blue-50 text-blue-600"
            />
            <StatCard 
              icon={Package} 
              label="Estoque Baixo" 
              value={inventoryStats.low.toString()} 
              color="bg-amber-50 text-amber-600"
            />
            <StatCard 
              icon={Clock} 
              label="Última Compra" 
              value={history[0] ? formatDate(history[0].finished_at) : '--'} 
              color="bg-slate-100 text-slate-600"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Lists Section */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-2 h-8 bg-primary rounded-full"></div>
            <h3 className="text-2xl font-black">Listas Ativas</h3>
          </div>
          
          <div className="flex flex-col gap-4">
            {loading ? (
              <>
                <Skeleton className="h-24 rounded-3xl" />
                <Skeleton className="h-24 rounded-3xl" />
              </>
            ) : activeLists.length === 0 ? (
              <Card className="p-12 border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-4 bg-transparent shadow-none" hover={false}>
                <ShoppingBag size={48} className="text-slate-200" />
                <p className="text-slate-400 font-bold">Nenhuma lista ativa no momento</p>
                <Link to="/listas" className="bg-primary text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-emerald-200 active:scale-95 transition-all">
                  Nova Lista
                </Link>
              </Card>
            ) : (
              activeLists.map(list => (
                <Link 
                  key={list.id} 
                  to={`/listas/${list.id}`}
                  className="group"
                >
                  <Card className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                        <ShoppingBag size={28} />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors">{list.name}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{list.market_name || 'Mercado Geral'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-slate-900">{formatCurrency(list.estimated_total || 0)}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Estimado</p>
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Chart Section */}
        <section className="bold-card p-8 flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
            <h3 className="text-2xl font-black">Gastos Recentes</h3>
          </div>
          <div className="h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" fontWeight="bold" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                    itemStyle={{ fontWeight: '900', color: '#0f172a' }}
                    formatter={(val: number) => [formatCurrency(val), "Gasto"]}
                  />
                  <Bar dataKey="gasto" radius={[8, 8, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#059669' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-300 font-bold italic">
                Finalize compras para ver seus dados
              </div>
            )}
          </div>
        </section>

        {/* AI Suggestions Section */}
        <section className="flex flex-col gap-6 lg:col-span-2">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                <h3 className="text-2xl font-black">Sugestões Inteligentes</h3>
             </div>
             <div className="text-[10px] font-black uppercase text-purple-400 tracking-widest bg-purple-50 px-3 py-1 rounded-full">Powered by Gemini</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {totalSavings > 0 ? (
               <div className="bg-white p-8 rounded-[40px] border-2 border-emerald-50 flex flex-col gap-4 shadow-xl shadow-emerald-900/5 relative overflow-hidden group">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                     <TrendingUp size={24} />
                  </div>
                  <div>
                     <h4 className="font-black text-slate-900 uppercase italic">Economia Real</h4>
                     <p className="text-sm text-slate-400 font-medium italic">"Parabéns! Você economizou {formatCurrency(totalSavings)} este mês seguindo nossas sugestões de preços."</p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-500">META: 90%</span>
                    <div className="w-20 h-1 bg-slate-50 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${economyScore}%` }} />
                    </div>
                  </div>
               </div>
             ) : (
               <div className="bg-white p-8 rounded-[40px] border-2 border-purple-50 flex flex-col gap-4 shadow-xl shadow-purple-900/5 relative overflow-hidden group">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                     <Sparkles size={24} />
                  </div>
                  <div>
                     <h4 className="font-black text-slate-900 uppercase italic">Comece a Economizar</h4>
                     <p className="text-sm text-slate-400 font-medium italic">"Finalize sua primeira lista no Modo Mercado para que eu possa analisar seu score de economia."</p>
                  </div>
                  <Link to="/listas" className="bold-button-primary !bg-purple-600 !text-[10px] !py-3 !px-6 !shadow-none self-start">CRIAR LISTA</Link>
               </div>
             )}

             <div className="bg-white p-8 rounded-[40px] border-2 border-blue-50 flex flex-col gap-4 shadow-xl shadow-blue-900/5 relative overflow-hidden group">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                   <ShieldCheck size={24} />
                </div>
                <div>
                   <h4 className="font-black text-slate-900 uppercase italic">Otimização de Estoque</h4>
                   <p className="text-sm text-slate-400 font-medium italic">"Você tem {inventoryStats.low} itens em nível crítico no estoque. Quer que eu prepare uma lista de reposição?"</p>
                </div>
                <Link to="/estoque" className="bold-button-primary !bg-blue-600 !text-[10px] !py-3 !px-6 !shadow-none self-start">REPOR AGORA</Link>
             </div>

             <div className="bg-white p-8 rounded-[40px] border-2 border-slate-50 flex flex-col gap-4 shadow-xl shadow-slate-900/5 relative overflow-hidden group">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform">
                   <Clock size={24} strokeWidth={3} />
                </div>
                <div>
                   <h4 className="font-black text-slate-900 uppercase italic">Aviso de Validade</h4>
                   <p className="text-sm text-slate-400 font-medium italic">"Temos 2 itens no seu estoque que podem vencer esta semana. Lembre-se de consumi-los!"</p>
                </div>
                <Link to="/estoque" className="bold-button-primary !bg-slate-600 !text-[10px] !py-3 !px-6 !shadow-none self-start">VER VALIDADES</Link>
             </div>
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <Link 
        to="/listas" 
        className="fixed bottom-24 right-6 w-16 h-16 bg-primary text-white rounded-[20px] flex items-center justify-center shadow-2xl shadow-emerald-400 z-40 transition-transform active:scale-90 md:hidden"
      >
        <Plus size={32} strokeWidth={3} />
      </Link>
    </div>
  );
}

const StatCard = ({ icon: Icon, label, value, color, trend }: { icon: any, label: string, value: string, color: string, trend?: string }) => (
  <Card className="p-6 flex flex-col gap-4 relative overflow-hidden group">
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm relative z-10 transition-transform group-hover:scale-110", color)}>
      <Icon size={24} />
    </div>
    <div className="relative z-10">
      <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
      {trend && <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">{trend}</p>}
    </div>
    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -translate-y-16 translate-x-16 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"></div>
  </Card>
);
