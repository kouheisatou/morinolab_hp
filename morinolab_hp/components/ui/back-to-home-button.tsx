import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Sparkles } from 'lucide-react';
import { useScrollPosition } from '@/hooks/use-scroll-position';
import { cn } from '@/lib/utils';

interface BackToHomeButtonProps {
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  restoreScroll?: boolean;
}

export function BackToHomeButton({
  variant = 'primary',
  size = 'default',
  className,
  restoreScroll = true,
}: BackToHomeButtonProps) {
  const { navigateWithScroll } = useScrollPosition();

  const handleClick = () => {
    navigateWithScroll('/', { restoreScroll });
  };

  const variants = {
    primary:
      'relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-500 hover:via-purple-500 hover:to-cyan-500 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300',
    secondary:
      'border-white/30 text-white hover:bg-white/10 hover:border-cyan-400/50 backdrop-blur-sm transition-all duration-300',
    minimal:
      'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    default: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg',
  };

  if (variant === 'primary') {
    return (
      <Button
        onClick={handleClick}
        className={cn(variants[variant], sizes[size], 'group', className)}
      >
        <div className='absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,120,120,0.1),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
        <Sparkles className='w-4 h-4 mr-2 relative z-10 group-hover:rotate-180 transition-transform duration-500' />
        <span className='relative z-10 font-medium'>Back to Home</span>
        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000' />
      </Button>
    );
  }

  return (
    <Button
      onClick={handleClick}
      variant='outline'
      className={cn(variants[variant], sizes[size], 'group', className)}
    >
      <Home className='w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200' />
      <span>Back to Home</span>
    </Button>
  );
}
