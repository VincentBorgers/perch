import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { Content, Data } from './types'

const dataDir = process.env.PERCH_DATA_DIR
  ? path.resolve(process.env.PERCH_DATA_DIR)
  : path.join(process.cwd(), 'data')

const dataFile = path.join(dataDir, 'db.json')

export const defaults: Data = {
  profile: {
    name: 'Your name',
    bio: 'A short line about you and what you do.',
    avatarUrl: '',
    socials: [],
  },
  links: [
    { id: 'sample-1', title: 'My website', url: 'https://example.com', enabled: true },
  ],
  theme: {
    backgroundType: 'gradient',
    bgColor1: '#1b2735',
    bgColor2: '#090a0f',
    gradientAngle: 160,
    bgImageUrl: '',
    textColor: '#ffffff',
    buttonStyle: 'soft',
    buttonColor: '#7c9cff',
    buttonTextColor: '#0b1020',
    buttonRadius: 14,
    font: 'system',
    avatarShape: 'circle',
  },
  auth: {
    passwordHash: '',
  },
}

async function readRaw(): Promise<Partial<Data>> {
  try {
    const text = await fs.readFile(dataFile, 'utf8')
    return JSON.parse(text) as Partial<Data>
  } catch {
    return {}
  }
}

function withDefaults(file: Partial<Data>): Data {
  return {
    profile: { ...defaults.profile, ...file.profile },
    links: Array.isArray(file.links) ? file.links : defaults.links,
    theme: { ...defaults.theme, ...file.theme },
    auth: { ...defaults.auth, ...file.auth },
  }
}

export async function getData(): Promise<Data> {
  return withDefaults(await readRaw())
}

async function writeData(data: Data): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true })
  const tmp = path.join(dataDir, `db.${process.pid}.tmp`)
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8')
  await fs.rename(tmp, dataFile)
}

/** Replace the editable content while keeping the stored auth untouched. */
export async function saveContent(content: Content): Promise<void> {
  const current = await getData()
  await writeData({ ...current, ...content })
}

export async function setPasswordHash(hash: string): Promise<void> {
  const current = await getData()
  await writeData({ ...current, auth: { passwordHash: hash } })
}
