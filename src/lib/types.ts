export type LinkItem = {
  id: string
  title: string
  url: string
  enabled: boolean
}

export type SocialPlatform =
  | 'instagram'
  | 'x'
  | 'youtube'
  | 'tiktok'
  | 'linkedin'
  | 'github'
  | 'email'
  | 'website'

export type SocialItem = {
  platform: SocialPlatform
  url: string
}

export type Profile = {
  name: string
  bio: string
  avatarUrl: string
  socials: SocialItem[]
}

export type BackgroundType = 'solid' | 'gradient' | 'image'
export type ButtonStyle = 'solid' | 'outline' | 'soft'
export type FontChoice = 'system' | 'serif' | 'mono' | 'rounded'
export type AvatarShape = 'circle' | 'rounded' | 'square'

export type Theme = {
  backgroundType: BackgroundType
  bgColor1: string
  bgColor2: string
  gradientAngle: number
  bgImageUrl: string
  textColor: string
  buttonStyle: ButtonStyle
  buttonColor: string
  buttonTextColor: string
  buttonRadius: number
  font: FontChoice
  avatarShape: AvatarShape
}

export type Auth = {
  passwordHash: string
}

export type Data = {
  profile: Profile
  links: LinkItem[]
  theme: Theme
  auth: Auth
}

/** The part of the data that the admin can edit and the public page renders. */
export type Content = Pick<Data, 'profile' | 'links' | 'theme'>
