export const LOCATIONS = [
  {
    state: 'Telangana',
    districts: [
      { district: 'Hyderabad', cities: ['Hyderabad'] },
      { district: 'Medchal–Malkajgiri', cities: ['Kukatpally', 'Quthbullapur', 'Uppal'] },
      { district: 'Rangareddy', cities: ['LB Nagar', 'Serilingampally'] },
      { district: 'Warangal Urban', cities: ['Warangal', 'Hanamkonda'] },
      { district: 'Karimnagar', cities: ['Karimnagar', 'Huzurabad'] },
      { district: 'Nizamabad', cities: ['Nizamabad', 'Bodhan', 'Armoor'] },
      { district: 'Khammam', cities: ['Khammam'] },
      { district: 'Bhadradri Kothagudem', cities: ['Kothagudem', 'Palwancha', 'Yellandu'] },
      { district: 'Mahabubnagar', cities: ['Mahbubnagar'] },
      { district: 'Nagarkurnool', cities: ['Nagarkurnool'] },
      { district: 'Jogulamba Gadwal', cities: ['Gadwal'] },
      { district: 'Wanaparthy', cities: ['Wanaparthy'] },
      { district: 'Nalgonda', cities: ['Nalgonda', 'Miryalaguda'] },
      { district: 'Suryapet', cities: ['Suryapet'] },
      { district: 'Yadadri Bhuvanagiri', cities: ['Bhongir'] },
      { district: 'Adilabad', cities: ['Adilabad'] },
      { district: 'Mancherial', cities: ['Mancherial', 'Bellampalli'] },
      { district: 'Jagtial', cities: ['Jagtial', 'Metpally'] },
      { district: 'Rajanna Sircilla', cities: ['Sircilla'] },
      { district: 'Siddipet', cities: ['Siddipet'] },
      { district: 'Medak', cities: ['Medak'] },
      { district: 'Sangareddy', cities: ['Sangareddy', 'Zaheerabad'] },
      { district: 'Vikarabad', cities: ['Vikarabad', 'Tandur'] },
      { district: 'Mahabubabad', cities: ['Mahabubabad'] },
      { district: 'Narayanpet', cities: ['Narayanpet'] },
      { district: 'Peddapalli', cities: ['Peddapalli', 'Ramagundam'] },
      { district: 'Kamareddy', cities: ['Kamareddy'] },
    ],
  },
  {
    state: 'Andhra Pradesh',
    districts: [
      { district: 'Visakhapatnam', cities: ['Visakhapatnam', 'Anakapalle'] },
      { district: 'Vizianagaram', cities: ['Vizianagaram'] },
      { district: 'Srikakulam', cities: ['Srikakulam'] },
      { district: 'East Godavari', cities: ['Kakinada', 'Amalapuram', 'Rajahmundry'] },
      { district: 'West Godavari', cities: ['Eluru', 'Bhimavaram', 'Tanuku', 'Tadepalligudem', 'Palakollu', 'Narasapuram'] },
      { district: 'Krishna', cities: ['Vijayawada', 'Machilipatnam', 'Gudivada'] },
      { district: 'Guntur', cities: ['Guntur', 'Tenali', 'Narasaraopet', 'Chilakaluripet', 'Sattenapalle', 'Repalle'] },
      { district: 'Bapatla', cities: ['Bapatla'] },
      { district: 'Prakasam', cities: ['Ongole', 'Markapur'] },
      { district: 'Nellore', cities: ['Nellore', 'Kavali', 'Gudur'] },
      { district: 'Kurnool', cities: ['Kurnool', 'Nandyal', 'Adoni'] },
      { district: 'Anantapur', cities: ['Anantapur', 'Hindupur', 'Dharmavaram'] },
      { district: 'Kadapa', cities: ['Kadapa', 'Proddatur', 'Rayachoti'] },
      { district: 'Chittoor', cities: ['Tirupati', 'Chittoor', 'Madanapalle', 'Puttur'] },
    ],
  },
];

export const getStates = () => LOCATIONS.map((l) => l.state);

export const getDistricts = (state) => {
  const s = LOCATIONS.find((l) => l.state === state);
  return s ? s.districts.map((d) => d.district) : [];
};

export const getCities = (state, district) => {
  const s = LOCATIONS.find((l) => l.state === state);
  if (!s) return [];
  const d = s.districts.find((x) => x.district === district);
  return d ? d.cities : [];
};
