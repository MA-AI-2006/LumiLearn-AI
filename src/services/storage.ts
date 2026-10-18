import {
  NoteDocument,
  SourceMaterial,
  Quiz,
  QuizAttempt,
  FlashcardDeck,
  TranslationResource,
  TutorConversation,
  UserPreferences
} from '../types';
import {
  auth,
  db,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc
} from './firebase';

const LOCAL_PREFIX = 'lumilearn_';

// Initial pre-loaded study material (Economics & Microeconomics as requested in prompts)
export const SEED_NOTES: NoteDocument[] = [
  {
    id: 'note-econ-101',
    title: 'Principles of Market Equilibrium, Elasticity & Welfare Economics',
    overview:
      'A thorough, teaching-first exploration of how competitive markets allocate resources, how buyers and sellers respond to price fluctuations via elasticity, and how market interventions such as taxes induce deadweight loss.',
    detailLevel: 'detailed',
    academicLevel: 'university',
    language: 'English',
    tags: ['Economics', 'Microeconomics', 'Market Dynamics', 'Calculus/Algebra'],
    summary:
      'Markets coordinate decentralized decisions through the price mechanism. Price elasticity reveals consumer price responsiveness, while economic surplus models the social efficiency of trade.',
    keyTakeaways: [
      'Equilibrium occurs when quantity demanded equals quantity supplied: Qd(P*) = Qs(P*).',
      'The midpoint method calculates elasticity without dependency on direction of price change.',
      'Unitary elasticity maximizes total revenue along a linear downward-sloping demand curve.',
      'Deadweight loss represents lost economic surplus from trades that no longer occur under taxation.'
    ],
    revisionChecklist: [
      'State the law of demand and law of supply with ceteris paribus assumption.',
      'Compute midpoint price elasticity of demand with step-by-step arithmetic.',
      'Explain why total revenue falls when price rises for elastic demand goods.',
      'Derive and explain the triangular area formula for deadweight loss under per-unit tax.'
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    sections: [
      {
        id: 'sec-1',
        title: '1. Market Equilibrium and Price Discovery',
        level: 1,
        content: `A market brings together decentralized buyers and sellers. Under the standard competitive framework, buyers seek to maximize consumer utility while sellers seek to maximize firm profits.

**Quantity Demanded (Qd)** is the specific quantity of a good that consumers are willing and able to purchase at a given price over a defined time horizon, holding other factors constant (*ceteris paribus*).
**Quantity Supplied (Qs)** is the amount producers are willing and able to bring to market at that same price.

Market equilibrium represents the unique market-clearing price at which quantity demanded exactly balances quantity supplied. If the market price is temporarily below equilibrium, a **shortage** emerges, spurring upward bidding among buyers. If the price sits above equilibrium, unsold inventory creates a **surplus**, prompting sellers to discount prices.`,
        formulas: [
          {
            name: 'Market Equilibrium Condition',
            latex: 'Q_d(P^*) = Q_s(P^*) = Q^*',
            plainVersion: 'Quantity buyers want to purchase at the clearing price equals quantity sellers produce.',
            purpose: 'Identifies the equilibrium price (P*) and equilibrium quantity (Q*) where the market clears without shortages or surpluses.',
            symbols: [
              { symbol: 'P^*', meaning: 'Market-clearing equilibrium price' },
              { symbol: 'Q^*', meaning: 'Equilibrium market quantity traded' },
              { symbol: 'Q_d(P)', meaning: 'Demand function relating price to units demanded' },
              { symbol: 'Q_s(P)', meaning: 'Supply function relating price to units supplied' }
            ],
            stepByStepMethod: [
              'Set the inverse or direct demand equation equal to the supply equation: Qd = Qs.',
              'Solve algebraically for the unknown equilibrium price P*.',
              'Substitute the calculated P* back into either equation to obtain the equilibrium quantity Q*.',
              'Cross-check by substituting P* into the other equation to verify both quantities match.'
            ],
            workedExample: {
              problem: 'Suppose market demand is Qd = 120 - 4P and market supply is Qs = 20 + 6P. Find the equilibrium price and quantity.',
              givenValues: 'Demand: Qd = 120 - 4P; Supply: Qs = 20 + 6P',
              steps: [
                { step: 'Equate Qd and Qs', calculation: '120 - 4P = 20 + 6P', result: '100 = 10P' },
                { step: 'Solve for Equilibrium Price', calculation: 'P^* = 100 / 10', result: 'P^* = $10.00' },
                { step: 'Substitute P* into Qd', calculation: 'Q^* = 120 - 4(10) = 120 - 40', result: 'Q^* = 80 units' }
              ],
              finalAnswer: 'P* = $10.00, Q* = 80 units',
              interpretation: 'At $10 per unit, buyers wish to buy exactly 80 units and sellers wish to sell exactly 80 units. The market clears with zero shortage or excess inventory.'
            },
            commonMistakes: [
              'Equating Price to Quantity instead of equating Quantity Demanded to Quantity Supplied.',
              'Forgetting to verify whether the demand curve formula is P(Q) or Q(P).'
            ]
          }
        ]
      },
      {
        id: 'sec-2',
        title: '2. Price Elasticity of Demand (Midpoint Method)',
        level: 1,
        content: `**Price Elasticity of Demand (Ed)** quantifies the responsiveness or sensitivity of consumer purchasing decisions to changes in price. 

Rather than relying on raw slope (which is sensitive to arbitrary units of measurement like dollars vs cents, or kilograms vs grams), elasticity relies on percentage variations. The **Midpoint Formula** calculates the percentage change relative to the average of initial and ending values, guaranteeing that the elasticity coefficient remains symmetric whether the price moves up or down.`,
        formulas: [
          {
            name: 'Price Elasticity of Demand (Midpoint Formula)',
            latex: 'E_d = \\left| \\frac{(Q_2 - Q_1) / \\left[\\frac{Q_1 + Q_2}{2}\\right]}{(P_2 - P_1) / \\left[\\frac{P_1 + P_2}{2}\\right]} \\right|',
            plainVersion: 'Percentage change in quantity demanded divided by percentage change in price, using average bases.',
            purpose: 'Calculates the magnitude of consumer responsiveness to price changes without dependency on direction of price change.',
            symbols: [
              { symbol: 'E_d', meaning: 'Price Elasticity of Demand coefficient (expressed as positive magnitude)' },
              { symbol: 'Q_1, Q_2', meaning: 'Initial and revised quantities demanded' },
              { symbol: 'P_1, P_2', meaning: 'Initial and revised prices' }
            ],
            stepByStepMethod: [
              'Find change in quantity: ΔQ = Q2 - Q1.',
              'Calculate average quantity: Q_avg = (Q1 + Q2) / 2.',
              'Calculate percentage change in quantity: %ΔQ = ΔQ / Q_avg.',
              'Find change in price: ΔP = P2 - P1.',
              'Calculate average price: P_avg = (P1 + P2) / 2.',
              'Calculate percentage change in price: %ΔP = ΔP / P_avg.',
              'Divide %ΔQ by %ΔP and take the absolute value |Ed|.'
            ],
            workedExample: {
              problem: 'A bookstore raises textbook price from $10 to $12. Quantity demanded declines from 100 units to 80 units. Compute Ed and determine whether demand is elastic.',
              givenValues: 'P1 = $10, P2 = $12, Q1 = 100 units, Q2 = 80 units',
              steps: [
                { step: 'Quantity difference', calculation: '80 - 100', result: '-20 units' },
                { step: 'Average quantity', calculation: '(100 + 80) / 2', result: '90 units' },
                { step: 'Percentage change in quantity', calculation: '-20 / 90 * 100', result: '-22.22%' },
                { step: 'Price difference', calculation: '12 - 10', result: '+$2.00' },
                { step: 'Average price', calculation: '(10 + 12) / 2', result: '$11.00' },
                { step: 'Percentage change in price', calculation: '2 / 11 * 100', result: '+18.18%' },
                { step: 'Elasticity magnitude', calculation: '|-22.22% / 18.18%|', result: '1.22' }
              ],
              finalAnswer: 'Ed = 1.22 (Elastic Demand)',
              interpretation: 'Because Ed = 1.22 > 1.0, demand is price-elastic. A 1% increase in price causes an approximate 1.22% decline in quantity demanded. Consequently, the bookstore will experience a reduction in total revenue from raising the price.'
            },
            commonMistakes: [
              'Using only the starting value as denominator rather than the midpoint average.',
              'Confusing price elasticity with the slope of the demand curve.'
            ]
          }
        ]
      },
      {
        id: 'sec-3',
        title: '3. Consumer Surplus and Deadweight Loss',
        level: 1,
        content: `**Consumer Surplus (CS)** represents the monetary gain obtained by consumers because they are able to purchase a product for a price less than the highest price they would be willing to pay. 
**Producer Surplus (PS)** represents the difference between the amount the producer is willing to accept versus what they receive.

When governments impose an excise or per-unit tax **t**, a tax wedge is driven between the price paid by consumers (Pc) and the price received by sellers (Ps). This reduces total output from Q* to Qt.

**Deadweight Loss (DWL)** is the net loss of total economic welfare (CS + PS + Tax Revenue) resulting from market distortion. Mutual gains from trade that could have occurred between Q* and Qt are completely extinguished.`,
        formulas: [
          {
            name: 'Deadweight Loss under Linear Tax Wedge',
            latex: 'DWL = \\frac{1}{2} \\cdot t \\cdot (Q^* - Q_t)',
            plainVersion: 'Area of the welfare triangle: 0.5 * tax rate * quantity reduction.',
            purpose: 'Quantifies lost social welfare from missed mutually beneficial transactions under taxation.',
            symbols: [
              { symbol: 'DWL', meaning: 'Deadweight loss in currency/welfare units' },
              { symbol: 't', meaning: 'Per-unit tax wedge: t = P_c - P_s' },
              { symbol: 'Q^*', meaning: 'Pre-tax competitive equilibrium quantity' },
              { symbol: 'Q_t', meaning: 'Post-tax quantity traded in the market' }
            ],
            stepByStepMethod: [
              'Determine the per-unit tax t.',
              'Calculate equilibrium quantity Q* without tax.',
              'Calculate post-tax quantity Qt by incorporating the tax wedge into supply and demand.',
              'Calculate the quantity shrinkage: ΔQ = Q* - Qt.',
              'Apply triangle area geometry: 0.5 * t * ΔQ.'
            ],
            workedExample: {
              problem: 'A $4 per-unit tax is levied on an energy drink market where original equilibrium quantity was 80 units. Under the tax, trade contracts to 65 units. Calculate the resulting deadweight loss.',
              givenValues: 't = $4.00, Q* = 80 units, Qt = 65 units',
              steps: [
                { step: 'Quantity reduction', calculation: '80 - 65', result: '15 units' },
                { step: 'Base * Height multiplication', calculation: '4 * 15', result: '$60.00' },
                { step: 'Triangle factor (0.5)', calculation: '0.5 * 60', result: '$30.00' }
              ],
              finalAnswer: 'DWL = $30.00',
              interpretation: '$30 worth of economic value is lost to society as deadweight loss. This surplus is neither captured by consumers, nor producers, nor government tax receipts.'
            }
          }
        ]
      }
    ]
  }
];

export const SEED_SOURCES: SourceMaterial[] = [
  {
    id: 'src-econ-1',
    title: 'Microeconomics_Chapter4_MarketForces.pdf',
    sourceType: 'document',
    fileName: 'Microeconomics_Chapter4_MarketForces.pdf',
    fileSize: '2.4 MB',
    mimeType: 'application/pdf',
    summary: 'Comprehensive university chapter covering supply and demand, elasticity, tax wedges, and deadweight loss.',
    processingStatus: 'ready',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'src-math-2',
    title: 'Calculus_Optimization_Lecture.mp3',
    sourceType: 'audio',
    fileName: 'Calculus_Optimization_Lecture.mp3',
    fileSize: '14.8 MB',
    mimeType: 'audio/mp3',
    summary: 'Lecture covering critical points, second derivative tests, and applied economics optimization problems.',
    processingStatus: 'ready',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const SEED_QUIZZES: Quiz[] = [
  {
    id: 'quiz-econ-1',
    sourceId: 'src-econ-1',
    noteId: 'note-econ-101',
    title: 'Market Equilibrium & Elasticity Assessment',
    description: 'Test your understanding of supply-demand equilibrium, midpoint elasticity, and deadweight loss calculation.',
    difficulty: 'intermediate',
    language: 'English',
    bestScore: 100,
    lastAttemptAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: 'What occurs in a competitive market when the prevailing price sits below the equilibrium price P*?',
        options: [
          'A surplus emerges because quantity supplied exceeds quantity demanded',
          'A shortage emerges because quantity demanded exceeds quantity supplied',
          'The demand curve automatically shifts to the left',
          'Sellers immediately cease all economic production'
        ],
        correctAnswer: 'A shortage emerges because quantity demanded exceeds quantity supplied',
        explanation: 'When price is below equilibrium, buyers demand more units than sellers are willing to supply at that lower price, resulting in excess demand (shortage). Competition among buyers bids the price upward.',
        difficulty: 'intermediate'
      },
      {
        id: 'q2',
        type: 'multiple_choice',
        question: 'If the price elasticity of demand coefficient |Ed| is 1.6, how will total revenue change if the firm increases price?',
        options: [
          'Total revenue will increase',
          'Total revenue will decrease',
          'Total revenue will remain perfectly unchanged',
          'Total revenue will drop to exactly zero'
        ],
        correctAnswer: 'Total revenue will decrease',
        explanation: 'Because |Ed| = 1.6 > 1, demand is elastic. The percentage drop in quantity demanded is larger than the percentage increase in price, causing total revenue (P * Q) to decrease.',
        difficulty: 'intermediate',
        formulaUsed: 'E_d = |\\%\\Delta Q / \\%\\Delta P|'
      },
      {
        id: 'q3',
        type: 'true_false',
        question: 'Deadweight loss from a per-unit tax is captured as government tax revenue.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'Deadweight loss represents lost economic surplus from trades that no longer occur. It is NOT collected by the government; it represents a pure destruction of potential economic welfare.',
        difficulty: 'beginner'
      }
    ]
  }
];

export const SEED_FLASHCARDS: FlashcardDeck[] = [
  {
    id: 'deck-econ-1',
    sourceId: 'src-econ-1',
    noteId: 'note-econ-101',
    title: 'Microeconomics Formulas & Key Concepts',
    description: 'Master core formulas: Equilibrium, Midpoint Elasticity, Consumer Surplus, and Deadweight Loss.',
    subject: 'Economics',
    cardsMastered: 2,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    cards: [
      {
        id: 'c1',
        front: 'What is the Midpoint Formula for Price Elasticity of Demand (Ed)?',
        back: 'Ed = | [ (Q2 - Q1) / ((Q1 + Q2)/2) ] / [ (P2 - P1) / ((P1 + P2)/2) ] |',
        easyExplanation: 'Percentage change in quantity over percentage change in price, using average quantity and average price as bases.',
        formulaLatex: 'E_d = \\left| \\frac{(Q_2 - Q_1) / \\left[\\frac{Q_1 + Q_2}{2}\\right]}{(P_2 - P_1) / \\left[\\frac{P_1 + P_2}{2}\\right]} \\right|',
        status: 'mastered',
        lastReviewed: new Date().toISOString()
      },
      {
        id: 'c2',
        front: 'What defines Unitary Elasticity and its effect on Total Revenue?',
        back: 'When |Ed| = 1.0. At this point, a percentage change in price produces an equal percentage change in quantity demanded. Total revenue is maximized.',
        easyExplanation: 'Price changes and quantity changes balance out evenly, so revenue reaches its peak.',
        status: 'mastered',
        lastReviewed: new Date().toISOString()
      },
      {
        id: 'c3',
        front: 'What is Deadweight Loss (DWL) in economic welfare analysis?',
        back: 'The loss of total economic surplus (consumer surplus + producer surplus) that results from an intervention (like a tax or tariff) reducing trades below the socially optimal equilibrium quantity.',
        formulaLatex: 'DWL = \\frac{1}{2} \\cdot t \\cdot (Q^* - Q_t)',
        easyExplanation: 'The lost welfare of mutually beneficial trades that never happen because of the tax wedge.',
        status: 'learning',
        lastReviewed: new Date().toISOString()
      }
    ]
  }
];

export const SEED_TUTOR_CONVERSATION: TutorConversation = {
  id: 'conv-sample',
  title: 'Understanding Price Elasticity Intuition',
  sourceId: 'src-econ-1',
  sourceTitle: 'Microeconomics_Chapter4_MarketForces.pdf',
  explanationLevel: 'university',
  createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  updatedAt: new Date(Date.now() - 3600000).toISOString(),
  messages: [
    {
      id: 'm1',
      role: 'user',
      content: 'Can you explain why raising the price of an elastic good reduces total revenue?',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'm2',
      role: 'assistant',
      content: `Let's break this down intuitively with both mathematical rigor and plain language:

1. **Total Revenue Definition:**
Total revenue is simply price multiplied by quantity:
\\[ TR = P \\times Q \\]

2. **The Two Opposing Forces:**
When you raise the price \\( P \\uparrow \\):
- **Positive Price Effect:** You gain more money for every unit you do sell.
- **Negative Quantity Effect:** Due to the law of demand, consumers buy fewer units \\( Q \\downarrow \\).

3. **Why Elasticity Determines the Winner:**
Elastic demand means consumers are **highly sensitive** to price (|Ed| > 1).
When you raise price by, say, **10%**, quantity demanded plunges by **20%**.

The loss of sales volume outweighs the higher price per unit! Therefore:
\\[ TR_{new} < TR_{old} \\]

In contrast, if demand were inelastic (|Ed| < 1), quantity would only drop slightly (e.g. 3%), and total revenue would rise!`,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      suggestedFollowUps: [
        'How does unitary elasticity fit into this?',
        'Show me a numerical calculation with midpoint formula',
        'What real-world goods are elastic vs inelastic?'
      ]
    }
  ]
};

// Storage helper functions (Handles both LocalStorage fallback and Firestore sync)
class StorageManager {
  private getLocal<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(LOCAL_PREFIX + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setLocal<T>(key: string, value: T): void {
    try {
      localStorage.setItem(LOCAL_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage quota exceeded or unavailable', e);
    }
  }

  // --- Source Materials ---
  async getSources(): Promise<SourceMaterial[]> {
    const user = auth.currentUser;
    if (user) {
      try {
        const col = collection(db, 'users', user.uid, 'sources');
        const snap = await getDocs(col);
        if (!snap.empty) {
          return snap.docs.map(d => ({ ...d.data(), id: d.id } as SourceMaterial));
        }
      } catch (err) {
        console.warn('Firestore getSources error, falling back to local', err);
      }
    }
    return this.getLocal<SourceMaterial[]>('sources', SEED_SOURCES);
  }

  async saveSource(source: SourceMaterial): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'sources', source.id);
        await setDoc(docRef, { ...source, userId: user.uid });
      } catch (err) {
        console.warn('Firestore saveSource error', err);
      }
    }
    const current = this.getLocal<SourceMaterial[]>('sources', SEED_SOURCES);
    const updated = [source, ...current.filter(s => s.id !== source.id)];
    this.setLocal('sources', updated);
  }

  async deleteSource(sourceId: string): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'sources', sourceId);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('Firestore deleteSource error', err);
      }
    }
    const current = this.getLocal<SourceMaterial[]>('sources', SEED_SOURCES);
    this.setLocal('sources', current.filter(s => s.id !== sourceId));
  }

  // --- Notes ---
  async getNotes(): Promise<NoteDocument[]> {
    const user = auth.currentUser;
    if (user) {
      try {
        const col = collection(db, 'users', user.uid, 'notes');
        const snap = await getDocs(col);
        if (!snap.empty) {
          return snap.docs.map(d => ({ ...d.data(), id: d.id } as NoteDocument));
        }
      } catch (err) {
        console.warn('Firestore getNotes error, using local fallback', err);
      }
    }
    return this.getLocal<NoteDocument[]>('notes', SEED_NOTES);
  }

  async getNoteById(id: string): Promise<NoteDocument | null> {
    const notes = await this.getNotes();
    return notes.find(n => n.id === id) || null;
  }

  async saveNote(note: NoteDocument): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'notes', note.id);
        await setDoc(docRef, { ...note, userId: user.uid, updatedAt: new Date().toISOString() });
      } catch (err) {
        console.warn('Firestore saveNote error', err);
      }
    }
    const current = this.getLocal<NoteDocument[]>('notes', SEED_NOTES);
    const updated = [note, ...current.filter(n => n.id !== note.id)];
    this.setLocal('notes', updated);
  }

  async deleteNote(noteId: string): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'notes', noteId);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('Firestore deleteNote error', err);
      }
    }
    const current = this.getLocal<NoteDocument[]>('notes', SEED_NOTES);
    this.setLocal('notes', current.filter(n => n.id !== noteId));
  }

  // --- Quizzes ---
  async getQuizzes(): Promise<Quiz[]> {
    const user = auth.currentUser;
    if (user) {
      try {
        const col = collection(db, 'users', user.uid, 'quizzes');
        const snap = await getDocs(col);
        if (!snap.empty) {
          return snap.docs.map(d => ({ ...d.data(), id: d.id } as Quiz));
        }
      } catch (err) {
        console.warn('Firestore getQuizzes error', err);
      }
    }
    return this.getLocal<Quiz[]>('quizzes', SEED_QUIZZES);
  }

  async saveQuiz(quiz: Quiz): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'quizzes', quiz.id);
        await setDoc(docRef, { ...quiz, userId: user.uid });
      } catch (err) {
        console.warn('Firestore saveQuiz error', err);
      }
    }
    const current = this.getLocal<Quiz[]>('quizzes', SEED_QUIZZES);
    this.setLocal('quizzes', [quiz, ...current.filter(q => q.id !== quiz.id)]);
  }

  // --- Flashcard Decks ---
  async getFlashcardDecks(): Promise<FlashcardDeck[]> {
    const user = auth.currentUser;
    if (user) {
      try {
        const col = collection(db, 'users', user.uid, 'flashcards');
        const snap = await getDocs(col);
        if (!snap.empty) {
          return snap.docs.map(d => ({ ...d.data(), id: d.id } as FlashcardDeck));
        }
      } catch (err) {
        console.warn('Firestore getFlashcardDecks error', err);
      }
    }
    return this.getLocal<FlashcardDeck[]>('flashcard_decks', SEED_FLASHCARDS);
  }

  async saveFlashcardDeck(deck: FlashcardDeck): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'flashcards', deck.id);
        await setDoc(docRef, { ...deck, userId: user.uid });
      } catch (err) {
        console.warn('Firestore saveFlashcardDeck error', err);
      }
    }
    const current = this.getLocal<FlashcardDeck[]>('flashcard_decks', SEED_FLASHCARDS);
    this.setLocal('flashcard_decks', [deck, ...current.filter(d => d.id !== deck.id)]);
  }

  // --- Translations ---
  async getTranslations(): Promise<TranslationResource[]> {
    return this.getLocal<TranslationResource[]>('translations', []);
  }

  async saveTranslation(trans: TranslationResource): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'translations', trans.id);
        await setDoc(docRef, { ...trans, userId: user.uid });
      } catch (err) {
        console.warn('Firestore saveTranslation error', err);
      }
    }
    const current = this.getLocal<TranslationResource[]>('translations', []);
    this.setLocal('translations', [trans, ...current.filter(t => t.id !== trans.id)]);
  }

  // --- Tutor Conversations ---
  async getTutorConversations(): Promise<TutorConversation[]> {
    return this.getLocal<TutorConversation[]>('tutor_conversations', [SEED_TUTOR_CONVERSATION]);
  }

  async saveTutorConversation(conv: TutorConversation): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'tutorConversations', conv.id);
        await setDoc(docRef, { ...conv, userId: user.uid });
      } catch (err) {
        console.warn('Firestore saveTutorConversation error', err);
      }
    }
    const current = this.getLocal<TutorConversation[]>('tutor_conversations', [SEED_TUTOR_CONVERSATION]);
    this.setLocal('tutor_conversations', [conv, ...current.filter(c => c.id !== conv.id)]);
  }

  // --- User Preferences ---
  async getPreferences(): Promise<UserPreferences> {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return snap.data() as UserPreferences;
        }
      } catch (err) {
        console.warn('Firestore getPreferences error', err);
      }
    }
    return this.getLocal<UserPreferences>('user_preferences', {
      displayName: 'Guest Student',
      email: 'student@lumilearn.ai',
      preferredLanguage: 'English',
      preferredNoteDetail: 'detailed',
      preferredQuizDifficulty: 'intermediate',
      theme: 'light'
    });
  }

  async savePreferences(prefs: UserPreferences): Promise<void> {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, prefs, { merge: true });
      } catch (err) {
        console.warn('Firestore savePreferences error', err);
      }
    }
    this.setLocal('user_preferences', prefs);
  }

  // Guest data migration to authenticated account
  async migrateGuestDataToUser(uid: string): Promise<number> {
    if (!uid) return 0;

    // Avoid redundant migration runs if already completed for this user
    const migrationMarker = `${LOCAL_PREFIX}migrated_${uid}`;
    if (localStorage.getItem(migrationMarker) === 'true') {
      return 0;
    }

    let migratedCount = 0;
    try {
      const localNotes = this.getLocal<NoteDocument[]>('notes', []);
      const localSources = this.getLocal<SourceMaterial[]>('sources', []);
      const localQuizzes = this.getLocal<Quiz[]>('quizzes', []);
      const localDecks = this.getLocal<FlashcardDeck[]>('flashcard_decks', []);

      // If there's nothing in local storage to migrate, mark and exit
      if (
        localNotes.length === 0 &&
        localSources.length === 0 &&
        localQuizzes.length === 0 &&
        localDecks.length === 0
      ) {
        localStorage.setItem(migrationMarker, 'true');
        return 0;
      }

      // Migrate notes safely
      for (const note of localNotes) {
        try {
          const docRef = doc(db, 'users', uid, 'notes', note.id);
          await setDoc(docRef, { ...note, userId: uid });
          migratedCount++;
        } catch (e: any) {
          if (e?.code === 'permission-denied' || e?.message?.includes('permissions')) {
            console.warn(
              'Firestore cloud sync notice: Firestore security rules in Firebase Console require deployment. Guest notes remain safe locally in browser storage.',
              e?.message
            );
            return migratedCount;
          }
        }
      }

      // Migrate sources safely
      for (const src of localSources) {
        try {
          const docRef = doc(db, 'users', uid, 'sources', src.id);
          await setDoc(docRef, { ...src, userId: uid });
          migratedCount++;
        } catch (e: any) {
          if (e?.code === 'permission-denied' || e?.message?.includes('permissions')) {
            console.warn('Firestore cloud sync pending for sources:', e?.message);
            return migratedCount;
          }
        }
      }

      // Migrate quizzes safely
      for (const q of localQuizzes) {
        try {
          const docRef = doc(db, 'users', uid, 'quizzes', q.id);
          await setDoc(docRef, { ...q, userId: uid });
          migratedCount++;
        } catch (e: any) {
          if (e?.code === 'permission-denied' || e?.message?.includes('permissions')) {
            console.warn('Firestore cloud sync pending for quizzes:', e?.message);
            return migratedCount;
          }
        }
      }

      // Migrate flashcards safely
      for (const d of localDecks) {
        try {
          const docRef = doc(db, 'users', uid, 'flashcards', d.id);
          await setDoc(docRef, { ...d, userId: uid });
          migratedCount++;
        } catch (e: any) {
          if (e?.code === 'permission-denied' || e?.message?.includes('permissions')) {
            console.warn('Firestore cloud sync pending for flashcard decks:', e?.message);
            return migratedCount;
          }
        }
      }

      // Mark migration as completed so it does not re-attempt needlessly on every load
      localStorage.setItem(migrationMarker, 'true');
    } catch (err: any) {
      console.warn('Cloud sync migration deferred (network or permissions):', err?.message || err);
    }
    return migratedCount;
  }
}

export const storage = new StorageManager();
