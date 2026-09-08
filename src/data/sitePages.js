export const SITE_ABOUT_ID = 'site-about'
export const SITE_TOPICS_ID = 'site-topics'

const SITE_PAGE_IDS = new Set([SITE_ABOUT_ID, SITE_TOPICS_ID])

export function isSitePageId(id) {
  return SITE_PAGE_IDS.has(id)
}
