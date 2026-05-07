import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatCurrency, cn } from '../lib/utils';
import { TrendingUp, ShoppingBag, DollarSign, ArrowUpRight } from 'lucide-react';
import { Card, Skeleton } from '../components/ui/Card';
import { PremiumGate } from '../components/PremiumGate';

export default function Reports() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from('shopping_lists')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'finished')
          .order('finished_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching reports:', error);
          console.error("[SAFE_FETCH_FAIL] Reports");
          return;
        }

        if (isMounted) {
          setData(data || []);
          const perList = (data || []).map(d => ({ name: d.name, value: Number(d.real_total) || 0 }));
          setCategoryData(perList);
          console.log("[SAFE_FETCH_OK] Reports");
        }
      } catch (err) {
        console.error('[REPORTS] Critical error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReports();
    return () => { isMounted = false; };
  }, [user]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center gap-4">
         <div className="w-3 h-10 bg-primary rounded-full"></div>
         <h2 className="text-4xl font-black tracking-tight uppercase leading-none">Relatórios de Gastos</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <SummaryCard icon={TrendingUp} label="Total Investido" value={formatCurrency(data.reduce((acc, d) => acc + (Number(d.real_total) || 0), 0))} color="primary" />
        <SummaryCard icon={ShoppingBag} label="Compras Realizadas" value={data.length.toString()} color="blue" />
        <SummaryCard icon={DollarSign} label="Economia IA" value={formatCurrency(data.reduce((acc, d) => acc + ((Number(d.estimated_total) || 0) - (Number(d.real_total) || 0)), 0))} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <PremiumGate feature="Gráficos Avançados">
           <Card className="p-10 flex flex-col gap-8 shadow-sm">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-black uppercase tracking-tighter">Gastos por Compra</h3>
                 <ArrowUpRight className="text-slate-200" size={32} />
              </div>
              <div className="h-80 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                       <XAxis dataKey="name" hide />
                       <Tooltip 
                          contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', fontWeight: '900', textTransform: 'uppercase' }}
                       />
                       <Bar dataKey="value" fill="#10b981" radius={[12, 12, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </Card>
         </PremiumGate>

         <PremiumGate feature="Distribuição de Valor">
           <Card className="p-10 flex flex-col gap-8 shadow-sm">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-black uppercase tracking-tighter">Distribuição de Valor</h3>
                 <div className="w-8 h-8 rounded-full bg-emerald-50 border-4 border-emerald-100 italic font-black text-primary text-[8px] flex items-center justify-center">ROI</div>
              </div>
              <div className="h-80 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                         data={categoryData}
                         cx="50%"
                         cy="50%"
                         innerRadius={80}
                         outerRadius={110}
                         paddingAngle={8}
                         dataKey="value"
                         stroke="none"
                       >
                         {categoryData.map((_, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip 
                          contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', fontWeight: '900' }}
                       />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
           </Card>
         </PremiumGate>
      </div>
    </div>
  );
}

const SummaryCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) => {
  const colorMap: Record<string, string> = {
    primary: "bg-emerald-50 text-primary shadow-emerald-100",
    blue: "bg-blue-50 text-blue-600 shadow-blue-100",
    amber: "bg-amber-50 text-amber-600 shadow-amber-100"
  };

  return (
    <Card className="p-8 flex items-center gap-6 group">
       <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center transition-all group-hover:scale-110", colorMap[color])}>
          <Icon size={32} strokeWidth={3} />
       </div>
       <div className="flex flex-col">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] italic mb-1">{label}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none">{value}</p>
       </div>
    </Card>
  );
};
