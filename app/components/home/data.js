import {
  FiCode,
  FiPenTool,
  FiTrendingUp,
  FiTarget,
  FiSmartphone,
  FiBriefcase,
  FiVideo,
  FiUsers,
  FiAward,
  FiZap,
  FiBookOpen,
  FiCompass,
  FiCheckCircle,
  FiLayers,
  FiSend,
  FiHeart,
  FiShield,
  FiCreditCard,
  FiCloud,
  FiHeadphones,
} from 'react-icons/fi';

export const marquee = [
  'Web Development',
  'UI/UX Design',
  'React',
  'Next.js',
  'Figma',
  'Digital Marketing',
  'Freelancing',
  'Career Growth',
  'Mobile Apps',
  'Branding',
  'Data Analytics',
  'Python',
];

export const heroBadges = [
  { icon: FiVideo, label: 'Live cohorts', tone: 'primary' },
  { icon: FiAward, label: 'Verified certificate', tone: 'success' },
  { icon: FiUsers, label: 'Mentor support', tone: 'accent' },
];

export const categories = [
  {
    icon: FiCode,
    title: 'Web Development',
    desc: 'Full-stack apps তৈরি করুন React, Next.js আর modern tooling দিয়ে।',
    count: '12 courses',
    tone: 'from-blue-500 to-indigo-500',
  },
  {
    icon: FiPenTool,
    title: 'UI/UX Design',
    desc: 'Product experience design করুন যা users delight দেয় আর conversions বাড়ায়।',
    count: '8 courses',
    tone: 'from-purple-500 to-pink-500',
  },
  {
    icon: FiTrendingUp,
    title: 'Digital Marketing',
    desc: 'Ads, funnels, SEO — যা সত্যিই sales আনে আর brand grow করায়।',
    count: '10 courses',
    tone: 'from-emerald-500 to-teal-500',
  },
  {
    icon: FiTarget,
    title: 'Freelancing',
    desc: 'Clients জিতুন, pricing শিখুন, freelance business scale করুন।',
    count: '6 courses',
    tone: 'from-amber-500 to-orange-500',
  },
  {
    icon: FiSmartphone,
    title: 'Mobile Development',
    desc: 'React Native দিয়ে iOS আর Android apps ship করুন।',
    count: '5 courses',
    tone: 'from-cyan-500 to-blue-500',
  },
  {
    icon: FiBriefcase,
    title: 'Career Development',
    desc: 'Resume, interview, portfolio — industry-ready হয়ে উঠুন।',
    count: '7 courses',
    tone: 'from-rose-500 to-red-500',
  },
];

export const methodology = [
  {
    step: 'Learn',
    icon: FiBookOpen,
    title: 'Structured video lessons',
    desc: 'Concept-by-concept, project-driven curriculum। Bengali explanation + English resources — যেভাবে সবচেয়ে ভালো বুঝবেন।',
    points: ['Lifetime access', 'Downloadable resources', 'Bengali + English mix'],
  },
  {
    step: 'Build',
    icon: FiLayers,
    title: 'Real portfolio projects',
    desc: 'প্রতিটা module শেষে একটা shippable project। Just watching না — actually building।',
    points: ['5+ portfolio projects', 'Real client briefs', 'Code review'],
  },
  {
    step: 'Ship',
    icon: FiSend,
    title: 'Mentor feedback + placement',
    desc: 'Industry mentors থেকে personal feedback আর career support — freelance বা job, দুটোতেই।',
    points: ['1-on-1 mentor sessions', 'Interview prep', 'Portfolio review'],
  },
];

export const roadmap = [
  {
    n: '01',
    title: 'Foundation',
    desc: 'Week 1–2: Setup, fundamentals, core concepts আর tools।',
    icon: FiCompass,
  },
  {
    n: '02',
    title: 'Skill fundamentals',
    desc: 'Week 3–6: Hands-on lessons আর guided exercises দিয়ে core skills।',
    icon: FiBookOpen,
  },
  {
    n: '03',
    title: 'Real projects',
    desc: 'Week 7–10: Portfolio projects — actual client briefs solve করুন।',
    icon: FiLayers,
  },
  {
    n: '04',
    title: 'Mentor review',
    desc: 'Week 11: Industry expert থেকে direct feedback আর code review।',
    icon: FiUsers,
  },
  {
    n: '05',
    title: 'Portfolio launch',
    desc: 'Week 12: Portfolio website, LinkedIn, GitHub — everything ready।',
    icon: FiTarget,
  },
  {
    n: '06',
    title: 'Career placement',
    desc: 'Post-graduation: Interview prep, referrals, freelance guidance।',
    icon: FiAward,
  },
];

export const instructors = [
  {
    name: 'Rakib Hasan',
    role: 'Senior Frontend Engineer',
    company: 'Ex-Grameenphone',
    monogram: 'from-indigo-500 to-purple-500',
    expertise: ['React', 'Next.js', 'TypeScript'],
    students: '2,400+',
  },
  {
    name: 'Farhana Chowdhury',
    role: 'Product Designer',
    company: 'Pathao',
    monogram: 'from-pink-500 to-rose-500',
    expertise: ['Figma', 'UX Research', 'Design Systems'],
    students: '1,800+',
  },
  {
    name: 'Tanvir Ahmed',
    role: 'Growth Marketing Lead',
    company: 'Chaldal',
    monogram: 'from-emerald-500 to-teal-500',
    expertise: ['Meta Ads', 'SEO', 'Analytics'],
    students: '3,100+',
  },
  {
    name: 'Nusrat Jahan',
    role: 'Full-Stack Developer',
    company: 'bKash',
    monogram: 'from-amber-500 to-orange-500',
    expertise: ['Node.js', 'Python', 'AWS'],
    students: '2,650+',
  },
];

export const studentProjects = [
  {
    title: 'Rannaghor Recipe App',
    student: 'Sadia Islam',
    tech: ['React Native', 'Firebase'],
    gradient: 'from-orange-400 via-rose-500 to-pink-500',
  },
  {
    title: 'FreelanceBD Dashboard',
    student: 'Mahin Rahman',
    tech: ['Next.js', 'Prisma', 'Postgres'],
    gradient: 'from-indigo-500 via-purple-500 to-fuchsia-500',
  },
  {
    title: 'Krishi Market Analytics',
    student: 'Ruhul Amin',
    tech: ['Python', 'FastAPI', 'D3'],
    gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
  },
  {
    title: 'CampusHub Social',
    student: 'Ayesha Karim',
    tech: ['React', 'Node', 'Socket.io'],
    gradient: 'from-sky-400 via-blue-500 to-indigo-500',
  },
  {
    title: 'ShobjiBazaar E-commerce',
    student: 'Imran Kabir',
    tech: ['Next.js', 'Stripe', 'MongoDB'],
    gradient: 'from-yellow-400 via-amber-500 to-orange-500',
  },
  {
    title: 'MediGuide Health App',
    student: 'Sumaiya Akter',
    tech: ['Flutter', 'Node', 'MySQL'],
    gradient: 'from-rose-400 via-red-500 to-pink-600',
  },
];

export const successStories = [
  {
    name: 'Sara Ahmed',
    monogram: 'from-blue-500 to-indigo-500',
    before: 'Fresh graduate',
    after: 'Junior Web Developer',
    company: 'Brain Station 23',
    quote:
      'Web development কোর্স শেষ করার ৬ সপ্তাহেই first job পেয়েছি। Portfolio projects আর mock interviews সবচেয়ে বেশি কাজে লেগেছে।',
    salary: '৳45k/mo',
  },
  {
    name: 'Rina Paul',
    monogram: 'from-pink-500 to-rose-500',
    before: 'Content writer',
    after: 'Freelance UX Designer',
    company: 'Upwork Top Rated',
    quote:
      'UX কোর্স করে freelance business শুরু করেছি। Mentor feedback-ই আসল difference — international clients থেকে $2k+/month আসছে।',
    salary: '$2k+/mo',
  },
  {
    name: 'Imran Khan',
    monogram: 'from-emerald-500 to-teal-500',
    before: 'Sales executive',
    after: 'Growth Marketer',
    company: 'ShopUp',
    quote:
      'Zero marketing knowledge থেকে paid campaigns run করছি। First month-এই bootcamp-এর cost recover হয়ে গেছে।',
    salary: '৳65k/mo',
  },
  {
    name: 'Lucia Gomez',
    monogram: 'from-amber-500 to-orange-500',
    before: 'Career switcher',
    after: 'Frontend Engineer',
    company: 'Tiger IT',
    quote:
      'Clear, structured, never boring। Certificate stand out করাতে সাহায্য করেছে আর lifetime access-এর জন্য বারবার ফিরে আসি।',
    salary: '৳55k/mo',
  },
  {
    name: 'Rafiul Islam',
    monogram: 'from-cyan-500 to-blue-500',
    before: 'BSc student',
    after: 'Mobile Developer',
    company: 'Pathao',
    quote:
      'Final year-এ কোর্স করেছি — graduation-এর আগেই full-time offer পেয়ে গেছি। Real project experience সব change করে দিয়েছে।',
    salary: '৳50k/mo',
  },
  {
    name: 'Tahmina Akter',
    monogram: 'from-purple-500 to-fuchsia-500',
    before: 'Housewife',
    after: 'Freelance Designer',
    company: 'Self-employed',
    quote:
      'ঘরে বসে skill শিখে Fiverr-এ level 2 seller হয়েছি। Community support ছাড়া এটা possible হত না।',
    salary: '$1.5k+/mo',
  },
];

export const hiringPartners = [
  'Pathao',
  'bKash',
  'Chaldal',
  'ShopUp',
  'Grameenphone',
  'Brain Station 23',
  'Tiger IT',
  'DataSoft',
  'Robi',
  'Banglalink',
  'Nagad',
  'Daraz',
];

export const careerSupport = [
  {
    icon: FiUsers,
    title: '1-on-1 mock interviews',
    desc: 'Industry experts-দের সাথে interview practice — real questions, real feedback।',
  },
  {
    icon: FiHeart,
    title: 'Portfolio review sessions',
    desc: 'Personal portfolio audit + suggestions থেকে employers আকর্ষণ করার পথ।',
  },
  {
    icon: FiSend,
    title: 'Referral network',
    desc: '৫০+ partner companies যেখানে আমাদের graduates already hire হচ্ছে।',
  },
  {
    icon: FiCheckCircle,
    title: 'Resume + LinkedIn clinic',
    desc: 'Recruiter-friendly resume আর LinkedIn profile — ATS pass করবে যেভাবে।',
  },
];

export const certifications = [
  {
    title: 'Course Completion Certificate',
    subtitle: 'Every course শেষে',
    desc: 'Shareable digital certificate — LinkedIn, resume, portfolio যেখানেই লাগাতে পারবেন।',
    features: ['Verifiable QR code', 'LinkedIn-ready', 'Shareable link'],
    tone: 'from-indigo-500 to-purple-500',
  },
  {
    title: 'Verified Skill Certificate',
    subtitle: 'Advanced projects শেষে',
    desc: 'Mentor-reviewed portfolio + skill assessment — employers-এর কাছে extra weight রাখে।',
    features: ['Mentor endorsed', 'Skill assessment', 'Employer verified'],
    tone: 'from-amber-500 to-orange-500',
  },
];

export const communityEvents = [
  {
    date: 'Jul 12',
    title: 'Live Q&A: Career switch থেকে Frontend Dev',
    kind: 'Webinar',
  },
  {
    date: 'Jul 19',
    title: 'Portfolio Review Marathon',
    kind: 'Workshop',
  },
  {
    date: 'Jul 26',
    title: 'Freelancing 101 — First client পাওয়ার গল্প',
    kind: 'Panel',
  },
];

export const platformStats = [
  {
    metric: '12,400+',
    label: 'Active learners',
    sub: 'Bangladesh জুড়ে',
  },
  {
    metric: '83%',
    label: 'Job placement rate',
    sub: 'Graduation-এর ৬ মাসে',
  },
  {
    metric: '৳45k',
    label: 'Average starting salary',
    sub: 'Junior roles-এ',
  },
  {
    metric: '4.9 / 5',
    label: 'Student satisfaction',
    sub: '2,000+ reviews থেকে',
  },
];

export const trustIndicators = [
  { icon: FiShield, label: 'Money-back guarantee', sub: '30 days' },
  { icon: FiCreditCard, label: 'Secure payments', sub: 'bKash • Nagad • Card' },
  { icon: FiCloud, label: 'Cloud-based learning', sub: 'Any device' },
  { icon: FiHeadphones, label: '24/7 support', sub: 'Bengali + English' },
];

export const learningOutcomes = {
  learn: [
    'Modern web development stack (React, Next.js, Node)',
    'Product-grade UI/UX design workflow',
    'Digital marketing fundamentals থেকে advanced strategies',
    'Freelance business setup আর client acquisition',
    'Agile teamwork আর version control (Git)',
    'Professional communication + interview skills',
  ],
  build: [
    '5+ portfolio projects (real client briefs)',
    'Personal portfolio website',
    'Live production deployment (Vercel, Netlify, AWS)',
    'GitHub profile with active contributions',
    'LinkedIn profile — recruiter optimized',
    'Case studies documenting your process',
  ],
};

export const faqItems = [
  {
    q: 'GHL Learning-এ payment কীভাবে করব?',
    a: 'আমরা bKash, Nagad, Rocket, Bank transfer আর international debit/credit card accept করি। Enrolment page থেকে যেকোনো একটা বেছে নিতে পারবেন। সব transaction encrypted আর secure।',
  },
  {
    q: 'Certificate কি job-এর জন্য valid?',
    a: 'হ্যাঁ — আমাদের certificate industry-recognized আর প্রতিটাতে verifiable QR code আর unique link আছে। Recruiters LinkedIn থেকে verify করতে পারে। বেশ কিছু partner companies (Pathao, bKash, ShopUp) directly consider করে।',
  },
  {
    q: 'কোর্স refund policy কী?',
    a: '30 days money-back guarantee — কোনো questions asked ছাড়া। যদি কোর্স ভালো না লাগে, প্রথম 30 দিনের মধ্যে full refund। শুধু email করুন।',
  },
  {
    q: 'Live class না recorded video?',
    a: 'দুটোই। Core lessons pre-recorded (নিজের গতিতে দেখতে পারবেন), plus প্রতি সপ্তাহে live Q&A session আর monthly workshop with mentors। Live sessions-এর recording পরে পাবেন।',
  },
  {
    q: 'Mentor access কতটুকু পাব?',
    a: 'প্রতিটা paid কোর্সে dedicated mentor আছে। Weekly office hours, code review submissions, আর 1-on-1 session বুক করার opportunity। Response time সাধারণত 24 hours-এর কম।',
  },
  {
    q: 'Prior experience কি দরকার?',
    a: 'বেশিরভাগ course beginner-friendly — কোনো prior coding/design experience দরকার নেই। প্রতিটা course page-এ prerequisites clearly উল্লেখ করা আছে। Advanced tracks-এর জন্য আমাদের foundation courses recommend করি।',
  },
  {
    q: 'Mobile-এ course দেখতে পারব?',
    a: 'হ্যাঁ — Android, iOS, tablet, laptop — সব device-এ smooth experience। Video download করে offline-ও দেখতে পারবেন। Progress সব device-এ sync হয়।',
  },
  {
    q: 'Community-তে কী কী পাব?',
    a: 'Private Discord + Facebook group — 12,000+ active learners। Peer support, project feedback, job leads, freelance opportunities। Weekly meetups (Dhaka, Chittagong, Sylhet, online) আর monthly speaker events।',
  },
  {
    q: 'Job placement কেমন help পাব?',
    a: 'Mock interviews, portfolio review, resume clinic, LinkedIn optimization — সবকিছু included। ৫০+ hiring partners network — আমরা directly refer করি qualified graduates-দের।',
  },
  {
    q: 'Course language কী — English না Bangla?',
    a: 'দুটোই। Explanations mostly Bangla-তে (technical terms English-এ), আর written resources (docs, code) English-এ। এই natural mix বেশিরভাগ Bangladeshi learners-এর জন্য সবচেয়ে কার্যকর।',
  },
];
