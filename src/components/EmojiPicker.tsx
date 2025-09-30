import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { EMOJI_CATEGORIES } from '@/lib/emojis';
import { Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmojiPickerContentProps {
  onSelect: (emoji: string) => void;
}

const categoryIcons: { [key: string]: React.ReactNode } = {
  'Emotion': '😀',
  'PeopleBodyRoles': '🧑',
  'AnimalsAndNature': '🌿',
  'FoodAndDrink': '🍔',
  'TransportAndBuildings': '🚗',
  'ActivitiesAndSports': '⚽', 
  'ObjectsAndTechnology': '💻',
  'SymbolsAndSigns': '❤️',
  'Sky': '⛅',
  'Sound': '🎵',
  'ComputerAndVideo': '🔋',
  'Sign': '⛔',
  'Flags' : '🚩',
};

type EmojiCategory = keyof typeof EMOJI_CATEGORIES;

export const EmojiPickerContent: React.FC<EmojiPickerContentProps> = ({ onSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<EmojiCategory>('Emotion');

  return (
    <div className="w-[350px] h-80 flex bg-gray-800 border-gray-700 text-white rounded-md shadow-lg z-50">
      <div className="flex-shrink-0 w-16 p-2 flex flex-col items-center space-y-2 border-r border-gray-700 overflow-y-auto">
        {(Object.keys(EMOJI_CATEGORIES) as EmojiCategory[]).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            onMouseDown={(e) => e.preventDefault()}
            className={cn(
              'p-1 rounded-md text-gray-400 hover:text-white',
              selectedCategory === category ? 'bg-gray-600 text-white' : 'hover:bg-gray-700'
            )}
            title={category}
          >
            {categoryIcons[category]}
          </button>
        ))}
      </div>
      <div className="flex-grow overflow-y-auto p-2">
        <h3 className="text-gray-400 font-bold px-2 pt-2 pb-1">{selectedCategory}</h3>
        <div className="grid grid-cols-7 gap-1">
          {EMOJI_CATEGORIES[selectedCategory].map(({ emoji, shortcut }, index) => (
            <div
              key={`${shortcut}-${index}`}
              onClick={() => onSelect(emoji)}
              className="cursor-pointer rounded-md p-1 text-2xl flex items-center justify-center hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const EmojiPicker: React.FC<EmojiPickerContentProps> = ({ onSelect }) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="focus:outline-none">
          <Smile className="h-6 w-6 text-gray-400 hover:text-white" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="p-0 bg-transparent border-none shadow-none"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <EmojiPickerContent onSelect={onSelect} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};