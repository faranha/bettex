import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, ChevronDown } from 'lucide-react';
import { changeLocale, t, useLocale, type Locale } from '@/lib/i18n';
import './LanguageSelector.css';

const options: { value: Locale; label: string; flag: string }[] = [
  { value: 'pt', label: 'Português', flag: 'flags/br.svg' },
  { value: 'en', label: 'English', flag: 'flags/us.svg' },
  { value: 'es', label: 'Español', flag: 'flags/es.svg' },
];

function Flag({ country }: { country: string }) {
  return <img className="lang-selector__flag" src={`${import.meta.env.BASE_URL}${country}`} width={24} height={16} alt="" aria-hidden="true" />;
}

export function LanguageSelector({ className = '' }: { className?: string }) {
  const locale = useLocale();
  const selected = options.find((option) => option.value === locale)!;
  return <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <button type="button" className={`lang-selector ${className}`.trim()} data-testid="language-selector" aria-label={t('Selecionar idioma')}>
        <Flag country={selected.flag} />
        <span className="lang-selector__code" data-i18n="translated">{locale.toUpperCase()}</span>
        <ChevronDown className="lang-selector__chevron" aria-hidden="true" />
      </button>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content className="lang-selector__menu" align="end" sideOffset={8} collisionPadding={12} aria-label={t('Selecionar idioma')} data-testid="language-options">
        <DropdownMenu.RadioGroup value={locale} onValueChange={(value) => {
          if (value !== locale) changeLocale(value as Locale);
        }}>
          {options.map((option) => <DropdownMenu.RadioItem key={option.value} value={option.value} className="lang-selector__option" data-testid={`language-option-${option.value}`}>
            <Flag country={option.flag} />
            <span className="lang-selector__name" lang={option.value} data-i18n="translated">{option.label}</span>
            <DropdownMenu.ItemIndicator className="lang-selector__selected"><Check size={16} aria-hidden="true" /></DropdownMenu.ItemIndicator>
          </DropdownMenu.RadioItem>)}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>;
}

export default LanguageSelector;
