import {
  FiSmartphone,
  FiMonitor,
  FiHeadphones,
  FiCamera,
  FiCpu,
  FiShoppingBag,
  FiHome,
  FiDroplet,
  FiCoffee,
  FiActivity,
  FiHeart,
  FiBox,
  FiBook,
  FiFilm,
  FiMusic,
  FiGift,
  FiTool,
  FiPackage,
  FiClipboard,
  FiBriefcase,
  FiTruck,
} from 'react-icons/fi';

import { MdGamepad } from 'react-icons/md';

import { FaPuzzlePiece } from 'react-icons/fa';

export const categoryIconMap: Record<string, any> = {
  // Electronics
  electronics: FiMonitor,
  'smartphones-accessories': FiSmartphone,
  'computers-laptops': FiMonitor,
  'audio-headphones': FiHeadphones,
  'cameras-drones': FiCamera,
  'smart-home-iot': FiCpu,

  // Fashion
  'fashion-apparel': FiShoppingBag,
  'womens-clothing': FiShoppingBag,
  'mens-clothing': FiShoppingBag,
  'shoes-footwear': FiShoppingBag,
  'bags-accessories': FiShoppingBag,
  'jewellery-watches': FiShoppingBag,

  // Home & Living
  'home-living': FiHome,
  furniture: FiHome,
  'home-decor': FiHome,
  'kitchen-dining': FiCoffee,
  'bedding-bath': FiHome,
  'lighting-lamps': FiHome,

  // Beauty
  'beauty-personal-care': FiDroplet,
  skincare: FiDroplet,
  haircare: FiDroplet,
  'makeup-cosmetics': FiDroplet,
  fragrances: FiDroplet,
  'wellness-selfcare': FiHeart,

  // Food
  'food-beverages': FiCoffee,
  'groceries-daily-needs': FiPackage,
  'snacks-sweets': FiCoffee,
  'drinks-beverages': FiCoffee,
  'organic-health-foods': FiActivity,
  'gourmet-gifts': FiGift,

  // Sports
  'sports-outdoors': FiActivity,
  'fitness-equipment': FiActivity,
  'outdoor-recreation': FiActivity,
  sportswear: FiActivity,
  'team-sports-gear': FiActivity,
  'camping-hiking': FiActivity,

  // Health & Wellness
  'health-wellness': FiHeart,
  'personal-care-devices': FiHeart,
  'fitness-trackers': FiActivity,
  'sleep-relaxation': FiHeart,
  'healthy-living-products': FiHeart,
  'vitamins-supplements': FiHeart,

  // Baby & Kids
  'baby-kids-toys': FiBox,
  'baby-gear-essentials': FiBox,
  'toys-games': FaPuzzlePiece,
  'kids-clothing-shoes': FiShoppingBag,
  'educational-stem-toys': FaPuzzlePiece,
  'kids-furniture-decor': FiHome,

  // Books, Movies, Games
  'books-movies-games': FiBook,
  'books-ebooks': FiBook,
  'movies-tv-series': FiFilm,
  'video-games-consoles': MdGamepad,
  'board-games-puzzles': FaPuzzlePiece,
  'music-instruments': FiMusic,

  // Pets
  'pet-supplies': FiPackage,
  'pet-food': FiPackage,
  'pet-toys-accessories': FiPackage,
  'pet-health-grooming': FiHeart,
  'aquatic-fish-supplies': FiDroplet,
  'pet-bedding-habitat': FiHome,

  // Bags & Luggage
  'bags-luggage-accessories': FiBriefcase,
  'backpacks-school-bags': FiBriefcase,
  'travel-luggage': FiBriefcase,
  'handbags-wallets': FiShoppingBag,
  'laptop-bags-briefcases': FiBriefcase,
  'accessories-wallets': FiShoppingBag,

  // Automotive
  'automotive-industrial': FiTruck,
  'car-accessories': FiTruck,
  'motorbike-parts': FiTruck,
  'tools-equipment': FiTool,
  'industrial-supplies': FiTool,
  'car-electronics-audio': FiHeadphones,

  // Office Supplies
  'office-supplies-stationery': FiClipboard,
  'office-furniture': FiHome,
  'printers-supplies': FiMonitor,
  'stationery-writing': FiClipboard,
  'school-supplies': FiClipboard,
  'office-tech-accessories': FiMonitor,

  // DIY
  'diy-tools-hardware': FiTool,
  'power-tools': FiTool,
  'hand-tools': FiTool,
  'building-materials': FiTool,
  'home-improvement': FiTool,
  'painting-decorating': FiTool,

  // Gifts
  'gifts-special-occasions': FiGift,
  'gift-hampers': FiGift,
  'seasonal-decor': FiGift,
  'party-supplies': FiGift,
  'personalized-gifts': FiGift,
  'greeting-cards': FiGift,
};
