// ============================================================
// 🔖 Type Definitions for CogniSeek
// ============================================================

export interface ItemCategory {
  id: string
  label: string
  icon: string
  items: Array<{ id: string; label: string }>
}

export interface LocationCategory {
  id: string
  name?: string
  label?: string
  icon: string
  subLocations: Array<{ id: string; label: string } | string>
}

export interface ActivityCategory {
  id: string
  name?: string
  label?: string
  icon?: string
  activities?: Array<{ id: string; label: string }>
}

export interface MoodOption {
  id: string
  label: string
  icon?: string
  description?: string
}

export interface SearchSession {
  // Step 0: Scene / Location Selection
  lossLocationCategory: string
  lossLocationSubCategory: string[]
  lossLocationCustom: string

  // Step 1: Item Identification
  itemCategory: string
  itemName: string
  itemCustomName: string
  itemFeatures: string
  itemSize: 'small' | 'medium' | 'large'
  itemColor: string
  itemType: string

  // Step 2: Time Trace
  lossTime: string
  lossTimeRange: string
  preciseTime: string

  // Step 3: Scene Reconstruction (locale-aware uses these)
  lossLocation: string
  lossScenario: string
  locationCategory: string         // alias for scene (home/work/transit/public)
  specificLocation: string         // primary sub-area ID
  locationCustom: string           // custom free-text location
  visitedMultipleLocations: boolean
  otherVisitedLocations: string[]  // array of sub-area IDs

  // Step 4: Context & Emotion
  userMood: string
  moodCustom: string
  userActivity: string
  specificActivity: string
  activityCustom: string
  activityCategory: string
  additionalContext: string
  wasDistracted: boolean
  otherPeoplePresent: boolean

  // Step 5: Prior Search Info
  hasSearched: boolean
  searchDuration: string
  searchedLocations: string[]
  searchedCustomLocations: string[]
  askedOthers: boolean
  triedFindMy: boolean

  // Final
  confidence: number
}

export const initialSearchSession: SearchSession = {
  // Step 0
  lossLocationCategory: '',
  lossLocationSubCategory: [],
  lossLocationCustom: '',

  // Step 1
  itemCategory: '',
  itemName: '',
  itemCustomName: '',
  itemFeatures: '',
  itemSize: 'medium',
  itemColor: '',
  itemType: '',

  // Step 2
  lossTime: '',
  lossTimeRange: '',
  preciseTime: '',

  // Step 3
  lossLocation: '',
  lossScenario: '',
  locationCategory: '',
  specificLocation: '',
  locationCustom: '',
  visitedMultipleLocations: false,
  otherVisitedLocations: [],

  // Step 4
  userMood: '',
  moodCustom: '',
  userActivity: '',
  specificActivity: '',
  activityCustom: '',
  activityCategory: '',
  additionalContext: '',
  wasDistracted: false,
  otherPeoplePresent: false,

  // Step 5
  hasSearched: false,
  searchDuration: '',
  searchedLocations: [],
  searchedCustomLocations: [],
  askedOthers: false,
  triedFindMy: false,

  // Final
  confidence: 0,
}
