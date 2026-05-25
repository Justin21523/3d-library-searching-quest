import { useGameStore } from '../../store/useGameStore';
import { Battery, BatteryCharging } from 'lucide-react';

export default function BatteryIndicator() {
  const battery = useGameStore((s) => s.flashlightBattery);
  const isOn = useGameStore((s) => s.isFlashlightOn);

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 text-white bg-black/50 p-2 rounded-lg backdrop-blur-sm">
      {isOn ? <BatteryCharging className="w-6 h-6" /> : <Battery className="w-6 h-6" />}
      <div className="w-20 h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-400 transition-all duration-300"
          style={{ width: `${battery}%` }}
        />
      </div>
      <span className="text-sm font-mono">{Math.round(battery)}%</span>
    </div>
  );
}