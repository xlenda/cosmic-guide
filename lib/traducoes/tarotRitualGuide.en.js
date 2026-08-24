const tarotRitualGuideEn = {
  themes: {
    love: {
      label: 'Love',
      focuses: {
        'new-bond': {
          label: 'Make room for a new connection',
          suggestedQuestion: 'What could help me recognize and build a reciprocal connection?',
          acknowledgement: 'You are not simply looking for someone; you want clarity without losing yourself at the beginning.',
          plan: 'We will look at what still travels with you, what is available now, and one possible direction forward.',
          cta: 'Help me see this beginning',
        },
        'mutuality-boundaries': {
          label: 'Understand reciprocity and boundaries',
          suggestedQuestion: 'What do I need to notice to balance care, reciprocity, and boundaries in this relationship?',
          acknowledgement: 'You want to care for the connection with reciprocity and clear boundaries, without leaving your own needs outside the conversation.',
          plan: 'We will separate the current situation, the tension that needs a name, and a possible next step between you.',
          cta: 'Bring clarity to this connection',
        },
        'closure-renewal': {
          label: 'Distinguish closure from renewal',
          suggestedQuestion: 'What does this phase reveal about closing, transforming, or renewing this connection?',
          acknowledgement: 'A relationship may call for change before it offers a simple answer about staying or leaving.',
          plan: 'We will recognize the situation, the point that can no longer be avoided, and the most honest action for now.',
          cta: 'Let me face this turning point',
        },
      },
    },
    career: {
      label: 'Career',
      focuses: {
        'direction-purpose': {
          label: 'Recover direction and purpose',
          suggestedQuestion: 'What thread connects my experience, my present moment, and a meaningful career direction?',
          acknowledgement: 'You want a direction that uses what you have built without requiring you to stay on autopilot.',
          plan: 'We will connect earlier lessons, present priorities, and one tangible possibility for development.',
          cta: 'Help me recover my direction',
        },
        'visibility-growth': {
          label: 'Build visibility and grow',
          suggestedQuestion: 'What could strengthen my recognition without pulling me away from how I want to work?',
          acknowledgement: 'Growth is not only about being seen more; it is also about making your value understandable without shrinking it.',
          plan: 'We will map your position, the friction limiting your visibility, and one move you can test.',
          cta: 'Help me make my value visible',
        },
        'decision-transition': {
          label: 'Choose through a transition',
          suggestedQuestion: 'What should I consider before deciding on my next professional move?',
          acknowledgement: 'You do not need to decide in the dark or wait for absolute certainty before you begin moving.',
          plan: 'We will define the situation, the tension between options, and a reversible next step that brings information.',
          cta: 'Help me assess my next move',
        },
      },
    },
    money: {
      label: 'Money',
      focuses: {
        'stability-habits': {
          label: 'Build stability through new habits',
          suggestedQuestion: 'Which financial pattern deserves review so I can build greater stability?',
          acknowledgement: 'You are looking for solid ground, not a quick promise; that begins by seeing the whole pattern.',
          plan: 'We will connect earlier habits, current choices, and one possibility for sustainable organization.',
          cta: 'Help me recognize my pattern',
        },
        'opportunity-choice': {
          label: 'Evaluate an opportunity',
          suggestedQuestion: 'What do I need to weigh to evaluate this financial opportunity more consciously?',
          acknowledgement: 'A sound decision can hold both excitement and cost without turning desire into a guarantee.',
          plan: 'We will clarify the offer, the tension between benefit and risk, and a practical check before you act.',
          cta: 'Help me weigh this opportunity',
        },
        'value-boundaries': {
          label: 'Revisit value, exchange, and boundaries',
          suggestedQuestion: 'Where do I need to align my value, my exchanges, and my material boundaries?',
          acknowledgement: 'Charging, offering, receiving, and saying no can all touch the same question of personal value.',
          plan: 'We will name the current exchange, the imbalance asking for attention, and a boundary you can use in daily life.',
          cta: 'Help me align value and limits',
        },
      },
    },
    energy: {
      label: 'Energy',
      focuses: {
        'overload-drain': {
          label: 'Understand overload and distraction',
          suggestedQuestion: 'What is consuming my energy, and which adjustment deserves priority?',
          acknowledgement: 'Tiredness and distraction can point to priorities competing for the same space.',
          plan: 'We will identify the situation, the source of friction, and one concrete reduction that gives your day more room.',
          cta: 'Help me locate what drains me',
        },
        'rhythm-recovery': {
          label: 'Return to a sustainable rhythm',
          suggestedQuestion: 'What shift in rhythm could help me recover presence without forcing productivity?',
          acknowledgement: 'Recovering your rhythm does not mean speeding up; sometimes it means fitting into your own routine again.',
          plan: 'We will look at the rhythm you learned, what you need now, and a more sustainable possibility ahead.',
          cta: 'Help me rebuild my rhythm',
        },
        'motivation-focus': {
          label: 'Rekindle motivation and focus',
          suggestedQuestion: 'What could turn scattered intention into a focus I can actually sustain?',
          acknowledgement: 'Motivation often grows when the next action becomes smaller and easier to see.',
          plan: 'We will separate the starting point, the noise fragmenting your attention, and one short action to try.',
          cta: 'Help me choose my focus',
        },
      },
    },
    wellbeing: {
      label: 'Wellbeing',
      focuses: {
        'emotional-balance': {
          label: 'Understand my emotional balance',
          suggestedQuestion: 'What are my emotions asking me to recognize and hold with care right now?',
          acknowledgement: 'You can listen to what you feel without turning every emotion into an instruction or a judgment.',
          plan: 'We will connect the emotional context, the present need, and one possibility for everyday care.',
          cta: 'Help me listen to this moment',
        },
        'self-care-boundaries': {
          label: 'Protect self-care and boundaries',
          suggestedQuestion: 'Which boundary could make room for more consistent care toward myself?',
          acknowledgement: 'Self-care also appears in choices that protect your time, attention, and availability.',
          plan: 'We will recognize the current demand, where you overextend yourself, and one small boundary to practice.',
          cta: 'Help me make room for care',
        },
        'support-next-step': {
          label: 'Identify support and a next step',
          suggestedQuestion: 'What kind of support and which next step could make this moment easier to move through?',
          acknowledgement: 'Asking for support does not reduce your agency; it can make the next step safer and more possible.',
          plan: 'We will name the situation, what makes it difficult to move through, and one concrete way to seek support.',
          cta: 'Help me recognize my support',
        },
      },
    },
  },
  spreads: {
    'past-present-future': {
      label: 'Origin · Now · Possibility',
      description: 'A continuity spread for noticing influence, presence, and direction without treating the future as certain.',
      positions: [
        { id: 'past', role: 'context', label: 'Origin', prompt: 'The earlier context that still influences this theme.' },
        { id: 'present', role: 'focus', label: 'Now', prompt: 'The point asking for attention in the present moment.' },
        { id: 'future', role: 'possibility', label: 'Possibility', prompt: 'One possible direction and what could bring you closer to it.' },
      ],
    },
    'situation-tension-next-step': {
      label: 'Situation · Tension · Next step',
      description: 'A decision-oriented spread that separates what is happening, what feels tight, and what can be done.',
      positions: [
        {
          id: 'situation', role: 'context', label: 'Situation', prompt: 'The situation as it presents itself now.',
          interpretationFrame: 'Read this card as the visible field of the question: what is already operating before assuming cause or blame.',
        },
        {
          id: 'tension', role: 'tension', label: 'Tension', prompt: 'The need, dynamic, or boundary asking for care.',
          interpretationFrame: 'Here, the card occupies the friction: what competes, tightens, or asks for a boundary within this situation.',
        },
        {
          id: 'next-step', role: 'action', label: 'Next step', prompt: 'One small, possible action for moving forward with more awareness.',
          interpretationFrame: 'Here, the card becomes an experiment: one small gesture that can produce information, not a prediction.',
        },
      ],
    },
  },
  signs: {
    aries: { label: 'Aries', text: 'Use your initiative as a starting point, then leave a pause before your first reaction.' },
    taurus: { label: 'Taurus', text: 'Notice what offers security without turning permanence into an obligation.' },
    gemini: { label: 'Gemini', text: 'Separate curiosity from distraction and name the question that truly matters now.' },
    cancer: { label: 'Cancer', text: 'Make room for what you feel and distinguish genuine care from carrying everything alone.' },
    leo: { label: 'Leo', text: 'Notice where your presence wants to shine and where outside validation weighs too heavily.' },
    virgo: { label: 'Virgo', text: 'Use your eye for detail in service of the next step without demanding a perfect solution.' },
    libra: { label: 'Libra', text: 'Consider both sides, then identify the criterion that makes the choice more fully yours.' },
    scorpio: { label: 'Scorpio', text: 'Approach what feels intense with honesty while respecting the pace of transformation.' },
    sagittarius: { label: 'Sagittarius', text: 'Keep the wider view, but choose one concrete experience you can test.' },
    capricorn: { label: 'Capricorn', text: 'Recognize the responsibility that is yours and release the pressure you do not need to carry.' },
    aquarius: { label: 'Aquarius', text: 'Listen to the different idea without losing sight of connection and human impact.' },
    pisces: { label: 'Pisces', text: 'Trust sensitivity as a signal for attention, then translate it into a clear boundary or gesture.' },
  },
  disclosures: {
    method: 'This guide is assembled through fixed rules from your selections; it is not an AI-generated response.',
    randomness: 'Your focus and sign do not select or replace the cards; the draw remains random.',
    sign: 'Your sun sign is used only as a contemporary reflective lens and does not alter cards or meanings.',
    future: 'The third position shows a possibility and a next step, never a guarantee about the future.',
    wellbeing: 'For wellbeing, the reading offers reflection and does not replace medical, psychological, or other qualified professional care.',
  },
};

export default tarotRitualGuideEn;
