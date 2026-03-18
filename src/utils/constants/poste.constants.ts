import type { TypePoste } from '../types/user.types';

export const COLOR_PALETTE: { bg: string; text: string; label?: string }[] = [
  { bg: '#ede9fe', text: '#6d28d9', label: 'Violet'    },
  { bg: '#dcfce7', text: '#15803d', label: 'Vert'      },
  { bg: '#dbeafe', text: '#1d4ed8', label: 'Bleu'      },
  { bg: '#fce7f3', text: '#be185d', label: 'Rose'      },
  { bg: '#ffedd5', text: '#c2410c', label: 'Orange'    },
  { bg: '#fef9c3', text: '#a16207', label: 'Jaune'     },
  { bg: '#f1f5f9', text: '#475569', label: 'Gris'      },
  { bg: '#fee2e2', text: '#dc2626', label: 'Rouge'     },
  { bg: '#ccfbf1', text: '#0f766e', label: 'Turquoise' },
];

export const TYPE_LABELS: Record<TypePoste, string> = {
  direction:  'Direction',
  commercial: 'Commercial',
  support:    'Support',
  rh:         'RH',
  technique:  'Technique',
  adv:        'ADV',
  autre:      'Autre',
};

export const TYPE_OPTIONS: { value: TypePoste; label: string }[] = [
  { value: 'direction',  label: 'Direction'  },
  { value: 'commercial', label: 'Commercial' },
  { value: 'support',    label: 'Support'    },
  { value: 'rh',         label: 'RH'         },
  { value: 'technique',  label: 'Technique'  },
  { value: 'adv',        label: 'ADV'        },
  { value: 'autre',      label: 'Autre'      },
];

export const NIVEAU_OPTIONS = ['Junior', 'Senior', 'Manager', 'Support', 'Direction'];

export function getPosteBadgeStyle(couleur: string | null | undefined) {
  if (!couleur) return undefined;
  return {
    background: couleur,
    color: COLOR_PALETTE.find(c => c.bg === couleur)?.text,
  };
}
