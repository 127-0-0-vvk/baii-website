export type LessonDay = {
  day: number;
  label: string;        // "Monday", "Tuesday" …
  title: string;        // Short task title
  video_url?: string;   // Optional YouTube embed URL — many critical-thinking days are text/claim based
  video_note?: string;  // Caption shown under the video
  read?: string;        // Optional "read this first" content shown when there is no video
  instructions: string; // What to do before writing
  prompt: string;       // What to write in the text box
  min_words: number;    // Minimum word count before the student can submit
  grading_criteria: string; // What a good answer looks like — fed to the AI grader
};

export type Week = {
  w: string;
  topic: string;
  concept: string;
  exercise: string;
  example: string;
  days?: LessonDay[];   // Present only on weeks with day-by-day lesson content
};

export type Module = {
  id: string;
  title: string;
  weeks: string;
  subtitle: string;
  weeks_detail: Week[];
};

export type Assessment = {
  label: string;
  weight: string;
  desc: string;
};

export type Year = {
  id: string;
  label: string;
  color: string;
  lightColor: string;
  title: string;
  tagline: string;
  description: string;
  finalMission: string;
  modules: Module[];
  assessment: Assessment[];
};

export const PILLAR5_YEARS: Year[] = [
  {
    id: "y6", label: "Class 6", color: "#2563EB", lightColor: "#EFF6FF",
    title: "The Truth Detective",
    tagline: "Can you tell fact from fiction?",
    description: "Students learn to evaluate any claim, trace sources, spot logical fallacies, and build fact-checked arguments. Every lesson uses real Indian examples — WhatsApp forwards, news headlines, political claims.",
    finalMission: "Myth-Buster Report: Student picks one widely-believed Indian claim, investigates it completely, writes a 2-page verdict, and presents to cohort + one invited adult. Judged on reasoning quality — not whether the verdict is 'right.'",
    modules: [
      { id:"m1", title:"Observation", weeks:"Wk 1–7", subtitle:"What am I actually seeing vs assuming?", weeks_detail:[
        {w:"W1",topic:"Look vs See",concept:"The invisible gorilla. Brain fills gaps automatically. Why eyewitnesses are unreliable.",exercise:"Watch a 2-min Indian street video. Write 15 specific observations. Compare with partner — who noticed different things?",example:"Two people watch the same cricket match — one notices the wrong umpire decision, other misses it completely. Why?",days:[
          {
            day:1,label:"Monday",title:"Your First Observation List",
            video_url:"https://www.youtube.com/embed/Pnl-S-9udT4",
            video_note:"A 4-minute walk through the streets of New Delhi. Watch it fully — no pausing, no rewinding.",
            instructions:"Watch the video once without stopping. Just observe. Then come back and write your response below.",
            prompt:"Write 15 specific things you SAW in the video. Number each one (1–15).\n\nOnly write what your eyes actually saw — not what you guessed or assumed.\n\n❌ Wrong: \"A man going to work.\"\n✅ Right: \"A man wearing a white shirt walking quickly past a red wall.\"\n\nWrite all 15 now.",
            min_words:40,
            grading_criteria:"The student must list at least 15 numbered observations. A good answer contains concrete, visual observations (specific colours, clothing, objects, actions seen on screen) rather than assumptions or interpretations (e.g. 'a man going to work' is an assumption; 'a man in a white shirt walking past a red wall' is an observation). Pass if there are roughly 15 items and most are genuine concrete observations. Be encouraging — this is a Class 6 student.",
          },
          {
            day:2,label:"Tuesday",title:"I See vs I Assume",
            video_url:"https://www.youtube.com/embed/yFM-7Ss2D3w",
            video_note:"A 7-minute walk through one of Delhi's busiest streets. Watch the whole thing.",
            instructions:"Watch the video once. This time, pay attention to what your brain does automatically — is it observing, or filling in gaps it didn't actually see?",
            prompt:"Write 5 'I SEE' statements and 5 'I ASSUME' statements from the video.\n\nFormat each one like this:\nI SEE → (something visually confirmed on screen)\nI ASSUME → (something your brain added that wasn't shown)\n\nExample:\nI SEE → a woman carrying a yellow bag\nI ASSUME → she is returning from shopping\n\nNow write your 10 statements.",
            min_words:40,
            grading_criteria:"The student must write 5 'I SEE' statements and 5 'I ASSUME' statements. Pass if the 'I SEE' lines are genuine visual observations and the 'I ASSUME' lines are genuine inferences/guesses the brain adds. The key skill is correctly separating observation from assumption. Be encouraging — this is a Class 6 student. If they mix them up (e.g. put an assumption under 'I SEE'), gently point it out in the feedback but still pass if they made a real attempt at all 10.",
          },
          {
            day:3,label:"Wednesday",title:"The Invisible Gorilla",
            video_url:"https://www.youtube.com/embed/vJG698U2Mvo",
            video_note:"A famous psychology experiment. The video will give you a task — follow it. Watch once only, no rewinding.",
            instructions:"This video will ask you to count something. Do it carefully. Watch once — no rewind, no pause. Come back and answer the questions below.",
            prompt:"Answer all three:\n\n1) What were you asked to count, and what was your count?\n\n2) What unexpected thing appeared in the video? Did you notice it while watching, or only when told?\n\n3) In 2–3 sentences: why do you think this happens? What does it tell you about how your brain works when it is focused on one thing?",
            min_words:40,
            grading_criteria:"The student must answer all three questions. The video is the selective-attention 'invisible gorilla' test (counting passes; a gorilla/unexpected element appears). Pass if they engaged honestly with all three parts and showed some reflection in Q3 about attention/focus causing them to miss things ('inattentional blindness'). Be encouraging — this is a Class 6 student. Reward honesty if they admit they missed the unexpected thing.",
          },
          {
            day:4,label:"Thursday",title:"Watch It Again",
            video_url:"https://www.youtube.com/embed/Pnl-S-9udT4",
            video_note:"The same New Delhi street walk from Monday. Watch it again — you are a different observer now.",
            instructions:"This is the exact video you watched on Monday. Watch it again right now. Then answer below.",
            prompt:"Answer all three:\n\n1) List 3 things you notice today that you completely missed on Day 1.\n\n2) Why did you miss them the first time? Write 2–3 honest sentences.\n\n3) What does this re-watch tell you about how much a single viewing actually captures?",
            min_words:40,
            grading_criteria:"The student re-watched Monday's video. Pass if they listed 3 newly-noticed details and reflected honestly on why they missed them the first time and what that says about single viewings. Be encouraging — this is a Class 6 student. The insight to reward is awareness that one viewing captures only a fraction of what's there.",
          },
          {
            day:5,label:"Friday",title:"Week 1 Wrap-Up",
            video_url:"https://www.youtube.com/embed/G5-LApmkKIQ",
            video_note:"A 12-minute look at everyday morning life in an Indian village. Watch it through.",
            instructions:"Final task for Week 1 — you've got this! Watch the video once, then take your time with all three parts below.",
            prompt:"You've learned to separate what you SEE from what you ASSUME. Let's put it together — kindly.\n\n1) Write 3 things you can CONFIRM you saw in the video (real observations).\n\n2) Now take 3 assumptions your brain made. Rewrite each one in this fair, kind way:\n   \"I assumed ___ . What I actually saw was ___ . A fairer way to say it is ___ .\"\n\n3) Finish these two sentences:\n   • \"One thing I used to assume about people or places — that I'll now check before I believe it — is ___.\"\n   • \"The best thing about looking carefully instead of guessing is ___.\"",
            min_words:55,
            grading_criteria:"Week 1 wrap-up for a Class 6 student. Reward three things: (1) three genuine observations; (2) the THREE assumptions rewritten in the fair frame 'I assumed __ / What I actually saw was __ / A fairer way to say it is __' — this reframing is the core skill: naming an assumption clearly and replacing it with a kind, evidence-based statement instead of a judgement; (3) a warm, thoughtful reflection in part 3. Praise fairness, open-mindedness and positivity — reward students who replace a negative guess with a kinder, fact-based version. Do NOT reward cynical or harsh judgements about people. Celebrate growth — this is the proud end of their very first week.",
          },
        ]},
        {w:"W2",topic:"Assumption vs Fact",concept:"'I see...' vs 'I think...' Assumptions lead to wrong conclusions.",exercise:"5 images — write separately 'I see...' and 'I assume...' for each. Compare with class.",example:"Photo of man in torn clothes outside a shop. What do you see vs assume?",days:[
          {
            day:1,label:"Monday",title:"Fact or Assumption?",
            read:"A FACT is something you can check and prove — \"the wall is red\", \"there are 3 cows\".\nAn ASSUMPTION is something your brain quietly adds — \"the house is old\", \"he is angry\".\nBoth can feel true. Only one is proven. Today you'll learn to tell them apart.",
            instructions:"Read the lesson above, then label each statement below.",
            prompt:"For EACH of these 8 statements, write FACT or ASSUMPTION, and one short line saying why:\n\n1. The bus is yellow.\n2. The man is angry.\n3. She is wearing a school uniform.\n4. That family is poor.\n5. The shop's shutter is down.\n6. He is lazy because he is sleeping.\n7. There are three cows on the road.\n8. The food is tasty.",
            min_words:40,
            grading_criteria:"Day 1 of 'Assumption vs Fact'. Intended answers: 1 FACT, 2 ASSUMPTION (you see a face, not the feeling), 3 FACT (uniform is visible), 4 ASSUMPTION, 5 FACT, 6 ASSUMPTION (sleeping ≠ lazy), 7 FACT, 8 ASSUMPTION (taste is an opinion). Reward correct labels AND the reasoning. A Class 6 student getting most right with sensible reasons is doing well — be warm and encouraging.",
          },
          {
            day:2,label:"Tuesday",title:"I See / I Think",
            read:"Detectives keep two things apart:\n\"I SEE\" = the proof in front of you.\n\"I THINK\" = the guess your brain adds.\nExample → I SEE: a boy running. I THINK: he is late.",
            instructions:"For each situation, separate what you SEE from what you THINK.",
            prompt:"For each of these 4 situations, write one 'I SEE' line and one 'I THINK' line.\n\nA) A girl stands at the bus stop with a heavy bag.\nB) A man is shouting near a shop.\nC) A dog is barking at a closed gate.\nD) A boy hasn't eaten his lunch.\n\nFormat:\nA) I SEE … / I THINK …",
            min_words:45,
            grading_criteria:"Reward correctly splitting observation ('I SEE' = only what's literally stated) from inference ('I THINK' = the guess) for all 4 situations. Gently correct if a guess sneaks into 'I SEE'. Class 6 — encourage effort and clear thinking.",
          },
          {
            day:3,label:"Wednesday",title:"The Story Your Brain Tells",
            read:"Read this carefully:\n\"A boy is sitting alone at the lunch table. His food is untouched. He is looking at the floor.\"\nThat is ALL we actually know.",
            instructions:"Use only the description above — no extra information.",
            prompt:"1) Write 3 things you KNOW for sure from the description (facts).\n\n2) Write 3 different STORIES your brain might invent about why he is alone (for example: 'he has no friends', 'he is sad', 'he is new here').\n\n3) Now write ONE kind, positive explanation that could also be true (for example: 'maybe he is waiting for a friend').",
            min_words:50,
            grading_criteria:"Teaches that one scene allows many possible stories, and to consider kind explanations (positivity). Reward: 3 genuine facts, 3 distinct invented stories clearly held as guesses, and at least one genuinely kind/positive alternative. Praise open-mindedness and kindness; gently discourage assuming the worst about someone.",
          },
          {
            day:4,label:"Thursday",title:"Spot the Assumption in a Message",
            read:"A WhatsApp forward says:\n\"URGENT! Drinking cold water after food causes cancer. Doctors are hiding this. Forward to 10 people to save lives!\"",
            instructions:"Read the forward above like a Truth Detective.",
            prompt:"1) What is the message ASKING you to believe?\n\n2) What real FACTS does it actually give? (Look carefully — are there any?)\n\n3) List 2 ASSUMPTIONS it wants you to swallow without proof.\n\n4) What is one question a Truth Detective would ask before believing or forwarding it?",
            min_words:50,
            grading_criteria:"Reward noticing the message gives NO real evidence, naming the hidden assumptions ('cold water causes cancer', 'doctors are hiding it'), and asking a good checking question ('which doctors? which study? where is the proof?'). Class 6 — reward healthy skepticism and curiosity, not fear.",
          },
          {
            day:5,label:"Friday",title:"Week 2 Wrap-Up: Fair & Kind",
            instructions:"Last task of Week 2 — finish it thoughtfully and kindly.",
            prompt:"You can now tell facts from assumptions. Let's finish well.\n\n1) In your own words, what is the difference between a FACT and an ASSUMPTION? (2–3 sentences)\n\n2) Think of one time you assumed something about someone and it turned out wrong. Write:\n   \"I assumed ___ . The truth was ___ .\"\n\n3) Finish this sentence:\n   \"Before I believe something about a person, one fair question I will ask myself is ___.\"",
            min_words:55,
            grading_criteria:"Week 2 wrap-up for a Class 6 student. Reward: a clear fact-vs-assumption explanation in their own words; an honest personal example of a wrong assumption being corrected; and a fair, positive self-question. Celebrate fairness, kindness and growth — do NOT reward harsh or cynical judgements about people.",
          },
        ]},
        {w:"W3",topic:"Memory is Not a Recording",concept:"Memory is reconstructive, not playback. Why two people remember the same event differently.",exercise:"Read a story. Wait 10 mins. Answer 10 questions without re-reading. Where did memory fail?",example:"Family members at the same wedding remember different things. Who is 'right'?"},
        {w:"W4",topic:"Numbers Lie If You Let Them",concept:"Percentage vs absolute numbers. Cherry-picking. Questions to ask when you see a statistic.",exercise:"3 real Indian ads with statistics. For each: what questions would a detective ask?",example:"'Crime increased 100%!' — from 1 case to 2 cases. Technically true, completely misleading."},
        {w:"W5",topic:"Photos Can Lie",concept:"Cropping, angle, context removal, old photos for new stories. How to reverse image search.",exercise:"5 viral Indian photos — find original context of each. Was the attached claim true?",example:"2008 Kerala flood photo shared as 'today's Mumbai flood.'"},
        {w:"W6",topic:"First Impression Bias",concept:"Anchoring bias — first number heard affects all future judgment. How to slow down thinking.",exercise:"Price guessing game — see high number first vs low number. How does anchoring change guesses?",example:"'This phone was ₹50,000, now only ₹30,000!' — did the original price actually matter?"},
        {w:"W7",topic:"Module 1 Challenge",concept:"Apply all Module 1 skills to one real viral WhatsApp forward.",exercise:"List every assumption, identify observation vs claim, spot misleading numbers or photos. Tutor session.",example:"Tutor asks: 'What would change your verdict about this forward?'"},
      ]},
      { id:"m2", title:"Sources", weeks:"Wk 8–14", subtitle:"Who said this and why should I believe them?", weeks_detail:[
        {w:"W8",topic:"Primary vs Secondary",concept:"Primary = the original. Secondary = someone reporting about it. Always find the original.",exercise:"News article with a claim — trace back to original source. Did original actually say what the article claimed?",example:"'Scientists say coffee causes cancer' — find the actual study. What did it really say?"},
        {w:"W9",topic:"Expert vs Not Expert",concept:"Domain expertise — an expert in one field is not expert in all fields. Credential vs credibility.",exercise:"5 claims — identify who is making each and whether they are actually expert in that domain.",example:"Bollywood actor promoting a health supplement. Cricketer endorsing a financial product."},
        {w:"W10",topic:"Agenda and Motive",concept:"Everyone has a motive. A source that benefits from you believing something needs extra scrutiny.",exercise:"3 studies — find who funded each. Does funder have financial interest in the result?",example:"Sugar industry funding its own safety study. Tobacco company research."},
        {w:"W11",topic:"How to Evaluate a Website",concept:"Who owns it? When updated? Sources cited? Lateral reading technique.",exercise:"4 websites with health claims — rate each on author clarity, citations, last updated, funding.",example:"WhatsApp-shared 'health tips' site vs ICMR publication. Which for medical info?"},
        {w:"W12",topic:"Media Bias",concept:"Every news outlet has a perspective. Bias by omission. Same event, two different newspapers.",exercise:"Same news story from two Indian channels. What facts did both include? Only one? Neither?",example:"Same political speech covered by pro-government and critical outlet. Compare headlines."},
        {w:"W13",topic:"Social Media is Not a Source",concept:"Shares and likes ≠ truth. How viral content spreads regardless of accuracy.",exercise:"Trace one trending claim — who originally posted it → who amplified → is any a credible source?",example:"'India will ban cash' spread by 10 lakh shares. Who started it? Any government source?"},
        {w:"W14",topic:"Module 2 Challenge",concept:"Full source evaluation on one popular Indian health or science claim.",exercise:"Trace every source. Rate each. Write one paragraph verdict: does this claim have solid sourcing?",example:"Tutor asks: 'Why did you trust this source over that one?'"},
      ]},
      { id:"m3", title:"Evidence", weeks:"Wk 15–21", subtitle:"Is this a fact or someone's feeling?", weeks_detail:[
        {w:"W15",topic:"Fact vs Opinion",concept:"A fact can be verified. An opinion is a judgement. Mixing them causes most arguments to go nowhere.",exercise:"20 statements — classify each as Fact, Opinion, or mixed. Include Indian political speech examples.",example:"'India's GDP is $3.5T' (fact) vs 'India is the greatest country' (opinion)."},
        {w:"W16",topic:"Anecdote vs Data",concept:"One person's experience is not proof. What data actually looks like — sample size, representative sample.",exercise:"5 claims supported only by personal stories. What data would actually prove or disprove each?",example:"'My neighbour drank neem juice and recovered from diabetes.' Why can't we conclude anything?"},
        {w:"W17",topic:"Correlation ≠ Causation",concept:"Two things happening together doesn't mean one caused the other. The rooster and the sunrise.",exercise:"5 'A causes B' claims from Indian media. Is there a hidden third factor? Correlation or causation?",example:"'Cities with more hospitals have more deaths — hospitals cause death!' Why is this wrong?"},
        {w:"W18",topic:"What Makes a Good Study?",concept:"Sample size, randomisation, control groups, peer review, replication. Why one study is never enough.",exercise:"Two 'studies' — one well-designed, one poorly designed. Identify 5 differences. Which is more reliable?",example:"'Study of 12 people shows turmeric cures arthritis' vs peer-reviewed trial of 1,200 patients."},
        {w:"W19",topic:"Absence of Evidence",concept:"'No proof it's harmful' ≠ 'proof it's safe.' The burden of proof — who has to prove what?",exercise:"5 product claims using absence of evidence. Identify the flaw in each reasoning.",example:"'No studies show our product is dangerous' — said by company that funded no studies on their product."},
        {w:"W20",topic:"How to Read a Chart",concept:"Truncated Y-axis, misleading scales, 3D distortion. Spot charts designed to mislead vs inform.",exercise:"6 real charts from Indian newspapers and government reports. Is each designed to inform or mislead?",example:"GDP growth chart starting at 6% on Y-axis making 7% look double the previous year."},
        {w:"W21",topic:"Module 3 Challenge",concept:"Find a statistical claim in Indian news this week. Evaluate evidence type, source, causation, chart.",exercise:"Write a one-paragraph verdict. Tutor: 'What would it take to change your verdict?'",example:""},
      ]},
      { id:"m4", title:"Logic Traps", weeks:"Wk 22–28", subtitle:"What tricks do people use to fool your brain?", weeks_detail:[
        {w:"W22",topic:"Ad Hominem",concept:"Attacking the person instead of the argument. Always a distraction.",exercise:"5 debates — find where ad hominem is used. Rewrite each to address the actual argument.",example:"Any Indian political debate. Count how many times the argument shifts to attacking the person."},
        {w:"W23",topic:"False Dilemma",concept:"'Either you're with us or against us.' Artificially limiting choices to two when more exist.",exercise:"5 'either/or' statements from ads and politics. Identify the excluded options.",example:"'Either buy this insurance or your family will suffer.' Are those really the only two options?"},
        {w:"W24",topic:"Slippery Slope",concept:"'If we allow X, then Y, then Z' — without evidence each step leads to the next.",exercise:"5 slippery slope arguments. For each step — what evidence exists that it leads to the next?",example:"'If we allow girls to go out at night, society will collapse.' Map the steps. Where does logic break?"},
        {w:"W25",topic:"Appeal to Tradition",concept:"'We've always done it this way.' Age of a practice doesn't prove its correctness.",exercise:"5 traditional practices. What does actual evidence say — beneficial, neutral, or harmful?",example:"'Our grandparents ate ghee every day and lived long — so ghee is healthy.' What other factors existed?"},
        {w:"W26",topic:"Bandwagon + False Authority",concept:"'Everyone believes it' and 'An expert said it' are not proof.",exercise:"Find 3 examples of each fallacy in Indian advertising this week.",example:"'India's #1 selling car' (bandwagon). 'Recommended by doctors' with no names (false authority)."},
        {w:"W27",topic:"Straw Man",concept:"Misrepresenting someone's argument to make it easier to attack.",exercise:"5 debates where straw man is used. Restate the original argument accurately.",example:"Find one straw man in any current Indian political or social media debate."},
        {w:"W28",topic:"Module 4 Challenge — Fallacy Hunt",concept:"Watch any 20-min Indian news debate. Identify every logical fallacy used.",exercise:"Name the fallacy, quote the exact moment, explain why. Most correctly identified wins.",example:"Tutor uses fallacies deliberately in session. Student must catch each one and name it."},
      ]},
      { id:"m5", title:"Build Your Case", weeks:"Wk 29–35", subtitle:"How do I prove something is true or false?", weeks_detail:[
        {w:"W29",topic:"Claim → Evidence → Reasoning",concept:"Three-part structure of any good argument. Most arguments are missing the reasoning.",exercise:"Rebuild 5 weak arguments using CER structure. Show what was missing in each.",example:"Write 3 candidate Myth-Buster claims to investigate for the year-end."},
        {w:"W30",topic:"Finding Real Evidence",concept:"Effective searching. AltNews, Boom, FactChecker — India's fact-checking sites.",exercise:"Pick Myth-Buster claim. 1 hour finding evidence. Categorise: strong / weak / irrelevant.",example:"First draft: what evidence found? What gaps remain?"},
        {w:"W31",topic:"Steelmanning the Other Side",concept:"Find the strongest argument against your conclusion. The hardest intellectual skill.",exercise:"Write the strongest possible argument FOR the claim — even if you think it's false. Then respond to it.",example:"If you can't steel man the other side, you don't understand the issue well enough yet."},
        {w:"W32",topic:"Writing a Clear Verdict",concept:"True / False / Partly True / Can't Tell Yet — each requires different language.",exercise:"Write the verdict paragraph for your Myth-Buster report. Peer feedback: Is it clear? Supported?",example:"Peer review session — swap reports, give one paragraph written feedback."},
        {w:"W33",topic:"Presenting Without Losing the Audience",concept:"Start with the claim, not the evidence. One-sentence verdict first. Then show your work.",exercise:"Present findings to 3 peers in exactly 3 minutes. They must ask 2 challenging questions.",example:"Video record yourself. Watch it back. What needs to change?"},
        {w:"W34",topic:"Final Tutor Session",concept:"Student presents complete draft. Tutor gives full attack — challenges every claim, source, conclusion.",exercise:"Revise report based on feedback. Finalise 2-page report and 5-min presentation.",example:"This is the hardest session of the year. Prepares student for the real presentation."},
        {w:"W35",topic:"🏆 Final Mission — Myth-Buster Report",concept:"2-page report + 5-minute presentation to cohort and one invited adult.",exercise:"Judged on: quality of evidence, clarity of reasoning, ability to handle challenging questions.",example:"BAII Truth Detective Badge issued. First credential of the Pillar 5 journey."},
      ]},
    ],
    assessment:[
      {label:"Weekly challenge submissions",weight:"40%",desc:"Short written response to a real-world task each week. Peer-graded alternating weeks."},
      {label:"Module challenges",weight:"30%",desc:"Longer applied task at end of each module. Tutor-graded with written comments."},
      {label:"Tutor sparring sessions",weight:"15%",desc:"Rated on: defended position under pressure? Updated view when shown good evidence?"},
      {label:"Year-end Myth-Buster mission",weight:"15%",desc:"2-page report + 5-min presentation. Source quality, argument structure, verdict clarity."},
    ]
  },
  {
    id:"y7", label:"Class 7", color:"#059669", lightColor:"#ECFDF5",
    title:"The Data Journalist", tagline:"Can you read what the numbers are actually saying?",
    description:"Students find real government data, interpret it honestly, spot manipulation, and present a data-driven story. Uses real India data throughout: data.gov.in, Census, NFHS, RBI DBIE, NITI Aayog.",
    finalMission:"India Data Story: Student picks one India problem and tells its data story in one page + one honest chart. Presented to cohort + invited adult.",
    modules:[
      {id:"m1",title:"Numbers Speak",weeks:"Wk 1–7",subtitle:"What do numbers actually mean?",weeks_detail:[
        {w:"W1",topic:"Absolute vs Relative",concept:"1,000 deaths sounds huge. 1,000 out of 1 billion is 0.0001%. Context changes everything.",exercise:"5 headlines with big numbers. Calculate the rate for each.",example:"'10 lakh unemployed!' — out of a workforce of 50 crore. What percentage is that?"},
        {w:"W2",topic:"Growth Rates + Base Effect",concept:"50% growth from a tiny base means nothing. 5% from a huge base is enormous.",exercise:"State A grew 40%, State B grew 8%. Which is actually doing better?",example:"Why 'fastest growing economy' headline needs context — fastest from what base?"},
        {w:"W3",topic:"Per Capita vs Total",concept:"India is 5th largest GDP but 140th in GDP per person. Which tells you more?",exercise:"5 countries — compare total GDP vs GDP per capita.",example:"'India has the most doctors' — but per 1,000 people India ranks very low."},
        {w:"W4",topic:"Time Period Manipulation",concept:"Cherry-picking a start or end date to make a trend look better or worse.",exercise:"Given a dataset. Plot the trend from 5 different start years.",example:"'Crime has fallen under our government' — did they choose the time window carefully?"},
        {w:"W5",topic:"False Precision",concept:"'67.3% of Indians support this policy' — survey of how many? When? Which people?",exercise:"5 suspiciously precise statistics. Investigate: how were these actually collected?",example:"Pre-election polls in India. Who answers phone calls from unknown numbers?"},
        {w:"W6",topic:"Comparing Incomparables",concept:"India total vs Switzerland total. 2020 vs 2024 without adjusting for inflation.",exercise:"5 'India vs [country]' comparisons from news. Is each fair?",example:"'India's defense budget is less than America's' — what would need to be equal?"},
        {w:"W7",topic:"Module 1 Challenge",concept:"Find one India government data claim from this month. Apply all 6 skills.",exercise:"Tutor: 'What would make you trust this number more?'",example:""},
      ]},
      {id:"m2",title:"Find the Data",weeks:"Wk 8–14",subtitle:"Where does real data live?",weeks_detail:[
        {w:"W8",topic:"India's Data Universe",concept:"data.gov.in, Census, NITI Aayog, RBI DBIE, MoSPI, ICMR, NSSO — what each contains.",exercise:"Go to data.gov.in. Find 3 datasets about education in Telangana.",example:"Download one real dataset from a government portal."},
        {w:"W9",topic:"Survey vs Administrative Data",concept:"Survey = people answer questions. Administrative = collected as byproduct of systems.",exercise:"Compare same metric from survey vs administrative source. Do they match?",example:"NFHS says X% children are malnourished. Government records say Y%. Why different?"},
        {w:"W10",topic:"How to Read a Dataset",concept:"Rows vs columns. Variables and observations. Missing data. Data dictionaries.",exercise:"NFHS-5 state summary. Which state has highest child vaccination rate?",example:"Real dataset reading — no calculation, just finding."},
        {w:"W11",topic:"When Data is Missing",concept:"Absence of data is itself information. The politics of data collection.",exercise:"Find 3 examples where India has incomplete data on an important issue.",example:"Many states don't report certain crime categories consistently."},
        {w:"W12",topic:"5 Calculations That Answer 80% of Questions",concept:"Sum, average, percentage, percentage change, rank.",exercise:"State-wise GDP data for 5 years. Which grew fastest? Which shrunk?",example:"First time using Google Sheets — enter data, write one formula."},
        {w:"W13",topic:"Cleaning Dirty Data",concept:"Real data is messy. Typos, mixed units, N/A instead of 0.",exercise:"Deliberately messy dataset with 5 error types. Identify all. Describe how to clean each.",example:"Any state government dataset often mixes lakh and crore in the same column."},
        {w:"W14",topic:"Module 2 Challenge",concept:"Choose a topic. Find data from government source. Download, clean, do 3 calculations.",exercise:"Tutor: 'What questions does this data still not answer?'",example:"Begin thinking about year-end Data Story topic."},
      ]},
      {id:"m3",title:"Read It Right",weeks:"Wk 15–21",subtitle:"Mean, median, and what averages hide",weeks_detail:[
        {w:"W15",topic:"Mean vs Median",concept:"Average income in India is Rs.1.5L/year. But median is far lower. 10 billionaires pull the average up.",exercise:"Class of 10. 9 earn Rs.15K/month. 1 earns Rs.10 crore/month. Calculate mean and median.",example:"Why 'average Indian salary' is a meaningless number for most Indians."},
        {w:"W16",topic:"Distributions",concept:"Normal, skewed, bimodal. Shape matters as much as the average.",exercise:"3 datasets with the same mean. Draw a rough histogram for each.",example:"India's income distribution — why does 'average' mislead policymakers?"},
        {w:"W17",topic:"Outliers",concept:"Sometimes an error. Sometimes the most important finding. How to identify and investigate.",exercise:"Dataset of test scores — one student scored 99, everyone else 35–45. Real or data error?",example:"If one district reports zero maternal deaths in a year, is that achievement or data hiding?"},
        {w:"W18",topic:"Sampling",concept:"A survey of 1,000 can represent 1 billion — if done right.",exercise:"Design a survey to find what Hyderabad students think about online learning.",example:"Why pre-election polls are so often wrong — who answers calls from unknown numbers?"},
        {w:"W19",topic:"Trends vs Noise",concept:"Two data points don't make a trend. Seasonal patterns. How to tell if a change is real.",exercise:"Monthly temperature data for 3 years. Identify seasonal pattern, long-term trend, random spikes.",example:"Month-on-month inflation jumps — signals or seasonal noise?"},
        {w:"W20",topic:"Index Numbers",concept:"CPI, HDI — what goes in them and who decides.",exercise:"India's HDI components for 5 years. Which improved most? Which is lagging?",example:"India's Global Hunger Index controversy — why does India dispute it?"},
        {w:"W21",topic:"Module 3 Challenge",concept:"Find a published 'average' in Indian news. Mean or median? Distribution? Outliers?",exercise:"Tutor: 'What question would a journalist ask next?'",example:"Finalise year-end Data Story topic this week."},
      ]},
      {id:"m4",title:"Visual Stories",weeks:"Wk 22–28",subtitle:"Honest charts, dishonest charts",weeks_detail:[
        {w:"W22",topic:"Chart Types — Right Tool, Right Job",concept:"Bar (comparison), line (trend), pie (composition), scatter (relationship).",exercise:"5 datasets — choose right chart type for each.",example:"A pie chart with 12 categories — why is this useless?"},
        {w:"W23",topic:"The Dishonest Chart Toolkit",concept:"Truncated Y-axis, dual axes faking correlation, 3D distortion.",exercise:"6 real charts from Indian news. Find the visual trick in each. Redraw honestly.",example:"Any government scheme's 'progress chart' — check where the Y-axis starts."},
        {w:"W24",topic:"Design Principles for Clear Charts",concept:"Less is more. Direct labelling vs legend. Colour for meaning not decoration.",exercise:"Redesign one bad chart from last week using design principles.",example:"First clean bar chart made in Google Sheets from real data."},
        {w:"W25",topic:"Maps and Spatial Data",concept:"Choropleth maps — why larger states dominate visually even with tiny data.",exercise:"India map showing one variable. Identify 3 ways visual size misleads.",example:"Why UP and Rajasthan dominate any India map even when per-capita metrics favour smaller states."},
        {w:"W26",topic:"Colour and Emotion",concept:"Colour choices create emotional responses independent of data.",exercise:"Same data with 3 colour schemes. Write one sentence emotional reaction to each.",example:"Build year-end chart this week. First draft."},
        {w:"W27",topic:"Annotation — Making the Story Visible",concept:"Guide the reader to the key insight without manipulating.",exercise:"Add annotations to year-end chart draft. Peer review: does annotation match the data?",example:"Chart peer review session — swap with partner, evaluate against 5 criteria."},
        {w:"W28",topic:"Module 4 Challenge",concept:"Find a dishonest chart in Indian media. Identify every trick. Redraw honestly.",exercise:"Tutor: 'Does your chart tell the truth your data is actually saying?'",example:"Final year-end chart should be complete this week."},
      ]},
      {id:"m5",title:"Tell the Story",weeks:"Wk 29–35",subtitle:"Data becomes human",weeks_detail:[
        {w:"W29",topic:"Every Dataset Has a Human Behind It",concept:"Data is people. Connect numbers to human reality without sensationalising.",exercise:"Given a child malnutrition statistic. Write one paragraph that makes a reader care — without distorting.",example:"Find one real person whose story reflects your dataset's key finding."},
        {w:"W30",topic:"Inverted Pyramid of Data Stories",concept:"Lead with the finding, not the methodology.",exercise:"Dense data report — rewrite key finding as 3 sentences a 12-year-old understands.",example:"Write first paragraph of year-end story."},
        {w:"W31",topic:"Honest Uncertainty",concept:"'Suggests,' 'indicates,' 'may' vs 'proves,' 'shows,' 'confirms.'",exercise:"Rewrite 5 overconfident data headlines to be honest about uncertainty.",example:"Add uncertainty language to year-end story draft."},
        {w:"W32",topic:"Explaining Methodology Simply",concept:"Explain your method in two sentences. Transparency without burying the story.",exercise:"Write a 2-sentence method note for your year-end story.",example:"Complete year-end story draft this week."},
        {w:"W33",topic:"Peer Review and Revision",concept:"Structured peer review: does headline match data? Uncertainty explained? Chart honest?",exercise:"Exchange stories with partner. Give written feedback using 5-point review rubric.",example:"Submit polished version to tutor for pre-final review."},
        {w:"W34",topic:"Final Tutor Session",concept:"Tutor reads full story and chart. Attacks 3 things: the headline claim, one data point, the conclusion.",exercise:"Final revision. Prepare 5-min spoken presentation for year-end showcase.",example:"Rehearse presenting to family member. Get feedback on clarity."},
        {w:"W35",topic:"🏆 Final Mission — India Data Story",concept:"1 page + 1 chart + 5 minutes — to cohort and invited adult.",exercise:"Judged on: data real and correctly sourced? Chart honest? Story clearly written?",example:"BAII Data Journalist Badge issued."},
      ]},
    ],
    assessment:[
      {label:"Weekly data task submissions",weight:"40%",desc:"Short written data analysis task each week. Focus: used real data? Applied concept correctly?"},
      {label:"Module challenges",weight:"30%",desc:"Longer applied task at end of each module. Always uses real India data."},
      {label:"Tutor sparring sessions",weight:"15%",desc:"Graded on data literacy, willingness to revise when shown a flaw."},
      {label:"Year-end India Data Story",weight:"15%",desc:"Data accuracy, chart honesty, writing clarity, Q&A performance."},
    ]
  },
  {
    id:"y8",label:"Class 8",color:"#DC2626",lightColor:"#FEF2F2",
    title:"The Debater",tagline:"Can you argue both sides of anything — and win?",
    description:"Students build structured arguments, steel man the opposition, rebut clearly, and hold positions under pressure. All topics are real India issues. Students always argue both sides.",
    finalMission:"Formal Oxford Debate: 3v3 teams, external judges. Student does not choose which side they argue. Judged on argument quality, evidence use, rebuttal strength, and delivery.",
    modules:[
      {id:"m1",title:"Argument Structure",weeks:"Wk 1–7",subtitle:"How every strong argument is built",weeks_detail:[
        {w:"W1",topic:"Claim–Warrant–Impact",concept:"Every argument needs all three. Claim: what you're saying. Warrant: why it's true. Impact: why it matters.",exercise:"10 single-sentence claims. Expand each into a full CWI argument in 3 sentences.",example:"'India should invest more in solar.' That's a claim. Build the warrant and impact."},
        {w:"W2",topic:"Signposting",concept:"'My first argument is... My second... In conclusion...' Signposting makes arguments impossible to miss.",exercise:"Take last week's CWI argument. Add signposting. Record yourself saying it.",example:"Watch any Indian parliamentary speech. Count how many times speaker signposts vs rambles."},
        {w:"W3",topic:"Argument Weight",concept:"Impact calculus — magnitude, probability, timeframe. Lead with your strongest argument.",exercise:"6 arguments for a motion. Rank by impact calculus. Justify ranking.",example:"'India should move to 4-day work week' — build 3 best CWI arguments in order of weight."},
        {w:"W4",topic:"Evidence in Debate",concept:"Cite and explain — not cite and dump. An unexplained statistic is worse than no statistic.",exercise:"Build one argument using one statistic + one expert quote + one real Indian example.",example:"Use NITI Aayog data or ISRO achievements as debate evidence."},
        {w:"W5",topic:"First Mini-Debate",concept:"2 minutes, no notes. Motion: 'School uniforms should be abolished.' Structure only judged.",exercise:"Prepare 2 CWI arguments. Deliver in 2 minutes.",example:"No winner judged this week. Only structure under time pressure matters."},
        {w:"W6",topic:"Defining the Motion",concept:"The team that defines the motion well controls the debate.",exercise:"5 debate motions. Write a sharp definition for the key term in each.",example:"'India should prioritize economic growth over environmental protection.' How you define 'prioritize' changes everything."},
        {w:"W7",topic:"Module 1 Challenge",concept:"Motion assigned 30 minutes before session. 3 CWI arguments. Signpost. Weight correctly. Deliver in 4 minutes.",exercise:"Tutor: 'Which of your three arguments was strongest? Why didn't you lead with it?'",example:"Structure evaluated — not content."},
      ]},
      {id:"m2",title:"Steel Man",weeks:"Wk 8–14",subtitle:"Understand the other side better than they do",weeks_detail:[
        {w:"W8",topic:"What is Steelmanning?",concept:"Find the strongest, most generous version of the opposing argument.",exercise:"Steel man the opposition to your personal belief about India building more highways.",example:"Steel man 'India should not have nuclear weapons' even if you believe India should."},
        {w:"W9",topic:"Research the Other Side",concept:"Find experts who disagree with you. Read sources you expect to dislike.",exercise:"'Caste-based reservations should extend to private companies.' Research strongest arguments on BOTH sides.",example:"Rule: every source must not already agree with you."},
        {w:"W10",topic:"Values Behind Arguments",concept:"Most disagreements are about underlying values — freedom vs equality, efficiency vs fairness.",exercise:"5 debate motions. Identify the core value clash.",example:"'Aadhaar is a privacy violation' vs 'Aadhaar enables welfare delivery.' What values are in conflict?"},
        {w:"W11",topic:"Charitable Interpretation",concept:"Interpret ambiguous arguments charitably — then defeat them.",exercise:"5 ambiguous debate arguments. Write most charitable interpretation. Then rebut that version.",example:"Live practice: partner gives ambiguous argument. Give charitable interpretation back."},
        {w:"W12",topic:"Both-Sides Debate",concept:"Same person argues proposition then opposition for the same motion.",exercise:"Motion: 'India should impose a carbon tax.' 4 mins proposition, 4 mins opposition — same person.",example:"Cohort votes: which side was more convincing?"},
        {w:"W13",topic:"Anticipating Attacks",concept:"Pre-emption: 'I anticipate the opposition will say X — here is why X is wrong.'",exercise:"Build one argument with pre-emption. Record 3 minutes with at least one pre-emption.",example:"Pre-emption signals you understand the other side so well you can dismiss their arguments before they make them."},
        {w:"W14",topic:"Module 2 Challenge",concept:"Assigned a side you personally disagree with. Argue it as if you believe it. 5 minutes.",exercise:"Tutor: 'Did you represent the other side fairly?'",example:"Key insight: if you couldn't argue it convincingly, you don't understand it well enough yet."},
      ]},
      {id:"m3",title:"Rebuttal",weeks:"Wk 15–21",subtitle:"Demolish the argument, not the person",weeks_detail:[
        {w:"W15",topic:"The 4 Rebuttal Moves",concept:"Turn, Take Out, Minimize, Outweigh.",exercise:"4 arguments. Apply a different rebuttal move to each.",example:"'Coal provides jobs to millions' — practice all 4 rebuttal moves on this one argument."},
        {w:"W16",topic:"Listen First, Respond Second",concept:"Preparing your rebuttal while the other person is speaking is the most common debate failure.",exercise:"Partner gives 2-min argument. Take notes. Rebut specifically the 3 points they made.",example:"Rule: every rebuttal must reference what was actually said — not generic points about the topic."},
        {w:"W17",topic:"The Pivot",concept:"Take the opponent's evidence and show it actually supports your side.",exercise:"5 arguments from the other side. For each, find a way to pivot.",example:"Opponent says 'India's solar sector created 1 lakh jobs.' You're arguing for coal. Pivot this."},
        {w:"W18",topic:"AREL — 60-second Rebuttal",concept:"Assert, Reason, Example, Link back. Four sentences. 60 seconds.",exercise:"Partner makes 1-min argument. 30 seconds to think. 60 seconds to rebut using AREL.",example:"Speed drill. Goal: fast structured thinking, not perfect rebuttals."},
        {w:"W19",topic:"Conceding Gracefully",concept:"'I accept that point. It doesn't change my conclusion because...'",exercise:"Partner makes 3 arguments — one genuinely strong. Identify it. Concede gracefully.",example:"The hardest exercise emotionally. Requires confidence in your overall position."},
        {w:"W20",topic:"Cross-Examination",concept:"Questions that expose weaknesses, demand definitions, create admissions.",exercise:"Partner presents 2-min argument. 2-min cross-examination using only genuine questions.",example:"'India should remove fertiliser subsidies.' Cross-examination practice."},
        {w:"W21",topic:"Module 3 Challenge",concept:"Live 3v3 mini-debate with full rebuttal round. Motion assigned 1 hour before.",exercise:"Tutor evaluates rebuttal quality specifically.",example:""},
      ]},
      {id:"m4",title:"Persuasion",weeks:"Wk 22–28",subtitle:"Logos, Ethos, Pathos — moving a room",weeks_detail:[
        {w:"W22",topic:"Logos, Ethos, Pathos",concept:"Logic, credibility, emotion. Best communicators use all three.",exercise:"Find 3 famous Indian speeches. For each — identify where Logos, Ethos, Pathos are used.",example:"Analyse Ambedkar's speech on the adoption of the Constitution."},
        {w:"W23",topic:"Voice — Speed, Pause, Volume",concept:"The pause is the most powerful tool in spoken communication.",exercise:"Same 2-min argument three times: nervous fast, slow and clear, theatrical. Record all three.",example:"Personal coaching: identify the speaking habit that undermines you most."},
        {w:"W24",topic:"The Opening Line",concept:"You have 15 seconds to make the audience care.",exercise:"Write 5 different opening lines for the same motion. Test on cohort.",example:"'India's farmers are the backbone of the nation' — find 5 more interesting ways to open this."},
        {w:"W25",topic:"Story as Evidence",concept:"One real story is more persuasive than five statistics for many audiences.",exercise:"Build one debate argument using a story + a statistic together.",example:"'A solar installer in Rajasthan whose income doubled after PM-KUSUM.'"},
        {w:"W26",topic:"Hostile Audience",concept:"How to acknowledge disagreement without conceding. Staying calm is persuasion.",exercise:"You argue a deliberately unpopular position. Cohort plays hostile audience.",example:"Debrief: what made you most nervous? What technique helped most?"},
        {w:"W27",topic:"The Closing",concept:"Last thing you say is what they remember. Summarise, answer key objection, give clear resolution.",exercise:"3 closings for same motion — logos, ethos, pathos-driven.",example:"Rehearse year-end debate closing. Record and watch back."},
        {w:"W28",topic:"Module 4 Challenge",concept:"Persuade the cohort to change their mind on one thing — anything. 5 minutes.",exercise:"Cohort votes before and after: did anyone change their position?",example:"Year-end debate team selection and motion announcement this week."},
      ]},
      {id:"m5",title:"Formal Debate",weeks:"Wk 29–35",subtitle:"Oxford format — the full competition",weeks_detail:[
        {w:"W29",topic:"Oxford Format",concept:"Proposition and Opposition. Opening speeches, rebuttals, floor questions, summary speeches.",exercise:"First full Oxford format practice. Focus on format execution.",example:"Each student receives their role and side for the year-end debate."},
        {w:"W30",topic:"Team Coordination",concept:"Define the 'team line' — one sentence everyone agrees is the core position.",exercise:"Team of 3 prepares 90 mins. Define team line. Divide motion into 3 arguments.",example:"First team preparation session for year-end debate."},
        {w:"W31",topic:"Practice Debate 1",concept:"Full debate — same teams and motion as year-end. Tutor judges and gives full detailed feedback.",exercise:"Debrief: What worked? What failed? What does each speaker need to fix specifically?",example:"Individual feedback session with tutor after."},
        {w:"W32",topic:"Targeted Improvement",concept:"Each student works on their specific weakness from Practice 1.",exercise:"Focused 30-min drill on personal weakness. Tutor present. Video recorded.",example:"Second team strategy session."},
        {w:"W33",topic:"Practice Debate 2 — Sides Switched",concept:"Same motion, teams argue opposite side. Confirms whether steel man was done properly.",exercise:"Can you argue the other side as convincingly as your own?",example:"Final preparation week. Review all notes."},
        {w:"W34",topic:"Final Preparation",concept:"Last individual tutor sessions. Full dress rehearsal.",exercise:"Timed rehearsal. Feedback session.",example:"Confirm external judges, time, audience."},
        {w:"W35",topic:"🏆 The Debate",concept:"Formal Oxford debate. 3 external judges. Real audience.",exercise:"Judged on: argument quality, evidence, rebuttal, team coordination, delivery.",example:"BAII Debater Badge + Best Speaker of the year award."},
      ]},
    ],
    assessment:[
      {label:"Weekly argument submissions",weight:"35%",desc:"Written CWI argument each week."},
      {label:"Module debates",weight:"30%",desc:"One live mini-debate per module. Tutor-judged on the specific skill of that module."},
      {label:"Tutor sparring sessions",weight:"15%",desc:"Can student handle being challenged? Do they concede appropriately?"},
      {label:"Year-end formal debate",weight:"20%",desc:"Formal debate performance. All four skills assessed."},
    ]
  },
  {
    id:"y9",label:"Class 9",color:"#7C3AED",lightColor:"#F5F3FF",
    title:"The Researcher",tagline:"Can you find the truth yourself — without anyone telling you where to look?",
    description:"Students independently design a methodology, collect and analyse evidence, and produce a structured 5-page research paper on a real India problem connected to their chosen pillar.",
    finalMission:"5-Page Research Paper: On a real unsolved India problem connected to chosen pillar. Defended in 10-minute presentation to a panel including one external researcher or professional. Paper published on BAII profile.",
    modules:[
      {id:"m1",title:"Research Questions",weeks:"Wk 1–7",subtitle:"Where real inquiry begins",weeks_detail:[
        {w:"W1",topic:"What is a Research Question?",concept:"Specific, answerable with evidence, not already answered.",exercise:"10 broad topics. Narrow each into a specific, answerable research question.",example:"Topic: 'Air pollution in India.' Narrow to a real research question."},
        {w:"W2",topic:"The Literature Review",concept:"Find out what's already been found. Google Scholar, SHODHGANGA.",exercise:"30-minute literature search. Find 3 relevant papers. Write one sentence summarising each.",example:"SHODHGANGA — India's free academic database."},
        {w:"W3",topic:"Hypothesis vs Research Question",concept:"A hypothesis predicts an answer. Design a study that can disprove it.",exercise:"5 research questions. Write a testable hypothesis for each.",example:"'States that spend more on primary education have higher literacy rates.' What data would disprove this?"},
        {w:"W4",topic:"Scope and Feasibility",concept:"What is researchable with tools available? Be honest about time, data access, expertise limitations.",exercise:"3 research questions. For each: what data needed? Do you have access?",example:"Begin drafting year-end paper research question."},
        {w:"W5",topic:"The Gap in the Literature",concept:"Find a paper that says 'more research is needed on X.' That X is your candidate.",exercise:"Find one academic paper ending with 'more research needed on [X].'",example:"Narrow three candidate questions to one."},
        {w:"W6",topic:"Connect to Your Pillar",concept:"Research question must connect to chosen BAII pillar.",exercise:"Write final research question: specific + answerable + gap identified + feasible + pillar-connected.",example:""},
        {w:"W7",topic:"Module 1 Challenge — Question Defence",concept:"Present approved research question to cohort.",exercise:"Tutor: 'What's the strongest argument that your question is NOT answerable?'",example:"After this week, question is locked."},
      ]},
      {id:"m2",title:"Methodology",weeks:"Wk 8–14",subtitle:"How will you find the answer?",weeks_detail:[
        {w:"W8",topic:"Qualitative vs Quantitative",concept:"Qualitative: themes, patterns, 'why' questions. Quantitative: numbers, statistics, 'how much' questions.",exercise:"For your locked research question — which methodology is more appropriate?",example:"Energy question about perceptions → qualitative. Energy question about adoption rates → quantitative."},
        {w:"W9",topic:"Secondary Data Analysis",concept:"Using existing datasets that others have collected. Government data is goldmine.",exercise:"Identify 2 specific government datasets that could answer your research question.",example:"NFHS, NITI Aayog, Ministry data — what exists that could inform your question?"},
        {w:"W10",topic:"Survey Design",concept:"How to write survey questions that don't lead the respondent.",exercise:"Write 5 survey questions for your research topic. Have a partner take the survey.",example:"The most common error: asking two things in one question."},
        {w:"W11",topic:"Interview Design",concept:"5 questions that open up, not close down. The follow-up question is more important than the original.",exercise:"Design a 5-question interview guide. Conduct a mock interview with a partner.",example:"A good interview question: 'Tell me about a time when...'"},
        {w:"W12",topic:"Research Ethics",concept:"Anonymity, informed consent, do no harm.",exercise:"Write a one-paragraph participant information sheet.",example:"Even a student survey needs informed consent if results will be published."},
        {w:"W13",topic:"Pilot Testing",concept:"Test your method on 2-3 people before full use.",exercise:"Run your data collection method on a small pilot. Document 3 things you learned.",example:"Most research plans change significantly after the first pilot."},
        {w:"W14",topic:"Methodology Section Written",concept:"Formal methodology section written and approved by tutor.",exercise:"Module challenge: present your methodology to cohort — can someone else replicate it?",example:""},
      ]},
      {id:"m3",title:"Reading Papers",weeks:"Wk 15–21",subtitle:"How to read academic research efficiently",weeks_detail:[
        {w:"W15",topic:"Anatomy of an Academic Paper",concept:"Abstract, introduction, methodology, findings, limitations, conclusion, references.",exercise:"Given one academic paper — draw a map of its structure.",example:"The abstract is a complete summary in 200 words."},
        {w:"W16",topic:"Read an Abstract in 3 Minutes",concept:"Skim for: research question, method, key finding, key limitation.",exercise:"Given 10 paper abstracts. In 30 minutes, classify each: highly relevant / somewhat relevant / not relevant.",example:"Most papers in your search results will not be relevant."},
        {w:"W17",topic:"Evaluate Methodology Quality",concept:"Sample size, randomisation, control group, peer review status.",exercise:"Given two studies with conflicting findings. Evaluate each methodology.",example:"A study of 12 people and a study of 12,000 people are not equally credible."},
        {w:"W18",topic:"Citation and Referencing (APA)",concept:"Why citation matters: giving credit, enabling verification.",exercise:"Write 5 reference entries in APA format.",example:"The purpose of a citation is to let your reader verify your claim independently."},
        {w:"W19",topic:"Identifying Limitations",concept:"Every published paper has limitations. Finding them makes you a better researcher.",exercise:"For 3 papers — identify each author's stated limitations AND one unstated limitation.",example:"An unstated limitation is often more informative than a stated one."},
        {w:"W20",topic:"Annotated Bibliography",concept:"For each paper: full citation + 3 sentences.",exercise:"Write annotated bibliography of 5 papers relevant to your research question.",example:"This is your literature review in draft form."},
        {w:"W21",topic:"Literature Review Drafted",concept:"Synthesise your 5 annotated sources into a coherent narrative.",exercise:"Write 400-500 word literature review section.",example:"This section goes into your final paper."},
      ]},
      {id:"m4",title:"Writing Findings",weeks:"Wk 22–28",subtitle:"How to present what you found",weeks_detail:[
        {w:"W22",topic:"Academic Writing Tone",concept:"Precise, hedged, and impersonal — but never deliberately unclear.",exercise:"Rewrite 5 casual sentences in academic style. Then rewrite 5 overly complex sentences in plain language.",example:"Good academic writing is not complicated — it is precise."},
        {w:"W23",topic:"Presenting Data in Writing",concept:"How to introduce a table or chart in prose.",exercise:"Write a paragraph that introduces and interprets one data table from your research.",example:"Never say 'As shown in Table 1...' and then repeat everything in Table 1."},
        {w:"W24",topic:"Hedging Language",concept:"'Suggests,' 'indicates,' 'may' vs 'proves,' 'shows,' 'confirms.'",exercise:"Rewrite 5 overconfident research statements using appropriate hedging.",example:"The strength of your claim must match the strength of your evidence."},
        {w:"W25",topic:"Acknowledging Limitations",concept:"Stating yours honestly increases credibility, not decreases it.",exercise:"Write a 3-sentence limitations paragraph for your study.",example:"The worst limitations section says 'more research is needed.'"},
        {w:"W26",topic:"Structuring the Findings Section",concept:"What order tells the story best?",exercise:"Outline your findings section: main finding → supporting evidence → nuance → unexplained.",example:"Your findings section is an argument built from evidence."},
        {w:"W27",topic:"Connecting Findings to Research Question",concept:"The findings section must answer the research question you stated in Week 6.",exercise:"Read your findings section draft. Does it answer your research question?",example:"If you can't answer your research question in one sentence from your findings, it's incomplete."},
        {w:"W28",topic:"Findings Section Complete",concept:"Findings section written, structured, and peer-reviewed.",exercise:"Exchange findings sections with a partner. Give written feedback.",example:"This section goes into your final paper."},
      ]},
      {id:"m5",title:"The Paper",weeks:"Wk 29–35",subtitle:"Assemble, defend, publish",weeks_detail:[
        {w:"W29",topic:"Introduction Written",concept:"Introduction: context, gap in literature, research question, why it matters.",exercise:"Combine all sections: introduction, literature review, methodology, findings.",example:"First time seeing the whole paper together. Does it flow?"},
        {w:"W30",topic:"Full Paper Assembled",concept:"All sections joined. Check: does the conclusion actually answer the research question?",exercise:"Read the whole paper aloud. Where does it stumble?",example:"First complete draft submitted."},
        {w:"W31",topic:"Peer Review",concept:"Partner reads and critiques full paper using a structured rubric.",exercise:"Exchange papers with one partner. Give one-paragraph written feedback.",example:"Revise paper based on peer feedback."},
        {w:"W32",topic:"Tutor Detailed Review",concept:"Tutor reads entire paper. Gives written feedback on every section.",exercise:"Revise based on tutor feedback. Most significant revision happens this week.",example:"This is where weak papers become good ones."},
        {w:"W33",topic:"Final Revision",concept:"Final version of paper submitted. No more changes after this week.",exercise:"Prepare 10-min spoken defence. Anticipate likely questions from the panel.",example:"Final paper locked."},
        {w:"W34",topic:"Presentation Practice",concept:"Practice 10-min defence to tutor. Tutor plays external reviewer.",exercise:"Full rehearsal. Timed. Video recorded. Watch it back.",example:"Prepare for the hardest questions from the panel."},
        {w:"W35",topic:"🏆 Paper Defence",concept:"10-min presentation to panel including one external researcher.",exercise:"Judged on: paper quality, methodology credibility, handling of panel questions.",example:"BAII Researcher Badge. Paper published on BAII profile."},
      ]},
    ],
    assessment:[
      {label:"Weekly research tasks",weight:"30%",desc:"Each week builds one piece of the paper."},
      {label:"Section submissions per module",weight:"30%",desc:"Methodology, literature review, findings, and introduction each graded separately."},
      {label:"Peer review quality",weight:"10%",desc:"How useful was the feedback you gave your partner?"},
      {label:"Year-end paper + defence",weight:"30%",desc:"Complete paper quality + ability to defend methodology and findings."},
    ]
  },
  {
    id:"y10",label:"Class 10",color:"#B45309",lightColor:"#FFFBEB",
    title:"The Strategist",tagline:"Can you solve a real problem that has no textbook answer?",
    description:"Students diagnose complex real-world problems, map stakeholders, evaluate multiple solutions with evidence, identify trade-offs, and present a consultant-style proposal to an external decision-maker.",
    finalMission:"Solution Proposal: 3-page consultant-style proposal presented to a real external decision-maker — company manager, NGO director, local government officer, or industry professional.",
    modules:[
      {id:"m1",title:"Problem Diagnosis",weeks:"Wk 1–7",subtitle:"The stated problem is rarely the real problem",weeks_detail:[
        {w:"W1",topic:"The 5 Whys",concept:"Ask 'why' five times to move from symptom to cause.",exercise:"'Students in India are not learning to read properly.' Apply 5 Whys.",example:"'Farmers in India are in debt.' Apply 5 Whys. What is the actual root cause?"},
        {w:"W2",topic:"Fishbone Diagram",concept:"Multiple causes, one effect. Map all contributing factors systematically.",exercise:"Map causes of 'poor air quality in Hyderabad.' Identify 3 most significant causes.",example:"Draw a fishbone for 'India's low female workforce participation rate.'"},
        {w:"W3",topic:"Problem vs Constraint",concept:"Some 'problems' are constraints — they cannot be solved, only managed.",exercise:"5 India problems. For each: solvable problem or constraint to work around?",example:"'India doesn't have enough water' — is water scarcity a problem or a constraint?"},
        {w:"W4",topic:"The Precise Problem Statement",concept:"What, where, who, when, magnitude. A vague problem statement produces vague solutions.",exercise:"Take a broad problem. Write 3 versions — progressively more precise.",example:"Begin thinking about year-end problem — must connect to chosen pillar."},
        {w:"W5",topic:"Quantify the Problem",concept:"How big is this problem really? How many people? How much money?",exercise:"Take your draft problem. Find the actual scale — numbers, data, India context.",example:"'India has a sanitation problem' — what does the actual data say?"},
        {w:"W6",topic:"Scope Boundary",concept:"What is in scope vs out of scope. Without a boundary, any problem becomes infinite.",exercise:"Take your year-end problem. Define explicitly what's in scope and what's out.",example:"Year-end problem chosen and approved this week."},
        {w:"W7",topic:"Module 1 Challenge",concept:"Full problem diagnosis: 5 Whys + fishbone + precise problem statement + quantification.",exercise:"Energy: 'Why do 40% of rooftop solar installations underperform within 2 years?'",example:""},
      ]},
      {id:"m2",title:"Stakeholder Mapping",weeks:"Wk 8–14",subtitle:"Who is affected, who has power, who has interest?",weeks_detail:[
        {w:"W8",topic:"Power-Interest Grid",concept:"Map every person and institution affected. Four quadrants.",exercise:"For your year-end problem — list every stakeholder. Place each on a power-interest grid.",example:"High power stakeholders who oppose a solution can kill it."},
        {w:"W9",topic:"Individuals vs Institutions vs Communities",concept:"Stakeholders operate at different scales.",exercise:"For your year-end problem — identify individual, institution, and community stakeholders.",example:"Telangana farmers, Telangana Agricultural University, and TGSPDCL all have different relationships to rooftop solar."},
        {w:"W10",topic:"Finding Hidden Stakeholders",concept:"The stakeholders you didn't think of initially often derail solutions.",exercise:"Stakeholder map from last week. Now find 3 stakeholders you initially missed.",example:"Bank loan officers matter enormously for solar adoption — but no energy analysis mentions them."},
        {w:"W11",topic:"Delhi Odd-Even Case Study",concept:"The odd-even vehicle scheme succeeded and failed simultaneously for different stakeholders.",exercise:"Map all stakeholders for Delhi's odd-even scheme.",example:"A solution that ignores stakeholders always creates unexpected opposition."},
        {w:"W12",topic:"Stakeholder Interests Often Conflict",concept:"When two important stakeholders want opposite things, you must choose — or find a third option.",exercise:"For your year-end problem — identify one pair of stakeholders with conflicting interests.",example:""},
        {w:"W13",topic:"Whose Support Do You Need?",concept:"To implement any solution, you need permission from some and cooperation from others.",exercise:"For your recommended solution — list every stakeholder whose active support you need.",example:""},
        {w:"W14",topic:"Module 2 Challenge",concept:"Complete stakeholder map for year-end problem.",exercise:"Present your stakeholder map to cohort. What did others notice that you missed?",example:""},
      ]},
      {id:"m3",title:"Solution Evaluation",weeks:"Wk 15–21",subtitle:"How to evaluate multiple options fairly",weeks_detail:[
        {w:"W15",topic:"Generate Minimum 3 Solutions",concept:"Resist the urge to jump to one. The first solution you think of is almost never the best one.",exercise:"For your year-end problem — generate 5 possible solutions.",example:"The best strategists generate many options before choosing."},
        {w:"W16",topic:"Build Evaluation Criteria",concept:"Cost, feasibility, speed, side effects, stakeholder acceptance.",exercise:"For your year-end problem — define your evaluation criteria. Weight them by importance.",example:"A solution that works but takes 20 years may not be acceptable."},
        {w:"W17",topic:"Score Each Solution",concept:"Use your criteria to score each solution systematically.",exercise:"Score all 5 solutions against your criteria in a table.",example:"If the result surprises you, either your criteria are wrong or your assumptions are wrong."},
        {w:"W18",topic:"Unintended Consequences",concept:"Every solution creates new problems. Find these before implementation.",exercise:"Take your highest-scoring solution. List every unintended consequence you can imagine.",example:"Subsidising solar made it popular — and created a black market."},
        {w:"W19",topic:"Agricultural Water Scarcity Case Study",concept:"Evaluate 3 proposed solutions to agricultural water scarcity in India.",exercise:"Given: drip irrigation subsidy, crop substitution programme, groundwater regulation. Score all three.",example:"The 'obvious' solution is often not the best one when all criteria are considered."},
        {w:"W20",topic:"Second-Order Effects",concept:"What happens after the solution is implemented?",exercise:"For your recommended solution — map the first-order and second-order effects.",example:"Banning diesel generators reduces air pollution (first) but hurts small businesses (second)."},
        {w:"W21",topic:"Module 3 Challenge",concept:"Scored comparison of 3 solutions for year-end problem with recommendation.",exercise:"Present to cohort. Cohort's job: find holes in your reasoning.",example:""},
      ]},
      {id:"m4",title:"Decision Under Uncertainty",weeks:"Wk 22–28",subtitle:"How to recommend action when information is incomplete",weeks_detail:[
        {w:"W22",topic:"Expected Value Thinking",concept:"Weight possible outcomes by their probability.",exercise:"For your recommended solution — estimate 3 possible outcomes and their probability.",example:""},
        {w:"W23",topic:"Scenario Planning",concept:"Best case, worst case, most likely case.",exercise:"Write a best case, worst case, and most likely scenario for the next 5 years.",example:"A solution that only works if everything goes perfectly is a bad solution."},
        {w:"W24",topic:"Reversible vs Irreversible Decisions",concept:"Reversible decisions can be made faster with less information.",exercise:"For your recommended solution — is it reversible or irreversible?",example:"Building a nuclear plant is irreversible. Piloting a solar subsidy is reversible."},
        {w:"W25",topic:"How to Recommend Action When Incomplete",concept:"Every real decision is made with incomplete information.",exercise:"What is the minimum information you would need before recommending action?",example:"The cost of waiting for perfect information is sometimes higher than acting on good-enough information."},
        {w:"W26",topic:"Energy Storage Technology Case Study",concept:"How should India choose between competing energy storage technologies?",exercise:"Given: lithium-ion, sodium-ion, flow batteries, pumped hydro. Which should India prioritise?",example:"The correct answer depends on assumptions about future costs. Make your assumptions explicit."},
        {w:"W27",topic:"Stress-Testing Your Recommendation",concept:"What would need to be true for your recommendation to be wrong?",exercise:"For your recommended solution — write 3 conditions under which it would fail.",example:""},
        {w:"W28",topic:"Module 4 Challenge",concept:"Full scenario plan and stress-test for your year-end problem's recommended solution.",exercise:"Present to cohort. Cohort's job: find the scenario where your recommendation fails.",example:""},
      ]},
      {id:"m5",title:"The Proposal",weeks:"Wk 29–35",subtitle:"Write it, present it to someone who can act on it",weeks_detail:[
        {w:"W29",topic:"Proposal Structure",concept:"Executive summary → problem diagnosis → stakeholder analysis → solution options → recommendation → implementation plan → risks.",exercise:"Assemble all previous module work into the proposal structure.",example:"3-page format. Each section has a word limit — forces discipline."},
        {w:"W30",topic:"The Executive Summary",concept:"One paragraph that tells a busy person everything they need to know.",exercise:"Write executive summary after the rest is complete.",example:"First complete draft of full proposal submitted."},
        {w:"W31",topic:"Peer Review",concept:"Partner reads and critiques full proposal.",exercise:"Exchange proposals. Give written feedback using 5-point rubric.",example:""},
        {w:"W32",topic:"External Mentor Review",concept:"An expert in the student's specific problem area gives 30 minutes of feedback.",exercise:"Revise based on mentor feedback. Final proposal version.",example:""},
        {w:"W33",topic:"Presentation Preparation",concept:"A proposal presentation is different from a research paper defence.",exercise:"Prepare 10-min presentation. Rehearse handling: 'Why this solution and not [alternative]?'",example:""},
        {w:"W34",topic:"Dress Rehearsal",concept:"Full presentation to tutor and mentor. Both give final feedback.",exercise:"Final revisions. Confirm logistics.",example:""},
        {w:"W35",topic:"🏆 The Proposal Presented",concept:"3-page proposal + 10-min presentation to a panel including one actual decision-maker.",exercise:"Judged on: diagnosis accuracy, stakeholder completeness, recommendation quality, Q&A performance.",example:"BAII Strategist Badge. Proposal goes on student portfolio."},
      ]},
    ],
    assessment:[
      {label:"Weekly strategic tasks",weight:"30%",desc:"One strategic thinking task per week — always applied to the student's year-end problem."},
      {label:"Module challenges",weight:"30%",desc:"Problem diagnosis, stakeholder map, solution comparison, scenario plan each assessed separately."},
      {label:"External mentor session performance",weight:"15%",desc:"Quality of questions asked, ability to incorporate feedback."},
      {label:"Year-end proposal + presentation",weight:"25%",desc:"Proposal quality + presentation and Q&A performance."},
    ]
  },
  {
    id:"y11",label:"Class 11",color:"#15803D",lightColor:"#F0FDF4",
    title:"The Communicator",tagline:"Can you move a room? Can you write something that gets read?",
    description:"Students develop professional communication as a weapon. By year-end: a 10-minute public talk at BAII's Student Speaker Event and an 800-word article published permanently on baii.in.",
    finalMission:"Two Real Outputs: A 10-minute public talk at BAII's Student Speaker Event and an 800-word article published permanently on baii.in.",
    modules:[
      {id:"m1",title:"Storytelling",weeks:"Wk 1–7",subtitle:"Every great talk and article is a story",weeks_detail:[
        {w:"W1",topic:"The Idea Worth Spreading",concept:"Every great TED talk has one central idea in one sentence.",exercise:"Watch 3 famous TED talks. Write the one-sentence idea of each.",example:"Begin topic selection for year-end talk. Must be deeply connected to your chosen pillar."},
        {w:"W2",topic:"Story Structure — Problem, Tension, Resolution",concept:"Why this structure works for both talks and articles.",exercise:"Design a narrative arc for a 10-min talk.",example:"'What is' — India imports Rs.14 lakh crore of energy. 'What could be' — India exports clean energy to Japan."},
        {w:"W3",topic:"Show, Don't Tell",concept:"Replace abstract claims with concrete images.",exercise:"5 abstract claims. Replace each with a concrete specific image.",example:""},
        {w:"W4",topic:"The Personal Story as Entry Point",concept:"The most compelling talks start with something genuinely personal.",exercise:"Write a 90-second personal story that connects to your year-end talk topic.",example:"Rule: the personal story must be genuinely yours — not fabricated for effect."},
        {w:"W5",topic:"Transitions — Moving Between Ideas",concept:"The sentence between two ideas is the most important one.",exercise:"Take your year-end talk outline. Write only the transition sentences.",example:"First full talk outline this week."},
        {w:"W6",topic:"Opening and Closing",concept:"The two moments the audience remembers.",exercise:"Write 3 different openings for your year-end talk. Write 2 different closings.",example:""},
        {w:"W7",topic:"Module 1 Challenge",concept:"3-minute talk to cohort on your year-end idea.",exercise:"Cohort evaluates: was the idea clear? Was the arc visible?",example:""},
      ]},
      {id:"m2",title:"Writing to Be Read",weeks:"Wk 8–14",subtitle:"Long-form writing that pulls people through",weeks_detail:[
        {w:"W8",topic:"The Paragraph",concept:"One idea per paragraph. Topic sentence, support, transition.",exercise:"Take a paragraph you wrote last year. Identify how many ideas are in it. Rewrite.",example:"Start thinking about your 800-word article topic."},
        {w:"W9",topic:"The Lead — Your First 50 Words",concept:"Your first paragraph decides whether anyone reads the rest.",exercise:"Write 5 different leads for the same article. Test on cohort.",example:"5 different leads for 'Why India's solar ambition is being held back by one invisible problem.'"},
        {w:"W10",topic:"Voice — Writing That Sounds Like a Human",concept:"The difference between academic writing and writing with a voice.",exercise:"Take a paragraph in flat academic style. Rewrite it with voice.",example:"First 500-word draft of your year-end article this week."},
        {w:"W11",topic:"Cutting Ruthlessly",concept:"Every sentence must earn its place. Filler words add nothing.",exercise:"Take your 500-word draft. Cut it to 350 words without losing any meaning.",example:"The discipline of cutting is the discipline of clarity."},
        {w:"W12",topic:"Transitions Between Sections",concept:"The section transition sentence must look backward and forward simultaneously.",exercise:"Take your article draft. Write transition sentences between each section.",example:"800-word draft complete this week."},
        {w:"W13",topic:"The Ending — Land the Plane",concept:"Most student writing trails off. The ending must return to the opening image.",exercise:"Read your article ending. Does it trail off or land? Rewrite the ending three times.",example:"Article near-final draft. Send to one person outside BAII to read."},
        {w:"W14",topic:"Module 2 Challenge",concept:"First complete draft of 800-word article submitted to tutor.",exercise:"Tutor feedback: is the lead compelling? Does the voice feel human?",example:""},
      ]},
      {id:"m3",title:"Speaking to Be Heard",weeks:"Wk 15–21",subtitle:"Public speaking as a craft",weeks_detail:[
        {w:"W15",topic:"TED Structure",concept:"Idea → context → examples → return to idea.",exercise:"Map 3 famous talks against TED structure.",example:"Map your own year-end talk against TED structure."},
        {w:"W16",topic:"The 3-Minute Version",concept:"If you can't do your talk in 3 minutes compellingly, the 10-minute version won't save you.",exercise:"Deliver your year-end talk in exactly 3 minutes.",example:"Monthly live speaking session — each student presents 3-min version to full cohort."},
        {w:"W17",topic:"Memorised vs Scripted vs Notes",concept:"Each has strengths and failures.",exercise:"Deliver the same 2 minutes three ways: scripted, memorised, notes only. Record all three.",example:"Decide which method you'll use for the year-end talk."},
        {w:"W18",topic:"Managing Nerves",concept:"Nerves are energy — the question is whether you direct it.",exercise:"Before next week's cohort session, use two calming techniques.",example:"Nerves management is personal — this week identifies what works for each student."},
        {w:"W19",topic:"Reading a Room",concept:"How to adjust in real time based on audience response.",exercise:"Deliberately try to 'read' the cohort during a partner's presentation.",example:""},
        {w:"W20",topic:"The Pause",concept:"The single most underused tool in spoken communication.",exercise:"Deliver 3 minutes of your year-end talk. Use at least 4 deliberate pauses.",example:"Full 10-minute practice talk to cohort this week."},
        {w:"W21",topic:"Module 3 Challenge",concept:"5-minute practice talk delivered to full cohort. Video recorded.",exercise:"Cohort feedback: was the idea clear? Did the structure work?",example:"Personal coaching note: identify your one remaining speaking weakness."},
      ]},
      {id:"m4",title:"Audience and Medium",weeks:"Wk 22–28",subtitle:"Same content, different audience",weeks_detail:[
        {w:"W22",topic:"Expert vs General Audience",concept:"Same finding, two completely different articles.",exercise:"Take your Class 9 research paper's key finding. Write 200 words for a general reader. Write 200 words for a peer researcher.",example:"Which version would you want a policymaker to read? Why?"},
        {w:"W23",topic:"Adapting Your Talk for Different Audiences",concept:"The content doesn't change — the language, examples, and depth do.",exercise:"Rehearse a 3-minute excerpt: once for energy engineers, once for Class 8 students.",example:""},
        {w:"W24",topic:"Digital vs Live Communication",concept:"What changes when communication moves online.",exercise:"Record your 3-minute talk as if it were a YouTube video.",example:""},
        {w:"W25",topic:"Handling Hard Questions",concept:"Compose, pause, answer only what was asked.",exercise:"Cohort asks the hardest questions they can think of about your talk topic.",example:""},
        {w:"W26",topic:"Feedback as a Gift",concept:"How to incorporate criticism without losing your voice.",exercise:"Share article draft with one person who will be genuinely critical.",example:""},
        {w:"W27",topic:"Full Dress Rehearsal",concept:"Full 10-minute talk. Tutor and mentor both attend.",exercise:"Final revisions to presentation based on mentor feedback.",example:""},
        {w:"W28",topic:"Article Sent for External Review",concept:"Article sent to a writing mentor for final feedback.",exercise:"Incorporate final feedback. Article near-final version.",example:""},
      ]},
      {id:"m5",title:"The Talk + The Piece",weeks:"Wk 29–35",subtitle:"Two real public outputs",weeks_detail:[
        {w:"W29-31",topic:"Final Revisions",concept:"Both talk and article in final revision cycle.",exercise:"Article sent to baii.in editorial team. Talk script finalised.",example:""},
        {w:"W32",topic:"Article Published",concept:"Article goes live on baii.in. Permanently accessible.",exercise:"This is a significant moment. The article is real. It exists.",example:"Article link goes on student's BAII profile."},
        {w:"W33",topic:"Final Dress Rehearsal",concept:"Full 10-minute talk rehearsal. External mentor attends.",exercise:"Adjust delivery based on mentor feedback.",example:""},
        {w:"W34",topic:"Day Before",concept:"Light review only. No new preparation. Confirm logistics. Get enough sleep.",exercise:"",example:""},
        {w:"W35",topic:"🏆 BAII Student Speaker Event",concept:"Public event. Parents, invited professionals, cohort.",exercise:"Judged on: clarity of central idea, narrative structure, delivery, handling of questions.",example:"BAII Communicator Badge. Article permanently on baii.in."},
      ]},
    ],
    assessment:[
      {label:"Weekly writing and speaking tasks",weight:"30%",desc:"Alternating weeks: written / spoken communication task."},
      {label:"Module communication pieces",weight:"30%",desc:"One longer piece per module."},
      {label:"Monthly live speaking sessions",weight:"20%",desc:"Four live cohort sessions. Graded on growth — trajectory matters more than baseline."},
      {label:"Year-end talk + published article",weight:"20%",desc:"Talk judged by external panel. Article quality assessed by tutor and writing mentor."},
    ]
  },
  {
    id:"y12",label:"Class 12",color:"#1E3A5F",lightColor:"#EFF6FF",
    title:"The Builder",tagline:"Can you turn everything you've learned into something that exists in the world?",
    description:"Integration year. All five thinking skills from Classes 6–11 converge into one ambitious final project. Student chooses one output format and produces it independently over 35 weeks.",
    finalMission:"One Real-World Output: Policy Brief (10 pages, submitted to real organisation), Startup Pitch (20 slides + 10-page business plan), or Research Paper (15 pages, submitted to real journal or conference).",
    modules:[
      {id:"m1",title:"Choose + Define + Plan",weeks:"Wk 1–8",subtitle:"Select output, narrow topic, build project plan",weeks_detail:[
        {w:"W1-2",topic:"Output Format Selection",concept:"Policy Brief, Startup Pitch, or Research Paper. Each leads to a different career path.",exercise:"Write a 1-page justification for your chosen output format.",example:"Policy Brief → policy/civil service. Startup Pitch → entrepreneurship. Research Paper → academic career."},
        {w:"W3-4",topic:"Topic Narrowing",concept:"Narrow to something that can be done well in 7 months.",exercise:"Propose 3 specific topics for your chosen output format.",example:""},
        {w:"W5-6",topic:"Full Project Plan",concept:"What will each week produce? A weekly plan forces commitment.",exercise:"Write a week-by-week plan for all 35 weeks.",example:""},
        {w:"W7-8",topic:"Module 1 Challenge — Plan Approval",concept:"Present project plan to tutor AND external mentor. Both must approve before Module 2 begins.",exercise:"Present complete project plan. Defend every choice under questioning.",example:"A weak plan produces a weak output."},
      ]},
      {id:"m2",title:"Research + Evidence",weeks:"Wk 9–18",subtitle:"10 weeks of independent research",weeks_detail:[
        {w:"W9-13",topic:"Independent Research Phase 1",concept:"Weekly check-in with tutor: what did you find? What surprised you?",exercise:"Weekly check-in: submit a 200-word reflection on what you found.",example:"Most students discover their initial plan needs significant revision. That is normal."},
        {w:"W14",topic:"Halfway Milestone — 40% Draft",concept:"First draft of 40% of the final output reviewed by tutor and mentor.",exercise:"Submit first 40% draft. Tutor and mentor both give written feedback.",example:""},
        {w:"W15-18",topic:"Independent Research Phase 2",concept:"Continue research incorporating feedback from the milestone review.",exercise:"Weekly check-in continues. Focus: are you answering the question you committed to?",example:""},
      ]},
      {id:"m3",title:"Write + Build + Revise",weeks:"Wk 19–28",subtitle:"10 weeks of production",weeks_detail:[
        {w:"W19-21",topic:"Production Begins",concept:"Move from research to writing/building. The hardest transition in any long project.",exercise:"Set weekly word count or slide count targets.",example:""},
        {w:"W22",topic:"First Complete Draft",concept:"All sections present, even if rough.",exercise:"Submit first complete draft. Everything is there. Nothing is missing.",example:""},
        {w:"W23",topic:"Peer Review",concept:"One classmate reads and critiques full output.",exercise:"Exchange outputs with a classmate working on the same format.",example:""},
        {w:"W25",topic:"Tutor Detailed Review",concept:"Tutor reads entire output. Gives written feedback on every section.",exercise:"Revise based on tutor feedback.",example:""},
        {w:"W27",topic:"External Mentor Review",concept:"Expert in the student's specific topic gives 30 minutes of feedback.",exercise:"Revise based on mentor feedback. This is where outputs change significantly.",example:""},
        {w:"W28",topic:"90% Complete",concept:"Output is 90% complete. Major revisions done.",exercise:"",example:""},
      ]},
      {id:"m4",title:"Final + Present + Launch",weeks:"Wk 29–35",subtitle:"The highest-stakes presentation of the BAII journey",weeks_detail:[
        {w:"W29-31",topic:"Final Revisions",concept:"Final revision cycle. No new research, no new sections.",exercise:"Read entire output aloud. Fix every sentence that makes you stumble.",example:""},
        {w:"W32",topic:"Output Locked",concept:"No more changes. Output is complete.",exercise:"Prepare your presentation for the panel.",example:""},
        {w:"W33",topic:"Presentation Preparation",concept:"Prepare specifically for the panel type.",exercise:"Rehearse handling the 5 hardest questions your specific panel type will ask.",example:""},
        {w:"W34",topic:"Full Dress Rehearsal",concept:"Tutor and mentor both present. Full length.",exercise:"Final adjustments. Confirm all logistics.",example:""},
        {w:"W35",topic:"🏆 Final Presentation",concept:"The highest-stakes audience of the student's entire BAII journey.",exercise:"Judged on: output quality, argument strength, evidence quality, presentation clarity, Q&A performance.",example:"BAII Builder Badge. Output published or submitted to real organisation."},
      ]},
    ],
    assessment:[
      {label:"Weekly check-ins",weight:"20%",desc:"Weekly 200-word reflections on what was found, what changed."},
      {label:"Milestone reviews",weight:"25%",desc:"Project plan, halfway draft, full first draft, final submission."},
      {label:"External mentor engagement",weight:"15%",desc:"Quality of preparation for mentor sessions, ability to act on expert feedback."},
      {label:"Final output + presentation",weight:"40%",desc:"The final document and presentation, judged by the external panel."},
    ]
  },
];

export const PILLAR5_ARC = [
  {year:"Class 6",skill:"Truth Detection",outcome:"Can investigate any claim, evaluate sources, spot logical fallacies"},
  {year:"Class 7",skill:"Data Literacy",outcome:"Can find, read, and honestly interpret real government data"},
  {year:"Class 8",skill:"Argumentation",outcome:"Can build and defend evidence-based arguments on any topic"},
  {year:"Class 9",skill:"Research",outcome:"Can conduct original independent research and write a 5-page paper"},
  {year:"Class 10",skill:"Strategy",outcome:"Can diagnose complex problems and propose solutions to real decision-makers"},
  {year:"Class 11",skill:"Communication",outcome:"Can deliver public talks and publish written work for real audiences"},
  {year:"Class 12",skill:"Building",outcome:"Can produce a real-world output that exists beyond BAII"},
];
