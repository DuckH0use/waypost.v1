import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Search, Star, Clock, X, Plus, Check, ChevronDown, ChevronUp,
  SlidersHorizontal, Trash2, Compass, Utensils, Landmark, Waves, Mountain,
  Building2, Sparkles, ArrowRight, ShoppingBag, PartyPopper, Trees, Globe2,
  Plane, CreditCard, ShieldCheck, Info, ArrowUpDown, CalendarDays, Bookmark,
  Building, Palette, Clapperboard, ZoomIn, ZoomOut, Wallet,
} from "lucide-react";

/* ============================== CONSTANTS ============================== */

const DEST_TYPES = ["City", "Beach", "Nature", "Mountains", "Culture", "Adventure", "Relaxation"];
const INTERESTS = ["Food", "History", "Shopping", "Nightlife", "Museums", "Nature", "Architecture", "Entertainment"];
const BUDGETS = [1, 2, 3];
const BUDGET_LABEL = { 1: "$", 2: "$$", 3: "$$$" };
const CLIMATES = ["Hot", "Warm", "Mild", "Cold"];
const TRIP_LENGTHS = ["Weekend", "3–5 days", "5–7 days", "1–2 weeks", "2+ weeks"];
const TRAVEL_TIMES = [
  { id: "lt3", label: "Under 3 hours", hrs: 3 },
  { id: "lt6", label: "Under 6 hours", hrs: 6 },
  { id: "lt10", label: "Under 10 hours", hrs: 10 },
  { id: "any", label: "Any distance", hrs: Infinity },
];
const DIFFICULTIES = [
  { id: "very", label: "Very beginner friendly" },
  { id: "beginner", label: "Beginner friendly" },
  { id: "moderate", label: "Moderate" },
  { id: "any", label: "Any" },
];
const BEGINNER_LABEL = { 1: "Challenging", 2: "Moderate", 3: "Beginner Friendly", 4: "Very Beginner Friendly" };

const TAG_ICON = {
  Food: Utensils, History: Landmark, Shopping: ShoppingBag, Nightlife: PartyPopper,
  Nature: Trees, Museums: Landmark, Relaxation: Waves, City: Building2,
  Beach: Waves, Mountains: Mountain, Culture: Landmark, Adventure: Compass,
  Architecture: Building, Entertainment: Clapperboard,
};

const ORIGIN_CITIES = [
  { name: "New York, USA", lat: 40.71, lng: -74.01 },
  { name: "Los Angeles, USA", lat: 34.05, lng: -118.24 },
  { name: "Chicago, USA", lat: 41.88, lng: -87.63 },
  { name: "Miami, USA", lat: 25.76, lng: -80.19 },
  { name: "San Francisco, USA", lat: 37.77, lng: -122.42 },
  { name: "Toronto, Canada", lat: 43.65, lng: -79.38 },
  { name: "London, UK", lat: 51.51, lng: -0.13 },
  { name: "Paris, France", lat: 48.85, lng: 2.35 },
  { name: "Berlin, Germany", lat: 52.52, lng: 13.40 },
  { name: "Dubai, UAE", lat: 25.20, lng: 55.27 },
  { name: "Mumbai, India", lat: 19.08, lng: 72.88 },
  { name: "Hong Kong", lat: 22.32, lng: 114.17 },
  { name: "São Paulo, Brazil", lat: -23.55, lng: -46.63 },
  { name: "Johannesburg, South Africa", lat: -26.20, lng: 28.05 },
];

/* ============================== DESTINATION DATABASE ============================== */
/* Every system (Explore, Trip Match, Destination Intelligence, Compare, Trip Builder)
   reads from this single array. Nothing is duplicated per feature. */

const DESTINATIONS = [
  {
    id: "tokyo", name: "Tokyo", country: "Japan", countryId: "japan", flag: "🇯🇵", region: "Asia",
    lat: 35.68, lng: 139.69,
    gradient: "linear-gradient(135deg,#2E3A6B,#C1467E)",
    tripTypes: ["City", "Culture"], interests: ["Food", "Shopping", "History", "Museums", "Nightlife", "Entertainment"],
    budget: 3, climate: "Mild", beginner: 3, tripLength: "5–7 days", dailyBudgetAvg: 140,
    bestSeason: "Spring / Fall",
    ratings: { transport: 5, food: 5, culture: 5, nature: 3, nightlife: 4, shopping: 5 },
    desc: "A city where centuries-old shrines sit a few blocks from neon skyscrapers. Tokyo rewards wandering — every neighborhood has its own personality, and the trains make it easy to explore even if you don't speak Japanese.",
    culture: {
      language: "Japanese", tipping: "Not expected, sometimes considered rude", payments: "Cash still common; IC cards for transit",
      etiquette: "Bowing, quiet trains, remove shoes indoors",
      tips: ["Carry cash — many small shops don't take cards.", "Don't eat while walking in busy areas.", "Trains stop running around midnight, plan ahead.", "Trash cans are rare; carry a small bag for litter."],
    },
    food: [
      { name: "Ramen", emoji: "🍜", desc: "Noodle soup with countless regional styles." },
      { name: "Sushi", emoji: "🍣", desc: "Fresh fish over vinegared rice, from casual to formal." },
      { name: "Takoyaki", emoji: "🐙", desc: "Crisp octopus dough balls, a street-food staple." },
      { name: "Tonkatsu", emoji: "🍱", desc: "Breaded pork cutlet served with rice and cabbage." },
      { name: "Matcha Sweets", emoji: "🍵", desc: "Green tea desserts from ice cream to cake." },
    ],
    mealCost: 2, knownFor: ["Seafood", "Noodles", "Street Food"],
    attractions: [
      { name: "Sensō-ji", cat: ["Culture", "History"], desc: "Tokyo's oldest temple, framed by a bustling market street.", cost: "Free", time: "1–2 hrs", mustSee: true },
      { name: "Shibuya Crossing", cat: ["City"], desc: "The famously chaotic scramble crossing.", cost: "Free", time: "30 min", mustSee: true },
      { name: "Meiji Shrine", cat: ["Culture"], desc: "A forested shrine tucked beside Harajuku.", cost: "Free", time: "1 hr", mustSee: true },
      { name: "Tsukiji Outer Market", cat: ["Food"], desc: "Stalls serving the freshest seafood breakfast you'll have.", cost: "$$", time: "1–2 hrs", mustSee: false },
      { name: "teamLab Planets", cat: ["Entertainment"], desc: "Immersive digital art you walk barefoot through.", cost: "$$$", time: "2 hrs", mustSee: true },
      { name: "Akihabara", cat: ["Shopping", "Entertainment"], desc: "Electronics, anime, and arcades district.", cost: "Free", time: "2 hrs", mustSee: false },
      { name: "Shinjuku Gyoen", cat: ["Nature"], desc: "Sprawling park mixing Japanese, French, and English gardens.", cost: "$", time: "2 hrs", mustSee: false },
      { name: "Tokyo Skytree", cat: ["City"], desc: "Tallest tower in Japan with sweeping views.", cost: "$$", time: "1–2 hrs", mustSee: false },
      { name: "Harajuku & Takeshita St", cat: ["Shopping", "Entertainment"], desc: "Youth fashion and quirky snacks.", cost: "Free", time: "1–2 hrs", mustSee: false },
      { name: "Ghibli Museum", cat: ["Entertainment", "Culture"], desc: "Whimsical museum from the Studio Ghibli team.", cost: "$$", time: "2 hrs", mustSee: false },
    ],
    cost: { accommodation: "$60–140/night", meals: "$25–50/day", localTransport: "$8–12/day", attractions: "$0–30/visit" },
    basics: { currency: "Japanese Yen (¥)", airport: "Narita (NRT) / Haneda (HND)", transportation: "Excellent — trains & subway", dailyBudget: "$100–180", plug: "Type A/B", safety: "Very safe" },
  },
  {
    id: "seoul", name: "Seoul", country: "South Korea", countryId: "south-korea", flag: "🇰🇷", region: "Asia",
    lat: 37.57, lng: 126.98,
    gradient: "linear-gradient(135deg,#4A2E6B,#E15B3D)",
    tripTypes: ["City", "Culture"], interests: ["Food", "Shopping", "Nightlife", "History", "Entertainment"],
    budget: 2, climate: "Mild", beginner: 3, tripLength: "3–5 days", dailyBudgetAvg: 100,
    bestSeason: "Spring / Fall",
    ratings: { transport: 5, food: 5, culture: 4, nature: 3, nightlife: 5, shopping: 5 },
    desc: "Palaces and hanok villages sit minutes from glowing shopping streets and 24-hour cafés. Seoul moves fast, but the subway system makes it approachable for a first-timer.",
    culture: {
      language: "Korean", tipping: "Not customary", payments: "Cards widely accepted, T-money for transit",
      etiquette: "Two hands when giving/receiving, remove shoes indoors",
      tips: ["Use the T-money card for buses, subway, and even convenience stores.", "Pouring your own drink is considered impolite.", "Many restaurants are self-order via kiosk.", "Jaywalking is taken seriously — use crosswalks."],
    },
    food: [
      { name: "Korean BBQ", emoji: "🥩", desc: "Grill-your-own meat with endless side dishes." },
      { name: "Bibimbap", emoji: "🍚", desc: "Rice bowl mixed with vegetables, egg, and chili paste." },
      { name: "Tteokbokki", emoji: "🌶️", desc: "Chewy rice cakes in a spicy-sweet sauce." },
      { name: "Kimchi Jjigae", emoji: "🍲", desc: "Bubbling kimchi stew, a comfort-food staple." },
      { name: "Hotteok", emoji: "🥞", desc: "Sweet, syrup-filled street pancakes." },
    ],
    mealCost: 2, knownFor: ["BBQ", "Street Food", "Cafés"],
    attractions: [
      { name: "Gyeongbokgung Palace", cat: ["Culture", "History"], desc: "The grandest of Seoul's five royal palaces.", cost: "$", time: "2 hrs", mustSee: true },
      { name: "Bukchon Hanok Village", cat: ["Culture"], desc: "Traditional wooden houses on a hillside.", cost: "Free", time: "1 hr", mustSee: true },
      { name: "Myeongdong", cat: ["Shopping", "Food"], desc: "Beauty shops and street food stalls.", cost: "$$", time: "2 hrs", mustSee: false },
      { name: "N Seoul Tower", cat: ["City"], desc: "Panoramic views over the whole city.", cost: "$$", time: "1–2 hrs", mustSee: true },
      { name: "Hongdae", cat: ["Nightlife", "Entertainment"], desc: "University district full of live music and clubs.", cost: "$$", time: "Evening", mustSee: false },
      { name: "Gwangjang Market", cat: ["Food"], desc: "Legendary street-food market since 1905.", cost: "$", time: "1 hr", mustSee: true },
      { name: "Lotte World", cat: ["Entertainment"], desc: "Indoor-outdoor theme park.", cost: "$$$", time: "Half day", mustSee: false },
      { name: "Dongdaemun Design Plaza", cat: ["Architecture", "Shopping"], desc: "Futuristic curved landmark and night market.", cost: "Free", time: "1–2 hrs", mustSee: false },
    ],
    cost: { accommodation: "$45–100/night", meals: "$15–35/day", localTransport: "$5–8/day", attractions: "$0–25/visit" },
    basics: { currency: "South Korean Won (₩)", airport: "Incheon (ICN)", transportation: "Excellent — subway", dailyBudget: "$70–130", plug: "Type C/F", safety: "Very safe" },
  },
  {
    id: "singapore", name: "Singapore", country: "Singapore", countryId: "singapore", flag: "🇸🇬", region: "Asia",
    lat: 1.35, lng: 103.82,
    gradient: "linear-gradient(135deg,#0F6E5B,#2E3A6B)",
    tripTypes: ["City"], interests: ["Food", "Shopping", "Museums", "Architecture", "Entertainment"],
    budget: 3, climate: "Hot", beginner: 4, tripLength: "3–5 days", dailyBudgetAvg: 150,
    bestSeason: "Year-round",
    ratings: { transport: 5, food: 5, culture: 4, nature: 3, nightlife: 3, shopping: 5 },
    desc: "Clean, orderly, and famously easy to navigate, Singapore is a gentle first stop into Asia. English is widely spoken and the food-court culture makes trying new dishes low-stakes.",
    culture: {
      language: "English, Mandarin, Malay, Tamil", tipping: "Not expected, service charge often included", payments: "Cards and mobile pay everywhere",
      etiquette: "No chewing gum sales, respect for shared/clean spaces",
      tips: ["Eating and drinking is banned on the subway.", "Hawker centers are the best way to try local food cheaply.", "Tap water is safe to drink.", "Jaywalking fines are enforced."],
    },
    food: [
      { name: "Chili Crab", emoji: "🦀", desc: "Whole crab in a sweet, spicy tomato-chili sauce." },
      { name: "Hainanese Chicken Rice", emoji: "🍗", desc: "Poached chicken over fragrant rice." },
      { name: "Laksa", emoji: "🍲", desc: "Spicy coconut noodle soup." },
      { name: "Satay", emoji: "🍢", desc: "Grilled skewers with peanut sauce." },
      { name: "Kaya Toast", emoji: "🍞", desc: "Coconut jam toast, a classic breakfast." },
    ],
    mealCost: 2, knownFor: ["Hawker Food", "Seafood", "Convenience"],
    attractions: [
      { name: "Gardens by the Bay", cat: ["Nature"], desc: "Futuristic Supertree gardens and domes.", cost: "$$", time: "3 hrs", mustSee: true },
      { name: "Marina Bay Sands SkyPark", cat: ["City", "Architecture"], desc: "Rooftop infinity views over the skyline.", cost: "$$$", time: "1 hr", mustSee: true },
      { name: "Chinatown", cat: ["Culture", "Food"], desc: "Temples, shophouses, and hawker stalls.", cost: "Free", time: "2 hrs", mustSee: false },
      { name: "Sentosa Island", cat: ["Entertainment"], desc: "Beaches, theme parks, and resorts.", cost: "$$", time: "Half day", mustSee: false },
      { name: "Hawker Centres", cat: ["Food"], desc: "Affordable, incredible local dishes under one roof.", cost: "$", time: "1 hr", mustSee: true },
      { name: "National Museum", cat: ["Museums"], desc: "Singapore's history from colony to nation.", cost: "$$", time: "2 hrs", mustSee: false },
      { name: "Jewel Changi Airport", cat: ["Architecture", "Entertainment"], desc: "Indoor waterfall inside a glass dome.", cost: "Free", time: "1–2 hrs", mustSee: true },
    ],
    cost: { accommodation: "$70–160/night", meals: "$20–40/day", localTransport: "$6–10/day", attractions: "$0–40/visit" },
    basics: { currency: "Singapore Dollar (S$)", airport: "Changi (SIN)", transportation: "Excellent — MRT", dailyBudget: "$110–190", plug: "Type G", safety: "Extremely safe" },
  },
  {
    id: "barcelona", name: "Barcelona", country: "Spain", countryId: "spain", flag: "🇪🇸", region: "Europe",
    lat: 41.39, lng: 2.17,
    gradient: "linear-gradient(135deg,#D9A441,#C1467E)",
    tripTypes: ["City", "Beach", "Culture"], interests: ["Food", "History", "Nightlife", "Museums", "Architecture"],
    budget: 2, climate: "Warm", beginner: 4, tripLength: "5–7 days", dailyBudgetAvg: 120,
    bestSeason: "Spring / Fall",
    ratings: { transport: 5, food: 5, culture: 5, nature: 3, nightlife: 4, shopping: 4 },
    desc: "Gaudí's dreamlike architecture, a Mediterranean beach, and long tapas dinners make Barcelona one of the friendliest big cities for a first European trip.",
    culture: {
      language: "Spanish, Catalan", tipping: "Small rounding up appreciated, not required", payments: "Cards widely accepted",
      etiquette: "Late dinners (9pm+), siesta closures midday",
      tips: ["Watch for pickpockets on Las Ramblas.", "Many shops close for a midday siesta.", "Dinner reservations rarely start before 8:30pm.", "Book Sagrada Família tickets online in advance."],
    },
    food: [
      { name: "Tapas", emoji: "🍤", desc: "Small shared plates, endlessly varied." },
      { name: "Paella", emoji: "🥘", desc: "Saffron rice with seafood or meat." },
      { name: "Jamón Ibérico", emoji: "🍖", desc: "Cured Spanish ham, thinly sliced." },
      { name: "Pan con Tomate", emoji: "🍅", desc: "Grilled bread rubbed with ripe tomato." },
      { name: "Crema Catalana", emoji: "🍮", desc: "Catalonia's take on crème brûlée." },
    ],
    mealCost: 2, knownFor: ["Tapas", "Seafood", "Wine"],
    attractions: [
      { name: "Sagrada Família", cat: ["Culture", "Architecture"], desc: "Gaudí's still-unfinished basilica masterpiece.", cost: "$$$", time: "1–2 hrs", mustSee: true },
      { name: "Park Güell", cat: ["Culture", "Nature", "Architecture"], desc: "Mosaic-covered park with skyline views.", cost: "$$", time: "1–2 hrs", mustSee: true },
      { name: "Gothic Quarter", cat: ["Culture", "Shopping"], desc: "Medieval alleys packed with shops and cafés.", cost: "Free", time: "2 hrs", mustSee: true },
      { name: "La Boqueria Market", cat: ["Food"], desc: "Colorful market off Las Ramblas.", cost: "$", time: "1 hr", mustSee: false },
      { name: "Barceloneta Beach", cat: ["Nature"], desc: "City beach with beach bars.", cost: "Free", time: "Half day", mustSee: false },
      { name: "Picasso Museum", cat: ["Museums"], desc: "Early works of the artist across five townhouses.", cost: "$$", time: "1–2 hrs", mustSee: false },
      { name: "Casa Batlló", cat: ["Architecture"], desc: "Gaudí's surreal, bone-like facade.", cost: "$$$", time: "1 hr", mustSee: false },
    ],
    cost: { accommodation: "$50–110/night", meals: "$20–40/day", localTransport: "$6–10/day", attractions: "$0–35/visit" },
    basics: { currency: "Euro (€)", airport: "El Prat (BCN)", transportation: "Excellent — metro", dailyBudget: "$90–150", plug: "Type C/F", safety: "Safe, watch belongings" },
  },
  {
    id: "prague", name: "Prague", country: "Czech Republic", countryId: "czech-republic", flag: "🇨🇿", region: "Europe",
    lat: 50.09, lng: 14.42,
    gradient: "linear-gradient(135deg,#175E54,#8A6FB0)",
    tripTypes: ["City", "Culture"], interests: ["History", "Museums", "Food", "Architecture"],
    budget: 1, climate: "Mild", beginner: 4, tripLength: "3–5 days", dailyBudgetAvg: 70,
    bestSeason: "Spring / Fall",
    ratings: { transport: 4, food: 4, culture: 5, nature: 2, nightlife: 3, shopping: 3 },
    desc: "Fairy-tale spires, a medieval astronomical clock, and cheap, excellent beer — Prague is walkable, compact, and one of Europe's best-preserved old towns.",
    culture: {
      language: "Czech", tipping: "5–10% appreciated", payments: "Cards common, small cash useful",
      etiquette: "Quiet in churches, punctuality valued",
      tips: ["Validate transit tickets before boarding.", "Beer is often cheaper than water at restaurants.", "The Old Town gets crowded — visit landmarks early.", "Some smaller shops are cash-only."],
    },
    food: [
      { name: "Trdelník", emoji: "🍩", desc: "Sweet rolled pastry, often filled." },
      { name: "Svíčková", emoji: "🍖", desc: "Marinated beef in creamy vegetable sauce." },
      { name: "Goulash", emoji: "🍲", desc: "Hearty beef stew served with bread dumplings." },
      { name: "Czech Beer", emoji: "🍺", desc: "Some of the best pilsner in the world." },
      { name: "Chlebíčky", emoji: "🥪", desc: "Open-faced sandwiches, a local snack tradition." },
    ],
    mealCost: 1, knownFor: ["Beer", "Pastries", "Hearty Food"],
    attractions: [
      { name: "Charles Bridge", cat: ["Culture", "History"], desc: "Statue-lined Gothic bridge over the Vltava.", cost: "Free", time: "1 hr", mustSee: true },
      { name: "Prague Castle", cat: ["Culture", "History", "Architecture"], desc: "The largest ancient castle complex in the world.", cost: "$$", time: "3 hrs", mustSee: true },
      { name: "Astronomical Clock", cat: ["Culture"], desc: "Medieval clock with an hourly show.", cost: "Free", time: "30 min", mustSee: true },
      { name: "Old Town Square", cat: ["Culture", "Shopping"], desc: "Cobblestone square ringed with pastel buildings.", cost: "Free", time: "1–2 hrs", mustSee: true },
      { name: "Petřín Hill", cat: ["Nature"], desc: "Park with a mini Eiffel-style lookout tower.", cost: "$", time: "2 hrs", mustSee: false },
      { name: "Jewish Quarter", cat: ["Culture", "History"], desc: "Historic synagogues and the Old Jewish Cemetery.", cost: "$$", time: "2 hrs", mustSee: false },
      { name: "Dancing House", cat: ["Architecture"], desc: "Deconstructivist landmark on the riverbank.", cost: "Free", time: "20 min", mustSee: false },
    ],
    cost: { accommodation: "$30–70/night", meals: "$12–25/day", localTransport: "$3–6/day", attractions: "$0–20/visit" },
    basics: { currency: "Czech Koruna (Kč)", airport: "Václav Havel (PRG)", transportation: "Excellent — trams & metro", dailyBudget: "$50–90", plug: "Type C/E", safety: "Very safe" },
  },
  {
    id: "reykjavik", name: "Reykjavik", country: "Iceland", countryId: "iceland", flag: "🇮🇸", region: "Europe",
    lat: 64.15, lng: -21.94,
    gradient: "linear-gradient(135deg,#1E2A28,#175E54)",
    tripTypes: ["Nature", "Adventure", "Relaxation"], interests: ["Nature"],
    budget: 3, climate: "Cold", beginner: 3, tripLength: "Weekend", dailyBudgetAvg: 175,
    bestSeason: "Summer",
    ratings: { transport: 3, food: 3, culture: 3, nature: 5, nightlife: 2, shopping: 2 },
    desc: "A small, colorful capital that's really a launchpad for glaciers, waterfalls, and geothermal springs. Best enjoyed with a rental car and a loose plan.",
    culture: {
      language: "Icelandic", tipping: "Not expected, included in prices", payments: "Cards accepted almost everywhere, even for small amounts",
      etiquette: "Shower before pools, quiet respect for nature",
      tips: ["Weather changes fast — layer up year-round.", "Renting a car is the easiest way to see the sights.", "Tap water is some of the cleanest in the world.", "Shower thoroughly (naked, communal) before entering public pools."],
    },
    food: [
      { name: "Icelandic Lamb", emoji: "🍖", desc: "Grass-fed and mild, a national staple." },
      { name: "Skyr", emoji: "🥣", desc: "Thick, protein-rich dairy similar to yogurt." },
      { name: "Plokkfiskur", emoji: "🐟", desc: "Creamy mashed fish and potato dish." },
      { name: "Rye Bread", emoji: "🍞", desc: "Traditionally baked underground using geothermal heat." },
      { name: "Hot Dogs", emoji: "🌭", desc: "A beloved Reykjavik street-food staple." },
    ],
    mealCost: 3, knownFor: ["Seafood", "Lamb", "Dairy"],
    attractions: [
      { name: "Blue Lagoon", cat: ["Nature"], desc: "Famous geothermal spa near the airport.", cost: "$$$", time: "3 hrs", mustSee: true },
      { name: "Golden Circle", cat: ["Nature"], desc: "Geysers, waterfalls, and a rift valley in one loop.", cost: "$$", time: "Full day", mustSee: true },
      { name: "Hallgrímskirkja", cat: ["Culture", "Architecture"], desc: "Iconic church with city-view tower.", cost: "$", time: "1 hr", mustSee: true },
      { name: "Northern Lights Tour", cat: ["Nature", "Entertainment"], desc: "Guided night trips to spot the aurora.", cost: "$$$", time: "3–4 hrs", mustSee: true },
      { name: "Reykjavik Harbor", cat: ["City", "Food"], desc: "Waterfront with seafood shacks and whale tours.", cost: "$$", time: "2 hrs", mustSee: false },
      { name: "Þingvellir National Park", cat: ["Nature"], desc: "Where tectonic plates visibly meet.", cost: "Free", time: "2 hrs", mustSee: true },
    ],
    cost: { accommodation: "$90–180/night", meals: "$35–60/day", localTransport: "$0 (car rental $60+/day)", attractions: "$0–90/visit" },
    basics: { currency: "Icelandic Króna (kr)", airport: "Keflavík (KEF)", transportation: "Limited — rental car recommended", dailyBudget: "$130–220", plug: "Type C/F", safety: "Extremely safe" },
  },
  {
    id: "bali", name: "Bali", country: "Indonesia", countryId: "indonesia", flag: "🇮🇩", region: "Asia",
    lat: -8.65, lng: 115.22,
    gradient: "linear-gradient(135deg,#0F6E5B,#D9A441)",
    tripTypes: ["Beach", "Nature", "Adventure", "Relaxation"], interests: ["Nature", "Food", "Shopping"],
    budget: 1, climate: "Hot", beginner: 3, tripLength: "1–2 weeks", dailyBudgetAvg: 50,
    bestSeason: "Apr–Oct (dry season)",
    ratings: { transport: 2, food: 4, culture: 4, nature: 5, nightlife: 3, shopping: 3 },
    desc: "Rice terraces, beach clubs, and temple ceremonies coexist across the island. Bali is affordable and relaxed, though renting a scooter or driver helps a lot getting around.",
    culture: {
      language: "Indonesian, Balinese", tipping: "Small tips appreciated, not required", payments: "Cash preferred outside resorts",
      etiquette: "Cover shoulders/knees at temples, use right hand",
      tips: ["Hire a driver for day trips — roads can be chaotic.", "Bring cash for markets and warungs.", "Dress modestly when visiting temples.", "Bargaining is expected at markets, not in shops."],
    },
    food: [
      { name: "Nasi Goreng", emoji: "🍛", desc: "Indonesia's smoky, spiced fried rice." },
      { name: "Babi Guling", emoji: "🐖", desc: "Balinese spit-roasted suckling pig." },
      { name: "Satay Lilit", emoji: "🍢", desc: "Minced spiced meat wrapped on lemongrass skewers." },
      { name: "Gado-Gado", emoji: "🥗", desc: "Vegetables with peanut sauce dressing." },
      { name: "Fresh Coconut", emoji: "🥥", desc: "Sold roadside all over the island." },
    ],
    mealCost: 1, knownFor: ["Street Food", "Tropical Fruit", "Seafood"],
    attractions: [
      { name: "Tegallalang Rice Terraces", cat: ["Nature"], desc: "Iconic stepped rice paddies near Ubud.", cost: "$", time: "1–2 hrs", mustSee: true },
      { name: "Uluwatu Temple", cat: ["Culture"], desc: "Clifftop temple with sunset kecak dance.", cost: "$", time: "2 hrs", mustSee: true },
      { name: "Seminyak Beach Clubs", cat: ["Entertainment"], desc: "Pools and lounges facing the sunset.", cost: "$$", time: "Half day", mustSee: false },
      { name: "Sacred Monkey Forest", cat: ["Nature"], desc: "Jungle sanctuary in the middle of Ubud.", cost: "$", time: "1 hr", mustSee: false },
      { name: "Mount Batur Sunrise Trek", cat: ["Adventure", "Nature"], desc: "Pre-dawn hike up an active volcano.", cost: "$$", time: "5–6 hrs", mustSee: true },
      { name: "Nusa Penida Day Trip", cat: ["Nature", "Adventure"], desc: "Dramatic cliffs and turquoise water by boat.", cost: "$$", time: "Full day", mustSee: true },
    ],
    cost: { accommodation: "$15–45/night", meals: "$10–20/day", localTransport: "$5–10/day (scooter)", attractions: "$0–20/visit" },
    basics: { currency: "Indonesian Rupiah (Rp)", airport: "Ngurah Rai (DPS)", transportation: "Limited — scooter or driver recommended", dailyBudget: "$35–70", plug: "Type C/F", safety: "Generally safe, careful on scooters" },
  },
  {
    id: "sydney", name: "Sydney", country: "Australia", countryId: "australia", flag: "🇦🇺", region: "Oceania",
    lat: -33.87, lng: 151.21,
    gradient: "linear-gradient(135deg,#2E3A6B,#0F6E5B)",
    tripTypes: ["City", "Beach", "Nature"], interests: ["Food", "Nightlife", "Nature", "Entertainment"],
    budget: 3, climate: "Warm", beginner: 4, tripLength: "5–7 days", dailyBudgetAvg: 150,
    bestSeason: "Sep–Nov / Mar–May",
    ratings: { transport: 4, food: 4, culture: 3, nature: 4, nightlife: 4, shopping: 3 },
    desc: "A harbor city that pairs an iconic skyline with beach culture minutes away. English-speaking and easy to navigate, Sydney is a comfortable, scenic first stop in Oceania.",
    culture: {
      language: "English", tipping: "Not expected, rounding up is fine", payments: "Cards and tap-to-pay everywhere",
      etiquette: "Casual and friendly, sun safety is taken seriously",
      tips: ["Wear sunscreen — the sun is stronger than it feels.", "Swim only between the flags at patrolled beaches.", "Opal card covers all public transport.", "Tipping isn't part of the culture, service is included."],
    },
    food: [
      { name: "Meat Pie", emoji: "🥧", desc: "A handheld savory classic." },
      { name: "Flat White", emoji: "☕", desc: "Australia's smooth espresso export." },
      { name: "Barramundi", emoji: "🐟", desc: "Popular local fish, often grilled." },
      { name: "Tim Tams", emoji: "🍫", desc: "Iconic chocolate biscuit." },
      { name: "Fish and Chips", emoji: "🍟", desc: "Best eaten at a harbor lookout." },
    ],
    mealCost: 3, knownFor: ["Seafood", "Coffee", "Brunch"],
    attractions: [
      { name: "Sydney Opera House", cat: ["Culture", "City", "Architecture"], desc: "The unmistakable sail-shaped landmark.", cost: "$$", time: "1–2 hrs", mustSee: true },
      { name: "Bondi to Coogee Walk", cat: ["Nature"], desc: "Scenic coastal walk past beaches and cliffs.", cost: "Free", time: "2–3 hrs", mustSee: true },
      { name: "Sydney Harbour Bridge", cat: ["City", "Adventure"], desc: "Walk across, or climb it for the views.", cost: "$$$", time: "1–3 hrs", mustSee: true },
      { name: "Taronga Zoo", cat: ["Entertainment", "Nature"], desc: "Harbor-view zoo with native wildlife.", cost: "$$", time: "3 hrs", mustSee: false },
      { name: "The Rocks", cat: ["Culture", "Shopping"], desc: "Historic cobbled streets and weekend markets.", cost: "Free", time: "2 hrs", mustSee: false },
      { name: "Manly Beach Ferry", cat: ["Nature"], desc: "Scenic harbor ferry to a laid-back beach town.", cost: "$", time: "Half day", mustSee: true },
    ],
    cost: { accommodation: "$70–150/night", meals: "$30–55/day", localTransport: "$10–15/day", attractions: "$0–45/visit" },
    basics: { currency: "Australian Dollar (A$)", airport: "Kingsford Smith (SYD)", transportation: "Excellent — trains, ferries, buses", dailyBudget: "$110–190", plug: "Type I", safety: "Very safe" },
  },
  {
    id: "mexicocity", name: "Mexico City", country: "Mexico", countryId: "mexico", flag: "🇲🇽", region: "North America",
    lat: 19.43, lng: -99.13,
    gradient: "linear-gradient(135deg,#E15B3D,#D9A441)",
    tripTypes: ["City", "Culture"], interests: ["Food", "History", "Museums", "Nightlife"],
    budget: 1, climate: "Mild", beginner: 2, tripLength: "3–5 days", dailyBudgetAvg: 65,
    bestSeason: "Mar–May / Sep–Nov",
    ratings: { transport: 3, food: 5, culture: 5, nature: 2, nightlife: 4, shopping: 4 },
    desc: "Ancient pyramids, world-class museums, and some of the best street food anywhere — Mexico City rewards a bit of extra planning around neighborhoods and transit.",
    culture: {
      language: "Spanish", tipping: "10–15% common at restaurants", payments: "Cards common in center, cash useful for street food",
      etiquette: "Warm greetings, unhurried meals",
      tips: ["Stick to bottled or filtered water.", "Use app-based taxis (Uber) over hailing on the street.", "Neighborhoods like Roma and Condesa are very walkable.", "Sunday is free at many major museums."],
    },
    food: [
      { name: "Tacos al Pastor", emoji: "🌮", desc: "Marinated pork sliced off a spinning trompo." },
      { name: "Mole", emoji: "🍫", desc: "Rich, complex sauce with dozens of ingredients." },
      { name: "Elote", emoji: "🌽", desc: "Grilled corn with mayo, cheese, and chili." },
      { name: "Tamales", emoji: "🫔", desc: "Steamed masa parcels, sweet or savory." },
      { name: "Chilaquiles", emoji: "🍳", desc: "Fried tortillas simmered in salsa, a breakfast staple." },
    ],
    mealCost: 1, knownFor: ["Street Food", "Tacos", "Markets"],
    attractions: [
      { name: "Teotihuacán", cat: ["History", "Culture"], desc: "Ancient pyramids just outside the city.", cost: "$", time: "Half day", mustSee: true },
      { name: "Frida Kahlo Museum", cat: ["Museums", "Culture"], desc: "The Blue House where Kahlo lived and worked.", cost: "$$", time: "1–2 hrs", mustSee: true },
      { name: "Zócalo & Cathedral", cat: ["History", "Culture", "Architecture"], desc: "The historic heart of the city.", cost: "Free", time: "1–2 hrs", mustSee: true },
      { name: "Chapultepec Park & Castle", cat: ["Nature", "Culture"], desc: "A huge park with a hilltop castle and museums.", cost: "$", time: "3 hrs", mustSee: false },
      { name: "Roma & Condesa", cat: ["Food", "Shopping"], desc: "Leafy streets full of cafés and boutiques.", cost: "$$", time: "2–3 hrs", mustSee: false },
      { name: "Xochimilco", cat: ["Entertainment"], desc: "Colorful trajinera boat rides through canals.", cost: "$$", time: "3 hrs", mustSee: false },
    ],
    cost: { accommodation: "$25–65/night", meals: "$12–25/day", localTransport: "$3–6/day", attractions: "$0–20/visit" },
    basics: { currency: "Mexican Peso ($)", airport: "Benito Juárez (MEX)", transportation: "Good — metro, but plan routes", dailyBudget: "$45–85", plug: "Type A/B", safety: "Safe with normal precautions" },
  },
  {
    id: "cusco", name: "Cusco", country: "Peru", countryId: "peru", flag: "🇵🇪", region: "South America",
    lat: -13.53, lng: -71.97,
    gradient: "linear-gradient(135deg,#8A6FB0,#175E54)",
    tripTypes: ["Mountains", "Culture", "Adventure"], interests: ["History", "Nature"],
    budget: 1, climate: "Cold", beginner: 2, tripLength: "5–7 days", dailyBudgetAvg: 60,
    bestSeason: "May–Sep (dry season)",
    ratings: { transport: 2, food: 4, culture: 5, nature: 5, nightlife: 2, shopping: 3 },
    desc: "The gateway to Machu Picchu, Cusco itself is a high-altitude Incan and colonial city. Give yourself a day or two to acclimatize before trekking.",
    culture: {
      language: "Spanish, Quechua", tipping: "Expected for guides and tours", payments: "Cash preferred outside tourist center",
      etiquette: "Slow pace due to altitude, respect for Incan sites",
      tips: ["Rest a day before any trek to adjust to the altitude.", "Coca tea is a common, mild remedy for altitude symptoms.", "Book Machu Picchu tickets weeks ahead in high season.", "Layer clothing — it's cold at night, warm midday."],
    },
    food: [
      { name: "Ceviche", emoji: "🐟", desc: "Citrus-cured fish, Peru's signature dish." },
      { name: "Lomo Saltado", emoji: "🥩", desc: "Stir-fried beef with a Chinese-Peruvian twist." },
      { name: "Cuy", emoji: "🍗", desc: "Roasted guinea pig, a traditional Andean dish." },
      { name: "Chicha Morada", emoji: "🥤", desc: "Sweet purple corn drink." },
      { name: "Quinoa Soup", emoji: "🍲", desc: "Hearty highland staple, warming and simple." },
    ],
    mealCost: 1, knownFor: ["Andean Cuisine", "Ceviche", "Local Markets"],
    attractions: [
      { name: "Machu Picchu", cat: ["History", "Culture"], desc: "The legendary Incan citadel in the clouds.", cost: "$$$", time: "Full day", mustSee: true },
      { name: "Sacred Valley", cat: ["Nature", "Culture"], desc: "Terraced valley of ruins and villages.", cost: "$$", time: "Full day", mustSee: true },
      { name: "Plaza de Armas", cat: ["Culture"], desc: "Cusco's colonial main square.", cost: "Free", time: "1 hr", mustSee: true },
      { name: "Rainbow Mountain", cat: ["Nature", "Adventure"], desc: "Striped mountain at extreme altitude.", cost: "$$", time: "Full day", mustSee: false },
      { name: "San Pedro Market", cat: ["Food", "Shopping"], desc: "Local produce, food stalls, and crafts.", cost: "$", time: "1 hr", mustSee: false },
      { name: "Sacsayhuamán", cat: ["History"], desc: "Massive Incan stone fortress above the city.", cost: "$", time: "2 hrs", mustSee: true },
    ],
    cost: { accommodation: "$20–55/night", meals: "$10–22/day", localTransport: "$3–7/day", attractions: "$0–65/visit" },
    basics: { currency: "Peruvian Sol (S/)", airport: "Alejandro Velasco Astete (CUZ)", transportation: "Limited — walkable center, tours for sites", dailyBudget: "$40–80", plug: "Type A/C", safety: "Safe, watch altitude sickness" },
  },
  {
    id: "capetown", name: "Cape Town", country: "South Africa", countryId: "south-africa", flag: "🇿🇦", region: "Africa",
    lat: -33.92, lng: 18.42,
    gradient: "linear-gradient(135deg,#0F3F39,#D9A441)",
    tripTypes: ["City", "Nature", "Adventure", "Relaxation"], interests: ["Nature", "Food", "History"],
    budget: 2, climate: "Mild", beginner: 3, tripLength: "2+ weeks", dailyBudgetAvg: 85,
    bestSeason: "Nov–Mar",
    ratings: { transport: 3, food: 4, culture: 4, nature: 5, nightlife: 3, shopping: 3 },
    desc: "Mountains, vineyards, and coastline meet in one of the world's most dramatically situated cities. A rental car opens up the Cape Peninsula and winelands easily.",
    culture: {
      language: "English, Afrikaans, Xhosa", tipping: "10–15% expected", payments: "Cards widely accepted",
      etiquette: "Friendly and direct, respect for diverse cultural history",
      tips: ["Rent a car for the Cape Peninsula and winelands.", "Sun protection is essential year-round.", "Book Table Mountain cable car tickets online.", "Be mindful of belongings in busy tourist areas."],
    },
    food: [
      { name: "Braai", emoji: "🔥", desc: "South African barbecue, a social tradition." },
      { name: "Bobotie", emoji: "🍛", desc: "Spiced minced meat bake with an egg topping." },
      { name: "Biltong", emoji: "🥓", desc: "Air-dried cured meat snack." },
      { name: "Cape Malay Curry", emoji: "🍲", desc: "Sweet-spiced curry from the Cape Malay community." },
      { name: "Winelands Tasting", emoji: "🍷", desc: "World-class wine just outside the city." },
    ],
    mealCost: 2, knownFor: ["Wine", "Seafood", "Braai"],
    attractions: [
      { name: "Table Mountain", cat: ["Nature"], desc: "Cable car or hike to sweeping city views.", cost: "$$", time: "3 hrs", mustSee: true },
      { name: "Cape of Good Hope", cat: ["Nature"], desc: "Dramatic cliffs at the peninsula's tip.", cost: "$$", time: "Half day", mustSee: true },
      { name: "Boulders Beach", cat: ["Nature"], desc: "Beach colony of African penguins.", cost: "$", time: "1 hr", mustSee: true },
      { name: "Robben Island", cat: ["History"], desc: "Former prison where Nelson Mandela was held.", cost: "$$", time: "3–4 hrs", mustSee: true },
      { name: "Stellenbosch Winelands", cat: ["Food"], desc: "Historic vineyards and tastings.", cost: "$$", time: "Full day", mustSee: false },
      { name: "Bo-Kaap", cat: ["Culture", "Architecture"], desc: "Colorful Cape Malay neighborhood.", cost: "Free", time: "1 hr", mustSee: false },
    ],
    cost: { accommodation: "$40–95/night", meals: "$18–35/day", localTransport: "$5–10/day (car rental extra)", attractions: "$0–35/visit" },
    basics: { currency: "South African Rand (R)", airport: "Cape Town Intl (CPT)", transportation: "Limited — rental car recommended", dailyBudget: "$60–110", plug: "Type M/N", safety: "Safe in tourist areas, stay alert" },
  },
];

const FEATURED_IDS = ["tokyo", "barcelona", "bali", "prague", "sydney", "mexicocity"];

/* Country-level records for the globe / World Explorer. One entry per country
   currently represented in DESTINATIONS; "matchNames" lists the label(s) the
   underlying world-atlas map might use so we can reliably find the polygon. */
const COUNTRIES = [
  { id: "japan", name: "Japan", flag: "🇯🇵", region: "Asia", matchNames: ["Japan"], desc: "An archipelago blending ancient tradition with futuristic cities.", popularCities: [{ name: "Tokyo", destId: "tokyo" }, { name: "Kyoto" }, { name: "Osaka" }] },
  { id: "south-korea", name: "South Korea", flag: "🇰🇷", region: "Asia", matchNames: ["South Korea", "Korea, Rep.", "Republic of Korea"], desc: "A fast-paced peninsula of palaces, pop culture, and incredible food.", popularCities: [{ name: "Seoul", destId: "seoul" }, { name: "Busan" }, { name: "Jeju" }] },
  { id: "singapore", name: "Singapore", flag: "🇸🇬", region: "Asia", matchNames: ["Singapore"], desc: "A gleaming city-state where Asia's flavors and cultures converge.", popularCities: [{ name: "Singapore", destId: "singapore" }] },
  { id: "spain", name: "Spain", flag: "🇪🇸", region: "Europe", matchNames: ["Spain"], desc: "Sun-drenched coastlines, historic cities, and legendary food culture.", popularCities: [{ name: "Barcelona", destId: "barcelona" }, { name: "Madrid" }, { name: "Seville" }] },
  { id: "czech-republic", name: "Czech Republic", flag: "🇨🇿", region: "Europe", matchNames: ["Czechia", "Czech Republic"], desc: "Fairy-tale old towns in the heart of Central Europe.", popularCities: [{ name: "Prague", destId: "prague" }, { name: "Brno" }] },
  { id: "iceland", name: "Iceland", flag: "🇮🇸", region: "Europe", matchNames: ["Iceland"], desc: "A dramatic land of glaciers, geysers, and geothermal springs.", popularCities: [{ name: "Reykjavik", destId: "reykjavik" }] },
  { id: "indonesia", name: "Indonesia", flag: "🇮🇩", region: "Asia", matchNames: ["Indonesia"], desc: "Thousands of islands spanning jungle, volcano, and beach.", popularCities: [{ name: "Bali", destId: "bali" }, { name: "Jakarta" }, { name: "Yogyakarta" }] },
  { id: "australia", name: "Australia", flag: "🇦🇺", region: "Oceania", matchNames: ["Australia"], desc: "A vast island continent of coastline, outback, and easygoing cities.", popularCities: [{ name: "Sydney", destId: "sydney" }, { name: "Melbourne" }, { name: "Brisbane" }] },
  { id: "mexico", name: "Mexico", flag: "🇲🇽", region: "North America", matchNames: ["Mexico"], desc: "Ancient ruins, vibrant cities, and some of the world's best street food.", popularCities: [{ name: "Mexico City", destId: "mexicocity" }, { name: "Cancún" }, { name: "Oaxaca" }] },
  { id: "peru", name: "Peru", flag: "🇵🇪", region: "South America", matchNames: ["Peru"], desc: "Home to Machu Picchu and a dramatic stretch of the Andes.", popularCities: [{ name: "Cusco", destId: "cusco" }, { name: "Lima" }] },
  { id: "south-africa", name: "South Africa", flag: "🇿🇦", region: "Africa", matchNames: ["South Africa"], desc: "Coastline, wildlife, and mountains meet at the continent's tip.", popularCities: [{ name: "Cape Town", destId: "capetown" }, { name: "Johannesburg" }] },
];

/* ============================== HELPERS ============================== */

function toRad(d) { return (d * Math.PI) / 180; }
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function estFlightHours(km) { return km / 800 + 1; }

function emptyFilters() {
  return {
    origin: null, budgetCats: [], maxBudget: "", tripLength: [], maxTravelTime: "any",
    destTypes: [], interests: [], climate: [], difficulty: "any",
  };
}

function toggleIn(arr, v) { return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]; }

/* Weighted, deterministic match score — not random. Every applicable filter
   category contributes one "vote"; the score is matched-votes / total-votes. */
function computeMatchScore(dest, f) {
  let total = 0, hit = 0;
  const vote = (matched) => { total++; if (matched) hit++; };

  f.destTypes.forEach((t) => vote(dest.tripTypes.includes(t)));
  f.interests.forEach((t) => vote(dest.interests.includes(t)));
  f.climate.forEach((c) => vote(dest.climate === c));
  f.tripLength.forEach((l) => vote(dest.tripLength === l));
  f.budgetCats.forEach((b) => vote(dest.budget === b));

  if (f.maxBudget !== "" && !Number.isNaN(Number(f.maxBudget))) {
    vote(dest.dailyBudgetAvg <= Number(f.maxBudget));
  }
  if (f.difficulty !== "any") {
    if (f.difficulty === "very") vote(dest.beginner === 4);
    else if (f.difficulty === "beginner") vote(dest.beginner >= 3);
    else if (f.difficulty === "moderate") vote(dest.beginner <= 2);
  }
  if (f.origin && f.maxTravelTime !== "any") {
    const km = haversineKm(f.origin.lat, f.origin.lng, dest.lat, dest.lng);
    const hrs = estFlightHours(km);
    const cap = TRAVEL_TIMES.find((t) => t.id === f.maxTravelTime)?.hrs ?? Infinity;
    vote(hrs <= cap);
  }

  if (total === 0) return null;
  return Math.round((hit / total) * 100);
}

function estTravelHours(origin, dest) {
  if (!origin) return null;
  return estFlightHours(haversineKm(origin.lat, origin.lng, dest.lat, dest.lng));
}

/* ============================== SMALL UI ============================== */

function Stars({ n }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13} strokeWidth={2} fill={i <= n ? "var(--teal)" : "none"} color={i <= n ? "var(--teal)" : "var(--line)"} />
      ))}
    </span>
  );
}

function Tag({ children }) {
  const Icon = TAG_ICON[children];
  return (
    <span className="tag">
      {Icon && <Icon size={11} strokeWidth={2.2} />}
      {children}
    </span>
  );
}

function StampBadge({ label }) {
  return <span className="stamp">{label}</span>;
}

function FilterChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={"chip" + (active ? " chip-active" : "")}>
      {active && <Check size={12} strokeWidth={3} />}
      {label}
    </button>
  );
}

function BookmarkBtn({ active, onClick, size = 16 }) {
  return (
    <button className={"bookmark-btn" + (active ? " bookmark-btn-active" : "")} onClick={onClick} title={active ? "Remove bookmark" : "Bookmark"}>
      <Bookmark size={size} fill={active ? "currentColor" : "none"} />
    </button>
  );
}

function DestCard({ d, onOpen, matchPct, onAddTrip, bookmarked, onBookmark }) {
  return (
    <div className="postcard">
      <div className="postcard-hero" style={{ background: d.gradient }} onClick={() => onOpen(d.id)}>
        <div className="postcard-hero-top">
          <div className="postcard-stamp">{BUDGET_LABEL[d.budget]}</div>
          {onBookmark && (
            <button className="pc-bookmark" onClick={(e) => { e.stopPropagation(); onBookmark(d.id); }}>
              <Bookmark size={15} fill={bookmarked ? "#fff" : "none"} color="#fff" />
            </button>
          )}
        </div>
        <div className="postcard-title">
          <span className="pc-name">{d.name}</span>
          <span className="pc-flag">{d.flag}</span>
        </div>
        {matchPct !== undefined && matchPct !== null && (
          <div className="match-badge">{matchPct}% Match</div>
        )}
      </div>
      <div className="postcard-body">
        <div className="pc-country">{d.country}</div>
        <div className="pc-tags">
          {Array.from(new Set([...d.tripTypes.slice(0, 1), ...d.interests])).slice(0, 3).map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
        <div className="pc-footer">
          <StampBadge label={BEGINNER_LABEL[d.beginner]} />
          <div style={{ display: "flex", gap: 8 }}>
            {onAddTrip && (
              <button className="btn-ghost-sm" onClick={() => onAddTrip(d.id)} title="Add to Trip">
                <Plus size={14} />
              </button>
            )}
            <button className="btn-link" onClick={() => onOpen(d.id)}>
              Explore <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dotted() {
  return <div className="dotted-divider" aria-hidden="true" />;
}

/* ============================== NAV ============================== */

function Nav({ tab, setTab, bookmarkCount }) {
  const tabs = [
    { id: "explore", label: "Explore" },
    { id: "tripmatch", label: "Trip Match" },
    { id: "destinations", label: "Destinations" },
    { id: "compare", label: "Compare" },
    { id: "trip", label: "My Trip" },
  ];
  return (
    <div className="nav">
      <div className="nav-inner">
        <button className="brand" onClick={() => setTab("explore")}>
          <Compass size={20} strokeWidth={2.4} />
          <span>Waypost</span>
        </button>
        <div className="nav-tabs">
          {tabs.map((t) => (
            <button key={t.id} className={"nav-tab" + (tab === t.id ? " nav-tab-active" : "")} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================== ADD TO TRIP MODAL ============================== */

function AddToTripModal({ pending, trips, onClose, onPick, onCreate }) {
  if (!pending) return null;
  const dest = DESTINATIONS.find((d) => d.id === pending.destId);
  const trip = trips[pending.destId];
  const hasItem = !!pending.attName;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-eyebrow">Add to Trip</div>
            <div className="modal-title">{pending.label}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        {!trip ? (
          <div className="modal-body">
            <p className="muted">You don't have a trip for {dest.name} yet. Create one to start adding {hasItem ? "attractions" : "days to plan"}.</p>
            <button className="btn-primary" onClick={() => onCreate(pending.destId, 5)}>
              Create a {dest.name} trip (5 days)
            </button>
          </div>
        ) : hasItem ? (
          <div className="modal-body">
            <p className="muted">Choose a day for {dest.name}:</p>
            <div className="day-pick-grid">
              {trip.days.map((day, i) => (
                <button key={i} className="day-pick-btn" onClick={() => onPick(pending.destId, i)}>
                  Day {i + 1}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="modal-body">
            <p className="muted">You're all set — {dest.name} is on your trip list with {trip.days.length} days. Head to My Trip to add attractions.</p>
            <button className="btn-outline" onClick={onClose}>Got it</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== WORLD EXPLORER (GLOBE) ============================== */

function Globe({ countryFeatures, onSelectCountry, flyTarget, highlightId, autoRotate, onManualDrag, size = 620 }) {
  const svgRef = useRef(null);
  const stateRef = useRef({ rotation: [10, -20], scale: size * 0.44, flying: false });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!window.d3 || !svgRef.current) return;
    const d3 = window.d3;
    const svg = d3.select(svgRef.current);
    const R = size / 2;
    const projection = d3.geoOrthographic().scale(stateRef.current.scale).translate([R, R]).clipAngle(90).rotate(stateRef.current.rotation);
    const path = d3.geoPath(projection);
    const graticule = d3.geoGraticule10();

    svg.selectAll("*").remove();
    svg.append("circle").attr("class", "globe-sea").attr("cx", R).attr("cy", R).attr("r", stateRef.current.scale);
    svg.append("path").attr("class", "globe-graticule").attr("d", path(graticule));
    const gCountries = svg.append("g").attr("class", "globe-countries");

    const countryPaths = gCountries.selectAll("path")
      .data(countryFeatures || [])
      .join("path")
      .attr("class", "globe-country")
      .attr("d", path);

    const highlightIdRef = { current: highlightId };

    function matchesHighlight(f) {
      const c = COUNTRIES.find((c) => c.id === highlightIdRef.current);
      if (!c) return false;
      const nm = (f.properties && (f.properties.name || f.properties.NAME)) || "";
      return c.matchNames.some((n) => n.toLowerCase() === nm.toLowerCase());
    }

    function redraw() {
      projection.rotate(stateRef.current.rotation).scale(stateRef.current.scale);
      svg.select(".globe-sea").attr("r", stateRef.current.scale);
      svg.select(".globe-graticule").attr("d", path(graticule));
      countryPaths.attr("d", path);
      countryPaths.classed("globe-country-active", matchesHighlight);
    }

    function findCountryAt(lng, lat) {
      for (const f of countryFeatures || []) {
        if (d3.geoContains(f, [lng, lat])) return f;
      }
      return null;
    }

    let moved = 0;
    const drag = d3.drag()
      .on("start", () => { moved = 0; onManualDrag && onManualDrag(); })
      .on("drag", (event) => {
        const sensitivity = 240 / stateRef.current.scale;
        stateRef.current.rotation = [
          stateRef.current.rotation[0] + event.dx * sensitivity,
          Math.max(-90, Math.min(90, stateRef.current.rotation[1] - event.dy * sensitivity)),
        ];
        moved += Math.abs(event.dx) + Math.abs(event.dy);
        redraw();
      })
      .on("end", (event) => {
        if (moved < 4) {
          const [mx, my] = d3.pointer(event, svg.node());
          const lonlat = projection.invert([mx, my]);
          if (lonlat) {
            const f = findCountryAt(lonlat[0], lonlat[1]);
            if (f) onSelectCountry(f);
          }
        }
      });

    svg.call(drag);
    svg.on("wheel", (event) => {
      event.preventDefault();
      const next = stateRef.current.scale * (event.deltaY < 0 ? 1.08 : 0.93);
      stateRef.current.scale = Math.max(size * 0.28, Math.min(size * 0.95, next));
      redraw();
    });

    stateRef.current.redraw = redraw;
    stateRef.current.projection = projection;
    stateRef.current.highlightIdRef = highlightIdRef;
    redraw();
    setReady(true);

    return () => { svg.on(".drag", null).on("wheel", null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryFeatures, size]);

  // keep highlight in sync without a full rebuild
  useEffect(() => {
    if (!stateRef.current.redraw || !stateRef.current.highlightIdRef) return;
    stateRef.current.highlightIdRef.current = highlightId;
    stateRef.current.redraw();
  }, [highlightId]);

  // fly-to animation when flyTarget changes
  useEffect(() => {
    if (!flyTarget || !window.d3 || !stateRef.current.redraw) return;
    const d3 = window.d3;
    stateRef.current.flying = true;
    const target = [-flyTarget.lng, -flyTarget.lat];
    const from = stateRef.current.rotation.slice();
    const interp = d3.interpolate(from, target);
    const targetScale = Math.min(size * 0.78, size * 0.6);
    const fromScale = stateRef.current.scale;
    const scaleInterp = d3.interpolate(fromScale, targetScale);
    const timer = d3.timer((elapsed) => {
      const t = Math.min(1, elapsed / 900);
      const eased = 1 - Math.pow(1 - t, 3);
      stateRef.current.rotation = interp(eased);
      stateRef.current.scale = scaleInterp(eased);
      stateRef.current.redraw();
      if (t >= 1) { timer.stop(); stateRef.current.flying = false; }
    });
    return () => timer.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyTarget]);

  // slow continuous auto-rotation; pauses during fly-to, fully stops when off
  useEffect(() => {
    if (!autoRotate || !window.d3) return;
    const d3 = window.d3;
    let last = null;
    const timer = d3.timer((elapsed) => {
      if (stateRef.current.flying) { last = elapsed; return; }
      if (last === null) { last = elapsed; return; }
      const dt = elapsed - last;
      last = elapsed;
      stateRef.current.rotation = [stateRef.current.rotation[0] + dt * 0.006, stateRef.current.rotation[1]];
      if (stateRef.current.redraw) stateRef.current.redraw();
    });
    return () => timer.stop();
  }, [autoRotate]);

  const zoom = (dir) => {
    if (!stateRef.current.redraw) return;
    stateRef.current.scale = Math.max(size * 0.28, Math.min(size * 0.95, stateRef.current.scale * (dir > 0 ? 1.15 : 0.87)));
    stateRef.current.redraw();
  };

  return (
    <div className="globe-wrap" style={{ width: size, height: size }}>
      <svg ref={svgRef} width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="globe-svg" />
      {!ready && <div className="globe-loading">Loading globe…</div>}
      <div className="globe-zoom-controls">
        <button onClick={() => zoom(1)}><ZoomIn size={16} /></button>
        <button onClick={() => zoom(-1)}><ZoomOut size={16} /></button>
      </div>
    </div>
  );
}

function CountryBubble({ country, onOpenDestination, onClose, bookmarked, onBookmark }) {
  if (!country) return null;
  const cityEntry = country.popularCities.find((c) => c.destId);
  const cityDest = cityEntry ? DESTINATIONS.find((d) => d.id === cityEntry.destId) : null;
  return (
    <div className="country-bubble">
      <div className="country-bubble-inner">
        <div className="country-panel-head">
          <div className="country-panel-title">
            <span className="country-flag">{country.flag}</span>
            <h3>{country.name}</h3>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {country.id && <BookmarkBtn active={bookmarked} onClick={() => onBookmark(country.id)} />}
            <button className="icon-btn" onClick={onClose}><X size={18} /></button>
          </div>
        </div>
        <p className="muted" style={{ marginTop: 4 }}>{country.desc}</p>
        {cityDest && (
          <div className="country-quickfacts">
            <span><strong>Best for:</strong> {[...cityDest.tripTypes, ...cityDest.interests].slice(0, 4).join(", ")}</span>
            <span><strong>Typical Cost:</strong> {BUDGET_LABEL[cityDest.budget]}</span>
            <span><strong>Best Time:</strong> {cityDest.bestSeason}</span>
          </div>
        )}
        {country.popularCities.length > 0 && (
          <div className="country-cities">
            <div className="info-label" style={{ marginBottom: 8 }}>Popular Cities</div>
            <div className="country-city-list">
              {country.popularCities.map((c) => (
                <button
                  key={c.name}
                  className={"country-city-chip" + (c.destId ? "" : " country-city-chip-disabled")}
                  disabled={!c.destId}
                  onClick={() => c.destId && onOpenDestination(c.destId)}
                >
                  {c.name}{!c.destId && <span className="soon-tag">soon</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="country-bubble-arrow" />
      <div className="country-bubble-arrow-fill" />
    </div>
  );
}

function Explore({ setTab, openDetail, bookmarkedCountries, bookmarkedDests, toggleBookmarkCountry, toggleBookmarkDest, requestAdd }) {
  const [features, setFeatures] = useState(null);
  const [libsReady, setLibsReady] = useState(!!(window.d3 && window.topojson));
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [query, setQuery] = useState("");
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    let cancelled = false;
    function loadLibs() {
      return new Promise((resolve) => {
        if (window.d3 && window.topojson) return resolve();
        let pending = 0;
        const done = () => { pending--; if (pending <= 0) resolve(); };
        if (!window.d3) { pending++; const s = document.createElement("script"); s.src = "https://unpkg.com/d3@7/dist/d3.min.js"; s.onload = done; document.head.appendChild(s); }
        if (!window.topojson) { pending++; const s2 = document.createElement("script"); s2.src = "https://unpkg.com/topojson-client@3"; s2.onload = done; document.head.appendChild(s2); }
        if (pending === 0) resolve();
      });
    }
    loadLibs().then(() => {
      if (cancelled) return;
      setLibsReady(true);
      fetch("https://unpkg.com/world-atlas@2/countries-110m.json")
        .then((r) => r.json())
        .then((topology) => {
          if (cancelled) return;
          const objName = Object.keys(topology.objects)[0];
          const geo = window.topojson.feature(topology, topology.objects[objName]);
          setFeatures(geo.features);
        })
        .catch(() => setFeatures([]));
    });
    return () => { cancelled = true; };
  }, []);

  const handleSelectCountry = useCallback((f) => {
    const nm = (f.properties && (f.properties.name || f.properties.NAME)) || "";
    const c = COUNTRIES.find((c) => c.matchNames.some((n) => n.toLowerCase() === nm.toLowerCase()));
    if (c) {
      const rep = DESTINATIONS.find((d) => d.countryId === c.id);
      setSelectedCountry(c);
      if (rep) setFlyTarget({ lat: rep.lat, lng: rep.lng, key: Date.now() });
    } else {
      setSelectedCountry({ id: null, name: nm || "Unknown", flag: "🌍", desc: "We don't have detailed coverage for this country yet — check back soon.", popularCities: [] });
    }
  }, []);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const results = [];
    DESTINATIONS.forEach((d) => {
      if (d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q)) {
        results.push({ label: `${d.name}, ${d.country}`, lat: d.lat, lng: d.lng, countryId: d.countryId, destId: d.id });
      }
    });
    return results.slice(0, 6);
  }, [query]);

  const pickSearchResult = (r) => {
    const c = COUNTRIES.find((c) => c.id === r.countryId);
    if (c) setSelectedCountry(c);
    setFlyTarget({ lat: r.lat, lng: r.lng, key: Date.now() });
    setQuery("");
  };

  const savedCountries = COUNTRIES.filter((c) => bookmarkedCountries.has(c.id));
  const savedDests = DESTINATIONS.filter((d) => bookmarkedDests.has(d.id));

  return (
    <div>
      <section className="hero hero-explore">
        <div className="hero-compass"><Compass size={26} strokeWidth={1.6} /></div>
        <h1 className="hero-title">Find your next<br /><em>destination.</em></h1>
        <p className="hero-sub">Spin the globe, or search a country or city, to start exploring.</p>
      </section>

      <div className="explore-center">
        <div className="search-bar" style={{ maxWidth: 420, position: "relative" }}>
          <Search size={16} color="var(--teal-dark)" />
          <input placeholder="Search a country or city..." value={query} onChange={(e) => setQuery(e.target.value)} />
          {searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map((r) => (
                <button key={r.label} onClick={() => pickSearchResult(r)}>{r.label}</button>
              ))}
            </div>
          )}
        </div>

        <label className="auto-rotate-toggle">
          <input type="checkbox" checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} />
          Auto-rotate globe
        </label>

        <div className="globe-stage">
          {!libsReady || features === null ? (
            <div className="globe-placeholder">Loading world map…</div>
          ) : (
            <>
              <Globe
                countryFeatures={features}
                onSelectCountry={handleSelectCountry}
                flyTarget={flyTarget}
                highlightId={selectedCountry?.id}
                autoRotate={autoRotate}
                onManualDrag={() => setAutoRotate(false)}
                size={620}
              />
              <CountryBubble
                country={selectedCountry}
                onOpenDestination={openDetail}
                onClose={() => setSelectedCountry(null)}
                bookmarked={selectedCountry?.id ? bookmarkedCountries.has(selectedCountry.id) : false}
                onBookmark={toggleBookmarkCountry}
              />
            </>
          )}
        </div>
        <div className="globe-hint">Drag to rotate · Scroll to zoom · Click a country</div>
      </div>

      {(savedCountries.length > 0 || savedDests.length > 0) && (
        <>
          <Dotted />
          <section className="section">
            <div className="section-head"><h2>Saved</h2></div>
            {savedCountries.length > 0 && (
              <div className="chip-row" style={{ marginBottom: 14 }}>
                {savedCountries.map((c) => (
                  <FilterChip key={c.id} label={`${c.flag} ${c.name}`} active onClick={() => toggleBookmarkCountry(c.id)} />
                ))}
              </div>
            )}
            {savedDests.length > 0 && (
              <div className="grid-cards">
                {savedDests.map((d) => (
                  <DestCard key={d.id} d={d} onOpen={openDetail} onAddTrip={requestAdd} bookmarked onBookmark={toggleBookmarkDest} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <Dotted />

      <section className="section">
        <div className="section-head">
          <h2>Featured Destinations</h2>
          <span className="section-eyebrow">Hand-picked, beginner-tested</span>
        </div>
        <div className="grid-cards">
          {FEATURED_IDS.map((id) => {
            const d = DESTINATIONS.find((x) => x.id === id);
            return <DestCard key={id} d={d} onOpen={openDetail} onAddTrip={requestAdd} bookmarked={bookmarkedDests.has(d.id)} onBookmark={toggleBookmarkDest} />;
          })}
        </div>
      </section>
    </div>
  );
}

/* ============================== TRIP MATCH ============================== */

function TripMatch({ filters, setFilters, openDetail, onAddTrip, bookmarkedDests, toggleBookmarkDest }) {
  const [sort, setSort] = useState("match");
  const [open, setOpen] = useState({ destTypes: true, interests: true, budget: true, tripLength: false, travelTime: false, climate: false, difficulty: false });

  const results = useMemo(() => {
    let list = DESTINATIONS.map((d) => ({ d, m: computeMatchScore(d, filters), hrs: estTravelHours(filters.origin, d) }));
    const anySelected = filters.destTypes.length || filters.interests.length || filters.climate.length || filters.tripLength.length || filters.budgetCats.length || filters.maxBudget !== "" || filters.difficulty !== "any" || (filters.origin && filters.maxTravelTime !== "any");
    if (anySelected) list = list.filter((x) => x.m === null || x.m > 0);
    if (sort === "match") list.sort((a, b) => (b.m ?? 0) - (a.m ?? 0));
    if (sort === "cost") list.sort((a, b) => a.d.budget - b.d.budget);
    if (sort === "time") list.sort((a, b) => (a.hrs ?? 999) - (b.hrs ?? 999));
    if (sort === "beginner") list.sort((a, b) => b.d.beginner - a.d.beginner);
    return list;
  }, [filters, sort]);

  const Section = ({ id, title, children }) => (
    <div className="filter-section">
      <button className="filter-section-head" onClick={() => setOpen((o) => ({ ...o, [id]: !o[id] }))}>
        <span>{title}</span>
        {open[id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open[id] && <div className="filter-section-body">{children}</div>}
    </div>
  );

  return (
    <div className="page">
      <div className="page-head">
        <h1>Find Your Perfect Destination</h1>
        <p className="muted">Tell us what you want from your trip.</p>
      </div>

      <div className="find-layout">
        <aside className="filter-panel">
          <div className="filter-panel-head">
            <SlidersHorizontal size={16} />
            <span>Filters</span>
            <button className="btn-link-sm" onClick={() => setFilters(emptyFilters())}>Clear Filters</button>
          </div>

          <div className="filter-section">
            <div className="info-label" style={{ marginBottom: 6 }}>Starting Location</div>
            <select className="compare-select" style={{ width: "100%" }} value={filters.origin?.name || ""} onChange={(e) => setFilters((f) => ({ ...f, origin: ORIGIN_CITIES.find((o) => o.name === e.target.value) || null }))}>
              <option value="">Where are you traveling from?</option>
              {ORIGIN_CITIES.map((o) => <option key={o.name} value={o.name}>{o.name}</option>)}
            </select>
          </div>

          <Section id="budget" title="Budget">
            <div className="chip-wrap">
              {BUDGETS.map((b) => (
                <FilterChip key={b} label={BUDGET_LABEL[b]} active={filters.budgetCats.includes(b)} onClick={() => setFilters((f) => ({ ...f, budgetCats: toggleIn(f.budgetCats, b) }))} />
              ))}
            </div>
            <div className="exact-budget-row">
              <Wallet size={13} />
              <input type="number" placeholder="Max daily budget ($)" value={filters.maxBudget} onChange={(e) => setFilters((f) => ({ ...f, maxBudget: e.target.value }))} />
            </div>
          </Section>

          <Section id="tripLength" title="Trip Length">
            <div className="chip-wrap">
              {TRIP_LENGTHS.map((l) => (
                <FilterChip key={l} label={l} active={filters.tripLength.includes(l)} onClick={() => setFilters((f) => ({ ...f, tripLength: toggleIn(f.tripLength, l) }))} />
              ))}
            </div>
          </Section>

          <Section id="travelTime" title="Maximum Travel Time">
            <div className="chip-wrap">
              {TRAVEL_TIMES.map((t) => (
                <FilterChip key={t.id} label={t.label} active={filters.maxTravelTime === t.id} onClick={() => setFilters((f) => ({ ...f, maxTravelTime: t.id }))} />
              ))}
            </div>
            {!filters.origin && filters.maxTravelTime !== "any" && <p className="muted-sm" style={{ marginTop: 6 }}>Set a starting location to use travel time.</p>}
          </Section>

          <Section id="destTypes" title="Destination Type">
            <div className="chip-wrap">
              {DEST_TYPES.map((t) => (
                <FilterChip key={t} label={t} active={filters.destTypes.includes(t)} onClick={() => setFilters((f) => ({ ...f, destTypes: toggleIn(f.destTypes, t) }))} />
              ))}
            </div>
          </Section>

          <Section id="interests" title="Interests">
            <div className="chip-wrap">
              {INTERESTS.map((t) => (
                <FilterChip key={t} label={t} active={filters.interests.includes(t)} onClick={() => setFilters((f) => ({ ...f, interests: toggleIn(f.interests, t) }))} />
              ))}
            </div>
          </Section>

          <Section id="climate" title="Climate">
            <div className="chip-wrap">
              {CLIMATES.map((c) => (
                <FilterChip key={c} label={c} active={filters.climate.includes(c)} onClick={() => setFilters((f) => ({ ...f, climate: toggleIn(f.climate, c) }))} />
              ))}
            </div>
          </Section>

          <Section id="difficulty" title="Travel Difficulty">
            <div className="chip-wrap">
              {DIFFICULTIES.map((d) => (
                <FilterChip key={d.id} label={d.label} active={filters.difficulty === d.id} onClick={() => setFilters((f) => ({ ...f, difficulty: d.id }))} />
              ))}
            </div>
          </Section>
        </aside>

        <div className="results">
          <div className="results-head">
            <span className="muted">{results.length} destination{results.length !== 1 ? "s" : ""}</span>
            <div className="sort-row">
              <ArrowUpDown size={14} />
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="match">Best Match</option>
                <option value="cost">Lowest Cost</option>
                <option value="time">Shortest Travel Time</option>
                <option value="beginner">Most Beginner Friendly</option>
              </select>
            </div>
          </div>
          <div className="grid-cards">
            {results.map(({ d, m }) => (
              <DestCard key={d.id} d={d} matchPct={m} onOpen={openDetail} onAddTrip={onAddTrip} bookmarked={bookmarkedDests.has(d.id)} onBookmark={toggleBookmarkDest} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== DESTINATIONS (browse) ============================== */

function DestinationsPage({ openDetail, searchTerm, setSearchTerm, onAddTrip, bookmarkedDests, toggleBookmarkDest }) {
  const [region, setRegion] = useState("All");
  const regions = ["All", ...Array.from(new Set(DESTINATIONS.map((d) => d.region)))];
  const results = DESTINATIONS.filter((d) => {
    const matchesRegion = region === "All" || d.region === region;
    const q = searchTerm.trim().toLowerCase();
    const matchesQ = !q || d.name.toLowerCase().includes(q) || d.country.toLowerCase().includes(q) || d.region.toLowerCase().includes(q);
    return matchesRegion && matchesQ;
  });
  return (
    <div className="page">
      <div className="page-head">
        <h1>Explore Destinations</h1>
        <div className="search-bar search-bar-sm">
          <Search size={16} color="var(--teal-dark)" />
          <input placeholder="Search cities, countries, or regions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <div className="chip-row">
        {regions.map((r) => (
          <FilterChip key={r} label={r} active={region === r} onClick={() => setRegion(r)} />
        ))}
      </div>
      <div className="grid-cards" style={{ marginTop: 20 }}>
        {results.map((d) => (
          <DestCard key={d.id} d={d} onOpen={openDetail} onAddTrip={onAddTrip} bookmarked={bookmarkedDests.has(d.id)} onBookmark={toggleBookmarkDest} />
        ))}
        {results.length === 0 && <p className="muted">No destinations match "{searchTerm}" yet. Try another search.</p>}
      </div>
    </div>
  );
}

/* ============================== COMPARE ============================== */

function CompareSelect({ value, onChange, exclude }) {
  return (
    <select className="compare-select" value={value || ""} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">Select Destination</option>
      {DESTINATIONS.filter((d) => !exclude.includes(d.id) || d.id === value).map((d) => (
        <option key={d.id} value={d.id}>{d.flag} {d.name}, {d.country}</option>
      ))}
    </select>
  );
}

function Compare({ compareIds, setCompareIds, openDetail, onAddTrip }) {
  const dests = compareIds.map((id) => DESTINATIONS.find((d) => d.id === id)).filter(Boolean);

  const setAt = (i, val) => {
    const next = [...compareIds];
    if (val) next[i] = val; else next.splice(i, 1);
    setCompareIds(next.filter(Boolean));
  };

  const rows = [
    { label: "Cost", get: (d) => BUDGET_LABEL[d.budget] },
    { label: "Destination Type", get: (d) => d.tripTypes.join(", ") },
    { label: "Climate", get: (d) => d.climate },
    { label: "Food", get: (d) => <Stars n={d.ratings.food} /> },
    { label: "Culture", get: (d) => <Stars n={d.ratings.culture} /> },
    { label: "Nature", get: (d) => <Stars n={d.ratings.nature} /> },
    { label: "Nightlife", get: (d) => <Stars n={d.ratings.nightlife} /> },
    { label: "Shopping", get: (d) => <Stars n={d.ratings.shopping} /> },
    { label: "Transportation", get: (d) => <Stars n={d.ratings.transport} /> },
    { label: "Beginner Friendly", get: (d) => BEGINNER_LABEL[d.beginner] },
    { label: "Recommended Stay", get: (d) => d.tripLength },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <h1>Compare Destinations</h1>
        <p className="muted">Pick two or three places you're weighing against each other.</p>
      </div>

      <div className="compare-selectors">
        {[0, 1, 2].map((i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="vs">VS</span>}
            <CompareSelect value={compareIds[i]} onChange={(v) => setAt(i, v)} exclude={compareIds} />
          </React.Fragment>
        ))}
      </div>

      {dests.length < 2 ? (
        <div className="empty-state">
          <Compass size={28} strokeWidth={1.5} />
          <p>Select at least two destinations to compare.</p>
        </div>
      ) : (
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th></th>
                {dests.map((d) => (
                  <th key={d.id}>
                    <div className="compare-col-head" style={{ background: d.gradient }}>
                      <span>{d.flag}</span>
                      <strong>{d.name}</strong>
                      <span className="compare-col-country">{d.country}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td className="row-label">{row.label}</td>
                  {dests.map((d) => (
                    <td key={d.id}>{row.get(d)}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <td></td>
                {dests.map((d) => (
                  <td key={d.id}>
                    <div className="compare-actions">
                      <button className="btn-outline btn-sm" onClick={() => openDetail(d.id)}>View Destination</button>
                      <button className="btn-primary btn-sm" onClick={() => onAddTrip(d.id)}>Add to Trip</button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ============================== DESTINATION INTELLIGENCE (detail page) ============================== */

function Detail({ id, setTab, onAddTrip, bookmarked, onBookmark }) {
  const d = DESTINATIONS.find((x) => x.id === id);
  const [attFilter, setAttFilter] = useState("All");
  if (!d) return null;
  const cats = ["All", "Must See", "Culture", "Food", "Nature", "Shopping", "Entertainment"];
  const filteredAtt = d.attractions.filter((a) => {
    if (attFilter === "All") return true;
    if (attFilter === "Must See") return a.mustSee;
    return a.cat.includes(attFilter);
  });

  return (
    <div>
      <div className="detail-hero" style={{ background: d.gradient }}>
        <button className="back-btn" onClick={() => setTab("destinations")}>← Back</button>
        <button className="bookmark-btn bookmark-btn-hero" onClick={() => onBookmark(d.id)} title="Bookmark">
          <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
        </button>
        <div className="detail-hero-inner">
          <h1>{d.name}, {d.country} {d.flag}</h1>
          <p>{d.desc}</p>
          <div className="detail-quickfacts">
            <span><strong>Best For:</strong> {d.interests.slice(0, 3).join(" • ")}</span>
            <span><strong>Budget:</strong> {BUDGET_LABEL[d.budget]}</span>
            <span><strong>Stay:</strong> {d.tripLength}</span>
            <span><strong>Best Season:</strong> {d.bestSeason}</span>
            <span><strong>Transportation:</strong> {d.basics.transportation.split("—")[0].trim()}</span>
            <span><strong>Beginner Friendly:</strong> {BEGINNER_LABEL[d.beginner]}</span>
          </div>
          <button className="btn-primary" onClick={() => onAddTrip(d.id)}><Plus size={15} /> Add to Trip</button>
        </div>
      </div>

      <div className="page">
        <section className="section">
          <h2 className="h-underline">Overview</h2>
          <p className="body-text">{d.desc}</p>
        </section>

        <Dotted />

        <section className="section">
          <h2 className="h-underline">Culture &amp; Important Information</h2>
          <div className="info-row-grid">
            <div className="info-row"><Globe2 size={16} /><div><span className="info-label">Language</span><span>{d.culture.language}</span></div></div>
            <div className="info-row"><CreditCard size={16} /><div><span className="info-label">Tipping</span><span>{d.culture.tipping}</span></div></div>
            <div className="info-row"><CreditCard size={16} /><div><span className="info-label">Payments</span><span>{d.culture.payments}</span></div></div>
            <div className="info-row"><Info size={16} /><div><span className="info-label">Etiquette</span><span>{d.culture.etiquette}</span></div></div>
          </div>
          <ul className="tip-list">
            {d.culture.tips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </section>

        <Dotted />

        <section className="section">
          <h2 className="h-underline">Food to Try</h2>
          <div className="food-grid">
            {d.food.map((f) => (
              <div key={f.name} className="food-card">
                <div className="food-emoji">{f.emoji}</div>
                <strong>{f.name}</strong>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="chip-row" style={{ marginTop: 14 }}>
            <span className="mini-fact"><strong>Typical Meal Cost:</strong> {BUDGET_LABEL[d.mealCost]}</span>
            <span className="mini-fact"><strong>Known For:</strong> {d.knownFor.join(" • ")}</span>
          </div>
        </section>

        <Dotted />

        <section className="section">
          <h2 className="h-underline">Attractions</h2>
          <div className="chip-row" style={{ marginBottom: 16 }}>
            {cats.map((c) => (
              <FilterChip key={c} label={c} active={attFilter === c} onClick={() => setAttFilter(c)} />
            ))}
          </div>
          <div className="attraction-grid">
            {filteredAtt.map((a) => (
              <div key={a.name} className="attraction-card">
                <div className="attraction-top" style={{ background: d.gradient }}>
                  {a.mustSee && <span className="must-see"><Star size={11} fill="#fff" color="#fff" /> Must See</span>}
                </div>
                <div className="attraction-body">
                  <strong>{a.name}</strong>
                  <div className="chip-wrap" style={{ margin: "4px 0 6px" }}>
                    {a.cat.map((c) => <Tag key={c}>{c}</Tag>)}
                  </div>
                  <p>{a.desc}</p>
                  <div className="attraction-meta">
                    <span><Clock size={12} /> {a.time}</span>
                    <span>{a.cost}</span>
                  </div>
                  <button className="btn-outline btn-sm" style={{ width: "100%", marginTop: 10 }} onClick={() => onAddTrip(d.id, a.name)}>
                    <Plus size={13} /> Add to Trip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Dotted />

        <section className="section">
          <h2 className="h-underline">Cost</h2>
          <div className="basics-grid">
            <div className="basics-item"><CreditCard size={16} /><span className="info-label">Accommodation</span><span>{d.cost.accommodation}</span></div>
            <div className="basics-item"><Utensils size={16} /><span className="info-label">Meals</span><span>{d.cost.meals}</span></div>
            <div className="basics-item"><Compass size={16} /><span className="info-label">Local Transportation</span><span>{d.cost.localTransport}</span></div>
            <div className="basics-item"><Star size={16} /><span className="info-label">Attractions</span><span>{d.cost.attractions}</span></div>
            <div className="basics-item"><Wallet size={16} /><span className="info-label">Estimated Daily Budget</span><span>{d.basics.dailyBudget}</span></div>
          </div>
        </section>

        <Dotted />

        <section className="section">
          <h2 className="h-underline">Travel Basics</h2>
          <div className="basics-grid">
            <div className="basics-item"><Plane size={16} /><span className="info-label">Main Airport</span><span>{d.basics.airport}</span></div>
            <div className="basics-item"><CreditCard size={16} /><span className="info-label">Currency</span><span>{d.basics.currency}</span></div>
            <div className="basics-item"><Compass size={16} /><span className="info-label">Transportation</span><span>{d.basics.transportation}</span></div>
            <div className="basics-item"><Sparkles size={16} /><span className="info-label">Plug Type</span><span>{d.basics.plug}</span></div>
            <div className="basics-item"><ShieldCheck size={16} /><span className="info-label">Safety</span><span>{d.basics.safety}</span></div>
            <div className="basics-item"><CalendarDays size={16} /><span className="info-label">Recommended Stay</span><span>{d.tripLength}</span></div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ============================== TRIP BUILDER ============================== */

function TripBuilder({ trips, setTrips, setTab }) {
  const [newDest, setNewDest] = useState("");
  const [newDays, setNewDays] = useState(5);
  const tripEntries = Object.entries(trips);

  const createTrip = () => {
    if (!newDest) return;
    setTrips((t) => ({ ...t, [newDest]: { days: Array.from({ length: newDays }, () => ({ attractions: [] })) } }));
    setNewDest("");
  };

  const removeAttraction = (destId, dayIdx, attIdx) => {
    setTrips((t) => {
      const copy = structuredClone(t);
      copy[destId].days[dayIdx].attractions.splice(attIdx, 1);
      return copy;
    });
  };

  const moveAttraction = (destId, dayIdx, attIdx, targetDay) => {
    setTrips((t) => {
      const copy = structuredClone(t);
      const [item] = copy[destId].days[dayIdx].attractions.splice(attIdx, 1);
      copy[destId].days[targetDay].attractions.push(item);
      return copy;
    });
  };

  const reorder = (destId, dayIdx, attIdx, dir) => {
    setTrips((t) => {
      const copy = structuredClone(t);
      const arr = copy[destId].days[dayIdx].attractions;
      const j = attIdx + dir;
      if (j < 0 || j >= arr.length) return t;
      [arr[attIdx], arr[j]] = [arr[j], arr[attIdx]];
      return copy;
    });
  };

  const deleteTrip = (destId) => {
    setTrips((t) => {
      const copy = { ...t };
      delete copy[destId];
      return copy;
    });
  };

  return (
    <div className="page">
      <div className="page-head">
        <h1>Trip Builder</h1>
        <p className="muted">Turn a destination into a simple day-by-day itinerary.</p>
      </div>

      <div className="create-trip-card">
        <div className="create-trip-row">
          <div>
            <label className="info-label">Destination</label>
            <select className="compare-select" value={newDest} onChange={(e) => setNewDest(e.target.value)}>
              <option value="">Select Destination</option>
              {DESTINATIONS.filter((d) => !trips[d.id]).map((d) => (
                <option key={d.id} value={d.id}>{d.flag} {d.name}, {d.country}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="info-label">Trip Length (days)</label>
            <input type="number" min={1} max={21} className="days-input" value={newDays} onChange={(e) => setNewDays(Math.max(1, Math.min(21, Number(e.target.value) || 1)))} />
          </div>
          <button className="btn-primary" onClick={createTrip} disabled={!newDest}>Create Trip</button>
        </div>
      </div>

      {tripEntries.length === 0 && (
        <div className="empty-state">
          <CalendarDays size={28} strokeWidth={1.5} />
          <p>No trips yet. Create one above, or add attractions from any destination page.</p>
        </div>
      )}

      {tripEntries.map(([destId, trip]) => {
        const d = DESTINATIONS.find((x) => x.id === destId);
        if (!d) return null;
        return (
          <div className="trip-card" key={destId}>
            <div className="trip-card-head" style={{ background: d.gradient }}>
              <h3>{d.name} — {trip.days.length} Day{trip.days.length !== 1 ? "s" : ""}</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-outline btn-sm" style={{ background: "rgba(255,255,255,0.9)" }} onClick={() => setTab("detail:" + destId)}>View Destination</button>
                <button className="icon-btn icon-btn-light" onClick={() => deleteTrip(destId)}><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="trip-days">
              {trip.days.map((day, dayIdx) => (
                <div className="trip-day" key={dayIdx}>
                  <div className="trip-day-label">DAY {dayIdx + 1}</div>
                  {day.attractions.length === 0 && <p className="muted-sm">No attractions yet.</p>}
                  {day.attractions.map((att, attIdx) => (
                    <div className="trip-att" key={attIdx}>
                      <span>{att}</span>
                      <div className="trip-att-actions">
                        <button title="Move up" onClick={() => reorder(destId, dayIdx, attIdx, -1)}><ChevronUp size={14} /></button>
                        <button title="Move down" onClick={() => reorder(destId, dayIdx, attIdx, 1)}><ChevronDown size={14} /></button>
                        {trip.days.length > 1 && (
                          <select value={dayIdx} onChange={(e) => moveAttraction(destId, dayIdx, attIdx, Number(e.target.value))}>
                            {trip.days.map((_, i) => <option key={i} value={i}>Day {i + 1}</option>)}
                          </select>
                        )}
                        <button title="Remove" onClick={() => removeAttraction(destId, dayIdx, attIdx)}><Trash2 size={13} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================== APP ============================== */

export default function App() {
  const [tab, setTab] = useState("explore");
  const [findFilters, setFindFilters] = useState(emptyFilters());
  const [searchTerm, setSearchTerm] = useState("");
  const [compareIds, setCompareIds] = useState([]);
  const [trips, setTrips] = useState({});
  const [pending, setPending] = useState(null);
  const [bookmarkedCountries, setBookmarkedCountries] = useState(new Set());
  const [bookmarkedDests, setBookmarkedDests] = useState(new Set());

  const openDetail = (id) => setTab("detail:" + id);

  const toggleBookmarkCountry = (id) => {
    setBookmarkedCountries((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleBookmarkDest = (id) => {
    setBookmarkedDests((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const requestAdd = (destId, attName) => {
    const d = DESTINATIONS.find((x) => x.id === destId);
    setPending({ destId, attName: attName || null, label: attName || d.name });
  };

  const createTripFromModal = (destId, days) => {
    setTrips((t) => ({ ...t, [destId]: { days: Array.from({ length: days }, () => ({ attractions: [] })) } }));
  };

  const pickDay = (destId, dayIdx) => {
    setTrips((t) => {
      const copy = structuredClone(t);
      copy[destId].days[dayIdx].attractions.push(pending.attName);
      return copy;
    });
    setPending(null);
  };

  let body;
  if (tab === "explore") {
    body = (
      <Explore
        setTab={setTab} openDetail={openDetail}
        bookmarkedCountries={bookmarkedCountries} bookmarkedDests={bookmarkedDests}
        toggleBookmarkCountry={toggleBookmarkCountry} toggleBookmarkDest={toggleBookmarkDest}
        requestAdd={requestAdd}
      />
    );
  } else if (tab === "tripmatch") {
    body = <TripMatch filters={findFilters} setFilters={setFindFilters} openDetail={openDetail} onAddTrip={requestAdd} bookmarkedDests={bookmarkedDests} toggleBookmarkDest={toggleBookmarkDest} />;
  } else if (tab === "compare") {
    body = <Compare compareIds={compareIds} setCompareIds={setCompareIds} openDetail={openDetail} onAddTrip={requestAdd} />;
  } else if (tab === "destinations") {
    body = <DestinationsPage openDetail={openDetail} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onAddTrip={requestAdd} bookmarkedDests={bookmarkedDests} toggleBookmarkDest={toggleBookmarkDest} />;
  } else if (tab === "trip") {
    body = <TripBuilder trips={trips} setTrips={setTrips} setTab={setTab} />;
  } else if (tab.startsWith("detail:")) {
    const id = tab.split(":")[1];
    body = <Detail id={id} setTab={setTab} onAddTrip={requestAdd} bookmarked={bookmarkedDests.has(id)} onBookmark={toggleBookmarkDest} />;
  }

  return (
    <div className="app-root">
      <style>{CSS}</style>
      <Nav tab={tab.startsWith("detail:") ? "destinations" : tab} setTab={setTab} />
      <main className="main">{body}</main>
      <AddToTripModal pending={pending} trips={trips} onClose={() => setPending(null)} onPick={pickDay} onCreate={createTripFromModal} />
      <footer className="footer">Waypost — a friendlier way to plan a first trip.</footer>
    </div>
  );
}

/* ============================== CSS ============================== */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');

.app-root {
  --cream: #F3EEE1;
  --paper: #FBF8F1;
  --ink: #1E2A28;
  --teal: #1B7A6B;
  --teal-dark: #0F3F39;
  --coral: #E15B3D;
  --gold: #D9A441;
  --line: #DCD2BA;
  background: var(--cream);
  color: var(--ink);
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}
.app-root * { box-sizing: border-box; }
.app-root h1, .app-root h2, .app-root h3 { font-family: 'Fraunces', serif; margin: 0; }
.app-root em { font-style: italic; color: var(--teal-dark); }
.app-root button { font-family: 'Inter', sans-serif; cursor: pointer; }
.app-root select, .app-root input { font-family: 'Inter', sans-serif; }
.muted { color: #6B6355; font-size: 14px; }
.muted-sm { color: #A69C89; font-size: 12.5px; font-style: italic; }

/* NAV */
.nav { position: sticky; top: 0; z-index: 20; background: var(--paper); border-bottom: 1px solid var(--line); }
.nav-inner { max-width: 1180px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; }
.brand { display: flex; align-items: center; gap: 8px; background: none; border: none; font-family: 'Fraunces', serif; font-weight: 600; font-size: 19px; color: var(--teal-dark); padding: 0; }
.nav-tabs { display: flex; gap: 4px; }
.nav-tab { background: none; border: none; padding: 8px 16px; border-radius: 20px; font-size: 14.5px; font-weight: 500; color: #6B6355; }
.nav-tab:hover { background: var(--cream); }
.nav-tab-active { background: var(--teal-dark); color: #fff; }

/* LAYOUT */
.main { max-width: 1180px; margin: 0 auto; padding: 0 24px 60px; }
.page { padding-top: 36px; }
.page-head { margin-bottom: 26px; }
.page-head h1 { font-size: 34px; margin-bottom: 6px; }
.section { padding: 40px 0; }
.section-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 20px; }
.section-head h2 { font-size: 24px; }
.section-eyebrow { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.04em; color: var(--coral); text-transform: uppercase; }
.h-underline { font-size: 22px; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 2px solid var(--ink); display: inline-block; }
.body-text { line-height: 1.7; color: #3D3B33; max-width: 70ch; }
.footer { text-align: center; padding: 30px; font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; color: #A69C89; border-top: 1px solid var(--line); }

.dotted-divider { border-top: 2px dotted var(--line); margin: 0; }

/* HERO */
.hero { text-align: center; padding: 56px 20px 30px; position: relative; }
.hero-explore { padding-bottom: 10px; }
.hero-compass { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border: 1.5px dashed var(--gold); border-radius: 50%; color: var(--teal-dark); margin-bottom: 18px; transform: rotate(-6deg); }
.hero-title { font-size: 52px; line-height: 1.05; font-weight: 500; color: var(--ink); letter-spacing: -0.01em; }
.hero-sub { color: #6B6355; font-size: 16px; margin: 16px 0 6px; }
.search-bar { display: flex; align-items: center; gap: 10px; max-width: 560px; margin: 0 auto; background: var(--paper); border: 1.5px solid var(--ink); border-radius: 40px; padding: 8px 10px 8px 20px; }
.search-bar input { flex: 1; border: none; outline: none; background: none; font-size: 15px; color: var(--ink); }
.search-bar-sm { max-width: 420px; margin: 16px 0 0; }
.search-dropdown { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: var(--paper); border: 1px solid var(--line); border-radius: 12px; box-shadow: 0 10px 24px rgba(30,42,40,0.12); z-index: 10; overflow: hidden; }
.search-dropdown button { display: block; width: 100%; text-align: left; background: none; border: none; padding: 10px 16px; font-size: 13.5px; }
.search-dropdown button:hover { background: var(--cream); }
.hero-actions { display: flex; gap: 14px; justify-content: center; margin-top: 22px; flex-wrap: wrap; }

/* BUTTONS */
.btn-primary { background: var(--teal-dark); color: #fff; border: none; padding: 12px 22px; border-radius: 30px; font-weight: 600; font-size: 14.5px; display: inline-flex; align-items: center; gap: 6px; transition: transform .12s ease; }
.btn-primary:hover { transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.btn-outline { background: none; color: var(--ink); border: 1.5px solid var(--ink); padding: 11px 20px; border-radius: 30px; font-weight: 600; font-size: 14.5px; }
.btn-sm { padding: 8px 14px; font-size: 13px; }
.btn-link { background: none; border: none; color: var(--teal-dark); font-weight: 600; font-size: 13.5px; display: inline-flex; align-items: center; gap: 4px; padding: 0; }
.btn-link-sm { background: none; border: none; color: var(--coral); font-size: 12.5px; font-weight: 600; margin-left: auto; }
.btn-ghost-sm { background: var(--cream); border: 1px solid var(--line); border-radius: 50%; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; color: var(--teal-dark); }
.icon-btn { background: none; border: none; color: var(--ink); display: flex; align-items: center; }
.icon-btn-light { color: #fff; }
.bookmark-btn { background: var(--paper); border: 1px solid var(--line); border-radius: 50%; width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; color: var(--ink); }
.bookmark-btn-active { background: var(--coral); border-color: var(--coral); color: #fff; }
.bookmark-btn-hero { position: absolute; top: 18px; right: 24px; background: rgba(255,255,255,0.9); border: none; color: var(--teal-dark); }

/* CARDS / GRID */
.grid-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(255px, 1fr)); gap: 20px; }
.postcard { background: var(--paper); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; transition: box-shadow .15s ease, transform .15s ease; }
.postcard:hover { box-shadow: 0 10px 24px rgba(30,42,40,0.1); transform: translateY(-2px); }
.postcard-hero { height: 130px; position: relative; cursor: pointer; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; }
.postcard-hero-top { display: flex; justify-content: space-between; align-items: flex-start; }
.postcard-stamp { background: rgba(255,255,255,0.92); font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 3px; border: 1px dashed var(--ink); }
.pc-bookmark { background: rgba(0,0,0,0.2); border: none; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; }
.postcard-title { display: flex; align-items: center; gap: 6px; }
.pc-name { font-family: 'Fraunces', serif; font-size: 22px; color: #fff; font-weight: 600; text-shadow: 0 2px 8px rgba(0,0,0,0.25); }
.pc-flag { font-size: 18px; }
.match-badge { position: absolute; top: 46px; left: 12px; background: var(--coral); color: #fff; font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 3px; }
.postcard-body { padding: 14px 15px 15px; display: flex; flex-direction: column; gap: 8px; }
.pc-country { font-size: 12.5px; color: #A69C89; font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; letter-spacing: 0.03em; }
.pc-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.pc-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; }

.tag { display: inline-flex; align-items: center; gap: 4px; background: var(--cream); border: 1px solid var(--line); border-radius: 20px; padding: 3px 9px; font-size: 11.5px; color: #4A4638; }
.stamp { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; font-weight: 600; color: var(--teal-dark); border: 1.5px dashed var(--teal); border-radius: 50%; padding: 6px 9px; transform: rotate(-7deg); display: inline-block; text-transform: uppercase; letter-spacing: 0.02em; }

/* CHIPS */
.chip-row { display: flex; flex-wrap: wrap; gap: 10px; }
.chip-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { display: inline-flex; align-items: center; gap: 5px; background: var(--paper); border: 1.5px solid var(--line); border-radius: 20px; padding: 7px 14px; font-size: 13px; font-weight: 500; color: #4A4638; }
.chip-lg { padding: 10px 18px; font-size: 14px; }
.chip-active { background: var(--teal-dark); border-color: var(--teal-dark); color: #fff; }

/* FIND / TRIP MATCH LAYOUT */
.find-layout { display: grid; grid-template-columns: 260px 1fr; gap: 32px; align-items: start; }
.filter-panel { background: var(--paper); border: 1px solid var(--line); border-radius: 14px; padding: 16px; position: sticky; top: 84px; max-height: calc(100vh - 100px); overflow-y: auto; }
.filter-panel-head { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; padding-bottom: 10px; margin-bottom: 6px; border-bottom: 1px solid var(--line); }
.filter-section { border-bottom: 1px solid var(--line); padding: 10px 0; }
.filter-section:last-child { border-bottom: none; }
.filter-section-head { width: 100%; display: flex; align-items: center; justify-content: space-between; background: none; border: none; font-weight: 600; font-size: 13.5px; padding: 2px 0; }
.filter-section-body { margin-top: 10px; }
.exact-budget-row { display: flex; align-items: center; gap: 6px; margin-top: 10px; border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; background: #fff; }
.exact-budget-row input { border: none; outline: none; font-size: 13px; width: 100%; background: none; }
.results-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.sort-row { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.sort-row select { border: 1px solid var(--line); border-radius: 8px; padding: 5px 8px; background: var(--paper); }

/* EXPLORE / GLOBE */
.explore-center { display: flex; flex-direction: column; align-items: center; gap: 16px; margin-top: 6px; }
.globe-stage { position: relative; display: flex; justify-content: center; width: 100%; }
.globe-wrap { position: relative; margin: 0 auto; }
.globe-svg { cursor: grab; touch-action: none; }
.globe-svg:active { cursor: grabbing; }
.globe-placeholder { width: 620px; max-width: 100%; height: 460px; display: flex; align-items: center; justify-content: center; color: #A69C89; border: 1px dashed var(--line); border-radius: 16px; background: var(--paper); }
.globe-loading { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #A69C89; font-size: 13px; }
.globe-zoom-controls { position: absolute; bottom: 10px; right: 10px; display: flex; flex-direction: column; gap: 6px; }
.globe-zoom-controls button { background: var(--paper); border: 1px solid var(--line); border-radius: 8px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; }
.globe-hint { text-align: center; font-size: 12px; color: #A69C89; font-family: 'IBM Plex Mono', monospace; }
.auto-rotate-toggle { display: inline-flex; align-items: center; gap: 8px; background: var(--paper); border: 1px solid var(--line); border-radius: 20px; padding: 7px 14px; font-size: 13px; font-weight: 500; color: #4A4638; cursor: pointer; }
.auto-rotate-toggle input { accent-color: var(--teal-dark); width: 15px; height: 15px; cursor: pointer; }
.globe-sea { fill: #AFD9E8; stroke: var(--teal-dark); stroke-width: 1.5; }
.globe-graticule { fill: none; stroke: #8FC3D6; stroke-width: 0.5; opacity: 0.6; }
.globe-country { fill: #9FC98A; stroke: #5C8A55; stroke-width: 0.6; cursor: pointer; transition: fill .1s ease; }
.globe-country:hover { fill: var(--gold); }
.globe-country-active { fill: #C9DE8A !important; stroke: var(--coral) !important; stroke-width: 2.5px !important; }
.country-bubble { position: absolute; left: 50%; top: 50%; transform: translate(-50%, calc(-100% - 20px)); width: 300px; max-width: 82vw; z-index: 15; }
.country-bubble-inner { background: var(--paper); border: 1.5px solid var(--ink); border-radius: 14px; padding: 16px; box-shadow: 0 14px 34px rgba(30,42,40,0.22); }
.country-bubble-arrow { position: absolute; left: 50%; bottom: -12px; transform: translateX(-50%); width: 0; height: 0; border-left: 12px solid transparent; border-right: 12px solid transparent; border-top: 12px solid var(--ink); }
.country-bubble-arrow-fill { position: absolute; left: 50%; bottom: -9px; transform: translateX(-50%); width: 0; height: 0; border-left: 9.5px solid transparent; border-right: 9.5px solid transparent; border-top: 9.5px solid var(--paper); }
.country-panel-head { display: flex; align-items: flex-start; justify-content: space-between; }
.country-panel-title { display: flex; align-items: center; gap: 8px; }
.country-flag { font-size: 26px; }
.country-panel-title h3 { font-size: 21px; }
.country-quickfacts { display: flex; flex-direction: column; gap: 5px; font-size: 13px; margin: 14px 0; }
.country-cities { margin-top: 10px; }
.country-city-list { display: flex; flex-wrap: wrap; gap: 8px; }
.country-city-chip { background: #fff; border: 1.5px solid var(--teal); color: var(--teal-dark); border-radius: 20px; padding: 7px 14px; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
.country-city-chip-disabled { border-color: var(--line); color: #A69C89; font-weight: 500; cursor: default; }
.soon-tag { font-family: 'IBM Plex Mono', monospace; font-size: 9px; background: var(--cream); border-radius: 8px; padding: 1px 6px; text-transform: uppercase; }

/* DETAIL PAGE */
.detail-hero { padding: 50px 24px 60px; position: relative; }
.detail-hero-inner { max-width: 800px; margin: 0 auto; text-align: center; color: #fff; }
.detail-hero-inner h1 { font-size: 38px; margin-bottom: 12px; }
.detail-hero-inner p { opacity: 0.95; line-height: 1.6; margin-bottom: 18px; max-width: 60ch; margin-left: auto; margin-right: auto; }
.detail-quickfacts { display: flex; flex-wrap: wrap; gap: 10px 18px; justify-content: center; font-size: 13px; margin-bottom: 22px; opacity: 0.95; }
.back-btn { background: rgba(255,255,255,0.9); border: none; border-radius: 20px; padding: 7px 14px; font-size: 13px; font-weight: 600; position: absolute; top: 18px; left: 24px; }

.info-row-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 18px; }
.info-row { display: flex; gap: 10px; background: var(--paper); border: 1px solid var(--line); border-radius: 10px; padding: 12px; }
.info-row > div { display: flex; flex-direction: column; gap: 2px; }
.info-label { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.03em; color: #A69C89; }
.tip-list { padding-left: 20px; line-height: 1.9; color: #3D3B33; }

.food-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; }
.food-card { background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 14px; text-align: center; }
.food-emoji { font-size: 30px; margin-bottom: 6px; }
.food-card p { font-size: 12.5px; color: #6B6355; margin-top: 4px; }
.mini-fact { font-size: 13px; background: var(--paper); border: 1px solid var(--line); border-radius: 20px; padding: 6px 14px; }

.attraction-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 18px; }
.attraction-card { background: var(--paper); border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
.attraction-top { height: 8px; position: relative; }
.must-see { position: absolute; top: -22px; right: 10px; background: var(--coral); color: #fff; font-size: 10.5px; font-weight: 700; padding: 3px 8px; border-radius: 20px; display: inline-flex; align-items: center; gap: 4px; }
.attraction-body { padding: 14px; }
.attraction-body p { font-size: 13px; color: #6B6355; margin: 6px 0 8px; line-height: 1.5; }
.attraction-meta { display: flex; justify-content: space-between; font-size: 12px; color: #4A4638; font-family: 'IBM Plex Mono', monospace; }
.attraction-meta span { display: inline-flex; align-items: center; gap: 4px; }

.basics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }
.basics-item { background: var(--paper); border: 1px solid var(--line); border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 5px; }
.basics-item span:last-child { font-size: 14px; font-weight: 500; }

/* COMPARE */
.compare-selectors { display: flex; align-items: center; gap: 14px; margin-bottom: 26px; flex-wrap: wrap; }
.compare-select { border: 1.5px solid var(--line); border-radius: 8px; padding: 9px 12px; font-size: 14px; background: var(--paper); min-width: 200px; }
.vs { font-family: 'Fraunces', serif; font-weight: 600; color: var(--coral); font-size: 15px; }
.compare-table-wrap { overflow-x: auto; }
.compare-table { border-collapse: collapse; width: 100%; min-width: 560px; }
.compare-table th, .compare-table td { border: 1px solid var(--line); padding: 12px 14px; text-align: center; font-size: 13.5px; }
.compare-col-head { display: flex; flex-direction: column; gap: 3px; padding: 14px; border-radius: 8px; color: #fff; }
.compare-col-head span:first-child { font-size: 20px; }
.compare-col-head strong { font-family: 'Fraunces', serif; font-size: 17px; }
.compare-col-country { font-size: 11.5px; opacity: 0.9; }
.row-label { text-align: left !important; font-weight: 600; background: var(--paper); font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.02em; color: #6B6355; }
.compare-actions { display: flex; flex-direction: column; gap: 8px; }
.empty-state { text-align: center; padding: 60px 20px; color: #A69C89; display: flex; flex-direction: column; align-items: center; gap: 10px; }

/* TRIP BUILDER */
.create-trip-card { background: var(--paper); border: 1px solid var(--line); border-radius: 14px; padding: 20px; margin-bottom: 26px; }
.create-trip-row { display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap; }
.days-input { border: 1.5px solid var(--line); border-radius: 8px; padding: 9px 12px; width: 90px; font-size: 14px; }
.trip-card { border: 1px solid var(--line); border-radius: 14px; overflow: hidden; margin-bottom: 24px; }
.trip-card-head { padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; color: #fff; }
.trip-card-head h3 { font-size: 20px; color: #fff; }
.trip-days { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0; background: var(--paper); }
.trip-day { padding: 16px; border-right: 1px dashed var(--line); border-top: 1px solid var(--line); }
.trip-day-label { font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.05em; color: var(--coral); margin-bottom: 10px; font-weight: 600; }
.trip-att { display: flex; align-items: center; justify-content: space-between; gap: 8px; background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; margin-bottom: 8px; font-size: 13px; }
.trip-att-actions { display: flex; align-items: center; gap: 4px; }
.trip-att-actions button { background: none; border: none; color: #6B6355; display: flex; }
.trip-att-actions select { border: 1px solid var(--line); border-radius: 6px; font-size: 11px; }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(30,42,40,0.45); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
.modal { background: var(--paper); border-radius: 16px; width: 100%; max-width: 380px; padding: 22px; }
.modal-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
.modal-eyebrow { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; text-transform: uppercase; color: var(--coral); letter-spacing: 0.03em; }
.modal-title { font-family: 'Fraunces', serif; font-size: 20px; margin-top: 2px; }
.modal-body p { margin-bottom: 14px; }
.day-pick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.day-pick-btn { border: 1.5px solid var(--line); background: #fff; border-radius: 8px; padding: 10px; font-weight: 600; font-size: 13px; }
.day-pick-btn:hover { border-color: var(--teal-dark); background: var(--cream); }

@media (max-width: 820px) {
  .find-layout { grid-template-columns: 1fr; }
  .filter-panel { position: static; max-height: none; }
  .hero-title { font-size: 36px; }
  .nav-tabs { gap: 0; }
  .nav-tab { padding: 8px 10px; font-size: 12.5px; }
}
@media (max-width: 680px) {
  .globe-wrap { width: 100% !important; max-width: 420px; }
  .globe-svg { width: 100% !important; height: auto !important; }
}
`;
