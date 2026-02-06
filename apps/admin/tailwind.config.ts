import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/preline/preline.js',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			sans: [
  				'var(--font-inter)',
  				'sans-serif'
  			],
  			mono: [
  				'var(--font-calistoga)',
  				'mono'
  			]
  		},
  		colors: {
  			gray: {
  				'50': '#fafaf9',
  				'100': '#f5f5f4',
  				'200': '#e7e5e4',
  				'300': '#d6d3d1',
  				'400': '#a8a29e',
  				'500': '#78716c',
  				'600': '#57534e',
  				'700': '#44403c',
  				'800': '#292524',
  				'900': '#1c1917',
  				'950': '#0c0a09'
  			},
  			fuchsia: {
  				'50': '#fbf7fc',
  				'100': '#f7eef9',
  				'200': '#eedbf3',
  				'300': '#e2bfe8',
  				'400': '#ce93d8',
  				'500': '#ba6fc6',
  				'600': '#9e50a9',
  				'700': '#84408b',
  				'800': '#6d3672',
  				'900': '#5b305f',
  				'950': '#3a163c',
  				DEFAULT: '#ba6fc6'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require('tailwindcss-animate'), require('preline/plugin')],
  safelist: [
    'fill-fuchsia-50',
    'fill-fuchsia-950',
    'fill-fuchsia',
    'from-fuchsia-50',
    'from-green-50',
    'from-orange-50',
    'from-cyan-50',
    'from-blue-50',
    'from-purple-50',
    'from-violet-50',
    'from-red-50',
    'from-yellow-50',
    'from-gray-50',
    'from-slate-50',
    'from-zinc-50',
    'from-neutral-50',
    'from-stone-50',
    'from-amber-50',
    'from-lime-50',
    'from-emerald-50',
    'from-teal-50',
    'from-sky-50',
    'from-indigo-50',
    'from-fuchsia-50',
    'from-rose-50',
    'text-fuchsia-600',
    'text-green-600',
    'text-orange-600',
    'text-cyan-600',
    'text-blue-600',
    'text-purple-600',
    'text-violet-600',
    'text-red-600',
    'text-yellow-600',
    'text-gray-600',
    'text-slate-600',
    'text-zinc-600',
    'text-neutral-600',
    'text-stone-600',
    'text-amber-600',
    'text-lime-600',
    'text-emerald-600',
    'text-teal-600',
    'text-sky-600',
    'text-indigo-600',
    'text-fuchsia-600',
    'text-rose-600',
  ],
} satisfies Config & { safelist?: string[] };
