"use client"

import { motion } from "framer-motion"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts"
import { Activity, Users, DollarSign, Shield } from "lucide-react"

const data = [
  { name: 'Jan', value: 4000, users: 2400 },
  { name: 'Feb', value: 3000, users: 1398 },
  { name: 'Mar', value: 2000, users: 9800 },
  { name: 'Apr', value: 2780, users: 3908 },
  { name: 'May', value: 1890, users: 4800 },
  { name: 'Jun', value: 2390, users: 3800 },
  { name: 'Jul', value: 3490, users: 4300 },
]

const stats = [
  { title: "Financial Flux", value: "₹24.8K", change: "+12.4%", icon: DollarSign, color: "text-blue-500", bg: "bg-blue-500/10" },
  { title: "Study Hours", value: "18.4", change: "+5.1%", icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { title: "Habit Score", value: "92%", change: "-2.3%", icon: Activity, color: "text-violet-500", bg: "bg-violet-500/10" },
  { title: "Compliance", value: "High", change: "Stable", icon: Shield, color: "text-brand", bg: "bg-brand/10" },
]

export function InteractiveDashboard() {
  return (
    <section className="py-24 relative z-10 bg-canvas/30">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-ink mb-6"
          >
            A command center for your entire life.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted"
          >
            Monitor, analyze, and optimize your daily actions from a single, beautiful interface.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
          className="glass-panel rounded-3xl overflow-hidden border border-line shadow-2xl bg-surface/90 backdrop-blur-2xl"
        >
          {/* Dashboard Header */}
          <div className="border-b border-line px-6 py-4 flex items-center justify-between bg-canvas/50">
            <div className="flex items-center gap-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="h-4 w-px bg-line" />
              <div className="text-sm font-medium text-ink">Overview</div>
              <div className="text-sm font-medium text-muted hover:text-ink cursor-pointer transition-colors">Analytics</div>
              <div className="text-sm font-medium text-muted hover:text-ink cursor-pointer transition-colors">Reports</div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand to-violet-500" />
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
              {stats.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + (i * 0.1) }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-canvas border border-line rounded-2xl p-4 md:p-6 cursor-pointer hover:border-brand/30 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                        <Icon size={20} className={stat.color} />
                      </div>
                      <div className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-green-500' : stat.change.startsWith('-') ? 'text-red-500' : 'text-muted'}`}>
                        {stat.change}
                      </div>
                    </div>
                    <div className="text-muted text-sm font-medium mb-1">{stat.title}</div>
                    <div className="text-2xl md:text-3xl font-bold text-ink">{stat.value}</div>
                  </motion.div>
                )
              })}
            </div>

            {/* Main Chart Area */}
            <div className="grid lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="lg:col-span-2 bg-canvas border border-line rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-ink">Conformity Metrics</h3>
                  <select className="bg-surface border border-line rounded-lg text-sm px-3 py-1.5 text-ink outline-none focus:border-brand">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>This Year</option>
                  </select>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" opacity={0.5} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: 'var(--ink)', fontWeight: 600 }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="bg-canvas border border-line rounded-2xl p-6"
              >
                <h3 className="font-bold text-ink mb-6">Recent Activity</h3>
                <div className="space-y-6">
                  {[
                    { title: "Financial log created", time: "2 min ago", type: "user" },
                    { title: "Habit streak updated", time: "15 min ago", type: "system" },
                    { title: "Study session complete", time: "1 hour ago", type: "file" },
                    { title: "Security audit passed", time: "3 hours ago", type: "security" },
                    { title: "Weekly report generated", time: "5 hours ago", type: "system" },
                  ].map((activity, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-brand mt-1.5" />
                        {i !== 4 && <div className="absolute top-3 left-[3px] w-px h-full bg-line" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-ink">{activity.title}</div>
                        <div className="text-xs text-muted mt-0.5">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
