import { articleMenu, directoryItems, secondLevel } from '../data/content.js'

export const topicDirs = directoryItems.filter((item) => item.id !== 'about' && item.id !== 'cases')

export const topicSubs = Object.entries(secondLevel)
  .filter(([dir]) => dir !== 'cases')
  .flatMap(([dir, items]) =>
    items.map((item) => ({
      id: item.id,
      label: item.label,
      dir,
      dirLabel: topicDirs.find((entry) => entry.id === dir)?.label || dir,
    })),
  )

export const articleCats = articleMenu.filter((item) => item.id !== 'latest')
