import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'bn';

interface Translations {
    [key: string]: {
        en: string;
        bn: string;
    };
}

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// All translations
const translations: Translations = {
    // Navbar
    'nav.home': { en: 'Home', bn: 'হোম' },
    'nav.marketplace': { en: 'Marketplace', bn: 'বাজার' },
    'nav.retailShop': { en: 'Retail Shop', bn: 'খুচরা দোকান' },
    'nav.b2bMarket': { en: 'B2B Market', bn: 'পাইকারি বাজার' },
    'nav.market_prices': { en: 'Market Prices', bn: 'বাজার মূল্য' },
    'nav.prices': { en: 'Prices', bn: 'মূল্য' },
    'nav.blogs': { en: 'Blogs & Tips', bn: 'ব্লগ ও পরামর্শ' },
    'nav.about': { en: 'About', bn: 'আমাদের সম্পর্কে' },
    'nav.profile': { en: 'My Profile', bn: 'আমার প্রোফাইল' },
    'nav.dashboard': { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
    'nav.logout': { en: 'Logout', bn: 'লগ আউট' },
    'nav.login': { en: 'Login', bn: 'লগইন' },
    'nav.signup': { en: 'Sign Up', bn: 'নিবন্ধন' },
    'nav.agronomists': { en: 'Agronomists', bn: 'কৃষিবিদ' },
    'nav.shop': { en: 'Shop', bn: 'শপ' },

    // Home Page
    'home.badge': { en: "Bangladesh's #1 Agricultural Platform", bn: 'বাংলাদেশের #১ কৃষি প্ল্যাটফর্ম' },
    'home.hero_title_1': { en: 'Fresh From Farm', bn: 'খামার থেকে তাজা' },
    'home.hero_title_2': { en: 'Direct To You', bn: 'সরাসরি আপনার কাছে' },
    'home.hero_subtitle': { en: 'Connect farmers directly with buyers. Get fresh produce at fair prices while supporting local agriculture.', bn: 'কৃষকদের সরাসরি ক্রেতাদের সাথে সংযুক্ত করুন। স্থানীয় কৃষিকে সমর্থন করার পাশাপাশি ন্যায্য মূল্যে তাজা পণ্য পান।' },
    'home.browse_marketplace': { en: 'Browse Marketplace', bn: 'বাজার ব্রাউজ করুন' },
    'home.join_farmer': { en: 'Join as Farmer', bn: 'কৃষক হিসেবে যোগ দিন' },
    'home.active_farmers': { en: 'Active Farmers', bn: 'সক্রিয় কৃষক' },
    'home.happy_buyers': { en: 'Happy Buyers', bn: 'সন্তুষ্ট ক্রেতা' },
    'home.districts': { en: 'Districts', bn: 'জেলা' },
    'home.categories_title': { en: 'Browse Categories', bn: 'বিভাগ ব্রাউজ করুন' },
    'home.categories_subtitle': { en: 'Find fresh produce across various categories', bn: 'বিভিন্ন বিভাগে তাজা পণ্য খুঁজুন' },
    'home.features_title': { en: 'Why Choose AgroConnect?', bn: 'কেন AgroConnect বেছে নেবেন?' },
    'home.features_subtitle': { en: 'We make agricultural trading simple, transparent, and fair', bn: 'আমরা কৃষি বাণিজ্যকে সহজ, স্বচ্ছ এবং ন্যায্য করি' },
    'home.feature_direct_title': { en: 'Direct Farm-to-Table', bn: 'সরাসরি খামার থেকে টেবিলে' },
    'home.feature_direct_desc': { en: 'Buy fresh produce directly from farmers, eliminating middlemen for better prices.', bn: 'ভালো দামের জন্য মধ্যস্থতাকারীদের বাদ দিয়ে কৃষকদের কাছ থেকে সরাসরি তাজা পণ্য কিনুন।' },
    'home.feature_prices_title': { en: 'Real-time Market Prices', bn: 'রিয়েল-টাইম বাজার মূল্য' },
    'home.feature_prices_desc': { en: 'Stay updated with current market prices across all districts in Bangladesh.', bn: 'বাংলাদেশের সব জেলা জুড়ে বর্তমান বাজার মূল্যের সাথে আপডেট থাকুন।' },
    'home.feature_expert_title': { en: 'Expert Agronomist Support', bn: 'বিশেষজ্ঞ কৃষিবিদ সহায়তা' },
    'home.feature_expert_desc': { en: 'Get professional advice from certified agronomists for better farming.', bn: 'ভালো চাষাবাদের জন্য সার্টিফাইড কৃষিবিদদের কাছ থেকে পেশাদার পরামর্শ নিন।' },
    'home.feature_secure_title': { en: 'Secure Bidding System', bn: 'নিরাপদ বিডিং সিস্টেম' },
    'home.feature_secure_desc': { en: 'Transparent bidding system with secure payment options.', bn: 'নিরাপদ পেমেন্ট বিকল্পসহ স্বচ্ছ বিডিং সিস্টেম।' },
    'home.how_title': { en: 'How It Works', bn: 'কীভাবে কাজ করে' },
    'home.how_subtitle': { en: 'Simple steps to start buying or selling', bn: 'কেনাবেচা শুরু করার সহজ ধাপ' },
    'home.step1_title': { en: 'Create Account', bn: 'অ্যাকাউন্ট তৈরি করুন' },
    'home.step1_desc': { en: 'Sign up as a farmer or buyer with your details', bn: 'আপনার বিবরণ দিয়ে কৃষক বা ক্রেতা হিসেবে সাইন আপ করুন' },
    'home.step2_title': { en: 'List or Browse', bn: 'তালিকাভুক্ত বা ব্রাউজ করুন' },
    'home.step2_desc': { en: 'Farmers list crops, buyers browse and bid', bn: 'কৃষকরা ফসল তালিকাভুক্ত করুন, ক্রেতারা ব্রাউজ ও বিড করুন' },
    'home.step3_title': { en: 'Trade Securely', bn: 'নিরাপদে বাণিজ্য করুন' },
    'home.step3_desc': { en: 'Complete transactions with secure payments', bn: 'নিরাপদ পেমেন্ট দিয়ে লেনদেন সম্পূর্ণ করুন' },
    'home.cta_title': { en: 'Ready to Get Started?', bn: 'শুরু করতে প্রস্তুত?' },
    'home.cta_subtitle': { en: 'Join thousands of farmers and buyers who are already benefiting from our platform. Sign up today and start trading!', bn: 'হাজার হাজার কৃষক ও ক্রেতা যোগ দিন যারা ইতিমধ্যে আমাদের প্ল্যাটফর্ম থেকে উপকৃত হচ্ছেন। আজই সাইন আপ করুন এবং বাণিজ্য শুরু করুন!' },
    'home.register_farmer': { en: 'Register as Farmer', bn: 'কৃষক হিসেবে নিবন্ধন করুন' },
    'home.register_buyer': { en: 'Register as Buyer', bn: 'ক্রেতা হিসেবে নিবন্ধন করুন' },

    // About Page
    'about.title': { en: 'About AgroConnect', bn: 'AgroConnect সম্পর্কে' },
    'about.subtitle': { en: 'Connecting farmers directly with buyers to ensure fair prices, fresh produce, and sustainable agriculture', bn: 'ন্যায্য মূল্য, তাজা পণ্য এবং টেকসই কৃষি নিশ্চিত করতে কৃষকদের সরাসরি ক্রেতাদের সাথে সংযুক্ত করা' },
    'about.mission': { en: 'Our Mission', bn: 'আমাদের মিশন' },
    'about.mission_text': { en: 'To revolutionize Bangladesh\'s agricultural marketplace by eliminating intermediaries and connecting farmers directly with consumers and commercial buyers. We aim to ensure fair prices for farmers while providing fresh, quality produce to buyers at reasonable costs.', bn: 'মধ্যস্থতাকারীদের বাদ দিয়ে এবং কৃষকদের সরাসরি ভোক্তা ও বাণিজ্যিক ক্রেতাদের সাথে সংযুক্ত করে বাংলাদেশের কৃষি বাজার বিপ্লব করা। আমরা ক্রেতাদের যুক্তিসঙ্গত খরচে তাজা, মানসম্পন্ন পণ্য সরবরাহ করার পাশাপাশি কৃষকদের জন্য ন্যায্য মূল্য নিশ্চিত করার লক্ষ্য রাখি।' },
    'about.vision': { en: 'Our Vision', bn: 'আমাদের দৃষ্টিভঙ্গি' },
    'about.vision_text': { en: 'To be Bangladesh\'s most trusted agricultural platform, supporting over 100,000 farmers and serving millions of customers. We envision a future where every farmer has direct access to markets and technology for sustainable growth.', bn: 'বাংলাদেশের সবচেয়ে বিশ্বস্ত কৃষি প্ল্যাটফর্ম হওয়া, ১,০০,০০০+ কৃষককে সমর্থন করা এবং লক্ষ লক্ষ গ্রাহকদের সেবা প্রদান করা। আমরা এমন একটি ভবিষ্যতের কল্পনা করি যেখানে প্রতিটি কৃষকের টেকসই বৃদ্ধির জন্য বাজার এবং প্রযুক্তিতে সরাসরি অ্যাক্সেস রয়েছে।' },
    'about.values_title': { en: 'Our Core Values', bn: 'আমাদের মূল মূল্যবোধ' },
    'about.values_subtitle': { en: 'What drives us every day', bn: 'প্রতিদিন আমাদের চালিত করে' },
    'about.value_farmer': { en: 'Farmer-Centric', bn: 'কৃষক-কেন্দ্রিক' },
    'about.value_farmer_desc': { en: 'We prioritize the well-being and fair compensation of farmers', bn: 'আমরা কৃষকদের কল্যাণ এবং ন্যায্য ক্ষতিপূরণকে অগ্রাধিকার দিই' },
    'about.value_quality': { en: 'Quality First', bn: 'গুণমান প্রথম' },
    'about.value_quality_desc': { en: 'Every product meets strict quality standards for consumer safety', bn: 'প্রতিটি পণ্য ভোক্তা সুরক্ষার জন্য কঠোর মান পূরণ করে' },
    'about.value_innovation': { en: 'Innovation', bn: 'উদ্ভাবন' },
    'about.value_innovation_desc': { en: 'Leveraging technology to improve agricultural practices', bn: 'কৃষি অনুশীলন উন্নত করতে প্রযুক্তি কাজে লাগানো' },
    'about.value_community': { en: 'Community', bn: 'সম্প্রদায়' },
    'about.value_community_desc': { en: 'Building a strong network of farmers, buyers, and agronomists', bn: 'কৃষক, ক্রেতা এবং কৃষিবিদদের একটি শক্তিশালী নেটওয়ার্ক তৈরি করা' },
    'about.why_title': { en: 'Why Choose AgroConnect?', bn: 'কেন AgroConnect বেছে নেবেন?' },
    'about.why_middlemen': { en: 'No Middlemen', bn: 'কোন মধ্যস্থতাকারী নেই' },
    'about.why_middlemen_desc': { en: 'Direct connection between farmers and buyers ensures better prices for farmers and fresher produce for customers.', bn: 'কৃষক এবং ক্রেতাদের মধ্যে সরাসরি সংযোগ কৃষকদের জন্য ভাল দাম এবং গ্রাহকদের জন্য তাজা পণ্য নিশ্চিত করে।' },
    'about.why_expert': { en: 'Expert Support', bn: 'বিশেষজ্ঞ সহায়তা' },
    'about.why_expert_desc': { en: 'Certified agronomists provide free consultation to help farmers improve crop quality and yield.', bn: 'সার্টিফাইড কৃষিবিদরা ফসলের গুণমান এবং ফলন উন্নত করতে কৃষকদের সাহায্য করার জন্য বিনামূল্যে পরামর্শ প্রদান করেন।' },
    'about.why_technology': { en: 'Technology Driven', bn: 'প্রযুক্তি চালিত' },
    'about.why_technology_desc': { en: 'Smart bidding system, real-time price tracking, and secure payments make transactions safe and transparent.', bn: 'স্মার্ট বিডিং সিস্টেম, রিয়েল-টাইম মূল্য ট্র্যাকিং এবং নিরাপদ পেমেন্ট লেনদেনকে নিরাপদ এবং স্বচ্ছ করে তোলে।' },
    'about.story_title': { en: 'Our Story', bn: 'আমাদের গল্প' },
    'about.story_p1': { en: 'AgroConnect was founded in 2024 with a simple vision: to transform Bangladesh\'s agricultural sector through technology and direct farmer-to-buyer connections.', bn: 'AgroConnect ২০২৪ সালে একটি সহজ দৃষ্টিভঙ্গি নিয়ে প্রতিষ্ঠিত হয়েছিল: প্রযুক্তি এবং সরাসরি কৃষক-থেকে-ক্রেতা সংযোগের মাধ্যমে বাংলাদেশের কৃষি খাতকে রূপান্তরিত করা।' },
    'about.story_p2': { en: 'Our founders, who have deep roots in farming communities, realized that farmers often struggle to get fair prices due to middlemen and lack of market information. Meanwhile, consumers face high prices and concerns about product freshness.', bn: 'আমাদের প্রতিষ্ঠাতারা, যাদের কৃষক সম্প্রদায়ে গভীর শিকড় রয়েছে, বুঝতে পেরেছিলেন যে মধ্যস্থতাকারী এবং বাজার তথ্যের অভাবের কারণে কৃষকরা প্রায়ই ন্যায্য মূল্য পেতে সংগ্রাম করেন। ইতিমধ্যে, ভোক্তারা উচ্চ মূল্য এবং পণ্যের সতেজতা নিয়ে উদ্বেগের মুখোমুখি হন।' },
    'about.story_p3': { en: 'Today, we\'re proud to serve thousands of farmers and buyers across Bangladesh, eliminating intermediaries and building trust in every transaction.', bn: 'আজ, আমরা বাংলাদেশ জুড়ে হাজার হাজার কৃষক এবং ক্রেতাদের সেবা করতে গর্বিত, মধ্যস্থতাকারীদের বাদ দিয়ে এবং প্রতিটি লেনদেনে বিশ্বাস তৈরি করছি।' },
    'about.team_title': { en: 'Our Team', bn: 'আমাদের দল' },
    'about.cta_title': { en: 'Join Our Movement', bn: 'আমাদের আন্দোলনে যোগ দিন' },
    'about.cta_subtitle': { en: 'Be part of transforming Bangladesh\'s agricultural sector. Whether you\'re a farmer or buyer, AgroConnect is your platform for success.', bn: 'বাংলাদেশের কৃষি খাত রূপান্তরের অংশ হন। আপনি কৃষক বা ক্রেতা যাই হোন না কেন, AgroConnect আপনার সাফল্যের প্ল্যাটফর্ম।' },
    'about.browse_products': { en: 'Browse Products', bn: 'পণ্য ব্রাউজ করুন' },
    'about.start_selling': { en: 'Start Selling', bn: 'বিক্রয় শুরু করুন' },

    // Categories
    'category.all': { en: 'All', bn: 'সব' },
    'category.rice': { en: 'Rice & Grains', bn: 'চাল ও শস্য' },
    'category.vegetables': { en: 'Vegetables', bn: 'সবজি' },
    'category.fruits': { en: 'Fruits', bn: 'ফল' },
    'category.spices': { en: 'Spices', bn: 'মশলা' },
    'category.pulses': { en: 'Pulses', bn: 'ডাল' },
    'category.fish': { en: 'Fish', bn: 'মাছ' },
    'category.items': { en: 'items', bn: 'আইটেম' },

    // Profile Page
    'profile.title': { en: 'My Profile', bn: 'আমার প্রোফাইল' },
    'profile.subtitle': { en: 'Manage your account information', bn: 'আপনার অ্যাকাউন্ট তথ্য পরিচালনা করুন' },
    'profile.personal_info': { en: 'Personal Information', bn: 'ব্যক্তিগত তথ্য' },
    'profile.location': { en: 'Location', bn: 'অবস্থান' },
    'profile.full_name': { en: 'Full Name', bn: 'সম্পূর্ণ নাম' },
    'profile.email': { en: 'Email', bn: 'ইমেইল' },
    'profile.phone': { en: 'Phone', bn: 'ফোন' },
    'profile.role': { en: 'Role', bn: 'ভূমিকা' },
    'profile.division': { en: 'Division', bn: 'বিভাগ' },
    'profile.district': { en: 'District', bn: 'জেলা' },
    'profile.upazila': { en: 'Upazila', bn: 'উপজেলা' },
    'profile.thana': { en: 'Thana', bn: 'থানা' },
    'profile.post_code': { en: 'Post Code', bn: 'পোস্ট কোড' },
    'profile.edit': { en: 'Edit Profile', bn: 'প্রোফাইল সম্পাদনা করুন' },
    'profile.save': { en: 'Save Changes', bn: 'পরিবর্তন সংরক্ষণ করুন' },
    'profile.cancel': { en: 'Cancel', bn: 'বাতিল' },
    'profile.not_provided': { en: 'Not provided', bn: 'প্রদান করা হয়নি' },
    'profile.select_division': { en: 'Select Division', bn: 'বিভাগ নির্বাচন করুন' },
    'profile.select_district': { en: 'Select District', bn: 'জেলা নির্বাচন করুন' },
    'profile.select_upazila': { en: 'Select Upazila', bn: 'উপজেলা নির্বাচন করুন' },
    'profile.success': { en: 'Profile updated successfully!', bn: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে!' },
    'profile.error': { en: 'Failed to update profile', bn: 'প্রোফাইল আপডেট করতে ব্যর্থ' },
    'profile.saving': { en: 'Saving...', bn: 'সংরক্ষণ করছি...' },
    'profile.placeholder_post_code': { en: 'Post Code (numbers only)', bn: 'পোস্ট কোড (শুধুমাত্র সংখ্যা)' },
    'profile.placeholder_thana': { en: 'Thana (can type manually)', bn: 'থানা (ম্যানুয়ালি টাইপ করা যাবে)' },

    // Market Prices
    'prices.title': { en: 'Current Market Prices', bn: 'বর্তমান বাজার মূল্য' },
    'prices.subtitle': { en: 'Real-time agricultural commodity prices across Bangladesh', bn: 'বাংলাদেশ জুড়ে রিয়েল-টাইম কৃষি পণ্যের মূল্য' },
    'prices.search': { en: 'Search by crop name...', bn: 'ফসলের নাম দ্বারা অনুসন্ধান করুন...' },
    'prices.crop': { en: 'Crop Name', bn: 'ফসলের নাম' },
    'prices.district': { en: 'District', bn: 'জেলা' },
    'prices.wholesale': { en: 'Wholesale Price (৳/kg)', bn: 'পাইকারি মূল্য (৳/কেজি)' },
    'prices.retail': { en: 'Retail Price (৳/kg)', bn: 'খুচরা মূল্য (৳/কেজি)' },
    'prices.change': { en: 'Change', bn: 'পরিবর্তন' },
    'prices.updated': { en: 'Updated', bn: 'আপডেট করা হয়েছে' },

    // Blogs
    'blogs.title': { en: 'Blogs & Tips', bn: 'ব্লগ ও পরামর্শ' },
    'blogs.subtitle': { en: 'Expert advice, market insights, and farming best practices', bn: 'বিশেষজ্ঞ পরামর্শ, বাজার অন্তর্দৃষ্টি এবং কৃষি সেরা অনুশীলন' },
    'blogs.search': { en: 'Search articles...', bn: 'নিবন্ধ অনুসন্ধান করুন...' },
    'blogs.read_more': { en: 'Read More', bn: 'আরও পড়ুন' },

    // Roles
    'role.farmer': { en: 'Farmer', bn: 'কৃষক' },
    'role.buyer': { en: 'Buyer', bn: 'ক্রেতা' },
    'role.customer': { en: 'Customer', bn: 'গ্রাহক' },
    'role.admin': { en: 'Admin', bn: 'প্রশাসক' },
    'role.agronomist': { en: 'Agronomist', bn: 'কৃষিবিজ্ঞানী' },

    // Common
    'common.loading': { en: 'Loading...', bn: 'লোড হচ্ছে...' },

    // Dashboard Common
    'dashboard.overview': { en: 'Overview', bn: 'সারসংক্ষেপ' },
    'dashboard.add_crop': { en: 'Add Crop', bn: 'ফসল যোগ করুন' },
    'dashboard.my_crops': { en: 'My Crops', bn: 'আমার ফসল' },
    'dashboard.orders': { en: 'Orders', bn: 'অর্ডার তালিকা' },
    'dashboard.exports': { en: 'Exports', bn: 'রপ্তানি' },
    'dashboard.bids': { en: 'Bids', bn: 'বিড সমূহ' },
    'dashboard.messages': { en: 'Messages', bn: 'বার্তা' },
    'dashboard.wallet': { en: 'Wallet', bn: 'ওয়ালেট' },
    'dashboard.ai_chat': { en: 'AI Assistant', bn: 'এআই সহকারী' },
    'dashboard.settings': { en: 'Settings', bn: 'সেটিংস' },
    'dashboard.logout': { en: 'Logout', bn: 'লগআউট' },
    'dashboard.title': { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
    'dashboard.subtitle': { en: 'Manage your farming activities efficiently', bn: 'আপনার কৃষি কার্যক্রম দক্ষতার সাথে পরিচালনা করুন' },

    // Farmer Dashboard
    'farmer.add_crop': { en: 'Add Crop', bn: 'ফসল যোগ করুন' },
    'farmer.total_crops': { en: 'Total Crops', bn: 'মোট ফসল' },
    'farmer.total_orders': { en: 'Total Orders', bn: 'মোট অর্ডার' },
    'farmer.pending_money': { en: 'Pending Amount', bn: 'অপেক্ষমাণ টাকা' },
    'farmer.total_income': { en: 'Total Income', bn: 'মোট আয়' },
    'farmer.sales_overview': { en: 'Sales Overview', bn: 'বিক্রয় সারসংক্ষেপ' },
    'farmer.sales_desc': { en: 'Income statistics for the last few days', bn: 'গত কয়েক দিনের আয়ের পরিসংখ্যান' },
    'farmer.crop_dist': { en: 'Crop Distribution', bn: 'ফসল বণ্টন' },
    'farmer.crop_dist_desc': { en: 'Distribution of crops in stock', bn: 'মজুদ ফসলের বণ্টন' },
    'farmer.todays_market': { en: 'Today\'s Market Price', bn: 'আজকের বাজার দর' },
    'farmer.market_desc': { en: 'Government market rates (per kg/unit)', bn: 'সরকারি বাজার দর (প্রতি কেজি/একক)' },
    'farmer.recent_orders': { en: 'Recent Orders', bn: 'সাম্প্রতিক অর্ডার' },
    'farmer.pending_bids': { en: 'Pending Bids', bn: 'অপেক্ষমাণ বিড' },
    'farmer.transaction_history': { en: 'Transaction History', bn: 'লেনদেনের ইতিহাস' },
    'farmer.cashout_history': { en: 'Cashout History', bn: 'উত্তোলনের ইতিহাস' },
    'farmer.no_data': { en: 'No data available', bn: 'কোন তথ্য নেই' },
    'farmer.accept': { en: 'Accept', bn: 'গ্রহণ করুন' },
    'farmer.reject': { en: 'Reject', bn: 'প্রত্যাখ্যান করুন' },

    // Marketplace
    'market.retail_title': { en: 'Retail Shop', bn: 'খুচরা দোকান' },
    'market.retail_subtitle': { en: 'Quality products curated by our team', bn: 'আমাদের টিম দ্বারা নির্বাচিত মানের পণ্য' },
    'market.b2b_title': { en: 'B2B Marketplace', bn: 'পাইকারি বাজার' },
    'market.b2b_subtitle': { en: 'Wholesale marketplace for farmers and buyers', bn: 'কৃষক ও ক্রেতাদের জন্য পাইকারি বাজার' },
    'market.search_placeholder': { en: 'Search for products...', bn: 'পণ্য অনুসন্ধান করুন...' },
    'market.filter_category': { en: 'Categories', bn: 'বিভাগ' },
    'market.sort_latest': { en: 'Sort by: Latest', bn: 'সাজান: নতুন' },
    'market.sort_low_high': { en: 'Price: Low to High', bn: 'মূল্য: কম থেকে বেশি' },
    'market.sort_high_low': { en: 'Price: High to Low', bn: 'মূল্য: বেশি থেকে কম' },
    'market.showing': { en: 'Showing', bn: 'দেখানো হচ্ছে' },
    'market.products': { en: 'products', bn: 'টি পণ্য' },
    'market.buy_now': { en: 'Buy Now', bn: 'এখনই কিনুন' },
    'market.place_bid': { en: 'Place Bid', bn: 'বিড করুন' },
    'market.min_order': { en: 'Min Order', bn: 'নূন্যতম অর্ডার' },
    'market.available': { en: 'Available', bn: 'মজুদ' },
    'market.login_bid': { en: 'Login to Bid', bn: 'বিড করতে লগইন করুন' },
    'market.wholesale_badge': { en: 'Wholesale', bn: 'পাইকারি' },

    // B2B Marketplace
    'b2b.title': { en: 'B2B Marketplace', bn: 'পাইকারি বাজার' },
    'b2b.subtitle': { en: 'Wholesale marketplace for bulk agricultural products', bn: 'পাইকারি কৃষি পণ্যের বাজার' },
    'b2b.search_placeholder': { en: 'Search for bulk crops...', bn: 'পাইকারি ফসল অনুসন্ধান করুন...' },
    'b2b.buyer_msg_title': { en: 'Welcome, Buyer', bn: 'স্বাগতম, ক্রেতা' },
    'b2b.buyer_msg_desc': { en: 'Browse and bid on bulk agricultural products', bn: 'পাইকারি কৃষি পণ্যে ব্রাউজ ও বিড করুন' },
    'b2b.admin_msg': { en: 'Admin Mode - You can manage all products', bn: 'এডমিন মোড - আপনি সব পণ্য পরিচালনা করতে পারেন' },
    'b2b.farmer_msg': { en: 'List your crops for bulk sale to buyers', bn: 'ক্রেতাদের কাছে পাইকারি বিক্রির জন্য আপনার ফসল তালিকাভুক্ত করুন' },
    'b2b.guest_msg_1': { en: 'Want to buy or sell in bulk?', bn: 'পাইকারি কিনতে বা বিক্রি করতে চান?' },
    'b2b.guest_msg_2': { en: 'to get started!', bn: 'শুরু করতে!' },
    'b2b.register_farmer': { en: 'Register as Farmer', bn: 'কৃষক হিসেবে নিবন্ধন করুন' },
    'b2b.register_buyer': { en: 'Register as Buyer', bn: 'ক্রেতা হিসেবে নিবন্ধন করুন' },
    'b2b.or': { en: 'or', bn: 'অথবা' },
    'b2b.wholesale': { en: 'Wholesale', bn: 'পাইকারি' },
    'b2b.min_price': { en: 'Minimum Price', bn: 'নূন্যতম মূল্য' },
    'b2b.place_bid': { en: 'Place Bid', bn: 'বিড করুন' },
    'b2b.login_to_bid': { en: 'Login to Bid', bn: 'বিড করতে লগইন করুন' },
    'b2b.categories': { en: 'Categories', bn: 'বিভাগসমূহ' },
    'b2b.all_categories': { en: 'All Categories', bn: 'সব বিভাগ' },

    // Retail Marketplace
    'retail.title': { en: 'Retail Shop', bn: 'খুচরা দোকান' },
    'retail.subtitle': { en: 'Fresh farm products delivered to your doorstep', bn: 'তাজা কৃষি পণ্য আপনার দোরগোড়ায়' },
    'retail.add_product': { en: 'Add Product', bn: 'পণ্য যোগ করুন' },
    'retail.search_placeholder': { en: 'Search for products...', bn: 'পণ্য অনুসন্ধান করুন...' },
    'retail.all_districts': { en: 'All Districts', bn: 'সব জেলা' },
    'retail.categories': { en: 'Categories', bn: 'বিভাগসমূহ' },
    'retail.all_categories': { en: 'All Categories', bn: 'সব বিভাগ' },
    'retail.showing': { en: 'Showing', bn: 'দেখানো হচ্ছে' },
    'retail.products': { en: 'products', bn: 'টি পণ্য' },
    'retail.no_products': { en: 'No Products Found', bn: 'কোন পণ্য পাওয়া যায়নি' },
    'retail.no_products_desc': { en: 'Try adjusting your search or filter to find what you are looking for.', bn: 'আপনি যা খুঁজছেন তা খুঁজে পেতে অনুসন্ধান বা ফিল্টার সামঞ্জস্য করার চেষ্টা করুন।' },
    'retail.clear_filters': { en: 'Clear Filters', bn: 'ফিল্টার মুছুন' },
    'retail.price': { en: 'Price', bn: 'মূল্য' },
    'retail.stock': { en: 'In Stock', bn: 'মজুদ আছে' },
    'retail.buy_now': { en: 'Buy Now', bn: 'এখনই কিনুন' },
    'retail.out_of_stock': { en: 'Out of Stock', bn: 'স্টক নেই' },

    // Admin
    'admin.add_product': { en: 'Add Product', bn: 'পণ্য যোগ করুন' },
    'admin.manage_products': { en: 'Manage Products', bn: 'পণ্য পরিচালনা করুন' },

    // Common Actions
    'action.edit': { en: 'Edit', bn: 'সম্পাদনা' },
    'action.delete': { en: 'Delete', bn: 'মুছুন' },
    'action.save': { en: 'Save', bn: 'সংরক্ষণ' },
    'action.cancel': { en: 'Cancel', bn: 'বাতিল' },
    'action.view': { en: 'View', bn: 'দেখুন' },
    'action.clear_filters': { en: 'Clear Filters', bn: 'ফিল্টার মুছুন' },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('agro_language') as Language;
        return saved || 'en';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('agro_language', lang);
        document.documentElement.lang = lang;
    };

    const t = (key: string): string => {
        const trans = translations[key];
        if (!trans) return key;
        return trans[language] || trans.en;
    };

    useEffect(() => {
        document.documentElement.lang = language;
        if (language === 'bn') {
            document.body.classList.add('font-bangla');
        } else {
            document.body.classList.remove('font-bangla');
        }
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};
