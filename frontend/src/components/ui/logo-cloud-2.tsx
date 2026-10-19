import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

type Logo = {
  src: string;
  alt: string;
  label?: string;
  width?: number;
  height?: number;
};

type LogoCloudProps = React.ComponentProps<'div'>;

export function LogoCloud({ className, ...props }: LogoCloudProps) {
  return (
    <div
      className={cn(
        'relative grid grid-cols-2 border-x border-zinc-700/30 md:grid-cols-4',
        className
      )}
      {...props}
    >
      <div className="-translate-x-1/2 -top-px pointer-events-none absolute left-1/2 w-screen border-t border-zinc-700/30" />

      <LogoCard
        className="relative border-r border-b border-zinc-700/30 bg-zinc-900"
        logo={{
          src: 'https://svgl.app/library/nvidia-wordmark-light.svg',
          alt: 'NVIDIA AI',
        }}
      >
        <Plus
          className="-right-[12.5px] -bottom-[12.5px] absolute z-10 w-6 h-6 text-zinc-700/50"
          strokeWidth={1}
        />
      </LogoCard>

      <LogoCard
        className="border-b border-zinc-700/30 md:border-r bg-zinc-900"
        logo={{
          src: 'https://svgl.app/library/supabase_wordmark_light.svg',
          alt: 'Supabase',
        }}
      />

      <LogoCard
        className="relative border-r border-b border-zinc-700/30 bg-zinc-900"
        logo={{
          src: 'https://svgl.app/library/github_wordmark_light.svg',
          alt: 'GitHub',
        }}
      >
        <Plus
          className="-right-[12.5px] -bottom-[12.5px] absolute z-10 w-6 h-6 text-zinc-700/50"
          strokeWidth={1}
        />
        <Plus
          className="-bottom-[12.5px] -left-[12.5px] absolute z-10 hidden w-6 h-6 md:block text-zinc-700/50"
          strokeWidth={1}
        />
      </LogoCard>

      <LogoCard
        className="relative border-b border-zinc-700/30 bg-zinc-900"
        logo={{
          src: 'https://svgl.app/library/openai_wordmark_light.svg',
          alt: 'OpenAI',
        }}
      />

      <LogoCard
        className="relative border-r border-b border-zinc-700/30 bg-zinc-900 md:border-b-0"
        logo={{
          src: 'https://svgl.app/library/turso-wordmark-light.svg',
          alt: 'Turso',
        }}
      >
        <Plus
          className="-right-[12.5px] -bottom-[12.5px] md:-left-[12.5px] absolute z-10 w-6 h-6 md:hidden text-zinc-700/50"
          strokeWidth={1}
        />
      </LogoCard>

      <LogoCard
        className="border-b border-r border-zinc-700/30 bg-zinc-900 md:border-b-0"
        logo={{
          src: 'https://svgl.app/library/clerk-wordmark-light.svg',
          alt: 'Clerk Auth',
        }}
      />

      <LogoCard
        className="border-r border-zinc-700/30 bg-zinc-900"
        logo={{
          src: 'https://svgl.app/library/claude-ai-wordmark-icon_light.svg',
          alt: 'Anthropic Claude',
        }}
      />

      <LogoCard
        className="bg-zinc-900"
        logo={{
          src: 'https://svgl.app/library/vercel_wordmark.svg',
          alt: 'Vercel',
        }}
      />

      <div className="-translate-x-1/2 -bottom-px pointer-events-none absolute left-1/2 w-screen border-b border-zinc-700/30" />
    </div>
  );
}

type LogoCardProps = React.ComponentProps<'div'> & {
  logo: Logo;
};

function LogoCard({ logo, className, children, ...props }: LogoCardProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-zinc-900 px-4 py-8 md:p-8 min-h-[90px]',
        className
      )}
      {...props}
    >
      <img
        alt={logo.alt}
        className="pointer-events-none h-4 select-none md:h-5 brightness-0 invert opacity-70 hover:opacity-100 transition-opacity"
        height={logo.height || 20}
        src={logo.src}
        width={logo.width || 120}
        loading="lazy"
        onError={(e) => {
          // Fallback to text if network SVG is blocked
          const target = e.currentTarget;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent && !parent.querySelector('.logo-fallback')) {
            const span = document.createElement('span');
            span.className = 'logo-fallback text-sm font-mono font-medium text-zinc-400 tracking-wider';
            span.innerText = logo.alt;
            parent.appendChild(span);
          }
        }}
      />
      {children}
    </div>
  );
}
