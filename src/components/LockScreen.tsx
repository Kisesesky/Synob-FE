'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from 'react';
import { toast } from "sonner";

interface LockScreenProps {
  onLogin: () => void;
}

export function LockScreen({ onLogin }: LockScreenProps) {
  // Main state (for clock/weather)
  const [time, setTime] = useState(new Date());
  const [city, setCity] = useState('Loading...');
  const [temperature, setTemperature] = useState<number | null>(null);
  const [weatherCondition, setWeatherCondition] = useState('...');

  // UI state
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [contentScale, setContentScale] = useState(0.81); // Initial scale
  const [isMobile, setIsMobile] = useState(false); // New state for mobile detection

  // Clock update
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Responsive content scaling and mobile detection
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768; // Example breakpoint for mobile
      setIsMobile(mobile);
      setContentScale(mobile ? 1 : 0.81);
    };

    handleResize(); // Apply on mount
    window.addEventListener('resize', handleResize); // Apply on resize
    return () => window.removeEventListener('resize', handleResize); // Cleanup
  }, []);


  // Fetch location and weather
  const fetchWeatherAndLocation = async (location: { latitude: number; longitude: number }) => {
    try {
      // Reverse geocode to get city name in English
      const cityResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&accept-language=en`);
      const cityData = await cityResponse.json();
      const cityName = cityData.address.city || cityData.address.town || cityData.address.village || 'Unknown';
      setCity(cityName);

      // Fetch weather
      const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true&weather_code=true`);
      const weatherData = await weatherResponse.json();
      setTemperature(Math.round(weatherData.current_weather.temperature));
      setWeatherCondition(getWeatherCondition(weatherData.current_weather.weathercode));

    } catch (error) {
      console.error("Error fetching data:", error);
      setCity('Error');
      setTemperature(null);
      setWeatherCondition('Error');
      toast.error("Could not fetch weather or location data.");
    }
  };

  // Initial load effect
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchWeatherAndLocation(position.coords),
        (error) => {
          console.error("Geolocation error:", error);
          setCity("Location access denied");
          toast.error("Location access was denied.");
        }
      );
    } else {
      setCity("Geolocation not supported");
      toast.error("Geolocation is not supported by your browser.");
    }
  }, []);

  const getWeatherCondition = (code: number): string => {
    const codeMap: { [key: number]: string } = {
      0: 'Clear', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Rime fog',
      51: 'Light drizzle', 53: 'Drizzle', 55: 'Dense drizzle',
      61: 'Slight rain', 63: 'Rain', 65: 'Heavy rain',
      71: 'Slight snow', 73: 'Snow', 75: 'Heavy snow',
      80: 'Rain showers', 81: 'Rain showers', 82: 'Violent showers',
      95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm',
    };
    return codeMap[code] || 'Unknown';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const handleLoginAttempt = () => {
    // Simple hardcoded password for mock authentication
    if (password === '1234') {
      onLogin(); // Notify parent (AppEntry) that login is successful
      toast.success("Logged in successfully!");
    } else {
      setLoginError("Incorrect password");
      toast.error("Incorrect password.");
    }
  };

  return (
    <main className="relative min-h-screen">
      <Toaster richColors />
      
      {/* Main Clock and Weather Display */}
      <div 
        className={`
          ${isMobile ? 'flex flex-col items-center justify-center h-screen w-full' : 'absolute time-container translate-x-[-50%] translate-y-[-50%] w-[85vw] max-w-none'}
        `}
        style={isMobile ? {} : { top: "calc(50% + 0.5px)", left: "calc(50% + 0.5px)" }}
      >
        <div className="flex flex-col justify-center items-center" style={isMobile ? {} : { transform: `scale(${contentScale})` }}>
          <div 
            className="box-border content-stretch flex flex-col font-sans gap-4 items-center justify-center leading-[0] p-[8px] relative text-[#ffffff] text-left text-nowrap tracking-[-0.25px]"
          >
            {/* Time */}
            <div style={{ fontVariationSettings: "'wdth' 100" }} className="flex flex-col justify-center items-center relative shrink-0">
              <p className="block leading-[normal] text-nowrap whitespace-pre text-[18.7vw] sm:text-[17vw] md:text-[15.3vw] lg:text-[11.9vw] xl:text-[204px]" style={{ textShadow: '0px 0px 40px rgba(0, 0, 0, 0.5), 0px 0px 20px rgba(0, 0, 0, 0.4), 0px 0px 10px rgba(0, 0, 0, 0.3)', fontWeight: '300' }}>
                {formatTime(time)}
              </p>
            </div>
            
            {/* City and Temperature */}
            <div className="flex flex-row justify-center items-center gap-4 mt-2">
              <p className="block leading-[normal] text-nowrap whitespace-pre text-[9.6vw] sm:text-[4.8vw] md:text-[3.6vw] lg:text-[3vw] xl:text-[38.4px] text-center opacity-80" style={{ textShadow: '0px 0px 20px rgba(0, 0, 0, 0.5), 0px 0px 10px rgba(0, 0, 0, 0.4)', fontWeight: '300' }}>
                {city}
              </p>
              <p className="block leading-[normal] text-nowrap whitespace-pre text-[9.6vw] sm:text-[4.8vw] md:text-[3.6vw] lg:text-[3vw] xl:text-[38.4px] text-center opacity-80" style={{ textShadow: '0px 0px 20px rgba(0, 0, 0, 0.5), 0px 0px 10px rgba(0, 0, 0, 0.4)', fontWeight: '300' }}>
                {temperature === null ? '--' : temperature}°C
              </p>
            </div>

            {/* Login/Unlock Form */}
            <div className="mt-8 w-full max-w-xs text-center">
              <Input
                type="password"
                placeholder="Enter password"
                className="mb-4 w-full text-center"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLoginAttempt()}
              />
              <Button onClick={handleLoginAttempt} className="w-full">Login / Unlock</Button>
              {loginError && <p className="text-red-400 mt-2">{loginError}</p>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
