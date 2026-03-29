import { TrafficSignal, Cpu, Camera, Database, Zap, Users } from 'lucide-react';

export default function AboutPage() {
  const techStack = [
    {
      category: 'Hardware',
      icon: Camera,
      items: ['ESP32-CAM (AI-Thinker)', 'ESP32 Dev Board', 'FC-51 IR Sensors', 'LED Traffic Lights', 'OLED Display'],
      color: 'blue',
    },
    {
      category: 'Software',
      icon: Cpu,
      items: ['YOLOv8 (Object Detection)', 'Flask (Backend API)', 'Next.js 14 (Dashboard)', 'Supabase (Database)', 'Arduino IDE'],
      color: 'green',
    },
    {
      category: 'Infrastructure',
      icon: Database,
      items: ['Cloudflare Tunnel (HTTPS)', 'Vercel (Deployment)', 'Real-time WebSocket', 'Sensor Fusion Engine', 'Decision Algorithm'],
      color: 'purple',
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Real-Time Processing',
      description: 'YOLOv8 detects vehicles at 12 FPS with sensor fusion validation',
    },
    {
      icon: Users,
      title: 'Multi-Device Sync',
      description: 'Camera, sensors, and LEDs work in perfect harmony over WiFi',
    },
    {
      icon: TrafficSignal,
      title: 'Adaptive Control',
      description: 'AI adjusts signals based on queue depth and vehicle count',
    },
  ];

  const specs = [
    { label: 'Hardware Cost', value: '~₹2,000 ($25)' },
    { label: 'Detection Accuracy', value: '~94% (YOLOv8)' },
    { label: 'Response Time', value: '<500ms' },
    { label: 'Deployment Time', value: '~30 minutes' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl">
              <TrafficSignal className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Adaptive Traffic Signal System
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            An edge-AI traffic management solution that combines computer vision with physical
            sensor validation for intelligent signal control
          </p>
        </div>

        {/* Key Specs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {specs.map((spec) => (
            <div
              key={spec.label}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 text-center"
            >
              <p className="text-slate-400 text-sm mb-2">{spec.label}</p>
              <p className="text-2xl font-bold text-white">{spec.value}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { step: '1', title: 'Capture', desc: 'ESP32-CAM captures live video' },
              { step: '2', title: 'Detect', desc: 'YOLOv8 identifies vehicles' },
              { step: '3', title: 'Validate', desc: 'IR sensors provide ground truth' },
              { step: '4', title: 'Decide', desc: 'AI selects optimal signal' },
              { step: '5', title: 'Actuate', desc: 'LEDs and OLED display update' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6"
            >
              <div className="bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Tech Stack</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {techStack.map((stack) => (
              <div
                key={stack.category}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`bg-${stack.color}-500/20 p-2 rounded-lg`}>
                    <stack.icon className={`w-5 h-5 text-${stack.color}-400`} />
                  </div>
                  <h3 className="text-white font-semibold">{stack.category}</h3>
                </div>
                <ul className="space-y-2">
                  {stack.items.map((item) => (
                    <li key={item} className="text-slate-400 text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Decision Engine */}
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl border border-blue-500/30 p-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">🧠 Fusion Algorithm</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Traffic Score Calculation</h3>
              <div className="bg-slate-900/50 rounded-lg p-4 font-mono text-sm">
                <p className="text-green-400">queue_level = (s25 × 1) + (s50 × 2) + (s75 × 3)</p>
                <p className="text-blue-400 mt-2">traffic_score = (car_count × 0.6) + (queue_level × 0.4)</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Decision Logic</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Score &lt; 3</span>
                  <span className="text-green-400">GREEN @ 80 km/h</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Score 3–7</span>
                  <span className="text-green-400">GREEN @ 60 km/h</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Score 7–12</span>
                  <span className="text-yellow-400">YELLOW @ 40 km/h</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Score 12–17</span>
                  <span className="text-red-400">RED @ 30 km/h</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Score ≥ 17</span>
                  <span className="text-red-400">RED @ 20 km/h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 py-8">
          <p>Built with ❤️ for smarter traffic management</p>
          <p className="mt-2 text-sm">
            Hardware + AI + Cloud = 🚀
          </p>
        </div>
      </div>
    </main>
  );
}
