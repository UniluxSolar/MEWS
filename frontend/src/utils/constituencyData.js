/**
 * District to Constituency Mapping for Telangana
 */
export const districtConstituencies = {
    "Adilabad": ["Adilabad", "Boath"],
    "Bhadradri Kothagudem": ["Aswaraopeta", "Bhadrachalam", "Kothagudem", "Pinapaka", "Yellandu"],
    "Hyderabad": [
        "Amberpet", "Bahadurpura", "Chandrayangutta", "Charminar", "Goshamahal",
        "Jubilee Hills", "Karwan", "Khairatabad", "Malakpet", "Musheerabad",
        "Nampally", "Sanathnagar", "Secunderabad", "Secunderabad Cantonment", "Yakutpura"
    ],
    "Jagtial": ["Dharmapuri", "Jagtial", "Koratla"],
    "Jangaon": ["Ghanpur (Station)", "Jangoan", "Palakurthi"],
    "Jayashankar Bhupalpally": ["Bhupalpalle", "Manthani"],
    "Jogulamba Gadwal": ["Alampur", "Gadwal"],
    "Kamareddy": ["Banswada", "Jukkal", "Kamareddy", "Yellareddy"],
    "Karimnagar": ["Choppadandi", "Huzurabad", "Karimnagar", "Manakondur"],
    "Khammam": ["Khammam", "Madhira", "Palair", "Sathupalli", "Wyra"],
    "Kumuram Bheem Asifabad": ["Asifabad", "Sirpur"],
    "Mahabubabad": ["Dornakal", "Mahabubabad"],
    "Mahabubnagar": ["Devarkadra", "Jadcherla", "Mahbubnagar", "Narayanpet", "Makthal"], // Note: Narayanpet is now a district but listing here for compatibility if needed
    "Mancherial": ["Bellampalli", "Chennur", "Mancherial"],
    "Medak": ["Medak", "Narsapur"],
    "Medchal Malkajgiri": ["Kukatpally", "Malkajgiri", "Medchal", "Quthbullapur", "Uppal"],
    "Mulugu": ["Mulug"],
    "Nagarkurnool": ["Achampet", "Kalwakurthy", "Kollapur", "Nagarkurnool"],
    "Nalgonda": ["Devarakonda", "Miryalaguda", "Munugode", "Nagarjuna Sagar", "Nakrekal", "Nalgonda"],
    "Narayanpet": ["Makthal", "Narayanpet"],
    "Nirmal": ["Khanapur", "Mudhole", "Nirmal"],
    "Nizamabad": ["Armur", "Balkonda", "Bodhan", "Nizamabad (Rural)", "Nizamabad (Urban)"],
    "Peddapalli": ["Manthani", "Peddapalli", "Ramagundam"],
    "Rajanna Sircilla": ["Sircilla", "Vemulawada"],
    "Ranga Reddy": [ // Variation: Rangareddy
        "Chevella", "Ibrahimpatnam", "Lal Bahadur Nagar", "Maheswaram",
        "Rajendranagar", "Serilingampally", "Shadnagar"
    ],
    "Sangareddy": ["Andole", "Narayankhed", "Patancheru", "Sangareddy", "Zahirabad"],
    "Siddipet": ["Dubbak", "Gajwel", "Husnabad", "Siddipet"],
    "Suryapet": ["Huzurnagar", "Kodad", "Suryapet", "Thungathurthi"],
    "Vikarabad": ["Chevella", "Kodangal", "Pargi", "Tandur", "Vicarabad"],
    "Wanaparthy": ["Wanaparthy"],
    "Warangal Rural": ["Narsampet", "Parkal"],
    "Warangal Urban": ["Warangal East", "Warangal West", "Wardhannapet"], // Sometimes Hanumakonda
    "Hanumakonda": ["Warangal East", "Warangal West", "Wardhannapet"], // Alias
    "Warangal": ["Warangal East", "Warangal West", "Wardhannapet", "Narsampet", "Parkal"], // Fallback
    "Yadadri Bhuvanagiri": ["Alair", "Bhongir"],

    // Aliases for partial/likely API mismatches
    "Yadadri Bhpngiri": ["Alair", "Bhongir"], // User reported typo
    "Yadadri Bhongiri": ["Alair", "Bhongir"], // Common spelling
    "Yadadri": ["Alair", "Bhongir"],
    "Bhadradri": ["Aswaraopeta", "Bhadrachalam", "Kothagudem", "Pinapaka", "Yellandu"],
    "Komaram Bheem": ["Asifabad", "Sirpur"],
    "Kumuram Bheem": ["Asifabad", "Sirpur"]
};

// Flattened list for fallback
export const allConstituencies = Object.values(districtConstituencies).flat().sort();

/**
 * Mapping of Assembly Constituency to Mandals
 * Note: This is a static mapping. In a production system, this ideally comes from the DB.
 * Currently populated for KHAMMAM District as per priority.
 */
export const constituencyMandals = {
    // KHAMMAM District
    "Khammam": ["Khammam (Urban)", "Khammam (Rural)", "Raghunathapalem"],
    "Palair": ["Kusumanchi", "Thirumalayapalem", "Nelakondapalli", "Khammam Rural"], // Overlap possible
    "Madhira": ["Madhira", "Bonakal", "Chinthakani", "Yerrupalem", "Mudigonda"],
    "Wyra": ["Wyra", "Konijerla", "Enkoor", "Julurpad", "Singareni"],
    "Sathupalli": ["Sathupalli", "Vemsoor", "Kallur", "Tallada", "Penuballi"],

    // BHADRADRI KOTHAGUDEM District
    "Kothagudem": ["Kothagudem", "Paloncha", "Suijathanagar", "Chunchupally", "Laxmidevipally"],
    "Bhadrachalam": ["Bhadrachalam", "Dummugudem", "Cherla", "Venkatapuram", "Wazeed"],
    "Pinapaka": ["Pinapaka", "Manuguru", "Gundala", "Burgampahad", "Aswapuram"],
    "Yellandu": ["Yellandu", "Kamepalli", "Bayyaram", "Tekulapally", "Garla"],
    "Aswaraopeta": ["Aswaraopeta", "Dammapeta", "Chandrugonda", "Mulkalapally"],

    // YADADRI BHUVANAGIRI District
    "Alair": ["Alair", "Rajapet", "Turkapally", "Yadagirigutta", "Bommalaramaram", "Gundala"],
    "Bhongir": ["Bhongir", "Bibinagar", "Bhoodan Pochampally", "Valigonda"],

    // KOMARAM BHEEM ASIFABAD District
    "Asifabad": ["Asifabad", "Jainoor", "Kerameri", "Lingapur", "Sirpur (U)", "Tiryani", "Rebbena", "Wankidi"],
    "Sirpur": ["Sirpur (T)", "Koutala", "Chintalamanepalli", "Dahegaon", "Bejjur", "Penchikalpet", "Kagaznagar"],

    // MEDCHAL MALKAJGIRI District
    "Medchal": ["Medchal", "Shamirpet", "Ghatkesar", "Keesara", "Medipally", "Kapra", "Muduchinthalapalli"],
    "Malkajgiri": ["Malkajgiri", "Alwal"],
    "Uppal": ["Uppal", "Kapra"],
    "Kukatpally": ["Kukatpally", "Balanagar"],
    "Quthbullapur": ["Quthbullapur", "Gajularamaram", "Dundigal Gandimaisamma"],

    // RANGA REDDY District
    "Rajendranagar": ["Rajendranagar", "Shamshabad", "Gandipet"],
    "Maheshwaram": ["Maheshwaram", "Kandukur", "Kadthal"],
    "Ibrahimpatnam": ["Ibrahimpatnam", "Manchal", "Yacharam", "Abdullapurmet"],
    "Chevella": ["Chevella", "Shabad", "Moinabad", "Shankarpally"],
    "Serilingampally": ["Serilingampally"],
    "Lal Bahadur Nagar": ["Saroornagar", "Hayathnagar"],
    "Shadnagar": ["Farooqnagar", "Kothur", "Keshampet", "Kondurg", "Chowdergudem", "Nandigama"],

    // HYDERABAD District (Mapping Mandals often 1:1 or grouped)
    "Amberpet": ["Amberpet"],
    "Bahadurpura": ["Bahadurpura"],
    "Chandrayangutta": ["Chandrayangutta"],
    "Charminar": ["Charminar"],
    "Goshamahal": ["Goshamahal"],
    "Jubilee Hills": ["Shaikpet"],
    "Karwan": ["Karwan"],
    "Khairatabad": ["Khairitabads"],
    "Malakpet": ["Malakpet"],
    "Musheerabad": ["Musheerabad"],
    "Nampally": ["Nampally"],
    "Sanathnagar": ["Ameerpet"],
    "Secunderabad": ["Secunderabad"],
    "Secunderabad Cantonment": ["Tirumalagiri", "Marredpally"],
    "Yakutpura": ["Yakutpura"],

    // SURYAPET District
    "Huzurnagar": ["Huzurnagar", "Neredcherla", "Garidepally", "Mattampally", "Mellachervu", "Chinthalapalem", "Palakeedu"],
    "Kodad": ["Kodad", "Mothey", "Nadigudem", "Munagala", "Chilkur", "Ananthagiri"],
    "Suryapet": ["Suryapet", "Atmakur (S)", "Chivvemla", "Penpahad"],
    "Thungathurthi": ["Thungathurthi", "Thirumalagiri", "Nuthankal", "Jaji Reddi Gudem", "Mothkur", "Maddirala", "Noothankal", "Nagaram", "Shali Gouraram", "Arvapally"],

    // Default Fallback / Empty for others to prevent crashes
    // User can populate more here
};

