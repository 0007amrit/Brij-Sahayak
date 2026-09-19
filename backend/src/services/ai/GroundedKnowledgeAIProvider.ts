import { IAIProvider, AIQueryRequest, AIQueryResponse } from './IAIProvider.js';
import fs from 'fs';
import path from 'path';

interface TempleRecord {
  id: string;
  index: number;
  name: string;
  hindiName?: string;
  area: string;
  zone: string;
  city: string;
  category: string;
  timing: string;
  route: string;
  parking: string;
  lastMile: string;
  zoneRule: string;
  nearby: string;
  helpline: string;
  disclaimer: string;
}

/**
 * Self-contained Grounded Knowledge Engine for BrajSahayak.
 * Uses deterministic natural-language understanding and rule-based knowledge retrieval.
 * Completely independent of Amazon Bedrock or external cloud APIs.
 */
export class GroundedKnowledgeAIProvider implements IAIProvider {
  private temples: TempleRecord[] = [];

  constructor() {
    this.loadTemples();
  }

  private loadTemples() {
    try {
      const candidates = [
        path.resolve(process.cwd(), '../data/seed/temples-data.json'),
        path.resolve(process.cwd(), 'data/seed/temples-data.json'),
        path.resolve(process.cwd(), '../../data/seed/temples-data.json'),
        '/Users/amritmishra05/Desktop/brajsahayak/data/seed/temples-data.json',
        '/Users/amritmishra05/.gemini/antigravity/scratch/brajsahayak copy/data/seed/temples-data.json'
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          this.temples = JSON.parse(fs.readFileSync(p, 'utf-8'));
          break;
        }
      }
    } catch (err) {
      console.warn('GroundedKnowledgeAIProvider: Could not pre-load temples-data.json', err);
    }
  }

  private detectLanguage(query: string): 'hi' | 'hinglish' | 'en' {
    if (/[\u0900-\u097F]/.test(query)) {
      return 'hi';
    }
    const hinglishMarkers = [
      'kahan', 'kaha', 'kaise', 'kya', 'hain', 'hai', 'bhai', 'paas', 'milegi',
      'jaaye', 'jaana', 'samay', 'darshan', 'ghante', 'chahiye', 'batao', 'kitna',
      'kab', 'khulega', 'hoga', 'mera', 'mere', 'sabse', 'bheed', 'bhid', 'mandir',
      'gaadi', 'rukna', 'khana', 'mithai', 'suvidha', 'yatra', 'door', 'kitni', 'par'
    ];
    const words = query.toLowerCase().split(/\s+/);
    const hasHinglish = words.some(w => hinglishMarkers.includes(w));
    if (hasHinglish) {
      return 'hinglish';
    }
    return 'en';
  }

  private matchTemples(qLower: string): TempleRecord[] {
    const templeAliases: { [id: string]: string[] } = {
      'M001': ['krishna janmabhoomi', 'janambhoomi', 'janmasthan', 'janamsthan', 'birthplace', 'm001', 'जन्मभूमि', 'कृष्ण जन्मस्थान', 'जन्मस्थान'],
      'M002': ['dwarkadhish', 'dwarkadheesh', 'dwarka dhish', 'm002', 'द्वारकाधीश', 'द्वारिकाधीश'],
      'M003': ['vishram ghat', 'yamuna ghat', 'aarti ghat', 'm003', 'विश्राम घाट', 'विश्राम'],
      'M004': ['gita mandir', 'birla mandir', 'geeta mandir', 'm004', 'गीता मंदिर', 'बिड़ला मंदिर'],
      'M005': ['bhuteshwar', 'bhooteshwar', 'bhuteshwar mahadev', 'm005', 'भूतेश्वर'],
      'M006': ['radha kund', 'radhakund', 'm006', 'राधा कुंड', 'राधाकुंड'],
      'M007': ['kusum sarovar', 'kusum sarowar', 'sarovar', 'm007', 'कुसुम सरोवर'],
      'M008': ['giriraj', 'giriraj ji', 'govardhan temple', 'danghati', 'dan ghati', 'm008', 'गिरिराज', 'गोवर्धन'],
      'M009': ['mansi ganga', 'manasi ganga', 'm009', 'मानसी गंगा'],
      'M010': ['banke bihari', 'bankey bihari', 'bihari ji', 'bankey bihari ji', 'm010', 'बांके बिहारी', 'बिहारी जी'],
      'M011': ['prem mandir', 'kripalu ji', 'fountain mandir', 'illumination', 'm011', 'प्रेम मंदिर', 'प्रेम मन्दिर'],
      'M012': ['iskcon', 'krishna balaram', 'krishna-balaram', 'hare krishna', 'm012', 'इस्कॉन', 'कृष्ण बलराम'],
      'M013': ['radha raman', 'radharaman', 'm013', 'राधा रमण', 'राधारमण'],
      'M014': ['radha vallabh', 'radhavallabh', 'hit harivansh', 'm014', 'राधा वल्लभ', 'राधावल्लभ'],
      'M015': ['madan mohan', 'sanatana goswami', 'm015', 'मदन मोहन'],
      'M016': ['rangji', 'ranganatha', 'south indian temple vrindavan', 'vaikuntha gate', 'm016', 'रंगजी'],
      'M017': ['nidhivan', 'nidhiban', 'haridas', 'bansichor', 'm017', 'निधिवन'],
      'M018': ['katyayani', 'katyayani peeth', 'uma devi', 'shaktipeeth', 'm018', 'कात्यायनी', 'उमा देवी'],
      'M019': ['govind dev', 'govind dev ji', 'roopa goswami', 'm019', 'गोविंद देव'],
      'M020': ['gopeshwar', 'gopeshwar mahadev', 'shivling vrindavan', 'm020', 'गोपेश्वर'],
      'M021': ['radharaman lal', 'shri radharaman', 'm021', 'राधारमण लाल'],
      'M022': ['priya kant', 'priya kant ju', 'devkinandan', 'm022', 'प्रिया कांत'],
      'M023': ['vaishno devi dham', 'vaishno devi vrindavan', 'cave temple', 'm023', 'वैष्णो देवी'],
      'M024': ['akshaya patra', 'food for life', 'm024', 'अक्षय पात्र'],
      'M025': ['shahji', 'shahji temple', 'twisted pillars', 'm025', 'शाहजी'],
      'M026': ['jaipur temple', 'sawai madho singh', 'm026', 'जयपुर मंदिर'],
      'M027': ['gokulnanda', 'gokulananda', 'lokanath goswami', 'm027', 'गोकुलानंद'],
      'M028': ['raman reti', 'ramana reti', 'gokul sand', 'karshni ashram', 'm028', 'रमण रेती', 'रमन रेती'],
      'M029': ['radha rani', 'ladli ji', 'shri ji mandir', 'barsana temple', 'bhanugarh', 'm029', 'राधा रानी', 'बरसाना', 'लाडली जी'],
      'M030': ['maan mandir', 'man mandir', 'ramesh baba', 'm030', 'मान मंदिर'],
      'M031': ['nand bhavan', 'nand baba', 'nandgaon temple', 'm031', 'नंद भवन', 'नंदगांव'],
      'M032': ['dauji', 'baldeo', 'balram mandir', 'dau ji', 'm032', 'दाऊजी', 'बलदेव', 'बलराम']
    };

    const matches: TempleRecord[] = [];
    for (const t of this.temples) {
      const aliases = templeAliases[t.id] || [];
      const matched = aliases.some(alias => qLower.includes(alias)) ||
        qLower.includes(t.name.toLowerCase()) ||
        qLower.includes(t.id.toLowerCase());

      if (matched) {
        matches.push(t);
      }
    }
    return matches;
  }

  async generateResponse(request: AIQueryRequest): Promise<AIQueryResponse> {
    const q = request.query.trim();
    const lang = request.preferredLanguage || this.detectLanguage(q);
    const qLower = q.toLowerCase();

    // 1. EMERGENCY & HELPLINES INTENT
    if (qLower.includes('helpline') || qLower.includes('police') || qLower.includes('ambulance') ||
        qLower.includes('emergency') || qLower.includes('madad') || qLower.includes('hospital') ||
        qLower.includes('हेल्पलाइन') || qLower.includes('पुलिस') || qLower.includes('एम्बुलेंस')) {
      if (lang === 'hi') {
        return {
          answer: `ब्रज क्षेत्र के लिए आधिकारिक आपातकालीन हेल्पलाइन नंबर:\n• पुलिस नियंत्रण कक्ष (Police): 100 / 112\n• मेडिकल एम्बुलेंस (Ambulance): 102 / 108\n• नगर निगम हेल्पलाइन (Mathura-Vrindavan): 1533\n• रेलवे पूछताछ (Railway Inquiry): 139`,
          language: 'hi',
          provider: 'grounded-knowledge-engine' as any,
          sources: ['Braj Emergency & Safety Directory'],
          disclaimer: 'यह संदर्भ जानकारी है। आपातकाल में सीधे 112 या 108 डायल करें।',
          suggestedFollowups: ['बांके बिहारी पार्किंग', 'मथुरा जंक्शन भीड़ स्थिति']
        };
      } else if (lang === 'hinglish') {
        return {
          answer: `Braj kshetra ke verified emergency helpline numbers yeh hain:\n• Police Helpline: 100 / 112\n• Medical Ambulance: 102 / 108\n• Nagar Nigam Mathura-Vrindavan: 1533\n• Railway Inquiry (Mathura Junction): 139\n\nKisi bhi emergency me turant in numbers par sampark karein.`,
          language: 'hinglish',
          provider: 'grounded-knowledge-engine' as any,
          sources: ['Braj Emergency & Safety Directory'],
          disclaimer: 'Official emergency reference. Dial 112/108 directly in emergency situations.',
          suggestedFollowups: ['Banke Bihari parking', 'Prem Mandir timings']
        };
      } else {
        return {
          answer: `Verified emergency helplines for the Braj region:\n• Police Control Room: 100 / 112\n• Medical Ambulance: 102 / 108\n• Municipal Helpline (Nagar Nigam): 1533\n• Railway Inquiries: 139`,
          language: 'en',
          provider: 'grounded-knowledge-engine' as any,
          sources: ['Braj Emergency & Safety Directory'],
          disclaimer: 'Emergency reference numbers. Contact 112 or 108 immediately in emergencies.',
          suggestedFollowups: ['Banke Bihari parking', 'Mathura Junction crowd']
        };
      }
    }

    // 2. OLD VRINDAVAN ZONE PARKING POLICY INTENT
    if (qLower.includes('old vrindavan') || (qLower.includes('vrindavan') && qLower.includes('narrow') && qLower.includes('park'))) {
      if (lang === 'hinglish') {
        return {
          answer: `Old Vrindavan (Banke Bihari, Radha Raman, Nidhivan, Radha Vallabh area) ki galiyan bohot sankri (narrow kunj galiyan) hain. Wahan private 4-wheeler gaadiyan le jana sakht mana hai.\n\nRecommended Zone Guidance:\n• Gaadi ko outer designated parking me park karein: Mandi Parking, ITI Parking, Darukh Parking ya MVDA Parking.\n• Parking se mandir perimeter tak paidal ya registered e-rickshaw se jayein.\n• Tyoharon par traffic police ke diversion points follow karein.`,
          language: 'hinglish',
          provider: 'grounded-knowledge-engine' as any,
          sources: ['Zone Rule: Old Vrindavan Heritage Corridors'],
          disclaimer: 'Reference data only. Local traffic police enforce dynamic barricades during rush.',
          suggestedFollowups: ['Banke Bihari parking', 'Prem Mandir parking', 'Yatra Planner']
        };
      } else {
        return {
          answer: `In Old Vrindavan (encompassing Banke Bihari, Radha Vallabh, and Radha Raman), narrow heritage lanes prevent private vehicular entry.\n\nZone Policy:\n• Park at designated outer facilities: Mandi Parking, ITI Parking, Darukh Parking, or MVDA Parking.\n• Complete the final leg on foot or by registered e-rickshaw.\n• During festive surges, traffic police restrict private vehicles to outer bypass boundaries.`,
          language: 'en',
          provider: 'grounded-knowledge-engine' as any,
          sources: ['Zone Rule: Old Vrindavan Heritage Corridors'],
          disclaimer: 'Reference data only. Please confirm with on-duty traffic personnel.',
          suggestedFollowups: ['Banke Bihari timings', 'Prem Mandir route']
        };
      }
    }

    // 3. ROUTE: BANKE BIHARI <-> PREM MANDIR
    if ((qLower.includes('banke bihari') && qLower.includes('prem mandir')) ||
        (qLower.includes('bihari') && qLower.includes('prem') && (qLower.includes('kaise') || qLower.includes('route') || qLower.includes('distance')))) {
      if (lang === 'hinglish') {
        return {
          answer: `Banke Bihari Temple se Prem Mandir jaane ka practical route:\n\n1. Exit & Last-Mile: Banke Bihari ke sankre galiyon se bahar nikal kar Vidyapeeth Chauraha ya main e-rickshaw stand tak paidal aayein.\n2. E-Rickshaw / Road Route: Wahan se direct e-rickshaw lein jo Raman Reti / Chhatikara Road hokar Prem Mandir tak jaata hai (approx 3.5–4.5 km, lagbhag 15–25 minutes standard traffic me).\n3. Gaadi se aane par: Agar gaadi Mandi ya ITI parking me khadi hai, toh wahan se bypass pakad kar Prem Mandir side parking / Rukmini Vihar pahunchein.\n\nTip: Prem Mandir evening illumination 6:00 PM – 8:30 PM ke beech sabse sundar dikhti hai!`,
          language: 'hinglish',
          provider: 'grounded-knowledge-engine' as any,
          sources: ['M010 Banke Bihari', 'M011 Prem Mandir Verified Records'],
          disclaimer: 'Reference route guidance. Real-time travel time depends on festival traffic.',
          suggestedFollowups: ['Prem Mandir timings', 'Banke Bihari crowd status']
        };
      } else {
        return {
          answer: `Connecting Banke Bihari Temple to Prem Mandir:\n\n1. Egress: Walk out of the narrow temple lanes toward Vidyapeeth Chauraha or the perimeter e-rickshaw stand.\n2. Transit: Board an e-rickshaw along Raman Reti Marg / Chhatikara Road directly to Prem Mandir (approx 4 km, 15–25 minutes under normal conditions).\n3. By Car: Drive via Bhaktivedanta Swami Marg bypass to Rukmini Vihar / Prem Mandir outer parking lot.\n\nTiming note: Prem Mandir evening illumination and musical fountain run from 6:00 PM to 8:30 PM.`,
          language: 'en',
          provider: 'grounded-knowledge-engine' as any,
          sources: ['M010 Banke Bihari', 'M011 Prem Mandir Verified Records'],
          disclaimer: 'Reference route guidance only. Actual travel time may vary with traffic diversions.',
          suggestedFollowups: ['Prem Mandir fountain timings', 'Banke Bihari parking']
        };
      }
    }

    // 4. FOOD, SWEETS & SHOPPING INTENT
    if (qLower.includes('food') || qLower.includes('khana') || qLower.includes('peda') || qLower.includes('sweet') ||
        qLower.includes('lassi') || qLower.includes('shopping') || qLower.includes('mithai') || qLower.includes('kachori') ||
        qLower.includes('पेड़ा') || qLower.includes('मिठाई') || qLower.includes('लस्सी') || qLower.includes('कचौड़ी')) {
      if (lang === 'hi') {
        return {
          answer: `ब्रज क्षेत्र के प्रसिद्ध स्थानीय व्यंजन और खरीदारी:\n\n• मथुरा: प्रसिद्ध मथुरा पेड़ा, सुबह की कचौड़ी-जलेबी (जन्मभूमि और द्वारकाधीश बाजार), पारंपरिक ब्रज थाली।\n• वृंदावन: कुल्हड़ लस्सी (बांके बिहारी के पास), माखन-मिश्री भोग, प्रेम मंदिर के पास चौपाटी फूड कोर्ट, इस्कॉन में गोविंदा शाकाहारी भोजन।\n• धार्मिक खरीदारी: पूजा सामग्री, तुलसी माला, पोशाक, पीतल की मूर्तियां, बांसुरी और स्मृति चिन्ह।`,
          language: 'hi',
          provider: 'grounded-knowledge-engine' as any,
          sources: ['Braj Knowledge Base: Regional Food & Shopping Directory'],
          disclaimer: 'संदर्भ डेटा। दैनिक दर्शन समय के अनुसार दुकानें खुलती हैं।',
          suggestedFollowups: ['मथुरा पेड़ा', 'बांके बिहारी समय']
        };
      } else if (lang === 'hinglish') {
        return {
          answer: `Braj kshetra ke famous local food aur shopping spots:\n\n• Mathura Special: Mathura peda, subah ki kachori-jalebi (Janmabhoomi & Dwarkadhish bazaars), Mathura thali.\n• Vrindavan Special: Kunj galiyon ki makkhan-mishri, kulhad lassi (Banke Bihari chowk), Chaupati food court (Prem Mandir side), Govinda vegetarian food (ISKCON).\n• Famous Shopping: Radha-Krishna devotional dresses, tulsi mala, peetal ki murtiyan, flute/souvenirs.\n• Barsana & Nandgaon: Local prasad, laddoo aur Braj snacks.`,
          language: 'hinglish',
          provider: 'grounded-knowledge-engine' as any,
          sources: ['Braj Knowledge Base: Regional Food & Shopping Directory'],
          disclaimer: 'Reference recommendations. Shop hours fluctuate with temple darshan timings.',
          suggestedFollowups: ['Banke Bihari ke paas food', 'Janmabhoomi peda shops']
        };
      } else {
        return {
          answer: `Famous regional food and shopping highlights in Braj:\n\n• Mathura Old City: Mathura Peda, morning kachori-jalebi, traditional vegetarian thali near Janmabhoomi and Vishram Ghat.\n• Vrindavan: Vrindavan sweet lassi (near Banke Bihari), makhan-mishri prasad, Chaupati eateries near Prem Mandir, Govinda vegetarian restaurant at ISKCON.\n• Devotional Shopping: Puja items, tulsi mala, deities clothing, brass artifacts, and Krishna-themed souvenirs across heritage bazaars.\n• Barsana: Authentic laddoo prasad and local village sweets.`,
          language: 'en',
          provider: 'grounded-knowledge-engine' as any,
          sources: ['Braj Knowledge Base: Regional Food & Shopping Directory'],
          disclaimer: 'Reference directory. Store availability aligns with daily darshan schedules.',
          suggestedFollowups: ['Where to buy Mathura peda?', 'Prem Mandir food chaupati']
        };
      }
    }

    // 5. CROWD SAFETY & RISK INTENT
    if (qLower.includes('crowd') || qLower.includes('bheed') || qLower.includes('stampede') ||
        qLower.includes('safety') || qLower.includes('risk') || qLower.includes('bhid') ||
        qLower.includes('भीड़') || qLower.includes('सुरक्षा')) {
      if (lang === 'hi') {
        return {
          answer: `ब्रजसहायक का भगदड़ निवारक (Stampede Saviour) इंजन तीर्थयात्रियों की भीड़ घनत्व की निगरानी करता है:\n\n• निगरानी केंद्र: बांके बिहारी मंदिर, मथुरा जंक्शन रेलवे स्टेशन, प्रेम मंदिर, जन्मभूमि कॉरिडोर, मथुरा बस स्टैंड, दान घाटी गोवर्धन।\n• जोखिम स्तर: सामान्य (LOW), मध्यम (MEDIUM), उच्च (HIGH), और गंभीर (CRITICAL)।\n\nआप वेबसाइट के **भीड़ सुरक्षा (/safety)** पेज पर लाइव स्थिति देख सकते हैं।`,
          language: 'hi',
          provider: 'grounded-knowledge-engine' as any,
          sources: ['Stampede Saviour Public Telemetry Model'],
          disclaimer: 'यह एक प्रारंभिक चेतावनी निर्णय-सहायता मॉडल है।',
          suggestedFollowups: ['बांके बिहारी भीड़ स्थिति', 'मथुरा जंक्शन स्थिति']
        };
      } else if (lang === 'hinglish') {
        return {
          answer: `BrajSahayak ka Stampede Saviour engine mandiron aur transit hubs ki crowd density monitor karta hai:\n\n• Monitored Places: Banke Bihari Temple, Mathura Junction Railway Station, Prem Mandir, Janmabhoomi Corridor, ISBT Bus Terminal, Dan Ghati Govardhan.\n• Risk Tiers: LOW, MEDIUM, HIGH, CRITICAL (density aur entry/exit rates par aadharit).\n\nAap website ke **Crowd Safety (/safety)** tab par live telemetry dekh sakte hain aur **Authority Dashboard (/authority)** par emergency directives check kar sakte hain.`,
          language: 'hinglish',
          provider: 'grounded-knowledge-engine' as any,
          sources: ['Stampede Saviour Public Telemetry Model'],
          disclaimer: 'Prototype early warning decision support model. Does not replace on-ground police command.',
          suggestedFollowups: ['Check Banke Bihari crowd', 'Open Authority Portal']
        };
      } else {
        return {
          answer: `BrajSahayak's Stampede Saviour engine monitors real-time crowd density across key transit and sacred hubs:\n\n• Monitored Venues: Banke Bihari Temple, Mathura Junction Railway Station, Prem Mandir, Janmabhoomi Outer Corridor, Mathura ISBT, and Dan Ghati.\n• Risk Classification: Evaluates crowd/capacity ratios and net accumulation flow rates (LOW, MEDIUM, HIGH, CRITICAL).\n\nVisit the **Crowd Safety (/safety)** page for public telemetry or the **Authority Dashboard (/authority)** for early warning directives.`,
          language: 'en',
          provider: 'grounded-knowledge-engine' as any,
          sources: ['Stampede Saviour Public Telemetry Model'],
          disclaimer: 'Prototype decision-support tool for authorized personnel.',
          suggestedFollowups: ['Check Mathura Junction crowd', 'Open Safety Dashboard']
        };
      }
    }

    // 6. ITINERARY & TIME-BUDGET PLANNING INTENT
    if (qLower.includes('hour') || qLower.includes('ghante') || qLower.includes('plan') ||
        qLower.includes('itinerary') || qLower.includes('visit') || qLower.includes('sequence') ||
        qLower.includes('घंटे') || qLower.includes('योजना')) {
      if (lang === 'hi') {
        return {
          answer: `5 घंटे में एक संतुलित ब्रज यात्रा योजना (उदा. बांके बिहारी + प्रेम मंदिर):\n\n• पड़ाव 1 (0–2 घंटे): बांके बिहारी मंदिर (वृंदावन) — मंडी/आईटीआई बाहरी पार्किंग में गाड़ी पार्क करें, ई-रिक्शा से दर्शन हेतु जाएं।\n• पड़ाव 2 (2–4 घंटे): प्रेम मंदिर (छटीकरा मार्ग) — ई-रिक्शा या बाईपास से जाएं, शाम की रोशनी और फव्वारा दर्शन करें।\n• वापसी (4–5 घंटे): प्रसाद लें, प्रसिद्ध लस्सी/पेड़ा का स्वाद लें और स्टेशन लौटें।\n\nसुझाव: आप हमारे समर्पित **यात्रा प्लानर (/planner)** टूल पर जाकर अपनी समय-सीमा तय कर सकते हैं!`,
          language: 'hi',
          provider: 'grounded-knowledge-engine' as any,
          sources: ['Braj Yatra Planner Engine'],
          disclaimer: 'अनुमानित संदर्भ अनुसूची। वास्तविक यातायात पर निर्भर करता है।',
          suggestedFollowups: ['यात्रा प्लानर खोलें', 'बांके बिहारी पार्किंग']
        };
      } else if (lang === 'hinglish') {
        return {
          answer: `5 ghante me ek santulit Braj Yatra plan (e.g. Banke Bihari + Prem Mandir):\n\n• Stop 1 (0–2 hrs): Banke Bihari Temple (Old Vrindavan) — Gaadi Mandi/ITI outer parking me park karein, e-rickshaw se darshan ke liye jayein.\n• Stop 2 (2–4 hrs): Prem Mandir (Chhatikara Road) — E-rickshaw ya outer bypass se jayein, garden aur evening illumination darshan karein.\n• Buffer & Prasad (4–5 hrs): Chaupati par snacks lein, Mathura peda kharidein aur station/hotel return karein.\n\nTip: Aap hamare dedicated **Yatra Planner (/planner)** tool par jakar apna custom duration select kar sakte hain!`,
          language: 'hinglish',
          provider: 'grounded-knowledge-engine' as any,
          sources: ['Braj Yatra Planner Engine'],
          disclaimer: 'Estimated reference sequence. Does not account for live traffic or aarti closures.',
          suggestedFollowups: ['Open Yatra Planner', 'Banke Bihari parking', 'Prem Mandir timings']
        };
      } else {
        return {
          answer: `For a 5-hour time envelope covering Banke Bihari and Prem Mandir:\n\n• Stop 1 (0–2 hrs): Banke Bihari Temple. Park at Mandi or ITI outer parking, take an e-rickshaw to the temple perimeter.\n• Stop 2 (2–4 hrs): Prem Mandir. Proceed to Chhatikara Road; tour the campus and view the evening illumination.\n• Buffer (4–5 hrs): Sample famous Vrindavan lassi or Mathura peda, return to starting station.\n\nUse our dedicated **/planner** tool to customize stops, start points, and duration!`,
          language: 'en',
          provider: 'grounded-knowledge-engine' as any,
          sources: ['Braj Yatra Planner Engine'],
          disclaimer: 'Reference time allocations. Traffic and queue lengths vary during festivals.',
          suggestedFollowups: ['Open Yatra Planner', 'Mathura Junction crowd']
        };
      }
    }

    // 7. SPECIFIC TEMPLE MATCHING (ALL 32 SITES)
    const matches = this.matchTemples(qLower);
    if (matches.length > 0) {
      const t = matches[0];

      const isParkingQuery = qLower.includes('park') || qLower.includes('gaadi') || qLower.includes('vehicle') ||
                            qLower.includes('car') || qLower.includes('पार्क') || qLower.includes('गाड़ी');
      const isTimingQuery = qLower.includes('timing') || qLower.includes('samay') || qLower.includes('kab') ||
                            qLower.includes('open') || qLower.includes('darshan') || qLower.includes('close') ||
                            qLower.includes('aarti') || qLower.includes('समय') || qLower.includes('दर्शन') ||
                            qLower.includes('खुलने') || qLower.includes('आरती');
      const isRouteQuery = qLower.includes('route') || qLower.includes('kaise') || qLower.includes('reach') ||
                           qLower.includes('pahuchein') || qLower.includes('direction') || qLower.includes('rasta') ||
                           qLower.includes('मार्ग') || qLower.includes('रास्ता') || qLower.includes('कैसे');

      // Parking response
      if (isParkingQuery) {
        if (lang === 'hi') {
          return {
            answer: `${t.name} के लिए सुझाया गया संदर्भ पार्किंग स्थल:\n\n• पार्किंग: ${t.parking}\n• अंतिम छोर विकल्प (Last-mile): ${t.lastMile}\n• क्षेत्र नियम: ${t.zoneRule}\n\nसूचना: यह संदर्भ मार्गदर्शन है और स्थान की गारंटी नहीं देता है। स्थानीय प्रशासन के निर्देशों का पालन करें।`,
            language: 'hi',
            provider: 'grounded-knowledge-engine' as any,
            sources: [`${t.name}`],
            disclaimer: t.disclaimer,
            suggestedFollowups: [`${t.name} समय`, 'हेल्पलाइन']
          };
        } else if (lang === 'hinglish') {
          return {
            answer: `${t.name} ke paas suggested reference parking:\n\n• Parking Option: ${t.parking}\n• Last-Mile Connectivity: ${t.lastMile}\n• Zone Policy: ${t.zoneRule}\n\nImportant Notice: Yeh reference parking information hai, guaranteed live space nahi hai. Festival days par traffic police ke diversion rules zaroor follow karein.`,
            language: 'hinglish',
            provider: 'grounded-knowledge-engine' as any,
            sources: [`${t.name} Verified Reference Record`],
            disclaimer: t.disclaimer,
            suggestedFollowups: [`${t.name} darshan timings`, `${t.name} kaise pahuchein`, 'Emergency helpline']
          };
        } else {
          return {
            answer: `Suggested reference parking for ${t.name}:\n\n• Parking Guidance: ${t.parking}\n• Last-Mile Travel: ${t.lastMile}\n• Zone Regulations: ${t.zoneRule}\n\nNotice: Parking guidance is reference-only and does not guarantee live spot availability. Follow local traffic police advisories.`,
            language: 'en',
            provider: 'grounded-knowledge-engine' as any,
            sources: [`${t.name} Reference Record`],
            disclaimer: t.disclaimer,
            suggestedFollowups: [`${t.name} opening hours`, `${t.name} route`, 'Braj Safety Dashboard']
          };
        }
      }

      // Timing response
      if (isTimingQuery) {
        if (lang === 'hi') {
          return {
            answer: `${t.name} के सामान्य संदर्भ दर्शन समय:\n\n• दर्शन समय: ${t.timing}\n• स्थान: ${t.area} (${t.zone})\n• मार्ग अवलोकन: ${t.route}\n\nमहत्वपूर्ण सूचना: मंदिर के दर्शन का समय मौसम (ग्रीष्म/शीतकालीन आरती कार्यक्रम) और त्योहारों के अनुसार बदल सकता है। पहुंचने से पूर्व स्थानीय रूप से पुष्टि करें।`,
            language: 'hi',
            provider: 'grounded-knowledge-engine' as any,
            sources: [`${t.name}`],
            disclaimer: t.disclaimer,
            suggestedFollowups: [`${t.name} पार्किंग कहां है`, `${t.name} मार्ग`]
          };
        } else if (lang === 'hinglish') {
          return {
            answer: `${t.name} ke general reference darshan timings:\n\n• Timings: ${t.timing}\n• Location: ${t.area} (${t.zone})\n• Route Overview: ${t.route}\n\nNote: Mandir ke darshan hours mausam (summer/winter aarti schedule) aur festivals ke mutabiq badal sakte hain. Yatra se pehle verify karein.`,
            language: 'hinglish',
            provider: 'grounded-knowledge-engine' as any,
            sources: [`${t.name}`],
            disclaimer: t.disclaimer,
            suggestedFollowups: [`${t.name} parking kahan hai`, `${t.name} route`]
          };
        } else {
          return {
            answer: `General reference timings for ${t.name}:\n\n• Darshan Hours: ${t.timing}\n• Location: ${t.area} (${t.zone})\n• Route Overview: ${t.route}\n\nImportant Note: Darshan hours adjust seasonally and during special aartis or festival observances. Verify locally on arrival.`,
            language: 'en',
            provider: 'grounded-knowledge-engine' as any,
            sources: [`${t.name}`],
            disclaimer: t.disclaimer,
            suggestedFollowups: [`Suggested parking for ${t.name}`, `Nearby food at ${t.name}`]
          };
        }
      }

      // Route response
      if (isRouteQuery) {
        if (lang === 'hi') {
          return {
            answer: `${t.name} तक पहुंचने का मार्ग मार्गदर्शन:\n\n• मार्ग: ${t.route}\n• अंतिम छोर विकल्प: ${t.lastMile}\n• सुझाया गया पार्किंग स्थल: ${t.parking}\n• क्षेत्र नियम: ${t.zoneRule}`,
            language: 'hi',
            provider: 'grounded-knowledge-engine' as any,
            sources: [`${t.name}`],
            disclaimer: t.disclaimer,
            suggestedFollowups: [`${t.name} समय`, `${t.name} पार्किंग`]
          };
        } else if (lang === 'hinglish') {
          return {
            answer: `${t.name} tak pahunchne ka route:\n\n• Route Guidance: ${t.route}\n• Last-Mile Option: ${t.lastMile}\n• Suggested Parking: ${t.parking}\n• Zone Rule: ${t.zoneRule}`,
            language: 'hinglish',
            provider: 'grounded-knowledge-engine' as any,
            sources: [`${t.name}`],
            disclaimer: t.disclaimer,
            suggestedFollowups: [`${t.name} timings`, `${t.name} parking`]
          };
        } else {
          return {
            answer: `Route and access guidance for ${t.name}:\n\n• Approach Route: ${t.route}\n• Last-Mile Connectivity: ${t.lastMile}\n• Suggested Parking: ${t.parking}\n• Zone Rule: ${t.zoneRule}`,
            language: 'en',
            provider: 'grounded-knowledge-engine' as any,
            sources: [`${t.name}`],
            disclaimer: t.disclaimer,
            suggestedFollowups: [`${t.name} timings`, `Parking for ${t.name}`]
          };
        }
      }

      // Default comprehensive overview for temple
      if (lang === 'hi') {
        return {
          answer: `${t.name} विवरण:\n\n• क्षेत्र: ${t.area} • ज़ोन: ${t.zone}\n• दर्शन समय: ${t.timing}\n• मार्ग: ${t.route}\n• पार्किंग: ${t.parking}\n• अंतिम छोर: ${t.lastMile}\n• पास में सुविधाएं: ${t.nearby}\n• क्षेत्र नियम: ${t.zoneRule}`,
          language: 'hi',
          provider: 'grounded-knowledge-engine' as any,
          sources: [`${t.name}`],
          disclaimer: t.disclaimer,
          suggestedFollowups: [`${t.name} पार्किंग`, `${t.name} समय`, 'यात्रा प्लानर']
        };
      } else if (lang === 'hinglish') {
        return {
          answer: `${t.name} Overview:\n\n• Area: ${t.area} • Zone: ${t.zone}\n• Timings: ${t.timing}\n• Route: ${t.route}\n• Parking: ${t.parking}\n• Last-Mile: ${t.lastMile}\n• Nearby Outlets: ${t.nearby}\n• Zone Policy: ${t.zoneRule}`,
          language: 'hinglish',
          provider: 'grounded-knowledge-engine' as any,
          sources: [`${t.name}`],
          disclaimer: t.disclaimer,
          suggestedFollowups: [`${t.name} parking`, `${t.name} timings`, 'Yatra Planner']
        };
      } else {
        return {
          answer: `${t.name} Overview:\n\n• Area: ${t.area} • Zone: ${t.zone}\n• Timings: ${t.timing}\n• Route: ${t.route}\n• Parking: ${t.parking}\n• Last-Mile: ${t.lastMile}\n• Nearby Food & Stays: ${t.nearby}\n• Zone Policy: ${t.zoneRule}`,
          language: 'en',
          provider: 'grounded-knowledge-engine' as any,
          sources: [`${t.name}`],
          disclaimer: t.disclaimer,
          suggestedFollowups: [`Parking for ${t.name}`, `Timings for ${t.name}`]
        };
      }
    }

    // 8. OUT OF DOMAIN / INSUFFICIENT INFORMATION (STRICT SAFEGUARD)
    if (lang === 'hi') {
      return {
        answer: `इस प्रश्न के लिए ब्रजसहायक सत्यापित संदर्भ डेटाबेस में पर्याप्त जानकारी उपलब्ध नहीं है।\n\nकृपया ब्रज क्षेत्र के मंदिरों, पार्किंग, दर्शन समय और मार्गों से संबंधित प्रश्न पूछें।`,
        language: 'hi',
        provider: 'grounded-knowledge-engine' as any,
        sources: ['BrajSahayak Grounded Knowledge Base'],
        disclaimer: 'यह सहायक केवल सत्यापित संदर्भ दस्तावेजों से उत्तर देता है।',
        suggestedFollowups: ['बांके बिहारी समय', 'द्वारकाधीश मंदिर रूट']
      };
    } else if (lang === 'hinglish') {
      return {
        answer: `I don't have enough verified information for that in the BrajSahayak reference knowledge base.\n\nMain keval Braj kshetra (Mathura, Vrindavan, Govardhan, Barsana, Nandgaon, Gokul, Baldeo) ke mandiron, suggested parking, darshan timings, routes aur crowd safety se jude verified reference jawaab de sakta hoon.`,
        language: 'hinglish',
        provider: 'grounded-knowledge-engine' as any,
        sources: ['BrajSahayak Grounded Knowledge Base'],
        disclaimer: 'BrajSahayak answers exclusively from verified reference documents to prevent hallucinations.',
        suggestedFollowups: ['Banke Bihari parking kahan hai?', 'Prem Mandir timing?', 'Mathura helpline numbers']
      };
    } else {
      return {
        answer: `I don't have enough verified information for that.\n\nBrajSahayak is strictly grounded in reference data covering sacred places in the Braj region (Mathura, Vrindavan, Govardhan, Barsana, Nandgaon, Gokul, Baldeo), suggested parking, last-mile transit, and crowd safety telemetry.`,
        language: 'en',
        provider: 'grounded-knowledge-engine' as any,
        sources: ['BrajSahayak Grounded Knowledge Base'],
        disclaimer: 'Grounded AI safeguard: The assistant will not extrapolate or hallucinate unverified details.',
        suggestedFollowups: ['Where to park near Banke Bihari?', 'Prem Mandir route', 'Emergency helplines']
      };
    }
  }
}
