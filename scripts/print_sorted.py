
lists = {
    "GOVT_JOB_CATEGORIES_STATE": ["Group-1", "Group-2", "Group-3", "Group-4", "Gazetted Officer", "Non-Gazetted Officer", "Class-IV Employee", "Contract / Outsourcing"],
    "GOVT_JOB_CATEGORIES_CENTRAL": ["Group-A (Gazetted)", "Group-B (Gazetted)", "Group-B (Non-Gazetted)", "Group-C", "Group-D", "Railways", "Banking / PSU", "Defence / Para-Military"],
    "GOVT_JOB_CATEGORIES_PSU": ["Maharatna", "Navratna", "Miniratna", "State PSU (e.g., Singareni, Transco)"],
    "POLITICAL_POSITIONS": [
        "Governor", "Chief Minister", "Deputy Chief Minister", "State Cabinet Ministers",
        "MLA", "MLC", "MP(Lok Sabha & Rajya Sabha)",
        "Mayor", "Deputy Mayor", "Corporator / Ward Councillor",
        "Municipal Chairman / President", "Municipal Councillor",
        "ZPTC", "Zilla Parishad Chairperson",
        "MPTC", "Mandal Parishad President", "Gram Panchayat Sarpanch", "Ward Member (Gram Panchayat)"
    ],
    "memberOccupations": [
        "Farmer", "Daily Wage Laborer",
        "Private Employee", "Government Employee", "Retired Govt. Employee",
        "Retired Private Employee", "Self-Employed / Business", "Student",
        "House Wife", "Unemployed", "Political Elected", "Other"
    ],
    "GENDER": ['Male', 'Female', 'Other'],
    "BLOOD_GROUP": ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    "MARITAL_STATUS": ['Unmarried', 'Married', 'Widowed', 'Divorced'],
    "EDUCATION_LEVEL": ["Primary School", "High School", "Intermediate", "Vocational / ITI", "Polytechnic / Diploma", "Engineering & Technology", "Degree", "PG", "Research / Doctoral Studies (PhD)"],
    "JOB_CAT_EDIT": ["State Government", "Central Government", "Public Sector Undertaking (PSU)"],
    "OCCUPATION_EDIT": ["Farmer", "Student", "Unemployed", "Private Job", "Government Employee", "Business", "Daily Wage Worker", "Self Employed", "Retired Govt. Employee", "Retired Private Employee", "Homemaker"],
    "RATION_CARD_TYPE": ['WAP (White)', 'PAP (Pink)', 'AAY (Antyodaya)']
}

for k, v in lists.items():
    print(f"{k}: {sorted(v)}")
