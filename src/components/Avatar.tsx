interface AvatarProps {
  profil: any
  velikost?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const VELIKOSTI = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-14 h-14 text-xl',
}

export default function Avatar({ profil, velikost = 'md', className = '' }: AvatarProps) {
  const velikostClass = VELIKOSTI[velikost]

  return (
    <div className={`${velikostClass} rounded-full border-2 border-blue-500/40 overflow-hidden flex-shrink-0 ${className}`}>
      {profil?.avatar_url ? (
        <img src={profil.avatar_url} alt={`${profil.ime} ${profil.priimek}`} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-blue-600/20 flex items-center justify-center font-black text-blue-300">
          {profil?.ime?.[0]}{profil?.priimek?.[0]}
        </div>
      )}
    </div>
  )
}