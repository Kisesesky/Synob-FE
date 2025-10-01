
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme, PrimaryColor } from "@/contexts/ThemeContext";
import { Sun, Moon, Laptop } from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { setTheme, primaryColor, setPrimaryColor, background, setBackground } = useTheme();

  const colors: { color: PrimaryColor; className: string }[] = [
    { color: 'blue', className: 'bg-blue-500' },
    { color: 'red', className: 'bg-red-500' },
    { color: 'green', className: 'bg-green-500' },
    { color: 'yellow', className: 'bg-yellow-500' },
    { color: 'white', className: 'bg-white-500' },
  ];

  const predefinedBackgrounds = [
    'https://i.pinimg.com/originals/c3/6b/31/c36b31dd8a929f4102bbc7998b18e5d2.gif',
    'https://i.pinimg.com/originals/0b/5c/c0/0b5cc024841accd9a31a7b2daeb0e57b.gif',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-gray-800 text-black dark:text-white">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div>
          <h3 className="text-lg font-medium">Theme</h3>
          <div className="flex items-center space-x-2 mt-2">
            <Button variant="outline" onClick={() => setTheme('light')}>
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            </Button>
            <Button variant="outline" onClick={() => setTheme('dark')}>
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            </Button>
            <Button variant="outline" onClick={() => setTheme('system')}>
              <Laptop className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-medium">Color</h3>
          <p className="text-sm text-muted-foreground">Customize the primary color of the application. This works independently of the theme setting.</p>
          <div className="flex items-center space-x-2 mt-2">
            {colors.map((col) => (
              <div
                key={col.color}
                className={`w-8 h-8 rounded-full cursor-pointer ${col.className} ${primaryColor === col.color ? 'ring-2 ring-offset-2 ring-current' : ''}`}
                onClick={() => setPrimaryColor(col.color)}
              ></div>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-medium">Background</h3>
          <p className="text-sm text-muted-foreground">Customize the background of the application.</p>
          <div className="grid gap-2 mt-2">
            <Label htmlFor="background-url">Background Image URL</Label>
            <Input
              id="background-url"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="Enter image URL"
            />
            <Button variant="outline" onClick={() => setBackground('')}>Clear Background</Button>
          </div>
          <div className="mt-4">
            <h4 className="text-md font-medium">Predefined Backgrounds</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {predefinedBackgrounds.map((bgUrl, index) => (
                <div
                  key={index}
                  className={`w-24 h-16 rounded-md bg-cover bg-center cursor-pointer ${background === bgUrl ? 'ring-2 ring-offset-2 ring-current' : ''}`}
                  style={{ backgroundImage: `url(${bgUrl})` }}
                  onClick={() => setBackground(bgUrl)}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
