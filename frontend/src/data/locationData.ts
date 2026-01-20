
export const locationData: Record<string, {
    division: string;
    divisionbn: string;
    districts: {
        district: string;
        districtbn: string;
        upazillas: string[];
    }[];
}> = {
    "Dhaka": {
        division: "Dhaka",
        divisionbn: "ঢাকা",
        districts: [
            {
                district: "Dhaka",
                districtbn: "ঢাকা",
                upazillas: ["Savar", "Dhamrai", "Keraniganj", "Nawabganj", "Dohar", "Tejgaon", "Ramna", "Gulshan", "Mirpur", "Pallabi", "Mohammadpur", "Dhanmondi"]
            },
            {
                district: "Faridpur",
                districtbn: "ফরিদুপুর",
                upazillas: ["Faridpur Sadar", "Boalmari", "Alfadanga", "Madhukhali", "Bhanga", "Nagarkanda", "Charbhadrasan", "Sadarpur", "Shaltha"]
            },
            {
                district: "Gazipur",
                districtbn: "গাজীপুর",
                upazillas: ["Gazipur Sadar", "Kaliakuir", "Kaliganj", "Kapasia", "Sreepur"]
            },
            {
                district: "Gopalganj",
                districtbn: "গোপালগঞ্জ",
                upazillas: ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"]
            },
            {
                district: "Kishoreganj",
                districtbn: "কিশোরগঞ্জ",
                upazillas: ["Kishoreganj Sadar", "Hossainpur", "Pakundia", "Katiadi", "Karimganj", "Tarail", "Itna", "Mithamoin", "Austagram", "Nikli", "Bajitpur", "Kuliarchar", "Bhairab"]
            },
            {
                district: "Madaripur",
                districtbn: "মাদারীপুর",
                upazillas: ["Madaripur Sadar", "Kalkini", "Rajoir", "Shibchar"]
            },
            {
                district: "Manikganj",
                districtbn: "মানিকগঞ্জ",
                upazillas: ["Manikganj Sadar", "Singair", "Shibalaya", "Saturia", "Harirampur", "Ghior", "Daulatpur"]
            },
            {
                district: "Munshiganj",
                districtbn: "মুন্সিগঞ্জ",
                upazillas: ["Munshiganj Sadar", "Sreenagar", "Sirajdikhan", "Louhajang", "Gajaria", "Tongibari"]
            },
            {
                district: "Narayanganj",
                districtbn: "নারায়ণগঞ্জ",
                upazillas: ["Narayanganj Sadar", "Bandar", "Araihazar", "Rupganj", "Sonargaon"]
            },
            {
                district: "Narsingdi",
                districtbn: "নরসিংদী",
                upazillas: ["Narsingdi Sadar", "Belabo", "Monohardi", "Palash", "Raipura", "Shibpur"]
            },
            {
                district: "Rajbari",
                districtbn: "রাজবাড়ী",
                upazillas: ["Rajbari Sadar", "Goalanda", "Pangsha", "Baliakandi", "Kalukhali"]
            },
            {
                district: "Shariatpur",
                districtbn: "শরীয়তপুর",
                upazillas: ["Shariatpur Sadar", "Naria", "Zajira", "Gosairhat", "Bhedarganj", "Damudya"]
            },
            {
                district: "Tangail",
                districtbn: "টাঙ্গাইল",
                upazillas: ["Tangail Sadar", "Sakhipur", "Basail", "Madhupur", "Ghatail", "Kalihati", "Nagarpur", "Mirzapur", "Gopalpur", "Delduar", "Bhuapur", "Dhanbari"]
            }
        ]
    },
    "Chattogram": {
        division: "Chattogram",
        divisionbn: "চট্টগ্রাম",
        districts: [
            {
                district: "Chattogram",
                districtbn: "চট্টগ্রাম",
                upazillas: ["Chattogram Sadar", "Sitakunda", "Mirsharai", "Sandwip", "Fatikchhari", "Hathazari", "Raozan", "Rangunia", "Boalkhali", "Patiya", "Banshkhali", "Anwara", "Chandanaish", "Satkania", "Lohagara"]
            },
            {
                district: "Cox's Bazar",
                districtbn: "কক্সবাজার",
                upazillas: ["Cox's Bazar Sadar", "Chakaria", "Kutubdia", "Ukhia", "Moheshkhali", "Pekua", "Ramu", "Teknaf"]
            },
            {
                district: "Cumilla",
                districtbn: "কুমিল্লা",
                upazillas: ["Cumilla Sadar", "Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram", "Daudkandi", "Debidwar", "Homna", "Laksam", "Muradnagar", "Nangalkot", "Meghna", "Titas", "Monohargonj", "Sadar Dakshin"]
            },
            {
                district: "Brahmanbaria",
                districtbn: "ব্রাহ্মণবাড়িয়া",
                upazillas: ["Brahmanbaria Sadar", "Ashuganj", "Nasirnagar", "Nabinagar", "Sarail", "Kasba", "Akhaura", "Bancharampur", "Bijoynagar"]
            },
            {
                district: "Chandpur",
                districtbn: "চাঁদপুর",
                upazillas: ["Chandpur Sadar", "Nasirnagar", "Nabinagar", "Sarail", "Kasba", "Akhaura", "Bancharampur", "Bijoynagar"]
            },
            {
                district: "Lakshmipur",
                districtbn: "লক্ষীপুর",
                upazillas: ["Lakshmipur Sadar", "Raipur", "Ramganj", "Ramgati", "Kamalnagar"]
            },
            {
                district: "Noakhali",
                districtbn: "নোয়াখালী",
                upazillas: ["Noakhali Sadar", "Begumganj", "Chatkhil", "Companiganj", "Hatiya", "Senbagh", "Sonaimuri", "Subarnachar", "Kabirhat"]
            },
            {
                district: "Feni",
                districtbn: "ফেনী",
                upazillas: ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Parshuram", "Fulgazi", "Sonagazi"]
            },
            {
                district: "Khagrachhari",
                districtbn: "খাগড়াছড়ি",
                upazillas: ["Khagrachhari Sadar", "Dighinala", "Panchhari", "Laxmichhari", "Mahalchhari", "Manikchhari", "Ramgarh", "Matiranga"]
            },
            {
                district: "Rangamati",
                districtbn: "রাঙ্গামাটি",
                upazillas: ["Rangamati Sadar", "Belaichhari", "Bagaichhari", "Barkal", "Juraichhari", "Rajasthali", "Kaptai", "Langadu", "Naniarchar", "Kaukhali"]
            },
            {
                district: "Bandarban",
                districtbn: "বান্দরবান",
                upazillas: ["Bandarban Sadar", "Alikadam", "Naikhongchhari", "Rowangchhari", "Lama", "Ruma", "Thanchi"]
            }
        ]
    },
    // Add other divisions as necessary, but these are the main ones populated for now
     "Rajshahi": {
        division: "Rajshahi",
        divisionbn: "রাজশাহী",
        districts: [
            {
                district: "Rajshahi",
                districtbn: "রাজশাহী",
                upazillas: ["Paba", "Durgapur", "Mohanpur", "Charghat", "Puthia", "Bagha", "Godagari", "Tanore", "Bagmara"]
            },
             {
                district: "Mymensingh",
                districtbn: "ময়মনসিংহ",
                upazillas: ["Mymensingh Sadar", "Muktagachha", "Valuka", "Haluaghat", "Gouripur", "Dhobaura", "Phulpur", "Nandail", "Trishal", "Ishwarganj", "Bhaluka", "Gafargaon"]
            },
            {
                district: "Sirajganj",
                districtbn: "সিরাজগঞ্জ",
                upazillas: ["Sirajganj Sadar", "Kazipur", "Ullapara", "Shahjadpur", "Raiganj", "Kamarkhanda", "Tarash", "Belkuchi", "Chauhali"]
            },
             {
                district: "Pabna",
                districtbn: "পাবনা",
                upazillas: ["Pabna Sadar", "Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Santhia", "Sujanagar"]
            },
             {
                district: "Bogura",
                districtbn: "বগুড়া",
                upazillas: ["Bogura Sadar", "Shibganj", "Sonatola", "Gabtali", "Kahaloo", "Dhunat", "Adamdighi", "Nandigram", "Sariakandi", "Sherpur", "Dupchanchia"]
            },
             {
                district: "Chapainawabganj",
                districtbn: "চাঁপাইনবাবগঞ্জ",
                upazillas: ["Chapainawabganj Sadar", "Gomastapur", "Nachole", "Bholahat", "Shibganj"]
            },
             {
                district: "Naogaon",
                districtbn: "নওগাঁ",
                upazillas: ["Naogaon Sadar", "Mohadevpur", "Manda", "Niamatpur", "Porsha", "Sapahar", "Patnitala", "Dhamoirhat", "Badalgachhi", "Raninagar", "Atrai"]
            },
             {
                district: "Natore",
                districtbn: "নাটোর",
                upazillas: ["Natore Sadar", "Baraigram", "Bagatipara", "Lalpur", "Naldanga", "Singra", "Gurudaspur"]
            },
             {
                district: "Joypurhat",
                districtbn: "জয়পুরহাট",
                upazillas: ["Joypurhat Sadar", "Akkelpur", "Kalai", "Khetlal", "Panchbibi"]
            }
        ]
    },
    // Adding minimal data for others to prevent errors if selected
    "Khulna": {
        division: "Khulna",
        divisionbn: "খুলনা",
        districts: [
            { district: "Khulna", districtbn: "খুলনা", upazillas: ["Khulna Sadar", "Daulatpur", "Khalishpur"] },
            { district: "Jessore", districtbn: "যশোর", upazillas: ["Jessore Sadar", "Jhikargachha", "Bagherpara"] },
            { district: "Satkhira", districtbn: "সাতক্ষীরা", upazillas: ["Satkhira Sadar", "Assasuni", "Debhata"] },
            { district: "Meherpur", districtbn: "মেহেরপুর", upazillas: ["Meherpur Sadar", "Gangni", "Mujibnagar"] },
            { district: "Narail", districtbn: "নড়াইল", upazillas: ["Narail Sadar", "Lohagara", "Kalia"] },
            { district: "Chuadanga", districtbn: "চুয়াডাঙ্গা", upazillas: ["Chuadanga Sadar", "Alamdanga", "Damurhuda", "Jibannagar"] },
            { district: "Kushtia", districtbn: "কুষ্টিয়া", upazillas: ["Kushtia Sadar", "Kumarkhali", "Khoksa", "Mirpur", "Daulatpur", "Bheramara"] },
            { district: "Magura", districtbn: "মাগুরা", upazillas: ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"] },
            { district: "Bagerhat", districtbn: "বাগেরহাট", upazillas: ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"] },
            { district: "Jhenaidah", districtbn: "ঝিনাইদহ", upazillas: ["Jhenaidah Sadar", "Harinakunda", "Shailkupa", "Maheshpur", "Kaliganj", "Kotchandpur"] }
        ]
    },
    "Barishal": {
        division: "Barishal",
        divisionbn: "বরিশাল",
        districts: [
             { district: "Barishal", districtbn: "বরিশাল", upazillas: ["Barishal Sadar", "Bakerganj", "Babuganj", "Wazirpur", "Banaripara", "Gournadi", "Agailjhara", "Mehendiganj", "Muladi", "Hizla"] },
             { district: "Barguna", districtbn: "বরগুনা", upazillas: ["Barguna Sadar", "Amtali", "Betagi", "Bamna", "Patharghata", "Taltali"] },
             { district: "Bhola", districtbn: "ভোলা", upazillas: ["Bhola Sadar", "Daulatkhan", "Burhanuddin", "Tazumuddin", "Lalmohan", "Char Fasson", "Monpura"] },
             { district: "Jhalokati", districtbn: "ঝালকাঠি", upazillas: ["Jhalokati Sadar", "Kathalia", "Nalchity", "Rajapur"] },
             { district: "Patuakhali", districtbn: "পটুয়াখালী", upazillas: ["Patuakhali Sadar", "Bauphal", "Dashmina", "Galachipa", "Kalapara", "Mirzaganj", "Rangabali", "Dumki"] },
             { district: "Pirojpur", districtbn: "পিরোজপুর", upazillas: ["Pirojpur Sadar", "Bhandaria", "Kawkhali", "Indurkani", "Mathbaria", "Nazirpur", "Nesarabad"] }
        ]
    },
    "Sylhet": {
        division: "Sylhet",
        divisionbn: "সিলেট",
        districts: [
            { district: "Sylhet", districtbn: "সিলেট", upazillas: ["Sylhet Sadar", "Beanibazar", "Bishwanath", "Companiganj", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Osmani Nagar", "South Surma", "Zakiganj"] },
            { district: "Moulvibazar", districtbn: "মৌলভীবাজার", upazillas: ["Moulvibazar Sadar", "Barlekha", "Juri", "Kamalganj", "Kulaura", "Rajnagar", "Sreemangal"] },
            { district: "Habiganj", districtbn: "হবিগঞ্জ", upazillas: ["Habiganj Sadar", "Azmiriganj", "Bahubal", "Baniyachong", "Chunarughat", "Lakhai", "Madhabpur", "Nabiganj", "Shayestaganj"] },
            { district: "Sunamganj", districtbn: "সুনামগঞ্জ", upazillas: ["Sunamganj Sadar", "Bishwamvarpur", "Chhatak", "Dakshin Sunamganj", "Derai", "Dharamapasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Sullah", "Tahirpur"] }
        ]
    },
    "Rangpur": {
        division: "Rangpur",
        divisionbn: "রংপুর",
        districts: [
            { district: "Rangpur", districtbn: "রংপুর", upazillas: ["Rangpur Sadar", "Badarganj", "Gangachara", "Kaunia", "Mithapukur", "Pirgachha", "Pirganj", "Taraganj"] },
            { district: "Dinajpur", districtbn: "দিনাজপুর", upazillas: ["Dinajpur Sadar", "Birampur", "Birganj", "Bochaganj", "Chirirbandar", "Fulbari", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur"] },
            { district: "Gaibandha", districtbn: "গাইবান্ধা", upazillas: ["Gaibandha Sadar", "Fulchhari", "Gobindaganj", "Palashbari", "Sadullapur", "Saghata", "Sundarganj"] },
            { district: "Kurigram", districtbn: "কুড়িগ্রাম", upazillas: ["Kurigram Sadar", "Bhurungamari", "Char Rajibpur", "Chilmari", "Nageshwari", "Phulbari", "Rajarhat", "Rowmari", "Ulipur"] },
            { district: "Lalmonirhat", districtbn: "লালমনিরহাট", upazillas: ["Lalmonirhat Sadar", "Aditmari", "Hatibandha", "Kaliganj", "Patgram"] },
            { district: "Nilphamari", districtbn: "নীলফামারী", upazillas: ["Nilphamari Sadar", "Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Saidpur"] },
            { district: "Panchagarh", districtbn: "পঞ্চগড়", upazillas: ["Panchagarh Sadar", "Atwari", "Boda", "Debiganj", "Tetulia"] },
            { district: "Thakurgaon", districtbn: "ঠাকুরগাঁও", upazillas: ["Thakurgaon Sadar", "Baliadangi", "Haripur", "Pirganj", "Ranisankail"] }
        ]
    },
    "Mymensingh": {
        division: "Mymensingh",
        divisionbn: "ময়মনসিংহ",
        districts: [
            { district: "Mymensingh", districtbn: "ময়মনসিংহ", upazillas: ["Mymensingh Sadar", "Muktagachha", "Valuka", "Haluaghat", "Gouripur", "Dhobaura", "Phulpur", "Nandail", "Trishal", "Ishwarganj", "Bhaluka", "Gafargaon"] },
            { district: "Jamalpur", districtbn: "জামালপুর", upazillas: ["Jamalpur Sadar", "Bakshiganj", "Dewanganj", "Islampur", "Madarganj", "Melandaha", "Sarishabari"] },
            { district: "Netrokona", districtbn: "নেত্রকোণা", upazillas: ["Netrokona Sadar", "Atpara", "Barhatta", "Durgapur", "Khaliajuri", "Kalmakanda", "Kendua", "Madan", "Mohanganj", "Purbadhala"] },
            { district: "Sherpur", districtbn: "শেরপুর", upazillas: ["Sherpur Sadar", "Jhenaigati", "Nakla", "Nalitabari", "Sreebardi"] }
        ]
    }
};
