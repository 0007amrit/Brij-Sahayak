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

export class MockAIProvider implements IAIProvider {
  private temples: TempleRecord[] = [];

  constructor() {
    try {
      const candidates = [
        path.resolve(process.cwd(), '../data/seed/temples-data.json'),
        path.resolve(process.cwd(), 'data/seed/temples-data.json'),
        path.resolve(process.cwd(), '../../data/seed/temples-data.json'),
        '/Users/amritmishra05/.gemini/antigravity/scratch/brajsahayak/data/seed/temples-data.json'
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          this.temples = JSON.parse(fs.readFileSync(p, 'utf-8'));
          break;
        }
      }
    } catch (err) {
      console.warn('MockAIProvider: Could not pre-load temples-data.json', err);
    }
  }

  private detectLanguage(query: string): 'hi' | 'hinglish' | 'en' {
    if (/[\u0900-\u097F]/.test(query)) {
      return 'hi';
    }
    const hinglishMarkers = [
      'kahan', 'kaha', 'kaise', 'kya', 'hain', 'hai', 'bhai', 'paas', 'milegi',
      'jaaye', 'jaana', 'samay', 'darshan', 'ghante', 'chahiye', 'batao', 'kitna',
      'kab', 'khulega', 'hoga', 'mera', 'mere', 'sabse'
    ];
    const words = query.toLowerCase().split(/\s+/);
    const hasHinglish = words.some(w => hinglishMarkers.includes(w));
    if (hasHinglish) {
      return 'hinglish';
    }
    return 'en';
  }

  private findMatchingTemples(query: string): TempleRecord[] {
    const q = query.toLowerCase();
    return this.temples.filter(t => {
      const name = t.name.toLowerCase();
      const area = t.area.toLowerCase();
      const city = t.city.toLowerCase();
      const id = t.id.toLowerCase();
      
      if (q.includes('banke bihari') && name.includes('banke bihari')) return true;
      if (q.includes('prem mandir') && name.includes('prem mandir')) return true;
      if (q.includes('iskcon') && name.includes('iskcon')) return true;
      if ((q.includes('janmabhoomi') || q.includes('krishna janma')) && name.includes('janmabhoomi')) return true;
      if (q.includes('dwarkadhish') && name.includes('dwarkadhish')) return true;
      if (q.includes('radha rani') && name.includes('radha rani')) return true;
      if (q.includes('radha raman') && name.includes('radha raman')) return true;
      if (q.includes('radha vallabh') && name.includes('radha vallabh')) return true;
      if (q.includes('nidhivan') && name.includes('nidhivan')) return true;
      if (q.includes('govardhan') && (name.includes('govardhan') || name.includes('giriraj'))) return true;
      if (q.includes('radha kund') && name.includes('radha kund')) return true;
      if (q.includes('kusum sarovar') && name.includes('kusum sarovar')) return true;
      if (q.includes('raman reti') && name.includes('raman reti')) return true;
      if (q.includes('dauji') && name.includes('dauji')) return true;
      if (q.includes('barsana') && (city.includes('barsana') || area.includes('barsana'))) return true;
      if (q.includes('nandgaon') && (city.includes('nandgaon') || area.includes('nandgaon'))) return true;
      if (q.includes('gokul') && (city.includes('gokul') || area.includes('gokul'))) return true;

      return name.split(' ').some(part => part.length > 4 && q.includes(part)) || id === q;
    });
  }

  async generateResponse(request: AIQueryRequest): Promise<AIQueryResponse> {
    const q = request.query.trim();
    const lang = request.preferredLanguage || this.detectLanguage(q);
    const qLower = q.toLowerCase();

    // Check for general region-wide helpline question
    if (qLower.includes('helpline') || qLower.includes('police') || qLower.includes('ambulance') || qLower.includes('emergency') || qLower.includes('madad')) {
      if (lang === 'hi') {
        return {
          answer: `ब्रज क्षेत्र के लिए आपातकालीन हेल्पलाइन नंबर:\n• पुलिस: 100\n• एम्बुलेंस: 102 / 108\n• नगर निगम (मथुरा-वृंदावन): 1533`,
          language: 'hi',
          provider: 'mock',
          sources: ['BrajSahayak Emergency Directory'],
          disclaimer: 'यह संदर्भ जानकारी है। आपातकाल में सीधे 100/108 डायल करें।',
          suggestedFollowups: ['बांके बिहारी पार्किंग', 'मथुरा जंक्शन भीड़ स्थिति']
        };
      } else if (lang === 'hinglish') {
        return {
          answer: `Braj kshetra ke verified emergency helpline numbers yeh hain:\n• Police: 100\n• Ambulance: 102 / 108\n• Nagar Nigam Mathura-Vrindavan: 1533\n\nKisi bhi aapaatkaal mein turant in numbers par sampark karein.`,
          language: 'hinglish',
          provider: 'mock',
          sources: ['BrajSahayak Emergency Directory'],
          disclaimer: 'Yeh reference helpline data hai. Aapaatkaal me seedhe 100/108 par call karein.',
          suggestedFollowups: ['Banke Bihari parking', 'Prem Mandir timings']
        };
      } else {
        return {
          answer: `Official emergency helplines for the Braj region:\n• Police: 100\n• Ambulance: 102 / 108\n• Municipal Corporation (Nagar Nigam): 1533`,
          language: 'en',
          provider: 'mock',
          sources: ['BrajSahayak Emergency Directory'],
          disclaimer: 'Emergency reference numbers. Dial 100 or 108 immediately in case of emergency.',
          suggestedFollowups: ['Banke Bihari parking', 'Mathura Junction crowd']
        };
      }
    }

    // Check for old Vrindavan general parking rule
    if (qLower.includes('old vrindavan') || (qLower.includes('vrindavan') && qLower.includes('narrow') && qLower.includes('park'))) {
      if (lang === 'hinglish') {
        return {
          answer: `Old Vrindavan (purana Vrindavan jaise Banke Bihari, Radha Raman, Nidhivan) ki galiyan bohot sankri (narrow) hain aur wahan private char-pahiya gaadiyan le jana mana hai.\n\nSuggested Advice:\n• Gaadi ko outer parking me park karein (jaise Mandi Parking, ITI Parking, Darukh Parking ya MVDA Parking).\n• Wahan se aage e-rickshaw lein ya paidal darshan ke liye jayein.\n• Tyoharon par traffic police ke diversion rules zaroor follow karein.`,
          language: 'hinglish',
          provider: 'mock',
          sources: ['Braj Knowledge Base: Zone-based parking rules'],
          disclaimer: 'Reference guidance only. Festival diversions may alter vehicle access.',
          suggestedFollowups: ['Banke Bihari parking', 'Prem Mandir parking', 'E-rickshaw rates']
        };
      } else {
        return {
          answer: `In Old Vrindavan (surrounding Banke Bihari, Radha Vallabh, Radha Raman), narrow heritage lanes prevent private vehicle entry.\n\nRecommended Zone Guideline:\n• Park at designated outer parking facilities: Mandi Parking, ITI Parking, Darukh Parking, or MVDA Parking.\n• Complete the final stretch using registered e-rickshaws or on foot.\n• During festive surges, traffic police establish vehicle boundaries at outer bypass roads.`,
          language: 'en',
          provider: 'mock',
          sources: ['Braj Knowledge Base: Zone-based parking rules'],
          disclaimer: 'Reference data only. Please confirm with on-duty traffic personnel.',
          suggestedFollowups: ['Banke Bihari timings', 'Prem Mandir route']
        };
      }
    }

    // Check for route between Banke Bihari and Prem Mandir
    if ((qLower.includes('banke bihari') && qLower.includes('prem mandir')) || (qLower.includes('kaise jaaye') || qLower.includes('how to reach') || qLower.includes('route'))) {
      if (qLower.includes('banke bihari') && qLower.includes('prem mandir')) {
        if (lang === 'hinglish') {
          return {
            answer: `Banke Bihari Temple se Prem Mandir jaane ke liye:\n1. Banke Bihari ke sankre galiyon se bahar nikal kar Vidyapeeth Chauraha ya main road approach tak paidal aayein.\n2. Wahan se direct e-rickshaw ya auto-rickshaw lein jo Raman Reti / Chhatikara Road hokar Prem Mandir tak jaata hai (approx 3.5 - 4.5 km, lagbhag 15-25 minutes sadharan traffic me).\n3. Agar personal gaadi Mandi ya ITI parking me khadi hai, toh wahan se bypass pakad kar Prem Mandir side parking / Rukmini Vihar pahunch sakte hain.\n\nNote: Sham ke samay (5:30 PM - 8:30 PM) dono mandiron me bhid rehti hai, isliye samay ka dhyan rakhein.`,
            language: 'hinglish',
            provider: 'mock',
            sources: ['M010 Banke Bihari', 'M011 Prem Mandir Knowledge Records'],
            disclaimer: 'Reference timing & route data. Real-time travel time depends on local festival traffic.',
            suggestedFollowups: ['Prem Mandir timings', 'Banke Bihari crowd status']
          };
        } else {
          return {
            answer: `Connecting Banke Bihari Temple to Prem Mandir:\n1. Exit the narrow temple lanes on foot towards Vidyapeeth or the designated e-rickshaw pick-up perimeter.\n2. Take an e-rickshaw along Raman Reti Marg / Chhatikara Road directly to Prem Mandir (approx 4 km, typically 15-25 minutes under normal conditions).\n3. If driving, proceed from outer Vrindavan parking via Bhaktivedanta Swami Marg to Rukmini Vihar / Prem Mandir outer parking lot.\n\nTiming coordination: Prem Mandir evening illumination is best viewed between 6:00 PM and 8:30 PM.`,
            language: 'en',
            provider: 'mock',
            sources: ['M010 Banke Bihari', 'M011 Prem Mandir Knowledge Records'],
            disclaimer: 'Reference route guidance only. Actual travel time may vary with traffic diversions.',
            suggestedFollowups: ['Banke Bihari parking', 'Prem Mandir fountain timings']
          };
        }
      }
    }

    // Check for temple specific match
    const matches = this.findMatchingTemples(q);

    if (matches.length > 0) {
      const t = matches[0];

      const isParkingQuery = qLower.includes('park') || qLower.includes('gaadi') || qLower.includes('vehicle');
      const isTimingQuery = qLower.includes('timing') || qLower.includes('samay') || qLower.includes('kab') || qLower.includes('open') || qLower.includes('darshan');

      if (isParkingQuery) {
        if (lang === 'hinglish') {
          return {
            answer: `${t.name} ke paas suggested parking:\n• ${t.parking}\n\nLast-mile connectivity:\n• ${t.lastMile}\n\nZone Guideline:\n• ${t.zoneRule}\n\nKripya dhyan dein: Yeh suggested/reference parking hai, live guaranteed space nahi hai. Tyohar ke dino parking sthal badal sakte hain.`,
            language: 'hinglish',
            provider: 'mock',
            sources: [`${t.id}: ${t.name} Verified Reference Data`],
            disclaimer: t.disclaimer,
            suggestedFollowups: [`${t.name} darshan timings`, `${t.name} kaise pahuchein`, 'Emergency helpline']
          };
        } else if (lang === 'hi') {
          return {
            answer: `${t.name} के लिए सुझाया गया पार्किंग स्थल:\n• ${t.parking}\n\nअंतिम छोर विकल्प (Last-mile):\n• ${t.lastMile}\n\nक्षेत्र नियम: ${t.zoneRule}\n\nनोट: यह केवल संदर्भ हेतु सुझाया गया पार्किंग स्थल है। स्थानीय पुलिस के निर्देशों का पालन करें।`,
            language: 'hi',
            provider: 'mock',
            sources: [`${t.id}: ${t.name}`],
            disclaimer: t.disclaimer,
            suggestedFollowups: [`${t.name} समय`, 'हेल्पलाइन']
          };
        } else {
          return {
            answer: `Suggested reference parking for ${t.name} (${t.id}):\n• ${t.parking}\n\nLast-Mile Travel:\n• ${t.lastMile}\n\nZone Regulations:\n• ${t.zoneRule}\n\nNotice: Parking suggestions are reference guidance and do not guarantee spot availability. Festivals trigger administration diversions.`,
            language: 'en',
            provider: 'mock',
            sources: [`${t.id}: ${t.name} Reference Record`],
            disclaimer: t.disclaimer,
            suggestedFollowups: [`${t.name} opening hours`, `${t.name} route`, 'Braj Safety Dashboard']
          };
        }
      }

      if (isTimingQuery) {
        if (lang === 'hinglish') {
          return {
            answer: `${t.name} (${t.id}) ke general reference timings:\n• ${t.timing}\n\nArea: ${t.area} (${t.zone})\n\nImportant Note: Mandir ke darshan samay mausam (summer/winter), aarti aur tyoharon ke anusaar badal sakte hain. Yatra shuru karne se pehle local star par confirm karein.`,
            language: 'hinglish',
            provider: 'mock',
            sources: [`${t.id}: ${t.name}`],
            disclaimer: t.disclaimer,
            suggestedFollowups: [`${t.name} parking kahan hai`, `${t.name} route`]
          };
        } else {
          return {
            answer: `General reference timings for ${t.name} (${t.id}):\n• Timings: ${t.timing}\n• Location: ${t.area} (${t.zone})\n\nRoute: ${t.route}\n\nImportant Note: Darshan hours fluctuate between summer/winter schedules and festival aartis. Confirm locally upon arrival.`,
            language: 'en',
            provider: 'mock',
            sources: [`${t.id}: ${t.name}`],
            disclaimer: t.disclaimer,
            suggestedFollowups: [`Suggested parking for ${t.name}`, `Nearby food at ${t.name}`]
          };
        }
      }

      if (lang === 'hinglish') {
        return {
          answer: `${t.name} (${t.id}) Information:\n• Timings: ${t.timing}\n• Route: ${t.route}\n• Suggested Parking: ${t.parking}\n• Last-Mile: ${t.lastMile}\n• Nearby Food & Shopping: ${t.nearby}\n• Zone Rule: ${t.zoneRule}`,
          language: 'hinglish',
          provider: 'mock',
          sources: [`${t.id}: ${t.name}`],
          disclaimer: t.disclaimer,
          suggestedFollowups: [`${t.name} parking`, `${t.name} timings`, 'Yatra Planner']
        };
      } else {
        return {
          answer: `${t.name} (${t.id}) Overview:\n• Timings: ${t.timing}\n• Route: ${t.route}\n• Suggested Parking: ${t.parking}\n• Last-Mile: ${t.lastMile}\n• Nearby Outlets: ${t.nearby}\n• Zone Rule: ${t.zoneRule}`,
          language: 'en',
          provider: 'mock',
          sources: [`${t.id}: ${t.name}`],
          disclaimer: t.disclaimer,
          suggestedFollowups: [`Parking for ${t.name}`, `Timings for ${t.name}`]
        };
      }
    }

    // Check for hours planning
    if (qLower.includes('hour') || qLower.includes('ghante') || qLower.includes('plan')) {
      if (lang === 'hinglish') {
        return {
          answer: `5 ghante me ek santulit yatra plan (e.g. Banke Bihari + Prem Mandir):\n1. Pehle Banke Bihari (Old Vrindavan): Gaadi Mandi/ITI parking me park karein, e-rickshaw se mandir pahunchein (approx 2 ghante darshan aur aana-jaana).\n2. Phir Prem Mandir (Chhatikara Road): E-rickshaw ya bypass se Prem Mandir pahunchein (approx 2 ghante darshan, garden aur illumination).\n3. Bachhe 1 ghante me local Mathura peda / lassi aur outer route return plan karein.\n\nNote: Yatra Planner tab par jaakar aap custom stops select kar sakte hain!`,
          language: 'hinglish',
          provider: 'mock',
          sources: ['Braj Yatra Planner Engine'],
          disclaimer: 'Estimated reference schedule. Does not account for live traffic delays.',
          suggestedFollowups: ['Open Yatra Planner', 'Banke Bihari parking', 'Prem Mandir timings']
        };
      } else {
        return {
          answer: `For a 5-hour window covering Banke Bihari and Prem Mandir:\n• Stop 1 (0-2 hrs): Banke Bihari Temple. Park at Mandi or ITI outer parking, take e-rickshaw into the temple perimeter.\n• Stop 2 (2-4 hrs): Prem Mandir. Proceed to Chhatikara Road; enjoy temple architecture and evening lights.\n• Buffer (4-5 hrs): Sample famous Vrindavan lassi or Mathura peda, return to starting station.\n\nUse our dedicated /planner tool to customize exact stop sequences!`,
          language: 'en',
          provider: 'mock',
          sources: ['Braj Yatra Planner Engine'],
          disclaimer: 'Reference time allocations. Traffic and queue lengths vary during festivals.',
          suggestedFollowups: ['Open Yatra Planner', 'Mathura Junction crowd']
        };
      }
    }

    // Out of domain / insufficient information fallback
    if (lang === 'hinglish') {
      return {
        answer: `I don't have enough verified information for that in the BrajSahayak reference knowledge base.\n\nMain keval Braj kshetra ke 32 mandiron, suggested parking, darshan timings, last-mile route, nearby food aur public safety se jude sawalon ke verified reference jawaab de sakta hoon.`,
        language: 'hinglish',
        provider: 'mock',
        sources: ['BrajSahayak Grounded Knowledge Base'],
        disclaimer: 'BrajSahayak answers exclusively from verified reference documents to prevent hallucinations.',
        suggestedFollowups: ['Banke Bihari parking kahan hai?', 'Prem Mandir timing?', 'Mathura helpline number']
      };
    } else if (lang === 'hi') {
      return {
        answer: `इस प्रश्न के लिए ब्रजसहायक सत्यापित डेटाबेस में पर्याप्त जानकारी उपलब्ध नहीं है।\n\nकृपया ब्रज क्षेत्र के 32 मंदिरों, पार्किंग, समय और मार्गों से संबंधित प्रश्न पूछें।`,
        language: 'hi',
        provider: 'mock',
        sources: ['BrajSahayak Grounded Knowledge Base'],
        disclaimer: 'यह सहायक केवल सत्यापित संदर्भ दस्तावेजों से उत्तर देता है।',
        suggestedFollowups: ['बांके बिहारी समय', 'द्वारकाधीश मंदिर रूट']
      };
    } else {
      return {
        answer: `I don't have enough verified information for that.\n\nBrajSahayak is strictly grounded in reference data covering 32 verified sacred places in the Braj region (Mathura, Vrindavan, Govardhan, Barsana, Nandgaon, Gokul, Baldeo), suggested parking, last-mile transit, and crowd safety telemetry.`,
        language: 'en',
        provider: 'mock',
        sources: ['BrajSahayak Grounded Knowledge Base'],
        disclaimer: 'Grounded AI safeguard: The assistant will not extrapolate or hallucinate unverified details.',
        suggestedFollowups: ['Where to park near Banke Bihari?', 'Prem Mandir route', 'Emergency helplines']
      };
    }
  }
}
