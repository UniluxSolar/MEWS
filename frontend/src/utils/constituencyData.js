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
    "Mahabubnagar": ["Devarkadra", "Jadcherla", "Mahbubnagar", "Makthal", "Narayanpet"], // Note: Narayanpet is now a district but listing here for compatibility if needed
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
    "Warangal": ["Narsampet", "Parkal", "Warangal East", "Warangal West", "Wardhannapet"], // Fallback
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
    "Palair": ["Khammam Rural", "Kusumanchi", "Nelakondapalli", "Thirumalayapalem"], // Overlap possible
    "Madhira": ["Bonakal", "Chinthakani", "Madhira", "Mudigonda", "Yerrupalem"],
    "Wyra": ["Enkoor", "Julurpad", "Konijerla", "Singareni", "Wyra"],
    "Sathupalli": ["Kallur", "Penuballi", "Sathupalli", "Tallada", "Vemsoor"],

    // BHADRADRI KOTHAGUDEM District
    "Kothagudem": ["Chunchupally", "Kothagudem", "Laxmidevipally", "Paloncha", "Suijathanagar"],
    "Bhadrachalam": ["Bhadrachalam", "Cherla", "Dummugudem", "Venkatapuram", "Wazeed"],
    "Pinapaka": ["Aswapuram", "Burgampahad", "Gundala", "Manuguru", "Pinapaka"],
    "Yellandu": ["Bayyaram", "Garla", "Kamepalli", "Tekulapally", "Yellandu"],
    "Aswaraopeta": ["Aswaraopeta", "Chandrugonda", "Dammapeta", "Mulkalapally"],

    // YADADRI BHUVANAGIRI District
    "Alair": ["Alair", "Bommalaramaram", "Gundala", "Rajapet", "Turkapally", "Yadagirigutta"],
    "Bhongir": ["Bhongir", "Bhoodan Pochampally", "Bibinagar", "Valigonda"],

    // KOMARAM BHEEM ASIFABAD District
    "Asifabad": ["Asifabad", "Jainoor", "Kerameri", "Lingapur", "Sirpur (U)", "Tiryani", "Rebbena", "Wankidi"],
    "Sirpur": ["Sirpur (T)", "Koutala", "Chintalamanepalli", "Dahegaon", "Bejjur", "Penchikalpet", "Kagaznagar"],

    // MEDCHAL MALKAJGIRI District
    "Medchal": ["Ghatkesar", "Kapra", "Keesara", "Medchal", "Medipally", "Muduchinthalapalli", "Shamirpet"],
    "Malkajgiri": ["Alwal", "Malkajgiri"],
    "Uppal": ["Kapra", "Uppal"],
    "Kukatpally": ["Balanagar", "Kukatpally"],
    "Quthbullapur": ["Dundigal Gandimaisamma", "Gajularamaram", "Quthbullapur"],

    // RANGA REDDY District
    "Rajendranagar": ["Gandipet", "Rajendranagar", "Shamshabad"],
    "Maheshwaram": ["Kadthal", "Kandukur", "Maheshwaram"],
    "Ibrahimpatnam": ["Abdullapurmet", "Ibrahimpatnam", "Manchal", "Yacharam"],
    "Chevella": ["Chevella", "Moinabad", "Shabad", "Shankarpally"],
    "Serilingampally": ["Serilingampally"],
    "Lal Bahadur Nagar": ["Hayathnagar", "Saroornagar"],
    "Shadnagar": ["Chowdergudem", "Farooqnagar", "Keshampet", "Kondurg", "Kothur", "Nandigama"],

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
    "Secunderabad Cantonment": ["Marredpally", "Tirumalagiri"],
    "Yakutpura": ["Yakutpura"],

    // SURYAPET District
    "Huzurnagar": ["Chinthalapalem", "Garidepally", "Huzurnagar", "Mattampally", "Mellachervu", "Neredcherla", "Palakeedu"],
    "Kodad": ["Ananthagiri", "Chilkur", "Kodad", "Mothey", "Munagala", "Nadigudem"],
    "Suryapet": ["Suryapet", "Atmakur (S)", "Chivvemla", "Penpahad"],
    "Thungathurthi": ["Arvapally", "Jaji Reddi Gudem", "Maddirala", "Mothkur", "Nagaram", "Noothankal", "Nuthankal", "Shali Gouraram", "Thirumalagiri", "Thungathurthi"],

    // NALGONDA District
    "Miryalaguda": ["Dameracherla", "Miryalaguda", "Vemulapalle"],
    "Nalgonda": ["Kanagal", "Madugulapally", "Nalgonda", "Tipperthy"],
    "Nakrekal": ["Chityal", "Kattangur", "Kethepally", "Nakrekal"],
    "Devarakonda": ["Chandampet", "Chintapally", "Devarakonda", "Gundlapally", "Nampally", "Pedda Adiserla Pally"],
    "Nagarjuna Sagar": ["Anumula", "Gurrampode", "Nidamanoor", "Peddavoora", "Tirumalagiri Sagar", "Tripuraram"],
    "Munugode": ["Chandur", "Choutuppal", "Ghatuppal", "Marriguda", "Munugode", "Narayanapur"],

    // Default Fallback / Empty for others to prevent crashes
    // User can populate more here
};

