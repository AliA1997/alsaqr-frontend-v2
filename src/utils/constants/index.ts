import { Margin, Options, Resolution } from "react-to-pdf";
import { CreateListOrCommunityForm, UserRegisterForm } from "@typings";

export const ROUTES_USER_CANT_ACCESS = [
  '/communities',
  '/bookmarks',
  '/lists',
  '/messages',
  '/notifications',
  '/yumna'
];

export const ROUTES_WIDGETS_HIDDEN = [
  "/messages",
  "/yumna"
]

export const MAX_BIO_LENGTH_FEED = 40;

export const MARITAL_STATUS_OPTIONS = [
  {
    label: "Single",
    value: 'Single',
    description: ''
  },
  {
    label: "Married",
    value: 'Married',
    description: ''
  },
  {
    label: "Divorced",
    value: 'Divorced',
    description: ''
  },
  {
    label: "Widowed",
    value: 'Widowed',
    description: ''
  }
];

export const RELIGION_OPTIONS = [
  { label: "Muslim", value: "Muslim" },
  { label: "Christian", value: "Christian" },
  { label: "Hindu", value: "Hindu" },
  { label: "Buddhist", value: "Buddhist" },
  { label: "Jewish", value: "Jewish" },
  { label: "Sikh", value: "Sikh" },
  { label: "Baháʼí", value: "Bahai" },
  { label: "Jain", value: "Jain" },
  { label: "Shinto", value: "Shinto" },
  { label: "Taoist", value: "Taoist" },
  { label: "Zoroastrian", value: "Zoroastrian" },
  { label: "Pagan / Wiccan", value: "Pagan" },
  { label: "Indigenous / Traditional", value: "Indigenous" },
  { label: "Atheist", value: "Atheist" },
  { label: "Agnostic", value: "Agnostic" },
  { label: "Spiritual but not religious", value: "Spiritual" },
  { label: "Other", value: "Other" },
  { label: "Prefer Not To Disclose", value: "Prefer Not To Disclose" },
];

export const HOBBIES_OPTIONS = [
  // Creative & Artistic
  { value: "Painting/Drawing", label: "Painting/Drawing" },
  { value: "Photography", label: "Photography" },
  { value: "Sculpting/Pottery", label: "Sculpting/Pottery" },
  { value: "Writing (Poetry, Fiction, Blogging)", label: "Writing (Poetry, Fiction, Blogging)" },
  { value: "Graphic Design/Digital Art", label: "Graphic Design/Digital Art" },
  { value: "Calligraphy/Hand Lettering", label: "Calligraphy/Hand Lettering" },
  { value: "Knitting/Crocheting/Sewing", label: "Knitting/Crocheting/Sewing" },
  { value: "DIY Crafts/Upcycling", label: "DIY Crafts/Upcycling" },

  // Outdoor & Adventure
  { value: "Hiking/Trekking", label: "Hiking/Trekking" },
  { value: "Camping/Backpacking", label: "Camping/Backpacking" },
  { value: "Gardening/Urban Farming", label: "Gardening/Urban Farming" },
  { value: "Birdwatching", label: "Birdwatching" },
  { value: "Rock Climbing", label: "Rock Climbing" },
  { value: "Kayaking/Canoeing", label: "Kayaking/Canoeing" },
  { value: "Cycling/Mountain Biking", label: "Cycling/Mountain Biking" },
  { value: "Geocaching", label: "Geocaching" },

  // Sports & Fitness
  { value: "Yoga/Pilates", label: "Yoga/Pilates" },
  { value: "Running/Jogging", label: "Running/Jogging" },
  { value: "Swimming", label: "Swimming" },
  { value: "Martial Arts (Karate, Taekwondo, etc.)", label: "Martial Arts (Karate, Taekwondo, etc.)" },
  { value: "Dancing (Salsa, Hip-Hop, Ballet, etc.)", label: "Dancing (Salsa, Hip-Hop, Ballet, etc.)" },
  { value: "Weightlifting/Strength Training", label: "Weightlifting/Strength Training" },
  { value: "Team Sports (Soccer, Basketball, Volleyball)", label: "Team Sports (Soccer, Basketball, Volleyball)" },
  { value: "Skateboarding/Rollerblading", label: "Skateboarding/Rollerblading" },

  // Intellectual & Learning
  { value: "Reading (Fiction, Non-Fiction, Magazines)", label: "Reading (Fiction, Non-Fiction, Magazines)" },
  { value: "Learning a New Language", label: "Learning a New Language" },
  { value: "Chess/Board Games", label: "Chess/Board Games" },
  { value: "Puzzle Solving (Crosswords, Sudoku)", label: "Puzzle Solving (Crosswords, Sudoku)" },
  { value: "Astronomy/Stargazing", label: "Astronomy/Stargazing" },
  { value: "History Research", label: "History Research" },
  { value: "Philosophy Discussion", label: "Philosophy Discussion" },
  { value: "Podcasting", label: "Podcasting" },

  // Tech & Gaming
  { value: "Coding/Programming", label: "Coding/Programming" },
  { value: "Video Gaming (PC, Console, Mobile)", label: "Video Gaming (PC, Console, Mobile)" },
  { value: "Virtual Reality (VR) Experiences", label: "Virtual Reality (VR) Experiences" },
  { value: "3D Printing", label: "3D Printing" },
  { value: "Drone Flying/Photography", label: "Drone Flying/Photography" },
  { value: "Building PCs/Tech Tinkering", label: "Building PCs/Tech Tinkering" },
  { value: "AI/Machine Learning Projects", label: "AI/Machine Learning Projects" },
  { value: "Retro Gaming Collection", label: "Retro Gaming Collection" },

  // Music & Performance
  { value: "Playing an Instrument (Guitar, Piano, Violin, etc.)", label: "Playing an Instrument (Guitar, Piano, Violin, etc.)" },
  { value: "Singing/Choir", label: "Singing/Choir" },
  { value: "DJing/Music Production", label: "DJing/Music Production" },
  { value: "Beatboxing", label: "Beatboxing" },
  { value: "Theater/Acting", label: "Theater/Acting" },
  { value: "Stand-Up Comedy", label: "Stand-Up Comedy" },
  { value: "Magic Tricks/Illusions", label: "Magic Tricks/Illusions" },
  { value: "Collecting Vinyl Records", label: "Collecting Vinyl Records" },

  // Social & Community
  { value: "Volunteering", label: "Volunteering" },
  { value: "Book Clubs", label: "Book Clubs" },
  { value: "Board Game Nights", label: "Board Game Nights" },
  { value: "Meetup Groups (Themed Interests)", label: "Meetup Groups (Themed Interests)" },
  { value: "Karaoke Nights", label: "Karaoke Nights" },
  { value: "Wine/Beer Tasting", label: "Wine/Beer Tasting" },
  { value: "Cooking Clubs", label: "Cooking Clubs" },
  { value: "Travel Groups", label: "Travel Groups" },

  // Relaxation & Mindfulness
  { value: "Meditation", label: "Meditation" },
  { value: "Journaling", label: "Journaling" },
  { value: "Aromatherapy/Candle Making", label: "Aromatherapy/Candle Making" },
  { value: "Tea/Coffee Brewing", label: "Tea/Coffee Brewing" },
  { value: "Feng Shui/Home Organization", label: "Feng Shui/Home Organization" },
  { value: "Coloring Books (Adult)", label: "Coloring Books (Adult)" },
  { value: "Listening to Audiobooks/Podcasts", label: "Listening to Audiobooks/Podcasts" },
  { value: "Stargazing", label: "Stargazing" },

  // Collecting
  { value: "Stamps/Coins", label: "Stamps/Coins" },
  { value: "Comic Books/Manga", label: "Comic Books/Manga" },
  { value: "Action Figures/Figurines", label: "Action Figures/Figurines" },
  { value: "Sneakers", label: "Sneakers" },
  { value: "Antiques", label: "Antiques" },
  { value: "Trading Cards (Pokémon, MTG, etc.)", label: "Trading Cards (Pokémon, MTG, etc.)" },
  { value: "Vinyl Records/CDs", label: "Vinyl Records/CDs" },
  { value: "Postcards", label: "Postcards" }
];

export const DEFAULT_USER_REGISTRATION_FORM: UserRegisterForm = {
  username: "",
  walletAddress: "",
  avatar: "",
  bgThumbnail: "",
  email: "",
  bio: "",
  firstName: "",
  lastName: "",
  dateOfBirth: undefined,
  maritalStatus: undefined,
  hobbies: [],
  religion: "",
  countryOfOrigin: undefined,
  followingUsers: []
};

export const DEFAULT_CREATED_LIST_OR_COMMUNITY_FORM: CreateListOrCommunityForm = {
  name: "",
  avatarOrBannerImage: "",
  isPrivate: "public",
  tags: [],
  usersAdded: [],
  postsAdded: []
};

export const ROUTE_TO_SHOW_SETTINGS_SIDEBAR = '/settings';
export const DELETE_YOUR_ACCOUNT = 'Delete Your Account';

export const REACT_TO_PDF_CONFIG: Options = {
   // default is `save`
   method: 'open',
   // default is Resolution.MEDIUM = 3, which should be enough, higher values
   // increases the image quality but also the size of the PDF, so be careful
   // using values higher than 10 when having multiple pages generated, it
   // might cause the page to crash or hang.
   resolution: Resolution.HIGH,
   page: {
      // margin is in MM, default is Margin.NONE = 0
      margin: Margin.LARGE,
      // default is 'A4'
      format: 'letter',
      // default is 'portrait'
      orientation: 'portrait',
   },
   canvas: {
      // default is 'image/jpeg' for better size performance
      mimeType: 'image/png',
      qualityRatio: 1,
   },
   // Customize any value passed to the jsPDF instance and html2canvas
   // function. You probably will not need this and things can break, 
   // so use with caution.
   overrides: {
      // see https://artskydj.github.io/jsPDF/docs/jsPDF.html for more options
      pdf: {
         compress: true
      },
      // see https://html2canvas.hertzen.com/configuration for more options
      canvas: {
         useCORS: true
      }
   },
};

export const INVITATION_EXPIRE_TIME = (24 * 60 * 60 * 1000) * 3

export const FALLBACK_IMAGE_URL = "https://res.cloudinary.com/aa1997/image/upload/v1720130142/Web3-Client-Projects/Gm.png";

export const FALLBACK_NEWS_IMAGE_URL = "/explore-news-placeholder.svg";

export const FALLBACK_POST_IMAGE_URL = "/post-placeholder.svg";

export const EXPLORE_SOURCES = [
  {
    id: "al-jazeera-english",
    name: "Al Jazeera English",
    image: "/explore-sources/aljazeeraenglish.svg",
    testId: 'ajtab',
  },
  {
    id: "argaam",
    name: "Argaam",
    image: "/explore-sources/argaam.svg",
    testId: 'argaamtab',
  },
  {
    id: "bleacher-report",
    name: "Bleacher Report",
    image: "/explore-sources/bleacher-report.svg",
    testId: 'brtab',
  },
  {
    id: "crypto-coins-news",
    name: "Crypto Coins News",
    image: "/explore-sources/cryptocoinnews.svg",
    testId: 'ccntab',
  },
  {
    id: "sabq",
    name: "SABQ",
    image: "/explore-sources/sabq.svg",
    testId: 'sabqtab'
  },
]

export const NOT_ALLOWED_NSFW_CHECKER_RESULTS = {
  "Somewhat Explicit": 'Somewhat Explicit',
  'Very Explicit': 'Very Explicit'
};

export const inTestMode = () => import.meta.env.VITE_PUBLIC_IS_TEST_MODE == true;

export const OAUTH_OPTIONS = {
  redirectTo: import.meta.env.VITE_PUBLIC_BASE_URL
}

export const DEFAULT_SMALL_ITEMS_PERPAGE = "10";

export const DEFAULT_MEDIUM_ITEMS_PERPAGE = "25";

// Virtualized feeds page on end-of-list (react-virtuoso). Virtualization caps how
// many rows are MOUNTED, not how many are fetched and pushed into the observable
// registries — so the page size still has to stay small.
export const DEFAULT_VIRTUALIZED_ITEMS_PERPAGE = "25";

export const SEARCH_TERM_KEY_FOR_PREDICATE = "searchTerm";

export const MEDIA_TAB = "media";

export const REELS_POST_TYPE = "reels";

// Yumna AI chatbot
export const YUMNA_AVATAR_URL = "/icons/yumna-ai.svg";

export const YUMNA_MAX_PROMPT_LENGTH = 256;

export const BASIC_SUBSCRIPTION_DAILY_LIMIT = 30;

export const PRO_SUBSCRIPTION_DAILY_LIMIT = 5000;

export const YUMNA_REMAINING_REQUESTS_WARNING_THRESHOLD = 10;

export const YUMNA_DEFAULT_CONTEXT = `You are Yumna, an AI assistant designed to help with a wide range of tasks, including answering questions, providing explanations, offering suggestions, and assisting with problem-solving.`;
